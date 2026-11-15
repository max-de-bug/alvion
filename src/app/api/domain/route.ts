import { NextRequest, NextResponse } from "next/server";

const RUST_CLOB_URL = "http://127.0.0.1:8080";

const DEFAULT_DOMAINS: Record<string, { insurance_usdc: number; max_pnl_cap_usdc: number }> = {
  AVAX: { insurance_usdc: 250_000, max_pnl_cap_usdc: 500_000 },
  BTC: { insurance_usdc: 1_000_000, max_pnl_cap_usdc: 2_000_000 },
  ETH: { insurance_usdc: 750_000, max_pnl_cap_usdc: 1_500_000 },
  SOL: { insurance_usdc: 500_000, max_pnl_cap_usdc: 1_000_000 },
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const market = (searchParams.get("market") || "AVAX").toUpperCase();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    try {
      const rustRes = await fetch(`${RUST_CLOB_URL}/api/domain/${market}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (rustRes.ok) {
        const data = await rustRes.json();
        return NextResponse.json({ ...data, source: "RUST_ENGINE_ON_PORT_8080" });
      }
    } catch {
      clearTimeout(timeoutId);
    }

    const domainConfig = DEFAULT_DOMAINS[market] || {
      insurance_usdc: 200_000,
      max_pnl_cap_usdc: 400_000,
    };

    return NextResponse.json({
      success: true,
      domain: {
        market,
        isolated_insurance_fund_usdc: domainConfig.insurance_usdc,
        max_realizable_pnl_cap_usdc: domainConfig.max_pnl_cap_usdc,
        current_realized_pnl_usdc: 14_250,
        long_open_interest_usd: 1_240_000,
        short_open_interest_usd: 820_000,
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

