use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use crate::orderbook::OrderBook;
use crate::domain::{DomainRiskManager, MarketDomain};
use crate::vault_mm::VaultMarketMaker;
use crate::types::{Order, Trade, L2Depth, Position, PRICE_SCALE, USD_SCALE};

pub struct ClobEngine {
    pub orderbooks: HashMap<String, OrderBook>,
    pub risk_manager: DomainRiskManager,
    pub vault_mm: HashMap<String, VaultMarketMaker>,
    pub recent_trades: Vec<Trade>,
}

impl ClobEngine {
    pub fn new() -> Self {
        let vault_liquidity = 5_250_000 * USD_SCALE;
        let mut engine = Self {
            orderbooks: HashMap::new(),
            risk_manager: DomainRiskManager::new(vault_liquidity),
            vault_mm: HashMap::new(),
            recent_trades: Vec::new(),
        };

        // Initialize markets & Automated Vault Market Makers
        for market in ["AVAX", "BTC", "ETH", "SOL"] {
            let mut book = OrderBook::new(market.to_string());
            let mut mm = VaultMarketMaker::new();

            let base_price = match market {
                "AVAX" => (7.18 * PRICE_SCALE as f64) as u64,
                "BTC" => (64550.0 * PRICE_SCALE as f64) as u64,
                "ETH" => (2680.0 * PRICE_SCALE as f64) as u64,
                "SOL" => (142.5 * PRICE_SCALE as f64) as u64,
                _ => (10.0 * PRICE_SCALE as f64) as u64,
            };

            // Initial automated quote laddering (Percolator-match style)
            mm.refresh_quotes(&mut book, base_price, 0.0);

            engine.orderbooks.insert(market.to_string(), book);
            engine.vault_mm.insert(market.to_string(), mm);
        }

        engine
    }

    /// Submit limit or market order
    pub fn submit_order(&mut self, order: Order, vault_oracle_price: u64) -> (Option<Position>, Vec<Trade>) {
        let market = order.market.clone();
        let trader = order.trader.clone();
        let side = order.side;
        let margin_usdc = order.margin_usdc;
        let leverage = order.leverage;

        let book = self.orderbooks.entry(market.clone()).or_insert_with(|| OrderBook::new(market.clone()));

        let trades = match order.order_type {
            crate::types::OrderType::Limit => book.place_limit_order(order),
            crate::types::OrderType::Market => book.place_market_order(order, vault_oracle_price),
        };

        // If matched trades occurred, open position in isolated domain
        let position = if !trades.is_empty() {
            let total_filled_usd: u64 = trades.iter().map(|t| t.size_usd).sum();
            let avg_price: u64 = if total_filled_usd > 0 {
                trades.iter().map(|t| t.price * t.size_usd).sum::<u64>() / total_filled_usd
            } else {
                vault_oracle_price
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
