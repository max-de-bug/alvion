use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use crate::orderbook::OrderBook;
use crate::domain::{DomainRiskManager, MarketDomain};
use crate::vault_mm::VaultMarketMaker;
use crate::types::{
    AdaptiveFundingInfo, L2Depth, L4Depth, Order, Position, SequencerTickReport, Trade, PRICE_SCALE, USD_SCALE,
};

use crate::relayer::OnChainRelayer;

pub struct ClobEngine {
    pub orderbooks: HashMap<String, OrderBook>,
    pub risk_manager: DomainRiskManager,
    pub vault_mm: HashMap<String, VaultMarketMaker>,
    pub recent_trades: Vec<Trade>,
    pub relayer: OnChainRelayer,
    pub tick_counter: u64,
    pub sequence_counter: u64,
    pub latest_oracle_prices: HashMap<String, u64>,
}

impl ClobEngine {
    pub fn new() -> Self {
        let vault_liquidity = 5_250_000 * USD_SCALE;
        let mut engine = Self {
            orderbooks: HashMap::new(),
            risk_manager: DomainRiskManager::new(vault_liquidity),
            vault_mm: HashMap::new(),
            recent_trades: Vec::new(),
            relayer: OnChainRelayer::new("0xb3d1bcb79c7770f7d070ae6ac7b345a95372279e"),
            tick_counter: 0,
            sequence_counter: 0,
            latest_oracle_prices: HashMap::new(),
        };

        // Initialize market order books & Vault Market Makers
        // Support NYSE & NASDAQ Equities + Avalanche Crypto
        for market in [
            "SPY", "NVDA", "TSLA", "AAPL", "QQQ", "MSFT", "AMZN", "GOOGL", "META", "COIN", "MSTR",
            "AVAX", "BTC", "ETH", "SOL",
        ] {
            engine.orderbooks.insert(market.to_string(), OrderBook::new(market.to_string()));
            engine.vault_mm.insert(market.to_string(), VaultMarketMaker::new());
        }

        // Zero hardcoded prices: Oracle prices start clean and are dynamically hydrated
        // from live external oracle feeds (Hyperliquid L2 / NYSE feeds / Pyth Network)
        // prior to processing client orders.

        engine
    }

    /// Dynamically update live oracle prices and recalibrate Percolator Vault MM spreads
    pub fn update_oracle_prices(&mut self, prices: &HashMap<String, u64>) {
        for (market, price) in prices {
            self.latest_oracle_prices.insert(market.clone(), *price);
            let skew = self.risk_manager.domains.get(market).map_or(0.0, |d| {
                let net_oi = (d.long_open_interest_usd as i64) - (d.short_open_interest_usd as i64);
                net_oi as f64 / (self.risk_manager.total_vault_liquidity_usdc as f64)
            });
            self.refresh_vault_mm(market, *price, skew);
        }
    }

    /// Submit limit or market order with Dual-Gate Margin Validation
    pub fn submit_order(&mut self, order: Order, vault_oracle_price: u64) -> (Option<Position>, Vec<Trade>) {
        let market = order.market.clone();
        let trader = order.trader.clone();
        let side = order.side;
        let margin_usdc = order.margin_usdc;
        let leverage = order.leverage;

        // Dual-Gate Margin Validation (Submission Gate)
        if !self.risk_manager.has_sufficient_margin(&trader, margin_usdc) {
            eprintln!("[CLEARINGHOUSE] Order submission rejected for {}: insufficient margin", trader);
            return (None, Vec::new());
        }

        let book = self.orderbooks.entry(market.clone()).or_insert_with(|| OrderBook::new(market.clone()));

        let effective_oracle_price = if vault_oracle_price > 0 {
            vault_oracle_price
        } else {
            *self.latest_oracle_prices.get(&market).unwrap_or(&0)
        };

        if order.order_type == crate::types::OrderType::Market && effective_oracle_price == 0 {
            eprintln!("[ORACLE GUARD] Order rejected: Live oracle price not yet available for {}", market);
            return (None, Vec::new());
        }

        let trades = match order.order_type {
            crate::types::OrderType::Limit => book.place_limit_order(order),
            crate::types::OrderType::Market => book.place_market_order(order, effective_oracle_price),
        };

        // If matched trades occurred, open position in isolated domain
        let position = if !trades.is_empty() {
            let total_filled_usd: u64 = trades.iter().map(|t| t.size_usd).sum();
            let avg_price: u64 = if total_filled_usd > 0 {
                trades.iter().map(|t| t.price * t.size_usd).sum::<u64>() / total_filled_usd
            } else {
                effective_oracle_price
            };

            let pos = self.risk_manager.open_position(
                trader,
                market,
                side,
                margin_usdc,
                leverage,
                total_filled_usd,
                avg_price,
            ).ok();
            pos
        } else {
            None
        };

        for trade in &trades {
            self.recent_trades.insert(0, trade.clone());
            self.relayer.enqueue_trade(trade.clone());
        }
        if self.recent_trades.len() > 100 {
            self.recent_trades.truncate(100);
        }

        (position, trades)
    }

    /// Refresh Automated Vault Market Maker quotes based on live oracle price
    pub fn refresh_vault_mm(&mut self, market: &str, oracle_price: u64, skew_ratio: f64) {
        if let Some(book) = self.orderbooks.get_mut(market) {
            if let Some(mm) = self.vault_mm.get_mut(market) {
                mm.refresh_quotes(book, oracle_price, skew_ratio);
            }
        }
    }

    pub fn cancel_order(&mut self, market: &str, order_id: &str) -> bool {
        if let Some(book) = self.orderbooks.get_mut(market) {
            book.cancel_order(order_id)
        } else {
            false
        }
    }

    pub fn get_depth(&self, market: &str, max_levels: usize) -> Option<L2Depth> {
        self.orderbooks.get(market).map(|b| b.get_l2_depth(max_levels))
    }

    pub fn get_l4_depth(&mut self, market: &str, max_levels: usize) -> Option<L4Depth> {
        self.sequence_counter += 1;
        let seq = self.sequence_counter;
        self.orderbooks.get(market).map(|b| b.get_l4_depth(max_levels, seq))
    }

    pub fn get_adaptive_funding(&self, market: &str, oracle_price: u64) -> Option<AdaptiveFundingInfo> {
        let (impact_bid, impact_ask) = self.orderbooks.get(market)
            .map(|b| b.get_impact_prices(5_000 * USD_SCALE))
            .unwrap_or((None, None));

        Some(self.risk_manager.calculate_adaptive_funding(market, oracle_price, impact_bid, impact_ask))
    }

    /// Deterministic Sequencer Tick Loop (Phase 1 -> Phase 5)
    pub fn execute_deterministic_tick(&mut self, oracle_prices: &HashMap<String, u64>) -> SequencerTickReport {
        self.tick_counter += 1;
        let now = chrono::Utc::now().timestamp() as u64;

        // Phase 1 & 2: Ingest real-time oracle prices & verify Solvency Invariant
        self.latest_oracle_prices = oracle_prices.clone();
        let (solvent, _, _) = self.risk_manager.verify_solvency_invariant();

        // Phase 3: Purge expired orders (0 gas)
        let mut expired_count = 0;
        for book in self.orderbooks.values_mut() {
            let mut expired_ids = Vec::new();
            for queue in book.bids.values() {
                for o in queue {
                    if o.expiry > 0 && o.expiry < now {
                        expired_ids.push(o.id.clone());
                    }
                }
            }
            for queue in book.asks.values() {
                for o in queue {
                    if o.expiry > 0 && o.expiry < now {
                        expired_ids.push(o.id.clone());
                    }
                }
            }
            for id in expired_ids {
                if book.cancel_order(&id) {
                    expired_count += 1;
                }
            }
        }

        // Phase 4: Automated Vault MM quotes refresh with Avellaneda-Stoikov skew
        let mut mm_quotes_active = 0;
        for (market, &price) in oracle_prices {
            let skew = self.risk_manager.domains.get(market).map_or(0.0, |d| {
                let net_oi = (d.long_open_interest_usd as i64) - (d.short_open_interest_usd as i64);
                net_oi as f64 / (self.risk_manager.total_vault_liquidity_usdc as f64)
            });
            self.refresh_vault_mm(market, price, skew);
            mm_quotes_active += 6;
        }

        // Phase 5: Reconciled deterministic report
        SequencerTickReport {
            tick_id: self.tick_counter,
            timestamp: now,
            active_markets: self.orderbooks.len(),
            expired_orders_purged: expired_count,
            vault_mm_quotes_active: mm_quotes_active,
            solvency_verified: solvent,
            phase: "DETERMINISTIC_EXECUTION_CYCLE_COMPLETE".to_string(),
        }
    }

    pub fn get_recent_trades(&self, market: Option<&str>) -> Vec<Trade> {
        match market {
            Some(m) => self.recent_trades.iter().filter(|t| t.market.eq_ignore_ascii_case(m)).cloned().collect(),
            None => self.recent_trades.clone(),
        }
    }

    pub fn get_domain_info(&self, market: &str) -> Option<MarketDomain> {
        self.risk_manager.domains.get(market).cloned()
    }

    pub fn verify_solvency(&self) -> (bool, u64, u64) {
        self.risk_manager.verify_solvency_invariant()
    }
}

pub type SharedEngine = Arc<Mutex<ClobEngine>>;
