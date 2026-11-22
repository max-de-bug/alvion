"use client";

import React, { useState } from "react";
import { Award, Zap, CheckCircle2, TrendingUp } from "lucide-react";
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
  const [activeTabExtended, setActiveTabExtended] = useState<"positions" | "openOrders" | "trades" | "points">("positions");

  const handleTabClick = (tab: "positions" | "openOrders" | "trades" | "points") => {
    setActiveTabExtended(tab);
    if (tab !== "points") {
      setBottomTab(tab);
    }
  };

  return (
    <div className="bg-[#0C1215] border border-[#1E272B] rounded-xl p-4 flex flex-col shadow-xl select-none text-slate-200">
      <div className="flex items-center justify-between border-b border-[#1E272B] pb-2 mb-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleTabClick("positions")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors relative ${activeTabExtended === "positions"
                ? "bg-[#162125] text-white"
                : "text-slate-400 hover:text-slate-200"
              }`}
          >
            Positions ({positions.length})
            {activeTabExtended === "positions" && (
              <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#4ECCA3] rounded-full" />
            )}
          </button>

          <button
            onClick={() => handleTabClick("openOrders")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors relative ${activeTabExtended === "openOrders"
                ? "bg-[#162125] text-white"
                : "text-slate-400 hover:text-slate-200"
              }`}
          >
            Open Orders ({openOrders.length})
            {activeTabExtended === "openOrders" && (
              <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#4ECCA3] rounded-full" />
            )}
          </button>

          <button
            onClick={() => handleTabClick("trades")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors relative ${activeTabExtended === "trades"
                ? "bg-[#162125] text-white"
                : "text-slate-400 hover:text-slate-200"
              }`}
          >
            Trade Fills ({recentTrades.length})
            {activeTabExtended === "trades" && (
              <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#4ECCA3] rounded-full" />
            )}
          </button>

          {/* TitanX Points Reward Tab */}
          <button
            onClick={() => handleTabClick("points")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 relative ${activeTabExtended === "points"
                ? "bg-[#162125] text-[#4ECCA3]"
                : "text-slate-400 hover:text-slate-200"
              }`}
          >
            <Award className="w-3.5 h-3.5 text-[#4ECCA3]" />
            <span>Alvion Points</span>
            <span className="bg-[#142921] text-[#4ECCA3] text-[10px] font-mono px-1.5 py-0.2 rounded-full border border-[#4ECCA3]/30">
              250 pts
            </span>
            {activeTabExtended === "points" && (
              <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#4ECCA3] rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* View 1: Active Positions */}
      {activeTabExtended === "positions" && (
        <div>
          {positions.length === 0 ? (
            <div className="py-10 text-center flex flex-col items-center justify-center gap-1 text-slate-500 text-xs">
              <span className="text-slate-400 font-medium">No open positions</span>
              <span className="text-[11px] text-slate-500">
                Execute a market or limit order above on BTC-USDCx to earn weekly testnet volume points.
              </span>
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
                    const market =
                      markets.find((m) => m.name === pos.market) || currentMarket;
                    const currentPx = market.markPx;

                    const pnlRatio = pos.isLong
                      ? (currentPx - pos.entryPrice) / pos.entryPrice
                      : (pos.entryPrice - currentPx) / pos.entryPrice;
                    const pnlUsdc = pos.sizeUsdc * pnlRatio;
                    const pnlPct = pnlRatio * pos.leverage * 100;

                    return (
                      <tr key={pos.id} className="hover:bg-[#121A1E] transition-colors">
                        <td className="py-3 font-bold text-white font-sans flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4ECCA3]" />
                          <span>{pos.market}-USDCx</span>
                        </td>
                        <td className="py-3">
                          <span
                            className={`font-semibold px-2 py-0.5 rounded text-[11px] ${pos.isLong
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
                          <button
                            onClick={() => onClosePosition(pos.id)}
                            className="px-3 py-1 rounded-lg bg-[#182125] hover:bg-rose-500/20 hover:text-rose-300 text-slate-300 text-xs border border-[#232F35] transition-colors cursor-pointer font-medium"
                          >
                            Close Market
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
      {activeTabExtended === "openOrders" && (
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
                    <tr key={ord.id} className="hover:bg-[#121A1E] transition-colors">
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
                          className="px-2.5 py-1 rounded bg-[#182125] hover:bg-rose-500/20 hover:text-rose-300 text-slate-300 text-xs border border-[#232F35] transition-colors cursor-pointer"
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
      {activeTabExtended === "trades" && (
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

      {/* View 4: Titan Points Dashboard (matching TitanX Testnet Reward Program) */}
      {activeTabExtended === "points" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 py-2">
          <div className="bg-[#121A1E] border border-[#212D33] rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center justify-between text-[#8C9DA6] text-[11px]">
              <span>Total Points</span>
              <Award className="w-3.5 h-3.5 text-[#4ECCA3]" />
            </div>
            <div className="text-xl font-bold font-mono text-[#4ECCA3]">250 pts</div>
            <span className="text-[10px] text-slate-400">Weekly rank: Top 5%</span>
          </div>

          <div className="bg-[#121A1E] border border-[#212D33] rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center justify-between text-[#8C9DA6] text-[11px]">
              <span>First Trade Bonus</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#4ECCA3]" />
            </div>
            <div className="text-xl font-bold font-mono text-white">+250 pts</div>
            <span className="text-[10px] text-[#4ECCA3]">Completed</span>
          </div>

          <div className="bg-[#121A1E] border border-[#212D33] rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center justify-between text-[#8C9DA6] text-[11px]">
              <span>Volume Multiplier</span>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white">1.25x</div>
            <span className="text-[10px] text-slate-400">Bronze Vanguard Tier</span>
          </div>

          <div className="bg-[#121A1E] border border-[#212D33] rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center justify-between text-[#8C9DA6] text-[11px]">
              <span>Referral Network</span>
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white">+15% Pts</div>
            <span className="text-[10px] text-slate-400">Invite friends via waitlist</span>
          </div>
        </div>
      )}
    </div>
  );
});
