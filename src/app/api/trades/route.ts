import { NextRequest, NextResponse } from "next/server";
import { matchingEngine } from "@/lib/matchingEngine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const market = searchParams.get("market") || undefined;
    const trades = matchingEngine.getTrades(market);
    return NextResponse.json({ success: true, trades });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to get trades" },
      { status: 500 }
    );
  }
}

