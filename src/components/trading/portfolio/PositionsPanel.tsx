"use client";

import React, { useState, useMemo } from "react";
import { Share2 } from "lucide-react";
import { MarketContext } from "@/lib/hyperliquid";
import { SignedOrder, MatchedTrade } from "@/lib/orderTypes";
import { Position } from "@/stores/useTradingStore";
import { SharePnlModal } from "./SharePnlModal";

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
  // Fast O(1) market lookup map (Vercel Best Practice: js-index-maps)
  const marketMap = useMemo(
    () => new Map(markets.map((m) => [m.name, m])),
    [markets]
  );

  const [sharingPosition, setSharingPosition] = useState<Position | null>(null);
  return (
    <div className="bg-[#0C1215] border border-[#1E272B] rounded-none p-4 flex flex-col shadow-xl select-none text-slate-200">
      <div className="flex items-center justify-between border-b border-[#1E272B] pb-2 mb-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setBottomTab("positions")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-none transition-colors relative ${bottomTab === "positions"
                ? "bg-[#162125] text-white"
                : "text-slate-400 hover:text-slate-200"
              }`}
          >
            Positions ({positions.length})
            {bottomTab === "positions" && (
              <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#4ECCA3] rounded-none" />
            )}
          </button>

          <button
            onClick={() => setBottomTab("openOrders")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-none transition-colors relative ${bottomTab === "openOrders"
                ? "bg-[#162125] text-white"
                : "text-slate-400 hover:text-slate-200"
              }`}
          >
            Open Orders ({openOrders.length})
            {bottomTab === "openOrders" && (
              <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#4ECCA3] rounded-none" />
            )}
          </button>

          <button
            onClick={() => setBottomTab("trades")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-none transition-colors relative ${bottomTab === "trades"
                ? "bg-[#162125] text-white"
                : "text-slate-400 hover:text-slate-200"
              }`}
          >
            Trade Fills ({recentTrades.length})
            {bottomTab === "trades" && (
              <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#4ECCA3] rounded-none" />
            )}
          </button>
        </div>
      </div>

      {/* View 1: Active Positions */}
      {bottomTab === "positions" && (
        <div>
          {positions.length === 0 ? (
            <div className="py-10 text-center flex flex-col items-center justify-center text-slate-500 text-xs">
              <span className="text-slate-400 font-medium">No open positions</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#1E272B] text-[#8C9DA6] font-medium pb-2 text-[11px]">
                    <th className="pb-2">Market</th>
                    <th className="pb-2">Side / Leverage</th>
                    <th className="pb-2">Size</th>
                    <th className="pb-2">Entry Price</th>
                    <th className="pb-2">Mark Price</th>
                    <th className="pb-2">Unrealized PnL (ROE)</th>
                    <th className="pb-2">Est. Liq Price</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A242A] font-mono">
                  {positions.map((pos) => {
                    const market = marketMap.get(pos.market) || currentMarket;
                    const currentPx = market.markPx;

                    const pnlRatio = pos.isLong
                      ? (currentPx - pos.entryPrice) / pos.entryPrice
                      : (pos.entryPrice - currentPx) / pos.entryPrice;
                    const pnlUsdc = pos.sizeUsdc * pnlRatio;
                    const pnlPct = pnlRatio * pos.leverage * 100;

                    return (
                      <tr
                        key={pos.id}
                        style={{ contentVisibility: "auto", containIntrinsicSize: "0 45px" }}
                        className="hover:bg-[#121A1E] transition-colors"
                      >
                        <td className="py-3 font-bold text-white font-sans flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-none bg-[#4ECCA3]" />
                          <span>{pos.market}-USDCx</span>
                        </td>
                        <td className="py-3">
                          <span
                            className={`font-semibold px-2 py-0.5 rounded-none text-[11px] ${pos.isLong
                                ? "bg-[#142921] text-[#4ECCA3] border border-[#4ECCA3]/30"
                                : "bg-[#281318] text-[#F43F5E] border border-[#F43F5E]/30"
                              }`}
                          >
                            {pos.isLong ? "Long" : "Short"} {pos.leverage}x
                          </span>
                        </td>
                        <td className="py-3 text-slate-200">
                          ${pos.sizeUsdc.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDCx
                        </td>
                        <td className="py-3 text-slate-300">
                          ${pos.entryPrice > 10 ? pos.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }) : pos.entryPrice.toFixed(4)}
                        </td>
                        <td className="py-3 text-slate-300">
                          ${currentPx > 10 ? currentPx.toLocaleString(undefined, { minimumFractionDigits: 2 }) : currentPx.toFixed(4)}
                        </td>
                        <td className="py-3">
                          <span
                            className={`font-bold ${pnlUsdc >= 0 ? "text-[#4ECCA3]" : "text-[#F43F5E]"
                              }`}
                          >
                            {pnlUsdc >= 0 ? "+" : ""}${pnlUsdc.toFixed(2)} ({pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%)
                          </span>
                        </td>
                        <td className="py-3 text-rose-400">
                          ${pos.liquidationPrice > 10 ? pos.liquidationPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }) : pos.liquidationPrice.toFixed(4)}
                        </td>
                        <td className="py-3 text-right font-sans">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSharingPosition(pos)}
                              title="Share PnL Card"
                              className="px-2.5 py-1 rounded-none bg-[#182125] hover:bg-[#1E2931] hover:text-[#4ECCA3] text-slate-400 text-xs border border-[#232F35] transition-colors cursor-pointer font-medium flex items-center gap-1"
                            >
                              <Share2 className="w-3.5 h-3.5 text-[#4ECCA3]" />
                              <span className="hidden sm:inline">Share</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onClosePosition(pos.id)}
                              className="px-3 py-1 rounded-none bg-[#182125] hover:bg-rose-500/20 hover:text-rose-300 text-slate-300 text-xs border border-[#232F35] transition-colors cursor-pointer font-medium"
                            >
                              Close Market
                            </button>
                          </div>
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
              No active limit orders.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#1E272B] text-[#8C9DA6] font-medium pb-2 text-[11px]">
                    <th className="pb-2">Order ID</th>
                    <th className="pb-2">Market</th>
                    <th className="pb-2">Side / Multiplier</th>
                    <th className="pb-2">Price</th>
                    <th className="pb-2">Size</th>
                    <th className="pb-2">Network</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A242A] font-mono">
                  {openOrders.map((ord) => (
                    <tr
                      key={ord.id}
                      style={{ contentVisibility: "auto", containIntrinsicSize: "0 38px" }}
                      className="hover:bg-[#121A1E] transition-colors"
                    >
                      <td className="py-2.5 text-slate-400">{ord.id.slice(0, 10)}...</td>
                      <td className="py-2.5 font-bold text-white font-sans">{ord.market}-USDCx</td>
                      <td className="py-2.5">
                        <span
                          className={`font-semibold ${ord.isLong ? "text-[#4ECCA3]" : "text-[#F43F5E]"
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
                      <td className="py-2.5 text-[#4ECCA3] text-[11px]">
                        Robinhood Chain L2
                      </td>
                      <td className="py-2.5 text-right font-sans">
                        <button
                          onClick={() => onCancelOrder(ord.id)}
                          className="px-2.5 py-1 rounded-none bg-[#182125] hover:bg-rose-500/20 hover:text-rose-300 text-slate-300 text-xs border border-[#232F35] transition-colors cursor-pointer"
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

      {/* View 3: Trade Fills */}
      {bottomTab === "trades" && (
        <div>
          {recentTrades.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No recent trade fills.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#1E272B] text-[#8C9DA6] font-medium pb-2 text-[11px]">
                    <th className="pb-2">Trade ID</th>
                    <th className="pb-2">Market</th>
                    <th className="pb-2">Side</th>
                    <th className="pb-2">Execution Price</th>
                    <th className="pb-2">Size</th>
                    <th className="pb-2 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A242A] font-mono">
                  {recentTrades.map((trd) => (
                    <tr key={trd.id} className="hover:bg-[#121A1E] transition-colors">
                      <td className="py-2.5 text-slate-400">{trd.id.slice(0, 10)}</td>
                      <td className="py-2.5 font-bold text-white font-sans">{trd.market}-USDCx</td>
                      <td className="py-2.5">
                        <span
                          className={`font-semibold ${trd.isLong ? "text-[#4ECCA3]" : "text-[#F43F5E]"
                            }`}
                        >
                          {trd.isLong ? "Buy" : "Sell"}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-200">
                        ${trd.price > 10 ? trd.price.toFixed(2) : trd.price.toFixed(4)}
                      </td>
                      <td className="py-2.5 text-slate-200">
                        ${trd.sizeUsd.toLocaleString()} USDCx
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

      {/* Share PnL Modal */}
      <SharePnlModal
        isOpen={!!sharingPosition}
        onClose={() => setSharingPosition(null)}
        position={sharingPosition}
        market={sharingPosition ? marketMap.get(sharingPosition.market) || currentMarket : null}
      />
    </div>
  );
});
