export interface OrderBookLevel {
  px: string;
  sz: string;
  n: number;
}

export interface OrderBookData {
  coin: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  spread: number;
  spreadBps: number;
}

export interface SolvencyData {
  is_solvent: boolean;
  total_assets_usdc: number;
  total_liabilities_usdc: number;
  solvency_ratio?: string;
  conservation_invariant?: string;
}

export interface DomainData {
  market: string;
  isolated_insurance_fund_usdc: number;
  max_realizable_pnl_cap_usdc: number;
  current_realized_pnl_usdc: number;
  long_open_interest_usd: number;
  short_open_interest_usd: number;
  available_long_liquidity_usd?: number;
  available_short_liquidity_usd?: number;
  domain_utilization_pct?: number;
  dynamic_max_leverage?: number;
  dampener_status?: "OPTIMAL" | "DAMPENED" | "GUARDED" | "RESTRICTED";
  firewall_status?: string;
  pnl_protection?: string;
}

export interface FundingData {
  market: string;
  oracle_price: number;
  mark_price: number;
  impact_bid: number;
  impact_ask: number;
  clob_premium_bps: number;
  vault_skew_bps: number;
  funding_rate_1h_pct: number;
  long_funding_rate_1h_pct?: number;
  short_funding_rate_1h_pct?: number;
  funding_rate_8h_pct: number;
  next_funding_time: number;
  formula?: string;
}

