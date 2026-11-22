"use client";

import React from "react";
import { MarketContext } from "@/lib/hyperliquid";
import { SignedOrder, MatchedTrade } from "@/lib/orderTypes";
import { Position } from "@/stores/useTradingStore";

interface PositionsPanelProps {
  bottomTab: "positions" | "openOrders" | "trades";
  setBottomTab: (tab: "positions" | "openOrders" | "trades") => void;
  positions: Position[];
  openOrders: SignedOrder[];
  recentTrades: MatchedTrade[];
  markets: MarketContext[];
  currentMarket: MarketContext;
  onClosePosition: (id: string) => void;
  onCancelOrder: (id: string) => void;
}

export const PositionsPanel = React.memo<PositionsPanelProps>(function PositionsPanel({
  bottomTab,
  setBottomTab,
  positions,
  openOrders,
  recentTrades,
  markets,
  currentMarket,
  onClosePosition,
  onCancelOrder,
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setBottomTab("positions")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${
              bottomTab === "positions"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Positions ({positions.length})
          </button>
          <button
            onClick={() => setBottomTab("openOrders")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${
              bottomTab === "openOrders"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Open orders ({openOrders.length})
          </button>
          <button
            onClick={() => setBottomTab("trades")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${
              bottomTab === "trades"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Fills ({recentTrades.length})
          </button>
        </div>
      </div>

      {/* View 1: Active Positions */}
      {bottomTab === "positions" && (
        <div>
          {positions.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No open positions.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium pb-2">
                    <th className="pb-2">Market</th>
                    <th className="pb-2">Side</th>
                    <th className="pb-2">Size</th>
                    <th className="pb-2">Entry</th>
                    <th className="pb-2">Mark</th>
                    <th className="pb-2">PnL</th>
                    <th className="pb-2">Est. liq</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {positions.map((pos) => {
                    const market =
                      markets.find((m) => m.name === pos.market) || currentMarket;
                    const currentPx = market.markPx;

                    const pnlRatio = pos.isLong
                      ? (currentPx - pos.entryPrice) / pos.entryPrice
                      : (pos.entryPrice - currentPx) / pos.entryPrice;
                    const pnlUsdc = pos.sizeUsdc * pnlRatio;
                    const pnlPct = pnlRatio * pos.leverage * 100;

                    return (
                      <tr key={pos.id} className="hover:bg-slate-850 transition-colors">
                        <td className="py-2.5 font-bold text-white font-sans">
                          {pos.market}
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`font-semibold ${
                              pos.isLong ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {pos.isLong ? "Buy" : "Sell"} {pos.leverage}x
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-200">
                          ${pos.sizeUsdc.toFixed(2)}
                        </td>
                        <td className="py-2.5 text-slate-300">
                          ${pos.entryPrice > 10 ? pos.entryPrice.toFixed(2) : pos.entryPrice.toFixed(4)}
                        </td>
                        <td className="py-2.5 text-slate-300">
                          ${currentPx > 10 ? currentPx.toFixed(2) : currentPx.toFixed(4)}
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`font-semibold ${
                              pnlUsdc >= 0 ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {pnlUsdc >= 0 ? "+" : ""}${pnlUsdc.toFixed(2)} ({pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%)
                          </span>
                        </td>
                        <td className="py-2.5 text-rose-400">
                          ${pos.liquidationPrice > 10 ? pos.liquidationPrice.toFixed(2) : pos.liquidationPrice.toFixed(4)}
                        </td>
                        <td className="py-2.5 text-right font-sans">
                          <button
                            onClick={() => onClosePosition(pos.id)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors cursor-pointer"
                          >
                            Close
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* View 2: Open Limit Orders */}
      {bottomTab === "openOrders" && (
        <div>
          {openOrders.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No open orders.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium pb-2">
                    <th className="pb-2">Order ID</th>
                    <th className="pb-2">Market</th>
                    <th className="pb-2">Side</th>
                    <th className="pb-2">Price</th>
                    <th className="pb-2">Size</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {openOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-850 transition-colors">
                      <td className="py-2.5 text-slate-400">{ord.id}</td>
                      <td className="py-2.5 font-bold text-white font-sans">{ord.market}</td>
                      <td className="py-2.5">
                        <span
                          className={`font-semibold ${
                            ord.isLong ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {ord.isLong ? "Buy" : "Sell"} {ord.leverage}x
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-200">
                        ${ord.price > 10 ? ord.price.toFixed(2) : ord.price.toFixed(4)}
                      </td>
                      <td className="py-2.5 text-slate-200">
                        ${ord.sizeUsd.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-slate-400">
                        Open
                      </td>
                      <td className="py-2.5 text-right font-sans">
                        <button
                          onClick={() => onCancelOrder(ord.id)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* View 3: Recent Fills */}
      {bottomTab === "trades" && (
        <div>
          {recentTrades.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No fills.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium pb-2">
                    <th className="pb-2">Trade ID</th>
                    <th className="pb-2">Market</th>
                    <th className="pb-2">Side</th>
                    <th className="pb-2">Price</th>
                    <th className="pb-2">Size</th>
                    <th className="pb-2 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {recentTrades.map((trd) => (
                    <tr key={trd.id} className="hover:bg-slate-850 transition-colors">
                      <td className="py-2.5 text-slate-400">{trd.id}</td>
                      <td className="py-2.5 font-bold text-white font-sans">{trd.market}</td>
                      <td className="py-2.5">
                        <span
                          className={`font-semibold ${
                            trd.isLong ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {trd.isLong ? "Buy" : "Sell"}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-200">
                        ${trd.price > 10 ? trd.price.toFixed(2) : trd.price.toFixed(4)}
                      </td>
                      <td className="py-2.5 text-slate-200">
                        ${trd.sizeUsd.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right text-slate-400 text-[11px]">
                        {new Date(trd.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
