import { SignedOrder, MatchedTrade } from "./orderTypes";

class MatchingEngine {
  private orders: Map<string, SignedOrder> = new Map();
  private trades: MatchedTrade[] = [];
  private orderNonce: number = 1000;

  constructor() {
    // Seed some initial maker orders for demonstration
    this.seedInitialLiquidity();
  }

  private seedInitialLiquidity() {
    const defaultMarkets = [
      { name: "AVAX", price: 7.18 },
      { name: "BTC", price: 64550.0 },
      { name: "ETH", price: 2680.0 },
      { name: "SOL", price: 142.5 },
    ];

    defaultMarkets.forEach((m) => {
      // Resting Bid
      const bidId = `ORDER-INIT-BID-${m.name}`;
      this.orders.set(bidId, {
        id: bidId,
        trader: "0x71C...Maker1",
        market: m.name,
        isLong: true,
        orderType: "LIMIT",
        price: m.price * 0.998,
        sizeUsd: 15000,
        marginUsdc: 300,
        leverage: 50,
        nonce: this.orderNonce++,
        expiry: Date.now() + 86400000,
        status: "OPEN",
        filledSizeUsd: 0,
        createdAt: Date.now() - 30000,
      });

      // Resting Ask
      const askId = `ORDER-INIT-ASK-${m.name}`;
      this.orders.set(askId, {
        id: askId,
        trader: "0x39B...Maker2",
        market: m.name,
        isLong: false,
        orderType: "LIMIT",
        price: m.price * 1.002,
        sizeUsd: 15000,
        marginUsdc: 300,
        leverage: 50,
        nonce: this.orderNonce++,
        expiry: Date.now() + 86400000,
        status: "OPEN",
        filledSizeUsd: 0,
        createdAt: Date.now() - 25000,
      });
    });
  }

  /**
   * Submit an order (Limit order rests or matches; Market order fills immediately)
   */
  public submitOrder(orderInput: Omit<SignedOrder, "id" | "status" | "filledSizeUsd" | "createdAt">): {
    order: SignedOrder;
    trades: MatchedTrade[];
  } {
    const id = "ORD-" + Math.floor(100000 + Math.random() * 900000);
    const order: SignedOrder = {
      ...orderInput,
      id,
      status: "OPEN",
      filledSizeUsd: 0,
      createdAt: Date.now(),
    };

    const trades: MatchedTrade[] = [];

    // If limit order, check matching against existing open opposite orders
    if (order.orderType === "LIMIT") {
      const openOppositeOrders = Array.from(this.orders.values()).filter(
        (o) =>
          o.market === order.market &&
          o.status === "OPEN" &&
          o.isLong !== order.isLong &&
          o.id !== order.id
      );

      // Sort: If order is Long (Buy), match against lowest sell asks
      // If order is Short (Sell), match against highest buy bids
      openOppositeOrders.sort((a, b) => (order.isLong ? a.price - b.price : b.price - a.price));

      let remainingSize = order.sizeUsd;

      for (const maker of openOppositeOrders) {
        const isMatch = order.isLong
          ? order.price >= maker.price
          : order.price <= maker.price;

        if (!isMatch) break;

        const makerAvailable = maker.sizeUsd - maker.filledSizeUsd;
        const matchSize = Math.min(remainingSize, makerAvailable);

        if (matchSize > 0) {
          maker.filledSizeUsd += matchSize;
          if (maker.filledSizeUsd >= maker.sizeUsd) {
            maker.status = "MATCHED";
          }

          remainingSize -= matchSize;
          order.filledSizeUsd += matchSize;

          const trade: MatchedTrade = {
            id: "TRD-" + Math.floor(100000 + Math.random() * 900000),
            market: order.market,
            price: maker.price,
            sizeUsd: matchSize,
            makerOrderId: maker.id,
            takerOrderId: order.id,
            buyer: order.isLong ? order.trader : maker.trader,
            seller: order.isLong ? maker.trader : order.trader,
            isLong: order.isLong,
            timestamp: Date.now(),
            settlementTxHash: "0xavax" + Math.random().toString(16).substring(2, 18),
            status: "SETTLED_ON_AVALANCHE",
          };

          this.trades.unshift(trade);
          trades.push(trade);

          if (remainingSize <= 0) {
            order.status = "MATCHED";
            break;
          }
        }
      }

      this.orders.set(order.id, order);
    } else {
      // Market order fills immediately against the Single USDC Vault
      order.status = "MATCHED";
      order.filledSizeUsd = order.sizeUsd;

      const trade: MatchedTrade = {
        id: "TRD-VAULT-" + Math.floor(100000 + Math.random() * 900000),
        market: order.market,
        price: order.price,
        sizeUsd: order.sizeUsd,
        takerOrderId: order.id,
        buyer: order.isLong ? order.trader : "0xAlvionUsdcVault",
        seller: order.isLong ? "0xAlvionUsdcVault" : order.trader,
        isLong: order.isLong,
        timestamp: Date.now(),
        settlementTxHash: "0xavax" + Math.random().toString(16).substring(2, 18),
        status: "SETTLED_ON_AVALANCHE",
      };

      this.trades.unshift(trade);
      trades.push(trade);
      this.orders.set(order.id, order);
    }

    // Keep max 50 recent trades
    if (this.trades.length > 50) {
      this.trades = this.trades.slice(0, 50);
    }

    return { order, trades };
  }

  /**
   * Cancel open order (instant, zero gas)
   */
  public cancelOrder(orderId: string): boolean {
    const order = this.orders.get(orderId);
    if (order && order.status === "OPEN") {
      order.status = "CANCELLED";
      return true;
    }
    return false;
  }

  /**
   * Get all active open orders for a market or trader
   */
  public getOrders(filters?: { market?: string; trader?: string; status?: string }): SignedOrder[] {
    let list = Array.from(this.orders.values());
    if (filters?.market) {
      list = list.filter((o) => o.market.toUpperCase() === filters.market!.toUpperCase());
    }
    if (filters?.trader) {
      list = list.filter((o) => o.trader.toLowerCase() === filters.trader!.toLowerCase());
    }
    if (filters?.status) {
      list = list.filter((o) => o.status === filters.status);
    }
    return list.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Get recent trades
   */
  public getTrades(market?: string): MatchedTrade[] {
    if (market) {
      return this.trades.filter((t) => t.market.toUpperCase() === market.toUpperCase());
    }
    return this.trades;
  }
}

// Global singleton instance for the server runtime
const globalForMatchingEngine = globalThis as unknown as {
  matchingEngineInstance?: MatchingEngine;
};

export const matchingEngine =
  globalForMatchingEngine.matchingEngineInstance ?? new MatchingEngine();

if (process.env.NODE_ENV !== "production") {
  globalForMatchingEngine.matchingEngineInstance = matchingEngine;
}

