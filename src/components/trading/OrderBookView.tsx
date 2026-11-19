"use client";

import React from "react";
import { BookOpen } from "lucide-react";
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
    <div className="md:col-span-5 bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col h-[340px]">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2">
        <div className="flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
          <span className="font-bold text-xs text-slate-200">
            CLOB Order Book
          </span>
        </div>
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
              className="flex items-center justify-between text-rose-400 hover:bg-slate-800/50 px-1 rounded cursor-pointer transition"
            >
              <span className="font-semibold">${parseFloat(ask.px).toFixed(4)}</span>
              <span className="text-slate-400">{parseFloat(ask.sz).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="my-1.5 py-1 px-2 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Mid:</span>
          <span className="font-bold text-white">
            ${markPrice > 10 ? markPrice.toFixed(2) : markPrice.toFixed(4)}
          </span>
          <span className="text-emerald-400 text-[10px]">Hyperliquid L2</span>
        </div>

        <div className="space-y-0.5">
          {orderBook?.bids.slice(0, 5).map((bid, i) => (
            <div
              key={`bid-${i}`}
              onClick={() => onSelectPrice(bid.px)}
              className="flex items-center justify-between text-emerald-400 hover:bg-slate-800/50 px-1 rounded cursor-pointer transition"
            >
              <span className="font-semibold">${parseFloat(bid.px).toFixed(4)}</span>
              <span className="text-slate-400">{parseFloat(bid.sz).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

