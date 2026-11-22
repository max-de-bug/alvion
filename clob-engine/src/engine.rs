use rustc_hash::FxHashMap;
use std::sync::{Arc, Mutex};
use crate::orderbook::OrderBook;
use crate::domain::{DomainRiskManager, MarketDomain};
use crate::vault_mm::VaultMarketMaker;
use crate::types::{
    AdaptiveFundingInfo, L2Depth, L4Depth, Order, Position, SequencerTickReport, Trade, PRICE_SCALE, USD_SCALE,
};
use crate::relayer::OnChainRelayer;
use crate::ws::{ServerWsMessage, WsBroadcaster};

pub const DEFAULT_MARKETS: &[&str] = &[
    "SPY", "NVDA", "TSLA", "AAPL", "QQQ", "MSFT", "AMZN", "GOOGL", "META", "COIN", "MSTR",
    "AVAX", "BTC", "ETH", "SOL",
];

pub struct ClobEngine {
    pub orderbooks: FxHashMap<String, OrderBook>,
    pub risk_manager: DomainRiskManager,
    pub vault_mm: FxHashMap<String, VaultMarketMaker>,
    pub recent_trades: Vec<Trade>,
    pub relayer: OnChainRelayer,
    pub tick_counter: u64,
    pub sequence_counter: u64,
    pub latest_oracle_prices: FxHashMap<String, u64>,
    pub broadcaster: Arc<WsBroadcaster>,
}

impl ClobEngine {
    pub fn new() -> Self {
        let vault_liquidity = 5_250_000 * USD_SCALE;
        let mut engine = Self {
            orderbooks: FxHashMap::default(),
            risk_manager: DomainRiskManager::new(vault_liquidity),
            vault_mm: FxHashMap::default(),
            recent_trades: Vec::new(),
            relayer: OnChainRelayer::new(crate::robinhood::ALVION_ROBINHOOD_CLEARINGHOUSE),
            tick_counter: 0,
            sequence_counter: 0,
            latest_oracle_prices: FxHashMap::default(),
            broadcaster: Arc::new(WsBroadcaster::new()),
        };

        // Dynamically register default asset pairs (NYSE/NASDAQ Equities + Robinhood Chain Crypto)
        for &market in DEFAULT_MARKETS {
            engine.register_market(market);
        }

        // Oracle prices start clean (0 hardcoded prices) and are dynamically hydrated
        // from live external feeds (Hyperliquid L2 / NYSE feeds) prior to processing orders.

        engine
    }

    /// Dynamically register a new trading pair into the engine at runtime
    pub fn register_market(&mut self, market: &str) {
        let m = market.to_uppercase();
        if !self.orderbooks.contains_key(&m) {
            self.orderbooks.insert(m.clone(), OrderBook::new(m.clone()));
            self.vault_mm.insert(m.clone(), VaultMarketMaker::new());
        }
    }

    /// Dynamically update live oracle prices and recalibrate Percolator Vault MM spreads
    pub fn update_oracle_prices(&mut self, prices: &FxHashMap<String, u64>) {
        for (market, price) in prices {
            self.latest_oracle_prices.insert(market.clone(), *price);
            let skew = self.risk_manager.domains.get(market).map_or(0.0, |d| {
                let net_oi = (d.long_open_interest_usd as i64) - (d.short_open_interest_usd as i64);
                net_oi as f64 / (self.risk_manager.total_vault_liquidity_usdc as f64)
            });
            self.refresh_vault_mm(market, *price, skew);

            // Broadcast real-time TickerUpdate to all WebSocket subscribers
            let price_f64 = (*price as f64) / PRICE_SCALE as f64;
            let funding_info = self.risk_manager.calculate_adaptive_funding(market, *price, None, None);
            self.broadcaster.broadcast(ServerWsMessage::TickerUpdate {
                market: market.clone(),
                oracle_price: price_f64,
                mark_price: price_f64,
                funding_1h_pct: funding_info.funding_rate_1h_pct,
            });

            // Broadcast updated orderbook snapshot reflecting fresh Vault MM quotes
            self.sequence_counter += 1;
            let seq = self.sequence_counter;
            if let Some(book) = self.orderbooks.get(market) {
                let depth = book.get_l4_depth(15, seq);
                self.broadcaster.broadcast(ServerWsMessage::OrderbookSnapshot {
                    market: market.clone(),
                    depth: serde_json::to_value(depth).unwrap_or_default(),
                });
            }
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

        let effective_oracle_price = if vault_oracle_price > 0 {
            vault_oracle_price
        } else {
            *self.latest_oracle_prices.get(&market).unwrap_or(&0)
        };

        if order.order_type == crate::types::OrderType::Market && effective_oracle_price == 0 {
            eprintln!("[ORACLE GUARD] Order rejected: Live oracle price not yet available for {}", market);
            return (None, Vec::new());
        }

        let trades = {
            let book = self.orderbooks.entry(market.clone()).or_insert_with(|| OrderBook::new(market.clone()));
            match order.order_type {
                crate::types::OrderType::Limit => book.place_limit_order(order),
                crate::types::OrderType::Market => book.place_market_order(order, effective_oracle_price),
            }
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
                market.clone(),
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
            self.broadcaster.broadcast(ServerWsMessage::TradeBroadcast {
                market: market.clone(),
                trade: serde_json::to_value(trade).unwrap_or_default(),
            });
        }
        if self.recent_trades.len() > 100 {
            self.recent_trades.truncate(100);
        }

        // Broadcast updated orderbook depth to subscribers
        self.sequence_counter += 1;
        let seq = self.sequence_counter;
        if let Some(book) = self.orderbooks.get(&market) {
            let depth = book.get_l4_depth(15, seq);
            self.broadcaster.broadcast(ServerWsMessage::OrderbookSnapshot {
                market: market.clone(),
                depth: serde_json::to_value(depth).unwrap_or_default(),
            });
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
        let m = market.to_uppercase();
        if let Some(book) = self.orderbooks.get_mut(&m) {
            let cancelled = book.cancel_order(order_id);
            if cancelled {
                self.sequence_counter += 1;
                let seq = self.sequence_counter;
                let depth = book.get_l4_depth(15, seq);
                self.broadcaster.broadcast(ServerWsMessage::OrderbookSnapshot {
                    market: m,
                    depth: serde_json::to_value(depth).unwrap_or_default(),
                });
            }
            cancelled
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
    pub fn execute_deterministic_tick(&mut self, oracle_prices: &FxHashMap<String, u64>) -> SequencerTickReport {
        self.tick_counter += 1;
        let now = chrono::Utc::now().timestamp() as u64;

        // Phase 1 & 2: Ingest real-time oracle prices & verify Solvency Invariant
        self.latest_oracle_prices = oracle_prices.clone();
        let (solvent, _, _) = self.risk_manager.verify_solvency_invariant();

        // Phase 3: Purge expired orders (0 gas)
        let mut expired_count = 0;
        let mut markets_to_notify = Vec::new();

        for (m, book) in self.orderbooks.iter_mut() {
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
            let mut purged = false;
            for id in expired_ids {
                if book.cancel_order(&id) {
                    expired_count += 1;
                    purged = true;
                }
            }
            if purged {
                markets_to_notify.push(m.clone());
            }
        }

        for m in markets_to_notify {
            self.sequence_counter += 1;
            let seq = self.sequence_counter;
            if let Some(book) = self.orderbooks.get(&m) {
                let depth = book.get_l4_depth(15, seq);
                self.broadcaster.broadcast(ServerWsMessage::OrderbookSnapshot {
                    market: m,
                    depth: serde_json::to_value(depth).unwrap_or_default(),
                });
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
            active_markets: self.orderbooks.len() as u32,
            expired_orders_purged: expired_count as u32,
            vault_mm_quotes_active: mm_quotes_active as u32,
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
