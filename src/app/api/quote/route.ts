import { NextRequest, NextResponse } from "next/server";
import { fetchHyperliquidMarkets, calculateQuote } from "@/lib/hyperliquid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      market = "AVAX",
      isLong = true,
      marginUsdc = 100,
      leverage = 20,
      vaultLiquidityUsdc = 5_000_000,
      vaultNetSkewUsdc = 350_000,
    } = body;

    const markets = await fetchHyperliquidMarkets();
    const marketCtx = markets.find(
      (m) => m.name.toUpperCase() === market.toUpperCase()
    );

    if (!marketCtx) {
      return NextResponse.json(
        { success: false, error: `Market '${market}' not found` },
        { status: 404 }
      );
    }

    if (leverage < 1 || leverage > 100) {
      return NextResponse.json(
        { success: false, error: "Leverage must be between 1x and 100x" },
        { status: 400 }
      );
    }

    if (marginUsdc <= 0) {
      return NextResponse.json(
        { success: false, error: "Margin USDC must be positive" },
        { status: 400 }
      );
    }

    const quote = calculateQuote(marketCtx, {
      market,
      isLong,
      marginUsdc,
      leverage,
      vaultLiquidityUsdc,
      vaultNetSkewUsdc,
    });

    return NextResponse.json({
      success: true,
      quote,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate quote",
      },
      { status: 500 }
    );
  }
}
