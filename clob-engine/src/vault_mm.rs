// Percolator-inspired Automated Vault Market Maker (percolator-match)
// Dynamically quotes resting bids & asks using the Single USDC Vault's depth.

use crate::orderbook::OrderBook;
use crate::types::{Order, OrderType, Side, USD_SCALE};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VaultMmConfig {
    pub base_spread_bps: u64, // e.g. 20 bps (0.20%)
    pub ladder_levels: usize, // e.g. 3 levels
    pub size_per_level_usd: u64, // e.g. $50,000
    pub max_skew_tolerance_bps: i64,
}

impl Default for VaultMmConfig {
    fn default() -> Self {
        Self {
            base_spread_bps: 20, // 0.20% tight spread
            ladder_levels: 3,
            size_per_level_usd: 50_000 * USD_SCALE,
            max_skew_tolerance_bps: 50,
        }
    }
}

pub struct VaultMarketMaker {
    pub config: VaultMmConfig,
    pub vault_address: String,
    pub active_quote_ids: Vec<String>,
}

impl VaultMarketMaker {
    pub fn new() -> Self {
        Self {
            config: VaultMmConfig::default(),
            vault_address: "0x4663111111111111111111111111111111114663".to_string(),
            active_quote_ids: Vec::new(),
        }
    }

    /// Refresh quotes on the CLOB book around the given oracle price
    pub fn refresh_quotes(
        &mut self,
        book: &mut OrderBook,
        oracle_price: u64,
        net_skew_ratio: f64, // e.g. +0.10 if vault is net long
    ) {
        // 1. Cancel existing resting vault orders
        for id in self.active_quote_ids.drain(..) {
            book.cancel_order(&id);
        }

        let now = chrono::Utc::now().timestamp() as u64;

        // 2. Compute Avellaneda-Stoikov inventory skew offset
        let skew_offset_bps = (net_skew_ratio * 30.0) as i64;

        // 3. Place layered Bids and Asks
        for level in 1..=self.config.ladder_levels {
            let level_multiplier = level as u64;

            // Bids: price = oracle * (1 - (base_spread * level - skew_offset) / 10000)
            let bid_spread_bps = (self.config.base_spread_bps * level_multiplier) as i64 - skew_offset_bps;
            let effective_bid_bps = bid_spread_bps.max(5) as u64;
            let bid_price = (oracle_price * (10000 - effective_bid_bps)) / 10000;

            // Asks: price = oracle * (1 + (base_spread * level + skew_offset) / 10000)
            let ask_spread_bps = (self.config.base_spread_bps * level_multiplier) as i64 + skew_offset_bps;
            let effective_ask_bps = ask_spread_bps.max(5) as u64;
            let ask_price = (oracle_price * (10000 + effective_ask_bps)) / 10000;

            // Place Vault Bid (Buy from traders)
            let bid_id = format!("VMM-BID-{}-{}", book.market, level);
            let bid_order = Order {
                id: bid_id.clone(),
                trader: self.vault_address.clone(),
                market: book.market.clone(),
                side: Side::Buy,
                order_type: OrderType::Limit,
                price: bid_price,
                size_usd: self.config.size_per_level_usd,
                remaining_size_usd: self.config.size_per_level_usd,
                margin_usdc: (self.config.size_per_level_usd / 20), // 20x internal vault allocation
                leverage: 20,
                nonce: now + level as u64,
                expiry: now + 300, // 5 min auto-refresh
                signature: None,
                created_at: now,
                settlement_chain: crate::types::SettlementChain::RobinhoodChain,
            };
            book.place_limit_order(bid_order);
            self.active_quote_ids.push(bid_id);

            // Place Vault Ask (Sell to traders)
            let ask_id = format!("VMM-ASK-{}-{}", book.market, level);
            let ask_order = Order {
                id: ask_id.clone(),
                trader: self.vault_address.clone(),
                market: book.market.clone(),
                side: Side::Sell,
                order_type: OrderType::Limit,
                price: ask_price,
                size_usd: self.config.size_per_level_usd,
                remaining_size_usd: self.config.size_per_level_usd,
                margin_usdc: (self.config.size_per_level_usd / 20),
                leverage: 20,
                nonce: now + 100 + level as u64,
                expiry: now + 300,
                signature: None,
                created_at: now,
                settlement_chain: crate::types::SettlementChain::RobinhoodChain,
            };
            book.place_limit_order(ask_order);
            self.active_quote_ids.push(ask_id);
        }
    }
}
