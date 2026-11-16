"use client";

import React from "react";
import { BookOpen } from "lucide-react";
import { MarketContext } from "@/lib/hyperliquid";
import { OrderBookData } from "@/types/trading";

interface FullOrderBookTabProps {
  currentMarket: MarketContext;
  orderBook: OrderBookData | null;
}

export const FullOrderBookTab: React.FC<FullOrderBookTabProps> = ({
  currentMarket,
  orderBook,
}) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-cyan-400" />
              Central Limit Order Book (CLOB) — {currentMarket.name}/USD
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Off-chain matching engine order book depth combined with Hyperliquid L2 feeds and resting user orders.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
              <div className="text-[10px] text-slate-400 uppercase font-medium">Spread</div>
              <div className="text-base font-mono font-bold text-cyan-300">
                ${orderBook?.spread.toFixed(4) || "0.0010"} ({orderBook?.spreadBps.toFixed(2) || "1.4"} bps)
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="font-bold text-xs text-emerald-400 uppercase tracking-wider">
                Buy Orders (Bids)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Price (USD) / Size</span>
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              {orderBook?.bids.map((b, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/60 transition"
                >
                  <span className="text-emerald-400 font-semibold">${parseFloat(b.px).toFixed(4)}</span>
                  <div className="flex items-center gap-3 text-slate-300">
                    <span>{parseFloat(b.sz).toFixed(2)} {currentMarket.name}</span>
                    <span className="text-slate-500 text-[10px]">({b.n} orders)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="font-bold text-xs text-rose-400 uppercase tracking-wider">
                Sell Orders (Asks)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Price (USD) / Size</span>
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              {orderBook?.asks.map((a, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/60 transition"
                >
                  <span className="text-rose-400 font-semibold">${parseFloat(a.px).toFixed(4)}</span>
                  <div className="flex items-center gap-3 text-slate-300">
                    <span>{parseFloat(a.sz).toFixed(2)} {currentMarket.name}</span>
                    <span className="text-slate-500 text-[10px]">({a.n} orders)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

