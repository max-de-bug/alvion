"use client";

import React from "react";
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
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h2 className="text-lg font-bold text-white">
              {currentMarket.name}/USD depth
            </h2>
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded-md border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-medium">Spread</span>
            <span className="text-sm font-mono font-semibold text-slate-200 ml-2">
              ${orderBook?.spread.toFixed(4) || "0.0010"} ({orderBook?.spreadBps.toFixed(2) || "1.4"} bps)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="font-semibold text-xs text-emerald-400">
                Bids
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Price (USD) / Size</span>
            </div>
            <div className="space-y-1 font-mono text-xs">
              {orderBook?.bids.map((b, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-1.5 rounded hover:bg-slate-900 transition-colors"
                >
                  <span className="text-emerald-400 font-medium">${parseFloat(b.px).toFixed(4)}</span>
                  <div className="flex items-center gap-3 text-slate-300">
                    <span>{parseFloat(b.sz).toFixed(2)} {currentMarket.name}</span>
                    <span className="text-slate-500 text-[10px]">({b.n})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="font-semibold text-xs text-rose-400">
                Asks
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Price (USD) / Size</span>
            </div>
            <div className="space-y-1 font-mono text-xs">
              {orderBook?.asks.map((a, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-1.5 rounded hover:bg-slate-900 transition-colors"
                >
                  <span className="text-rose-400 font-medium">${parseFloat(a.px).toFixed(4)}</span>
                  <div className="flex items-center gap-3 text-slate-300">
                    <span>{parseFloat(a.sz).toFixed(2)} {currentMarket.name}</span>
                    <span className="text-slate-500 text-[10px]">({a.n})</span>
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
