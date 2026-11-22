import { NextRequest, NextResponse } from "next/server";

export interface OrderBookLevel {
  px: string;
  sz: string;
  n: number;
}

export interface L2OrderBook {
  coin: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  spread: number;
  spreadBps: number;
}

const HYPERLIQUID_API_URL = "https://api.hyperliquid.xyz/info";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const coin = searchParams.get("coin") || "SOL";

    const res = await fetch(HYPERLIQUID_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "l2Book", coin }),
      next: { revalidate: 1 },
    });

    if (!res.ok) {
      throw new Error(`Hyperliquid API returned ${res.statusText}`);
    }

    const data = await res.json();
    const rawBids: OrderBookLevel[] = data?.levels?.[0] || [];
    const rawAsks: OrderBookLevel[] = data?.levels?.[1] || [];

    const bestBid = rawBids.length > 0 ? parseFloat(rawBids[0].px) : 0;
    const bestAsk = rawAsks.length > 0 ? parseFloat(rawAsks[0].px) : 0;
    const spread = bestAsk > 0 && bestBid > 0 ? bestAsk - bestBid : 0;
    const mid = bestAsk > 0 && bestBid > 0 ? (bestAsk + bestBid) / 2 : 1;
    const spreadBps = (spread / mid) * 10000;

    return NextResponse.json({
      success: true,
      orderBook: {
        coin,
        bids: rawBids.slice(0, 10),
        asks: rawAsks.slice(0, 10),
        spread,
        spreadBps,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch order book",
      },
      { status: 500 }
    );
  }
}

