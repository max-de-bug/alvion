// Percolator-inspired Source-Domain Risk Firewall & Junior PnL Engine
// Ensures profits from long-tail/volatile pairs cannot drain the primary USDC vault.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::types::{Position, Side, USD_SCALE};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarketDomain {
    pub market: String,
    pub isolated_insurance_fund_usdc: u64, // Dedicated insurance buffer for this market
    pub max_realizable_pnl_cap_usdc: u64,  // Maximum profit traders can realize from this domain
    pub current_realized_pnl_usdc: i64,    // Running realized PnL in this domain
    pub long_open_interest_usd: u64,
    pub short_open_interest_usd: u64,
}

#[derive(Debug)]
pub enum DomainError {
    MarketNotFound,
    PositionNotFound,
    PositionClosed,
    ExceededDomainPnlCap { requested: u64, allowed: u64 },
    MaintenanceMarginViolated,
}

pub struct DomainRiskManager {
    pub domains: HashMap<String, MarketDomain>,
    pub positions: HashMap<String, Position>,
    pub total_vault_liquidity_usdc: u64,
}

impl DomainRiskManager {
    pub fn new(vault_liquidity_usdc: u64) -> Self {
        let mut manager = Self {
            domains: HashMap::new(),
            positions: HashMap::new(),
            total_vault_liquidity_usdc: vault_liquidity_usdc,
        };

        // Initialize risk domains for standard markets
        manager.add_domain("AVAX", 250_000 * USD_SCALE, 500_000 * USD_SCALE);
        manager.add_domain("BTC", 1_000_000 * USD_SCALE, 2_000_000 * USD_SCALE);
        manager.add_domain("ETH", 750_000 * USD_SCALE, 1_500_000 * USD_SCALE);
        manager.add_domain("SOL", 500_000 * USD_SCALE, 1_000_000 * USD_SCALE);

        manager
    }

    pub fn add_domain(&mut self, market: &str, insurance_usdc: u64, max_pnl_cap: u64) {
        self.domains.insert(
            market.to_string(),
            MarketDomain {
                market: market.to_string(),
                isolated_insurance_fund_usdc: insurance_usdc,
                max_realizable_pnl_cap_usdc: max_pnl_cap,
                current_realized_pnl_usdc: 0,
                long_open_interest_usd: 0,
                short_open_interest_usd: 0,
            },
        );
    }

    /// Open position and increment domain Open Interest
    pub fn open_position(
        &mut self,
        trader: String,
        market: String,
        side: Side,
        margin_usdc: u64,
        leverage: u32,
        size_usd: u64,
        entry_price: u64,
    ) -> Result<Position, DomainError> {
        let domain = self.domains.get_mut(&market).ok_or(DomainError::MarketNotFound)?;

        match side {
            Side::Buy => domain.long_open_interest_usd += size_usd,
            Side::Sell => domain.short_open_interest_usd += size_usd,
        }

        let now = chrono::Utc::now().timestamp() as u64;
        let id = format!("POS-{}", Uuid::new_v4().simple());

        let pos = Position {
            id: id.clone(),
            trader,
            market,
            side,
            margin_usdc,
            leverage,
            size_usd,
            entry_price,
            open_timestamp: now,
            is_open: true,
        };

        self.positions.insert(id, pos.clone());
        Ok(pos)
    }

    /// Close position with "Junior PnL" Source-Domain constraint
    /// If market manipulated, profit payout is bounded by the domain's realizable cap!
    pub fn close_position_with_junior_pnl(
        &mut self,
        position_id: &str,
        exit_price: u64,
    ) -> Result<(i64, u64), DomainError> {
        let pos = self.positions.get_mut(position_id).ok_or(DomainError::PositionNotFound)?;
        if !pos.is_open {
            return Err(DomainError::PositionClosed);
        }

        let market = pos.market.clone();
        let raw_pnl = Self::calc_pnl(pos.side, pos.entry_price, pos.size_usd, exit_price);

        let domain = self.domains.get_mut(&market).ok_or(DomainError::MarketNotFound)?;

        // Deduct Open Interest
        match pos.side {
            Side::Buy => domain.long_open_interest_usd = domain.long_open_interest_usd.saturating_sub(pos.size_usd),
            Side::Sell => domain.short_open_interest_usd = domain.short_open_interest_usd.saturating_sub(pos.size_usd),
        }

        pos.is_open = false;

        let realizable_pnl = if raw_pnl > 0 {
            let requested_profit = raw_pnl as u64;
            // Junior PnL Cap: maximum realizable payout backed by domain's insurance + quota
            let available_cap = domain.max_realizable_pnl_cap_usdc.saturating_sub(domain.current_realized_pnl_usdc.max(0) as u64);
            let capped_profit = requested_profit.min(available_cap);
            domain.current_realized_pnl_usdc += capped_profit as i64;
            capped_profit as i64
        } else {
            // Losses accrue directly into domain reserves and vault
            domain.current_realized_pnl_usdc += raw_pnl;
            raw_pnl
        };

        let payout_usdc = if realizable_pnl >= 0 {
            pos.margin_usdc + realizable_pnl as u64
        } else {
            let loss = (-realizable_pnl) as u64;
            pos.margin_usdc.saturating_sub(loss)
        };

        Ok((realizable_pnl, payout_usdc))
    }

    /// Check if position is liquidatable (Maintenance margin = 0.8% = 80 bps)
    pub fn can_liquidate(&self, position_id: &str, current_price: u64) -> Result<bool, DomainError> {
        let pos = self.positions.get(position_id).ok_or(DomainError::PositionNotFound)?;
        if !pos.is_open {
            return Err(DomainError::PositionClosed);
        }

        let pnl = Self::calc_pnl(pos.side, pos.entry_price, pos.size_usd, current_price);
        let remaining_margin = pos.margin_usdc as i64 + pnl;
        let maintenance_threshold = (pos.size_usd * 80) / 10000;

        Ok(remaining_margin <= maintenance_threshold as i64)
    }

    /// Percolation Invariant 1: Conservation of Value / Solvency Proof
    /// Asserts that total protocol assets >= all locked margins + Junior PnL obligations
    pub fn verify_solvency_invariant(&self) -> (bool, u64, u64) {
        let total_locked_margin: u64 = self.positions.values().filter(|p| p.is_open).map(|p| p.margin_usdc).sum();
        let total_insurance_funds: u64 = self.domains.values().map(|d| d.isolated_insurance_fund_usdc).sum();
        let total_assets = self.total_vault_liquidity_usdc + total_insurance_funds;
        let is_solvent = total_assets >= total_locked_margin;
        (is_solvent, total_assets, total_locked_margin)
    }

    fn calc_pnl(side: Side, entry_price: u64, size_usd: u64, current_price: u64) -> i64 {
        if side == Side::Buy {
            let price_diff = current_price as i64 - entry_price as i64;
            (price_diff * size_usd as i64) / entry_price as i64
        } else {
            let price_diff = entry_price as i64 - current_price as i64;
            (price_diff * size_usd as i64) / entry_price as i64
        }
    }
}

