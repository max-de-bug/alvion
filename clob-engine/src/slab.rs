// Percolator Zero-Copy Intrusive Slab Memory Architecture
// Provides strict O(1) order cancellation and allocation without dynamic heap traversal.
#![allow(dead_code)]

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use rustc_hash::FxHashMap;

pub const PRICE_SCALE: u64 = 1_000_000; // 6 decimals fixed-point for price
pub const USD_SCALE: u64 = 1_000_000;   // 6 decimals for USD notional
pub const NULL_IDX: u32 = u32::MAX;

#[repr(C)]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct FixedId(pub [u8; 16]);

impl FixedId {
    pub fn new(bytes: [u8; 16]) -> Self {
        Self(bytes)
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
    VaultMaker = 2,
}

/// Zero-copy fixed-layout order node with intrusive linked-list pointers.
#[repr(C)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SlabOrder {
    pub id: FixedId,
    pub trader_id: FixedId,
    pub side: Side,
    pub order_type: OrderType,
    pub price: u64,
    pub size_usd: u64,
    pub remaining_size_usd: u64,
    pub margin_usdc: u64,
    pub leverage: u16,
    pub created_at: u64,
    // Intrusive queue indices (links within SlabArena)
    pub prev_idx: u32,
    pub next_idx: u32,
}

/// Price level tracking intrusive FIFO queue boundaries and aggregated liquidity.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SlabLevel {
    pub price: u64,
    pub total_size_usd: u64,
    pub order_count: u32,
    pub head_idx: u32, // Head of FIFO queue (oldest order)
    pub tail_idx: u32, // Tail of FIFO queue (newest order)
}

impl SlabLevel {
    pub fn new(price: u64) -> Self {
        Self {
            price,
            total_size_usd: 0,
            order_count: 0,
            head_idx: NULL_IDX,
            tail_idx: NULL_IDX,
        }
    }

    pub fn is_empty(&self) -> bool {
        self.order_count == 0 || self.head_idx == NULL_IDX
    }

    /// Append order to tail of FIFO queue in strict O(1)
    pub fn push_back(&mut self, arena: &mut SlabArena, order_idx: u32, size: u64) {
        let order = arena.get_mut(order_idx).expect("invalid order_idx");
        order.prev_idx = self.tail_idx;
        order.next_idx = NULL_IDX;

        if self.tail_idx != NULL_IDX {
            arena.get_mut(self.tail_idx).unwrap().next_idx = order_idx;
        } else {
            self.head_idx = order_idx;
        }

        self.tail_idx = order_idx;
        self.total_size_usd += size;
        self.order_count += 1;
    }

    /// Pop head order from FIFO queue in strict O(1)
    pub fn pop_front(&mut self, arena: &mut SlabArena) -> Option<u32> {
        if self.head_idx == NULL_IDX {
            return None;
        }

        let front_idx = self.head_idx;
        let next_idx = arena.get(front_idx).unwrap().next_idx;

        if next_idx != NULL_IDX {
            arena.get_mut(next_idx).unwrap().prev_idx = NULL_IDX;
            self.head_idx = next_idx;
        } else {
            self.head_idx = NULL_IDX;
            self.tail_idx = NULL_IDX;
        }

        let order = arena.get_mut(front_idx).unwrap();
        self.total_size_usd = self.total_size_usd.saturating_sub(order.remaining_size_usd);
        self.order_count = self.order_count.saturating_sub(1);

        order.prev_idx = NULL_IDX;
        order.next_idx = NULL_IDX;

        Some(front_idx)
    }

    /// Unlink an arbitrary order anywhere in the queue in strict O(1) without iterating
    pub fn unlink(&mut self, arena: &mut SlabArena, order_idx: u32, size: u64) {
        let (prev, next) = {
            let order = arena.get(order_idx).expect("invalid order_idx to unlink");
            (order.prev_idx, order.next_idx)
        };

        if prev != NULL_IDX {
            arena.get_mut(prev).unwrap().next_idx = next;
        } else {
            self.head_idx = next;
        }

        if next != NULL_IDX {
            arena.get_mut(next).unwrap().prev_idx = prev;
        } else {
            self.tail_idx = prev;
        }

        self.total_size_usd = self.total_size_usd.saturating_sub(size);
        self.order_count = self.order_count.saturating_sub(1);

        let order = arena.get_mut(order_idx).unwrap();
        order.prev_idx = NULL_IDX;
        order.next_idx = NULL_IDX;
    }
}

/// Contiguous pre-allocated memory pool for SlabOrders with O(1) free list.
pub struct SlabArena {
    orders: Vec<Option<SlabOrder>>,
    free_list: Vec<u32>,
}

impl SlabArena {
    pub fn with_capacity(capacity: usize) -> Self {
        let mut orders = Vec::with_capacity(capacity);
        let mut free_list = Vec::with_capacity(capacity);
        for i in 0..capacity {
            orders.push(None);
            free_list.push(i as u32);
        }
        Self { orders, free_list }
    }

    pub fn alloc(&mut self, order: SlabOrder) -> u32 {
        if let Some(idx) = self.free_list.pop() {
            self.orders[idx as usize] = Some(order);
            idx
        } else {
            let idx = self.orders.len() as u32;
            self.orders.push(Some(order));
            idx
        }
    }

    pub fn free(&mut self, idx: u32) {
        if let Some(slot) = self.orders.get_mut(idx as usize) {
            *slot = None;
            self.free_list.push(idx);
        }
    }

    pub fn get(&self, idx: u32) -> Option<&SlabOrder> {
        self.orders.get(idx as usize)?.as_ref()
    }

    pub fn get_mut(&mut self, idx: u32) -> Option<&mut SlabOrder> {
        self.orders.get_mut(idx as usize)?.as_mut()
    }

    pub fn len(&self) -> usize {
        self.orders.len() - self.free_list.len()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SlabTrade {
    pub id: FixedId,
    pub maker_order_id: Option<FixedId>,
    pub taker_order_id: FixedId,
    pub price: u64,
    pub size_usd: u64,
    pub side: Side,
    pub timestamp: u64,
}

/// High-Performance Intrusive Slab OrderBook
pub struct SlabOrderBook {
    pub market: String,
    pub arena: SlabArena,
    pub bids: BTreeMap<u64, SlabLevel>,
    pub asks: BTreeMap<u64, SlabLevel>,
    // O(1) index: order_id -> (Side, price, slab_idx) with FxHash
    pub order_index: FxHashMap<FixedId, (Side, u64, u32)>,
}

impl SlabOrderBook {
    pub fn new(market: String, initial_capacity: usize) -> Self {
        Self {
            market,
            arena: SlabArena::with_capacity(initial_capacity),
            bids: BTreeMap::new(),
            asks: BTreeMap::new(),
            order_index: FxHashMap::default(),
        }
    }

    /// Place a Limit Order with O(1) price-level matching and intrusive FIFO placement
    pub fn place_limit_order(&mut self, mut order: SlabOrder) -> Vec<SlabTrade> {
        let mut trades = Vec::new();
        let now = chrono::Utc::now().timestamp() as u64;

        match order.side {
            Side::Buy => {
                // Match against lowest asks where ask <= order.price
                while order.remaining_size_usd > 0 {
                    let lowest_ask = match self.asks.keys().next().copied() {
                        Some(p) if p <= order.price => p,
                        _ => break,
                    };

                    let mut level_empty = false;
                    {
                        let level = self.asks.get_mut(&lowest_ask).unwrap();
                        while let Some(maker_idx) = level.head_idx.into() {
                            if maker_idx == NULL_IDX {
                                level_empty = true;
                                break;
                            }

                            let (match_size, maker_done, maker_id) = {
                                let maker = self.arena.get_mut(maker_idx).unwrap();
                                let match_size = order.remaining_size_usd.min(maker.remaining_size_usd);
                                order.remaining_size_usd -= match_size;
                                maker.remaining_size_usd -= match_size;
                                let done = maker.remaining_size_usd == 0;
                                (match_size, done, maker.id)
                            };

                            level.total_size_usd = level.total_size_usd.saturating_sub(match_size);

                            trades.push(SlabTrade {
                                id: FixedId::random(),
                                maker_order_id: Some(maker_id),
                                taker_order_id: order.id,
                                price: lowest_ask,
                                size_usd: match_size,
                                side: Side::Buy,
                                timestamp: now,
                            });

                            if maker_done {
                                level.pop_front(&mut self.arena);
                                self.order_index.remove(&maker_id);
                                self.arena.free(maker_idx);
                            }

                            if order.remaining_size_usd == 0 || level.is_empty() {
                                break;
                            }
                        }

                        if level.is_empty() {
                            level_empty = true;
                        }
                    }

                    if level_empty {
                        self.asks.remove(&lowest_ask);
                    }
                }

                // If remaining, place on bids in O(1)
                if order.remaining_size_usd > 0 {
                    let price = order.price;
                    let remaining_size = order.remaining_size_usd;
                    let order_id = order.id;

                    let slab_idx = self.arena.alloc(order);
                    self.order_index.insert(order_id, (Side::Buy, price, slab_idx));

                    let level = self.bids.entry(price).or_insert_with(|| SlabLevel::new(price));
                    level.push_back(&mut self.arena, slab_idx, remaining_size);
                }
            }
            Side::Sell => {
                // Match against highest bids where bid >= order.price
                while order.remaining_size_usd > 0 {
                    let highest_bid = match self.bids.keys().next_back().copied() {
                        Some(p) if p >= order.price => p,
                        _ => break,
                    };

                    let mut level_empty = false;
                    {
                        let level = self.bids.get_mut(&highest_bid).unwrap();
                        while let Some(maker_idx) = level.head_idx.into() {
                            if maker_idx == NULL_IDX {
                                level_empty = true;
                                break;
                            }

                            let (match_size, maker_done, maker_id) = {
                                let maker = self.arena.get_mut(maker_idx).unwrap();
                                let match_size = order.remaining_size_usd.min(maker.remaining_size_usd);
                                order.remaining_size_usd -= match_size;
                                maker.remaining_size_usd -= match_size;
                                let done = maker.remaining_size_usd == 0;
                                (match_size, done, maker.id)
                            };

                            level.total_size_usd = level.total_size_usd.saturating_sub(match_size);

                            trades.push(SlabTrade {
                                id: FixedId::random(),
                                maker_order_id: Some(maker_id),
                                taker_order_id: order.id,
                                price: highest_bid,
                                size_usd: match_size,
                                side: Side::Sell,
                                timestamp: now,
                            });

                            if maker_done {
                                level.pop_front(&mut self.arena);
                                self.order_index.remove(&maker_id);
                                self.arena.free(maker_idx);
                            }

                            if order.remaining_size_usd == 0 || level.is_empty() {
                                break;
                            }
                        }

                        if level.is_empty() {
                            level_empty = true;
                        }
                    }

                    if level_empty {
                        self.bids.remove(&highest_bid);
                    }
                }

                // If remaining, place on asks in O(1)
                if order.remaining_size_usd > 0 {
                    let price = order.price;
                    let remaining_size = order.remaining_size_usd;
                    let order_id = order.id;

                    let slab_idx = self.arena.alloc(order);
                    self.order_index.insert(order_id, (Side::Sell, price, slab_idx));

                    let level = self.asks.entry(price).or_insert_with(|| SlabLevel::new(price));
                    level.push_back(&mut self.arena, slab_idx, remaining_size);
                }
            }
        }

        trades
    }

    /// Cancel order with STRICT O(1) intrusive unlinking (Zero queue scanning!)
    pub fn cancel_order(&mut self, order_id: &FixedId) -> bool {
        if let Some((side, price, slab_idx)) = self.order_index.remove(order_id) {
            let mut level_empty = false;
            let remaining_size = self.arena.get(slab_idx).map(|o| o.remaining_size_usd).unwrap_or(0);

            match side {
                Side::Buy => {
                    if let Some(level) = self.bids.get_mut(&price) {
                        // Strict O(1) intrusive unlinking
                        level.unlink(&mut self.arena, slab_idx, remaining_size);
                        if level.is_empty() {
                            level_empty = true;
                        }
                    }
                    if level_empty {
                        self.bids.remove(&price);
                    }
                }
                Side::Sell => {
                    if let Some(level) = self.asks.get_mut(&price) {
                        // Strict O(1) intrusive unlinking
                        level.unlink(&mut self.arena, slab_idx, remaining_size);
                        if level.is_empty() {
                            level_empty = true;
                        }
                    }
                    if level_empty {
                        self.asks.remove(&price);
                    }
                }
            }

            self.arena.free(slab_idx);
            return true;
        }

        false
    }

    /// Fast L2 depth snapshot extracted in O(L) where L is max_levels (no inner order iterations)
    pub fn get_l2_depth(&self, max_levels: usize) -> (Vec<(f64, f64)>, Vec<(f64, f64)>) {
        let bids: Vec<(f64, f64)> = self.bids.iter().rev().take(max_levels).map(|(&p, level)| {
            (p as f64 / PRICE_SCALE as f64, level.total_size_usd as f64 / USD_SCALE as f64)
        }).collect();

        let asks: Vec<(f64, f64)> = self.asks.iter().take(max_levels).map(|(&p, level)| {
            (p as f64 / PRICE_SCALE as f64, level.total_size_usd as f64 / USD_SCALE as f64)
        }).collect();

        (bids, asks)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_test_order(id_byte: u8, side: Side, price: u64, size: u64) -> SlabOrder {
        let mut id_bytes = [0u8; 16];
        id_bytes[0] = id_byte;
        SlabOrder {
            id: FixedId(id_bytes),
            trader_id: FixedId(id_bytes),
            side,
            order_type: OrderType::Limit,
            price,
            size_usd: size,
            remaining_size_usd: size,
            margin_usdc: size / 10,
            leverage: 10,
            created_at: 1000,
            prev_idx: NULL_IDX,
            next_idx: NULL_IDX,
        }
    }

    #[test]
    fn test_intrusive_unlinking_at_any_position() {
        let mut book = SlabOrderBook::new("AVAX".to_string(), 100);
        let price = 10 * PRICE_SCALE;

        // Place 3 orders at same price level: A -> B -> C
        let ord_a = make_test_order(1, Side::Buy, price, 100 * USD_SCALE);
        let ord_b = make_test_order(2, Side::Buy, price, 200 * USD_SCALE);
        let ord_c = make_test_order(3, Side::Buy, price, 300 * USD_SCALE);

        book.place_limit_order(ord_a.clone());
        book.place_limit_order(ord_b.clone());
        book.place_limit_order(ord_c.clone());

        let level = book.bids.get(&price).unwrap();
        assert_eq!(level.order_count, 3);
        assert_eq!(level.total_size_usd, 600 * USD_SCALE);

        // Cancel order B in the middle in O(1)
        let cancelled = book.cancel_order(&ord_b.id);
        assert!(cancelled);

        let level = book.bids.get(&price).unwrap();
        assert_eq!(level.order_count, 2);
        assert_eq!(level.total_size_usd, 400 * USD_SCALE);

        // Verify remaining queue order is A -> C
        let head = book.arena.get(level.head_idx).unwrap();
        assert_eq!(head.id, ord_a.id);
        assert_eq!(head.next_idx, level.tail_idx);

        let tail = book.arena.get(level.tail_idx).unwrap();
        assert_eq!(tail.id, ord_c.id);
        assert_eq!(tail.prev_idx, level.head_idx);

        // Cancel head order A in O(1)
        book.cancel_order(&ord_a.id);
        let level = book.bids.get(&price).unwrap();
        assert_eq!(level.order_count, 1);
        assert_eq!(level.head_idx, level.tail_idx);

        // Cancel tail order C in O(1)
        book.cancel_order(&ord_c.id);
        assert!(book.bids.get(&price).is_none());
    }

    #[test]
    fn test_fifo_matching_order() {
        let mut book = SlabOrderBook::new("AVAX".to_string(), 100);
        let price = 20 * PRICE_SCALE;

        // Two sellers at $20: Seller 1 (100 USD), Seller 2 (200 USD)
        let sell_1 = make_test_order(10, Side::Sell, price, 100 * USD_SCALE);
        let sell_2 = make_test_order(11, Side::Sell, price, 200 * USD_SCALE);

        book.place_limit_order(sell_1.clone());
        book.place_limit_order(sell_2.clone());

        // Buyer comes in with size 150 USD at $20
        let buy = make_test_order(20, Side::Buy, price, 150 * USD_SCALE);
        let trades = book.place_limit_order(buy);

        assert_eq!(trades.len(), 2);
        // First trade fills Seller 1 completely (FIFO)
        assert_eq!(trades[0].maker_order_id, Some(sell_1.id));
        assert_eq!(trades[0].size_usd, 100 * USD_SCALE);

        // Second trade partially fills Seller 2
        assert_eq!(trades[1].maker_order_id, Some(sell_2.id));
        assert_eq!(trades[1].size_usd, 50 * USD_SCALE);

        // Seller 2 should still have 150 USD resting
        let level = book.asks.get(&price).unwrap();
        assert_eq!(level.order_count, 1);
        assert_eq!(level.total_size_usd, 150 * USD_SCALE);
    }
}
