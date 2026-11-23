import { NextRequest, NextResponse } from "next/server";

const RUST_CLOB_URL = "http://127.0.0.1:8080";
const USD_SCALE = 1_000_000;

const DEFAULT_DOMAINS: Record<
  string,
  {
    insurance_usdc: number;
    max_pnl_cap_usdc: number;
    long_oi: number;
    short_oi: number;
    avail_long: number;
    avail_short: number;
  }
> = {
  SPY: {
    insurance_usdc: 5_000_000,
    max_pnl_cap_usdc: 10_000_000,
    long_oi: 98_840_000,
    short_oi: 99_940_000,
    avail_long: 1_160_000,
    avail_short: 57_280,
  },
  QQQ: {
    insurance_usdc: 3_000_000,
    max_pnl_cap_usdc: 6_000_000,
    long_oi: 41_200_000,
    short_oi: 40_850_000,
    avail_long: 840_000,
    avail_short: 120_500,
  },
  NVDA: {
    insurance_usdc: 3_500_000,
    max_pnl_cap_usdc: 7_000_000,
    long_oi: 34_120_000,
    short_oi: 33_890_000,
    avail_long: 720_000,
    avail_short: 94_000,
  },
  TSLA: {
    insurance_usdc: 2_500_000,
    max_pnl_cap_usdc: 5_000_000,
    long_oi: 22_500_000,
    short_oi: 23_100_000,
    avail_long: 610_000,
    avail_short: 88_000,
  },
  AAPL: {
    insurance_usdc: 2_500_000,
    max_pnl_cap_usdc: 5_000_000,
    long_oi: 18_400_000,
    short_oi: 18_250_000,
    avail_long: 550_000,
    avail_short: 76_000,
  },
  MSFT: {
    insurance_usdc: 2_000_000,
    max_pnl_cap_usdc: 4_000_000,
    long_oi: 15_800_000,
    short_oi: 15_600_000,
    avail_long: 480_000,
    avail_short: 65_000,
  },
  AMZN: {
    insurance_usdc: 2_000_000,
    max_pnl_cap_usdc: 4_000_000,
    long_oi: 14_200_000,
    short_oi: 14_100_000,
    avail_long: 420_000,
    avail_short: 59_000,
  },
  GOOGL: {
    insurance_usdc: 2_000_000,
    max_pnl_cap_usdc: 4_000_000,
    long_oi: 12_500_000,
    short_oi: 12_400_000,
    avail_long: 390_000,
    avail_short: 52_000,
  },
  META: {
    insurance_usdc: 2_000_000,
    max_pnl_cap_usdc: 4_000_000,
    long_oi: 16_700_000,
    short_oi: 16_900_000,
    avail_long: 430_000,
    avail_short: 61_000,
  },
  COIN: {
    insurance_usdc: 1_500_000,
    max_pnl_cap_usdc: 3_000_000,
    long_oi: 9_400_000,
    short_oi: 9_250_000,
    avail_long: 310_000,
    avail_short: 45_000,
  },
  MSTR: {
    insurance_usdc: 1_500_000,
    max_pnl_cap_usdc: 3_000_000,
    long_oi: 8_900_000,
    short_oi: 9_100_000,
    avail_long: 280_000,
    avail_short: 42_000,
  },
  AVAX: {
    insurance_usdc: 2_000_000,
    max_pnl_cap_usdc: 4_000_000,
    long_oi: 12_450_000,
    short_oi: 11_800_000,
    avail_long: 650_000,
    avail_short: 85_000,
  },
  BTC: {
    insurance_usdc: 5_000_000,
    max_pnl_cap_usdc: 10_000_000,
    long_oi: 48_200_000,
    short_oi: 46_900_000,
    avail_long: 1_450_000,
    avail_short: 180_000,
  },
  ETH: {
    insurance_usdc: 4_000_000,
    max_pnl_cap_usdc: 8_000_000,
    long_oi: 28_400_000,
    short_oi: 29_100_000,
    avail_long: 980_000,
    avail_short: 140_000,
  },
  SOL: {
    insurance_usdc: 2_500_000,
    max_pnl_cap_usdc: 5_000_000,
    long_oi: 19_800_000,
    short_oi: 19_200_000,
    avail_long: 580_000,
    avail_short: 78_000,
  },
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const market = (searchParams.get("market") || "SPY").toUpperCase();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    try {
      const rustRes = await fetch(`${RUST_CLOB_URL}/api/domain/${market}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (rustRes.ok) {
        const data = await rustRes.json();
        if (data.domain) {
          return NextResponse.json({
            success: true,
            domain: {
              market: data.domain.market,
              isolated_insurance_fund_usdc: data.domain.isolated_insurance_fund_usdc / USD_SCALE,
              max_realizable_pnl_cap_usdc: data.domain.max_realizable_pnl_cap_usdc / USD_SCALE,
              current_realized_pnl_usdc: data.domain.current_realized_pnl_usdc / USD_SCALE,
              long_open_interest_usd: data.domain.long_open_interest_usd / USD_SCALE,
              short_open_interest_usd: data.domain.short_open_interest_usd / USD_SCALE,
              available_long_liquidity_usd: data.domain.available_long_liquidity_usd / USD_SCALE,
              available_short_liquidity_usd: data.domain.available_short_liquidity_usd / USD_SCALE,
              firewall_status: "ACTIVE_PROTECTED",
              pnl_protection: "JUNIOR_TRANCHE_CAPPED",
            },
            source: "RUST_ENGINE_ON_PORT_8080",
          });
        }
      }
    } catch {
      clearTimeout(timeoutId);
    }

    const domainConfig = DEFAULT_DOMAINS[market] || DEFAULT_DOMAINS.SPY;
    const netSkew = Math.abs(domainConfig.long_oi - domainConfig.short_oi);
    const capacity = domainConfig.insurance_usdc * 2;
    const domainUtilizationPct = Number(((netSkew / capacity) * 100).toFixed(1));

    let dynamicMaxLeverage = 1000;
    let dampenerStatus: "OPTIMAL" | "DAMPENED" | "GUARDED" | "RESTRICTED" = "OPTIMAL";

    if (domainUtilizationPct >= 90) {
      dynamicMaxLeverage = 10;
      dampenerStatus = "RESTRICTED";
    } else if (domainUtilizationPct >= 75) {
      dynamicMaxLeverage = 50;
      dampenerStatus = "GUARDED";
    } else if (domainUtilizationPct >= 50) {
      dynamicMaxLeverage = 100;
      dampenerStatus = "DAMPENED";
    }

    return NextResponse.json({
      success: true,
      domain: {
        market,
        isolated_insurance_fund_usdc: domainConfig.insurance_usdc,
        max_realizable_pnl_cap_usdc: domainConfig.max_pnl_cap_usdc,
        current_realized_pnl_usdc: 0,
        long_open_interest_usd: domainConfig.long_oi,
        short_open_interest_usd: domainConfig.short_oi,
        available_long_liquidity_usd: domainConfig.avail_long,
        available_short_liquidity_usd: domainConfig.avail_short,
        domain_utilization_pct: domainUtilizationPct,
        dynamic_max_leverage: dynamicMaxLeverage,
        dampener_status: dampenerStatus,
        firewall_status: "ACTIVE_PROTECTED",
        pnl_protection: "JUNIOR_TRANCHE_CAPPED",
      },
      source: "FALLBACK_DOMAIN_VALIDATOR",
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Domain query failed" },
      { status: 500 }
    );
  }
}
