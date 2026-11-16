use std::collections::{BTreeMap, HashMap, VecDeque};
use crate::types::{Order, OrderBookLevel, Side, Trade, L2Depth, L4Level, L4Depth, PRICE_SCALE, USD_SCALE};
use uuid::Uuid;

pub struct OrderBook {
    pub market: String,
    // Bids sorted ascending, we will read reverse (highest price first)
    pub bids: BTreeMap<u64, VecDeque<Order>>,
    // Asks sorted ascending (lowest price first)
    pub asks: BTreeMap<u64, VecDeque<Order>>,
    // Index: order_id -> (Side, price) for O(1) order cancellation
    pub order_index: HashMap<String, (Side, u64)>,
}

impl OrderBook {
    pub fn new(market: String) -> Self {
        Self {
            market,
            bids: BTreeMap::new(),
            asks: BTreeMap::new(),
            order_index: HashMap::new(),
        }
    }

    /// Place a Limit Order: Matches crossed prices, or rests in book
    pub fn place_limit_order(&mut self, mut order: Order) -> Vec<Trade> {
        let mut trades = Vec::new();

        match order.side {
            Side::Buy => {
                // Match against lowest asks where ask_price <= order.price
                while order.remaining_size_usd > 0 {
                    let lowest_ask = match self.asks.keys().next().copied() {
                        Some(p) if p <= order.price => p,
                        _ => break,
                    };

                    let queue = self.asks.get_mut(&lowest_ask).unwrap();
                    while let Some(mut maker) = queue.pop_front() {
                        let match_size = order.remaining_size_usd.min(maker.remaining_size_usd);

                        order.remaining_size_usd -= match_size;
                        maker.remaining_size_usd -= match_size;

                        trades.push(Trade {
                            id: format!("TRD-{}", Uuid::new_v4().simple()),
                            market: self.market.clone(),
                            maker_order_id: Some(maker.id.clone()),
                            taker_order_id: order.id.clone(),
                            buyer: order.trader.clone(),
                            seller: maker.trader.clone(),
                            price: lowest_ask,
                            size_usd: match_size,
                            side: Side::Buy,
                            timestamp: chrono::Utc::now().timestamp() as u64,
                            settlement_tx_hash: format!("0xavax_{}", Uuid::new_v4().simple()),
                            status: "SETTLED_ON_AVALANCHE".to_string(),
                        });

                        if maker.remaining_size_usd > 0 {
                            queue.push_front(maker);
                            break;
                        } else {
                            self.order_index.remove(&maker.id);
                        }

                        if order.remaining_size_usd == 0 {
                            break;
                        }
                    }

                    if self.asks.get(&lowest_ask).map_or(false, |q| q.is_empty()) {
                        self.asks.remove(&lowest_ask);
                    }
                }

                // If size remains, rest on bids
                if order.remaining_size_usd > 0 {
                    let price = order.price;
                    let order_id = order.id.clone();
                    self.order_index.insert(order_id, (Side::Buy, price));
                    self.bids.entry(price).or_default().push_back(order);
                }
            }
            Side::Sell => {
                // Match against highest bids where bid_price >= order.price
                while order.remaining_size_usd > 0 {
                    let highest_bid = match self.bids.keys().next_back().copied() {
                        Some(p) if p >= order.price => p,
                        _ => break,
                    };

                    let queue = self.bids.get_mut(&highest_bid).unwrap();
                    while let Some(mut maker) = queue.pop_front() {
                        let match_size = order.remaining_size_usd.min(maker.remaining_size_usd);

                        order.remaining_size_usd -= match_size;
                        maker.remaining_size_usd -= match_size;

                        trades.push(Trade {
                            id: format!("TRD-{}", Uuid::new_v4().simple()),
                            market: self.market.clone(),
                            maker_order_id: Some(maker.id.clone()),
                            taker_order_id: order.id.clone(),
                            buyer: maker.trader.clone(),
                            seller: order.trader.clone(),
                            price: highest_bid,
                            size_usd: match_size,
                            side: Side::Sell,
                            timestamp: chrono::Utc::now().timestamp() as u64,
                            settlement_tx_hash: format!("0xavax_{}", Uuid::new_v4().simple()),
                            status: "SETTLED_ON_AVALANCHE".to_string(),
                        });

                        if maker.remaining_size_usd > 0 {
                            queue.push_front(maker);
                            break;
                        } else {
                            self.order_index.remove(&maker.id);
                        }

                        if order.remaining_size_usd == 0 {
                            break;
                        }
                    }

                    if self.bids.get(&highest_bid).map_or(false, |q| q.is_empty()) {
                        self.bids.remove(&highest_bid);
                    }
                }

                // If size remains, rest on asks
                if order.remaining_size_usd > 0 {
                    let price = order.price;
                    let order_id = order.id.clone();
                    self.order_index.insert(order_id, (Side::Sell, price));
                    self.asks.entry(price).or_default().push_back(order);
                }
            }
        }

        trades
    }

    /// Place a Market Order: Sweeps book, any remainder fills against the Single USDC Vault
    pub fn place_market_order(&mut self, order: Order, vault_oracle_price: u64) -> Vec<Trade> {
        let mut trades = self.place_limit_order(Order {
            price: if order.side == Side::Buy { u64::MAX } else { 0 },
            ..order.clone()
        });

        // Calculate remaining unfilled size
        let filled: u64 = trades.iter().map(|t| t.size_usd).sum();
        let unfilled = order.size_usd.saturating_sub(filled);

        // Fill remaining against Single USDC Vault Backstop
        if unfilled > 0 {
            trades.push(Trade {
                id: format!("TRD-VAULT-{}", Uuid::new_v4().simple()),
                market: self.market.clone(),
                maker_order_id: None,
                taker_order_id: order.id.clone(),
                buyer: if order.side == Side::Buy { order.trader.clone() } else { "0xAlvionUsdcVault".to_string() },
                seller: if order.side == Side::Sell { order.trader.clone() } else { "0xAlvionUsdcVault".to_string() },
                price: vault_oracle_price,
                size_usd: unfilled,
                side: order.side,
                timestamp: chrono::Utc::now().timestamp() as u64,
                settlement_tx_hash: format!("0xavax_vault_{}", Uuid::new_v4().simple()),
                status: "SETTLED_AGAINST_USDC_VAULT".to_string(),
            });
        }

        trades
    }

    /// Cancel order with O(1) index lookup (0 Gas)
    pub fn cancel_order(&mut self, order_id: &str) -> bool {
        if let Some((side, price)) = self.order_index.remove(order_id) {
            match side {
                Side::Buy => {
                    if let Some(queue) = self.bids.get_mut(&price) {
                        queue.retain(|o| o.id != order_id);
                        if queue.is_empty() {
                            self.bids.remove(&price);
                        }
                        return true;
                    }
                }
                Side::Sell => {
                    if let Some(queue) = self.asks.get_mut(&price) {
                        queue.retain(|o| o.id != order_id);
                        if queue.is_empty() {
                            self.asks.remove(&price);
                        }
                        return true;
                    }
                }
            }
        }
        false
    }

    /// Extract L2 Depth snapshot
    pub fn get_l2_depth(&self, max_levels: usize) -> L2Depth {
        let bids: Vec<OrderBookLevel> = self.bids.iter().rev().take(max_levels).map(|(&p, q)| {
            let total_size: u64 = q.iter().map(|o| o.remaining_size_usd).sum();
            OrderBookLevel {
                price: p as f64 / PRICE_SCALE as f64,
                size: total_size as f64 / USD_SCALE as f64,
                order_count: q.len(),
            }
        }).collect();

        let asks: Vec<OrderBookLevel> = self.asks.iter().take(max_levels).map(|(&p, q)| {
            let total_size: u64 = q.iter().map(|o| o.remaining_size_usd).sum();
            OrderBookLevel {
                price: p as f64 / PRICE_SCALE as f64,
                size: total_size as f64 / USD_SCALE as f64,
                order_count: q.len(),
            }
        }).collect();

        let best_bid = bids.first().map(|b| b.price).unwrap_or(0.0);
        let best_ask = asks.first().map(|a| a.price).unwrap_or(0.0);
        let spread = if best_ask > 0.0 && best_bid > 0.0 { best_ask - best_bid } else { 0.0 };
        let mid = if best_ask > 0.0 && best_bid > 0.0 { (best_ask + best_bid) / 2.0 } else { 1.0 };
        let spread_bps = (spread / mid) * 10000.0;

        L2Depth {
            market: self.market.clone(),
            bids,
            asks,
            spread,
            spread_bps,
        }
    }

    /// Calculate Impact Bid and Impact Ask (VWAP for a standard impact size, e.g. $5,000 USD)
    pub fn get_impact_prices(&self, impact_notional_usd: u64) -> (Option<u64>, Option<u64>) {
        // Impact Bid: selling impact_notional into the bids (highest down)
        let impact_bid = {
            let mut remaining = impact_notional_usd;
            let mut weighted_sum: u128 = 0;
            let mut total_filled: u64 = 0;

            for (&price, queue) in self.bids.iter().rev() {
                for order in queue {
                    let fill = order.remaining_size_usd.min(remaining);
                    weighted_sum += (price as u128) * (fill as u128);
                    total_filled += fill;
                    remaining = remaining.saturating_sub(fill);
                    if remaining == 0 {
                        break;
                    }
                }
                if remaining == 0 {
                    break;
                }
            }
            if total_filled > 0 {
                Some((weighted_sum / total_filled as u128) as u64)
            } else {
                self.bids.keys().next_back().copied()
            }
        };

        // Impact Ask: buying impact_notional from the asks (lowest up)
        let impact_ask = {
            let mut remaining = impact_notional_usd;
            let mut weighted_sum: u128 = 0;
            let mut total_filled: u64 = 0;

            for (&price, queue) in self.asks.iter() {
                for order in queue {
                    let fill = order.remaining_size_usd.min(remaining);
                    weighted_sum += (price as u128) * (fill as u128);
                    total_filled += fill;
                    remaining = remaining.saturating_sub(fill);
                    if remaining == 0 {
                        break;
                    }
                }
                if remaining == 0 {
                    break;
                }
            }
            if total_filled > 0 {
                Some((weighted_sum / total_filled as u128) as u64)
            } else {
                self.asks.keys().next().copied()
            }
        };

        (impact_bid, impact_ask)
    }

    /// Extract L4 Depth snapshot with automated Vault MM attribution and impact metrics
    pub fn get_l4_depth(&self, max_levels: usize, sequence: u64) -> L4Depth {
        let (impact_bid_scaled, impact_ask_scaled) = self.get_impact_prices(5_000 * USD_SCALE);

        let bids: Vec<L4Level> = self.bids.iter().rev().take(max_levels).map(|(&p, q)| {
            let total_size: u64 = q.iter().map(|o| o.remaining_size_usd).sum();
            let is_vault_mm = q.iter().any(|o| o.trader.contains("VaultMM") || o.id.starts_with("MM-"));
            L4Level {
                price: p as f64 / PRICE_SCALE as f64,
                size: total_size as f64 / USD_SCALE as f64,
                order_count: q.len(),
                is_vault_mm,
            }
        }).collect();

        let asks: Vec<L4Level> = self.asks.iter().take(max_levels).map(|(&p, q)| {
            let total_size: u64 = q.iter().map(|o| o.remaining_size_usd).sum();
            let is_vault_mm = q.iter().any(|o| o.trader.contains("VaultMM") || o.id.starts_with("MM-"));
            L4Level {
                price: p as f64 / PRICE_SCALE as f64,
                size: total_size as f64 / USD_SCALE as f64,
                order_count: q.len(),
                is_vault_mm,
            }
        }).collect();

        let best_bid = bids.first().map(|b| b.price).unwrap_or(0.0);
        let best_ask = asks.first().map(|a| a.price).unwrap_or(0.0);
        let spread = if best_ask > 0.0 && best_bid > 0.0 { best_ask - best_bid } else { 0.0 };
        let mid = if best_ask > 0.0 && best_bid > 0.0 { (best_ask + best_bid) / 2.0 } else { 1.0 };
        let spread_bps = (spread / mid) * 10000.0;

        let impact_bid = impact_bid_scaled.map_or(best_bid, |p| p as f64 / PRICE_SCALE as f64);
        let impact_ask = impact_ask_scaled.map_or(best_ask, |p| p as f64 / PRICE_SCALE as f64);

        L4Depth {
            market: self.market.clone(),
            sequence,
            timestamp: chrono::Utc::now().timestamp_millis() as u64,
            bids,
            asks,
            impact_bid,
            impact_ask,
            spread_bps,
        }
    }
}
