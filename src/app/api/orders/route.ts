import { NextRequest, NextResponse } from "next/server";
import { matchingEngine } from "@/lib/matchingEngine";

const RUST_CLOB_URL = "http://127.0.0.1:8080";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const market = searchParams.get("market") || undefined;
    const trader = searchParams.get("trader") || undefined;
    const status = searchParams.get("status") || undefined;

    const orders = matchingEngine.getOrders({ market, trader, status });
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to get orders" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      trader = "0xUserAvalancheWallet",
      market = "AVAX",
      isLong = true,
      orderType = "LIMIT",
      price,
      sizeUsd,
      marginUsdc,
      leverage = 20,
      expiry = Date.now() + 86400000,
      signature = "0xeip712mocksignature",
    } = body;

    if (!price || price <= 0) {
      return NextResponse.json({ success: false, error: "Invalid price" }, { status: 400 });
    }
    if (!sizeUsd || sizeUsd <= 0) {
      return NextResponse.json({ success: false, error: "Invalid size" }, { status: 400 });
    }

    // Try Rust CLOB Engine first if running
    try {
      const rustRes = await fetch(`${RUST_CLOB_URL}/api/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trader,
          market,
          is_long: isLong,
          order_type: orderType,
          price,
          size_usd: sizeUsd,
          margin_usdc: marginUsdc,
          leverage,
          signature,
        }),
        signal: AbortSignal.timeout(200),
      });

      if (rustRes.ok) {
        const rustData = await rustRes.json();
        return NextResponse.json({
          success: true,
          engine: "Rust High-Performance CLOB (480k+ ops/sec)",
          order: {
            id: rustData.order_id,
            trader,
            market,
            isLong,
            orderType,
            price,
            sizeUsd,
            marginUsdc,
            leverage,
            status: rustData.status,
            createdAt: Date.now(),
          },
          trades: rustData.trades,
          position: rustData.position,
          settlementMessage:
            rustData.trades_count > 0
              ? `Matched in Rust Engine (${rustData.trades_count} fill) -> Settling to Avalanche C-Chain USDC Vault`
              : "Order resting on Rust CLOB Book (0 Gas • EIP-712)",
        });
      }
    } catch {
      // Fallback to internal TS engine if Rust service is offline
    }

    // In-memory fallback
    const { order, trades } = matchingEngine.submitOrder({
      trader,
      market,
      isLong,
      orderType,
      price,
      sizeUsd,
      marginUsdc,
      leverage,
      nonce: Math.floor(Math.random() * 100000),
      expiry,
      signature,
    });

    return NextResponse.json({
      success: true,
      engine: "TypeScript Sequencer",
      order,
      trades,
      settlementMessage:
        trades.length > 0
          ? `Matched ${trades.length} fill(s) -> Settling to Avalanche C-Chain USDC Vault`
          : "Order resting on CLOB Order Book (0 Gas)",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to place order" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("id");
    const market = searchParams.get("market") || "AVAX";

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 });
    }

    // Try Rust Engine cancel
    try {
      await fetch(`${RUST_CLOB_URL}/api/order/${market}/${orderId}`, {
        method: "DELETE",
        signal: AbortSignal.timeout(200),
      });
    } catch {
      // ignore
    }

    const cancelled = matchingEngine.cancelOrder(orderId);
    if (!cancelled) {
      return NextResponse.json(
        { success: false, error: "Order not found or already closed" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Order ${orderId} cancelled instantly (0 Gas).`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to cancel order" },
      { status: 500 }
    );
  }
}
