import { NextResponse } from "next/server";
import { fetchHyperliquidMarkets } from "@/lib/hyperliquid";

export async function GET() {
  try {
    const markets = await fetchHyperliquidMarkets();
    return NextResponse.json({
      success: true,
      timestamp: Date.now(),
      network: "Avalanche C-Chain",
      markets,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch markets",
      },
      { status: 500 }
    );
  }
}
