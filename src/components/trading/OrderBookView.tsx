"use client";

import React from "react";
import { OrderBookData } from "@/types/trading";

interface OrderBookViewProps {
  orderBook: OrderBookData | null;
  markPrice: number;
  onSelectPrice: (px: string) => void;
}

export const OrderBookView = React.memo<OrderBookViewProps>(function OrderBookView({
  orderBook,
  markPrice,
  onSelectPrice,
}) {
  return (
    <div className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-col h-[340px]">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
        <span className="font-semibold text-xs text-white">
          Order book
        </span>
        <span className="text-[10px] text-slate-400 font-mono">
          Spread: {orderBook?.spreadBps.toFixed(1) || "1.2"} bps
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-between font-mono text-[11px] overflow-hidden">
        <div className="space-y-0.5 flex flex-col-reverse">
          {orderBook?.asks.slice(0, 5).map((ask, i) => (
            <div
              key={`ask-${i}`}
              onClick={() => onSelectPrice(ask.px)}
              className="flex items-center justify-between text-rose-400 hover:bg-slate-850 px-1 py-0.5 rounded cursor-pointer transition-colors"
            >
              <span>${parseFloat(ask.px).toFixed(4)}</span>
              <span className="text-slate-400">{parseFloat(ask.sz).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="my-1.5 py-1 px-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Mid</span>
          <span className="font-semibold text-white">
            ${markPrice > 10 ? markPrice.toFixed(2) : markPrice.toFixed(4)}
          </span>
        </div>

        <div className="space-y-0.5">
          {orderBook?.bids.slice(0, 5).map((bid, i) => (
            <div
              key={`bid-${i}`}
              onClick={() => onSelectPrice(bid.px)}
              className="flex items-center justify-between text-emerald-400 hover:bg-slate-850 px-1 py-0.5 rounded cursor-pointer transition-colors"
            >
              <span>${parseFloat(bid.px).toFixed(4)}</span>
              <span className="text-slate-400">{parseFloat(bid.sz).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
