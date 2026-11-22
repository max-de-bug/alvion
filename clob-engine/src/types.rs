use serde::{Deserialize, Serialize};

pub const PRICE_SCALE: u64 = 1_000_000; // 6 decimals fixed point for price (e.g. $7.18 -> 7_180_000)
pub const USD_SCALE: u64 = 1_000_000;   // 6 decimals for USD notional & USDC

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SettlementChain {
    RobinhoodChain,
}

impl Default for SettlementChain {
    fn default() -> Self {
        Self::RobinhoodChain
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Side {
    Buy,
    Sell,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum OrderType {
    Limit,
    Market,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Order {
    pub id: String,
    pub trader: String,
    pub market: String,
    pub side: Side,
    pub order_type: OrderType,
    pub price: u64, // Scaled by PRICE_SCALE
    pub size_usd: u64, // Scaled by USD_SCALE
    pub remaining_size_usd: u64,
    pub margin_usdc: u64,
    pub leverage: u32,
    pub nonce: u64,
    pub expiry: u64,
    pub signature: Option<String>,
    pub created_at: u64,
    #[serde(default)]
    pub settlement_chain: SettlementChain,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Trade {
    pub id: String,
    pub market: String,
    pub maker_order_id: Option<String>,
    pub taker_order_id: String,
    pub buyer: String,
    pub seller: String,
    pub price: u64,
    pub size_usd: u64,
    pub side: Side,
    pub timestamp: u64,
    pub settlement_tx_hash: String,
    pub status: String,
    #[serde(default)]
    pub settlement_chain: SettlementChain,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Position {
    pub id: String,
    pub trader: String,
    pub market: String,
    pub side: Side,
    pub margin_usdc: u64,
    pub leverage: u32,
    pub size_usd: u64,
    pub entry_price: u64,
    pub open_timestamp: u64,
    pub is_open: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrderBookLevel {
    pub price: f64,
    pub size: f64,
    pub order_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct L2Depth {
    pub market: String,
    pub bids: Vec<OrderBookLevel>,
    pub asks: Vec<OrderBookLevel>,
    pub spread: f64,
    pub spread_bps: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct L4Level {
    pub price: f64,
    pub size: f64,
    pub order_count: usize,
    pub is_vault_mm: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct L4Depth {
    pub market: String,
    pub sequence: u64,
    pub timestamp: u64,
    pub bids: Vec<L4Level>,
    pub asks: Vec<L4Level>,
    pub impact_bid: f64,
    pub impact_ask: f64,
    pub spread_bps: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdaptiveFundingInfo {
    pub market: String,
    pub oracle_price: f64,
    pub mark_price: f64,
    pub impact_bid: f64,
    pub impact_ask: f64,
    pub clob_premium_bps: f64,
    pub vault_skew_bps: f64,
    pub funding_rate_1h_pct: f64,
    pub funding_rate_8h_pct: f64,
    pub long_funding_rate_1h_pct: f64,
    pub short_funding_rate_1h_pct: f64,
    pub next_funding_time: u64,
    pub formula: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SequencerTickReport {
    pub tick_id: u64,
    pub timestamp: u64,
    pub active_markets: usize,
    pub expired_orders_purged: usize,
    pub vault_mm_quotes_active: usize,
    pub solvency_verified: bool,
    pub phase: String,
}

