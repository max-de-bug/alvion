import { NextRequest, NextResponse } from "next/server";

const RUST_CLOB_URL = "http://127.0.0.1:8080";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const market = (searchParams.get("market") || "AVAX").toUpperCase();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    try {
      const rustRes = await fetch(`${RUST_CLOB_URL}/api/funding/${market}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (rustRes.ok) {
        const data = await rustRes.json();
        return NextResponse.json({ ...data, source: "RUST_CLOB_SEQUENCER" });
      }
    } catch {
      clearTimeout(timeoutId);
    }

    // High-precision mathematical fallback for Alvion Adaptive Skew Funding
    const defaultPrices: Record<string, number> = {
      SPY: 754.37,
      NVDA: 162.85,
      TSLA: 390.22,
      AAPL: 356.27,
      AVAX: 7.28,
      BTC: 65000.0,
      ETH: 1820.0,
    };
    const baseOracle = defaultPrices[market] || 100.0;
    const impactMid = baseOracle * 1.00015; // +1.5 bps
    const clobPremiumBps = ((impactMid - baseOracle) / baseOracle) * 10000;
    const vaultSkewBps = 1.2; // slight net long bias
    const hourlyRatePct = (clobPremiumBps * 0.125 * 0.01) + (vaultSkewBps * 0.0005);
    const longRate = Number(hourlyRatePct.toFixed(4)) || 0.0022;
    const shortRate = longRate > 0 ? Number((-longRate * 0.9).toFixed(4)) : 0.0010;
    const now = Math.floor(Date.now() / 1000);
    const nextFundingTime = (Math.floor(now / 3600) + 1) * 3600;

    return NextResponse.json({
      success: true,
      funding: {
        market,
        oracle_price: baseOracle,
        mark_price: impactMid,
        impact_bid: baseOracle * 0.9998,
        impact_ask: baseOracle * 1.0005,
        clob_premium_bps: Number(clobPremiumBps.toFixed(2)),
        vault_skew_bps: Number(vaultSkewBps.toFixed(2)),
        funding_rate_1h_pct: longRate,
        funding_rate_8h_pct: Number((longRate * 8).toFixed(4)),
        long_funding_rate_1h_pct: longRate,
        short_funding_rate_1h_pct: shortRate,
        next_funding_time: nextFundingTime,
        formula: "Alvion Adaptive: CLOB_Impact_Premium(1/8) + Vault_Inventory_Skew(0.05%)",
      },
      source: "FALLBACK_ADAPTIVE_FUNDING_CALCULATOR",
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Funding query failed" },
      { status: 500 }
    );
  }
}

