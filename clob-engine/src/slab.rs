// Zero-copy fixed-layout memory structures for high-frequency matching
// Eliminates dynamic heap reallocations (no dynamic Strings on the hot path)

use serde::{Deserialize, Serialize};

pub const PRICE_SCALE: u64 = 1_000_000; // 6 decimals fixed-point for price
pub const USD_SCALE: u64 = 1_000_000;   // 6 decimals for USD notional

#[repr(C)]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct FixedId([u8; 16]);

impl FixedId {
    pub fn new(uuid_bytes: [u8; 16]) -> Self {
        Self(uuid_bytes)
    }

    pub fn random() -> Self {
        Self(*uuid::Uuid::new_v4().as_bytes())
    }

    pub fn as_str(&self) -> String {
        uuid::Uuid::from_bytes(self.0).to_string()
    }
}

#[repr(C)]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Side {
    Buy = 0,
    Sell = 1,
}

#[repr(C)]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum OrderType {
    Limit = 0,
    Market = 1,
    VaultMaker = 2, // Placed by the Automated Vault Market Maker
}

/// Zero-copy fixed-size order layout
#[repr(C)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SlabOrder {
    pub id: FixedId,
    pub trader_id: FixedId,
    pub market_idx: u8, // 0 = AVAX, 1 = BTC, 2 = ETH, 3 = SOL
    pub side: Side,
    pub order_type: OrderType,
    pub price: u64,
    pub size_usd: u64,
    pub remaining_size_usd: u64,
    pub margin_usdc: u64,
    pub leverage: u16,
    pub nonce: u64,
    pub expiry: u64,
    pub created_at: u64,
}

/// Fixed-capacity orderbook price level
#[repr(C)]
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct SlabLevel {
    pub price: u64,
    pub size_usd: u64,
    pub order_count: u32,
}

