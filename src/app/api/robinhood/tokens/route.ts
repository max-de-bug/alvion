import { NextResponse } from "next/server";
import { fetchRobinhoodStockTokens } from "@/lib/robinhoodTokens";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");

    const tokens = await fetchRobinhoodStockTokens();

    if (symbol) {
      const match = tokens.find(
        (t) => t.tokenSymbol.toUpperCase() === symbol.toUpperCase()
      );
      if (!match) {
        return NextResponse.json(
          { success: false, error: `Stock token '${symbol}' not found on Robinhood Chain` },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        network: "Robinhood Chain Mainnet (Chain ID: 4663)",
        token: match,
      });
    }

    return NextResponse.json({
      success: true,
      network: "Robinhood Chain Mainnet (Chain ID: 4663)",
      count: tokens.length,
      tokens,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch Robinhood stock tokens",
      },
      { status: 500 }
    );
  }
}

