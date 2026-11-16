"use client";

import React from "react";
import { ListOrdered, FileCheck2, CheckCircle2, XCircle } from "lucide-react";
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

export const PositionsPanel: React.FC<PositionsPanelProps> = ({
  bottomTab,
  setBottomTab,
  positions,
  openOrders,
  recentTrades,
  markets,
  currentMarket,
  onClosePosition,
  onCancelOrder,
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBottomTab("positions")}
            className={`text-xs font-bold px-3 py-1 rounded-md transition ${
              bottomTab === "positions"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Positions ({positions.length})
          </button>
          <button
            onClick={() => setBottomTab("openOrders")}
            className={`text-xs font-bold px-3 py-1 rounded-md transition flex items-center gap-1 ${
              bottomTab === "openOrders"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ListOrdered className="h-3 w-3" />
            Open Limit Orders ({openOrders.length})
          </button>
          <button
            onClick={() => setBottomTab("trades")}
            className={`text-xs font-bold px-3 py-1 rounded-md transition flex items-center gap-1 ${
              bottomTab === "trades"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileCheck2 className="h-3 w-3" />
            Recent Fills ({recentTrades.length})
          </button>
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          Settlement: <span className="text-cyan-300">Avalanche C-Chain USDC</span>
        </div>
      </div>

      {/* View 1: Active Positions */}
      {bottomTab === "positions" && (
        <div>
          {positions.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No active positions. Place a limit order on the book or market order against the vault.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium pb-2">
                    <th className="pb-2">Market & Type</th>
                    <th className="pb-2">Size / Margin</th>
                    <th className="pb-2">Entry / Mark</th>
                    <th className="pb-2">PnL (USDC)</th>
                    <th className="pb-2">Liquidation Price</th>
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
                      <tr key={pos.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3">
                          <div className="font-bold flex items-center gap-1.5 font-sans">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                pos.isLong
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-rose-500/20 text-rose-400"
                              }`}
                            >
                              {pos.isLong ? "LONG" : "SHORT"} {pos.leverage}x
                            </span>
                            <span className="text-white">{pos.market}</span>
                            <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
                              {pos.executionType}
                            </span>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="text-slate-200 font-semibold">
                            ${pos.sizeUsdc.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Margin: ${pos.marginUsdc.toFixed(2)} USDC
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="text-slate-200">
                            ${pos.entryPrice > 10 ? pos.entryPrice.toFixed(2) : pos.entryPrice.toFixed(4)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Mark: ${currentPx > 10 ? currentPx.toFixed(2) : currentPx.toFixed(4)}
                          </div>
                        </td>
                        <td className="py-3">
                          <div
                            className={`font-bold ${
                              pnlUsdc >= 0 ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {pnlUsdc >= 0 ? "+" : ""}${pnlUsdc.toFixed(2)}
                            <span className="text-[10px] ml-1">
                              ({pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%)
                            </span>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="font-bold text-rose-400">
                            ${pos.liquidationPrice > 10 ? pos.liquidationPrice.toFixed(2) : pos.liquidationPrice.toFixed(4)}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Maint: 0.8%
                          </div>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => onClosePosition(pos.id)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-sans transition"
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

      {/* View 2: Open Limit Orders (Resting on CLOB) */}
      {bottomTab === "openOrders" && (
        <div>
          {openOrders.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No resting limit orders on the book.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium pb-2">
                    <th className="pb-2">Order ID</th>
                    <th className="pb-2">Market & Side</th>
                    <th className="pb-2">Price</th>
                    <th className="pb-2">Size (USD)</th>
                    <th className="pb-2">Margin (USDC)</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Cancel (0 Gas)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {openOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-2.5 text-slate-300 font-semibold">{ord.id}</td>
                      <td className="py-2.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            ord.isLong
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-rose-500/20 text-rose-400"
                          }`}
                        >
                          {ord.isLong ? "BUY" : "SELL"} {ord.leverage}x
                        </span>{" "}
                        <span className="text-white font-bold">{ord.market}</span>
                      </td>
                      <td className="py-2.5 text-slate-200">
                        ${ord.price > 10 ? ord.price.toFixed(2) : ord.price.toFixed(4)}
                      </td>
                      <td className="py-2.5 text-slate-200">
                        ${ord.sizeUsd.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-cyan-300">
                        ${ord.marginUsdc.toFixed(2)}
                      </td>
                      <td className="py-2.5">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 text-[10px]">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                          Resting on Book
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => onCancelOrder(ord.id)}
                          className="px-2 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-sans transition flex items-center gap-1 ml-auto"
                        >
                          <XCircle className="h-3 w-3" />
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

      {/* View 3: Recent Fills / Trades */}
      {bottomTab === "trades" && (
        <div>
          {recentTrades.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No recent fills recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium pb-2">
                    <th className="pb-2">Trade ID</th>
                    <th className="pb-2">Market & Side</th>
                    <th className="pb-2">Fill Price</th>
                    <th className="pb-2">Size</th>
                    <th className="pb-2">Settlement</th>
                    <th className="pb-2 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {recentTrades.map((trd) => (
                    <tr key={trd.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-2.5 text-slate-300">{trd.id}</td>
                      <td className="py-2.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            trd.isLong
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-rose-500/20 text-rose-400"
                          }`}
                        >
                          {trd.isLong ? "LONG" : "SHORT"}
                        </span>{" "}
                        <span className="text-white font-bold">{trd.market}</span>
                      </td>
                      <td className="py-2.5 text-slate-200">
                        ${trd.price > 10 ? trd.price.toFixed(2) : trd.price.toFixed(4)}
                      </td>
                      <td className="py-2.5 text-slate-200">
                        ${trd.sizeUsd.toLocaleString()} USD
                      </td>
                      <td className="py-2.5">
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px]">
                          <CheckCircle2 className="h-3 w-3" />
                          Avalanche C-Chain USDC
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-slate-400 text-[10px]">
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
};

