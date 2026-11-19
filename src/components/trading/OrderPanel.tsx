"use client";

import React from "react";
import { ListOrdered, TrendingUp, TrendingDown, Zap, CheckCircle2 } from "lucide-react";
import { MarketContext, QuoteResult } from "@/lib/hyperliquid";

interface OrderPanelProps {
  orderType: "market" | "limit";
  setOrderType: (t: "market" | "limit") => void;
  isLong: boolean;
  setIsLong: (b: boolean) => void;
  limitPrice: string;
  setLimitPrice: (p: string) => void;
  currentMarket: MarketContext;
  leverage: number;
  setLeverage: (l: number) => void;
  marginUsdc: number;
  setMarginUsdc: (m: number) => void;
  walletBalance: number;
  quote: QuoteResult | null;
  loadingQuote: boolean;
  availableLongLiq: number;
  availableShortLiq: number;
  longFundingRate: number;
  shortFundingRate: number;
  formatUsdCompact: (val: number) => string;
  onExecuteTrade: () => void;
}

const LEVERAGE_OPTIONS = [2, 5, 10, 25, 50, 75, 100];
const MARGIN_PERCENTAGES = [0.25, 0.5, 0.75, 1];

export const OrderPanel = React.memo<OrderPanelProps>(function OrderPanel({
  orderType,
  setOrderType,
  isLong,
  setIsLong,
  limitPrice,
  setLimitPrice,
  currentMarket,
  leverage,
  setLeverage,
  marginUsdc,
  setMarginUsdc,
  walletBalance,
  quote,
  loadingQuote,
  availableLongLiq,
  availableShortLiq,
  longFundingRate,
  shortFundingRate,
  formatUsdCompact,
  onExecuteTrade,
}) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-4 shadow-xl">
      {/* Order Type Selector */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
          <ListOrdered className="h-4 w-4 text-cyan-400" />
          Option A Engine
        </span>
        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setOrderType("limit")}
            className={`px-2.5 py-1 rounded font-medium transition ${
              orderType === "limit"
                ? "bg-cyan-500 text-black font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Limit (CLOB 0-Gas)
          </button>
          <button
            onClick={() => setOrderType("market")}
            className={`px-2.5 py-1 rounded font-medium transition ${
              orderType === "market"
                ? "bg-cyan-500 text-black font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Market (Vault Fill)
          </button>
        </div>
      </div>

      {/* Long / Short Selector */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
        <button
          onClick={() => setIsLong(true)}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-sm transition ${
            isLong
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          Buy / Long
        </button>
        <button
          onClick={() => setIsLong(false)}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-sm transition ${
            !isLong
              ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <TrendingDown className="h-4 w-4" />
          Sell / Short
        </button>
      </div>

      {/* Limit Price Input if Limit Order selected */}
      {orderType === "limit" && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Limit Price (USD)</span>
            <span className="text-[10px] text-cyan-400 font-mono">
              Mid: ${currentMarket.markPx.toFixed(4)}
            </span>
          </div>
          <div className="relative">
            <input
              type="number"
              step="0.0001"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-500 pr-16"
            />
            <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
              USD
            </span>
          </div>
        </div>
      )}

      {/* Leverage Slider (Up to 100x) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Leverage</span>
          <span className="font-mono font-bold text-cyan-400 text-sm">
            {leverage}x
          </span>
        </div>

        <input
          type="range"
          min="1"
          max="100"
          step="1"
          value={leverage}
          onChange={(e) => setLeverage(Number(e.target.value))}
          className="w-full accent-cyan-500 cursor-pointer"
        />

        <div className="flex items-center justify-between gap-1">
          {LEVERAGE_OPTIONS.map((lev) => (
            <button
              key={lev}
              onClick={() => setLeverage(lev)}
              className={`text-[10px] font-mono px-2 py-1 rounded transition ${
                leverage === lev
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {lev}x
            </button>
          ))}
        </div>
      </div>

      {/* Margin Collateral (USDC) */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Collateral (USDC)</span>
          <span className="text-[11px] text-slate-400 font-mono">
            Avail: ${walletBalance.toFixed(2)}
          </span>
        </div>
        <div className="relative">
          <input
            type="number"
            min="10"
            max={walletBalance}
            value={marginUsdc}
            onChange={(e) => setMarginUsdc(Math.max(1, Number(e.target.value)))}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-500 pr-16"
          />
          <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
            USDC
          </span>
        </div>
        <div className="flex gap-1.5 pt-1">
          {MARGIN_PERCENTAGES.map((pct) => (
            <button
              key={pct}
              onClick={() => setMarginUsdc(Math.floor(walletBalance * pct))}
              className="flex-1 text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 py-1 rounded border border-slate-700/50"
            >
              {pct === 1 ? "MAX" : `${pct * 100}%`}
            </button>
          ))}
        </div>
      </div>

      {/* Execution Details Breakdown */}
      <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 flex flex-col gap-2 text-xs font-mono">
        <div className="flex items-center justify-between text-slate-400">
          <span>Order Size</span>
          <span className="text-white font-semibold">
            ${quote?.positionSizeUsdc.toLocaleString(undefined, { minimumFractionDigits: 2 }) || (marginUsdc * leverage).toFixed(2)} USDC
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-400">
          <span>Target Execution Price</span>
          <span className="text-white font-bold">
            ${orderType === "limit" && limitPrice ? Number(limitPrice).toFixed(4) : quote?.executionPrice.toFixed(4) || "..."}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-400">
          <span>Execution Route</span>
          <span className="text-cyan-400">
            {orderType === "limit" ? "EIP-712 CLOB Maker (0 Gas)" : "USDC Vault Instant Fill"}
          </span>
        </div>

        <div className="border-t border-slate-800/80 my-1"></div>

        <div className="flex items-center justify-between text-slate-400">
          <span>Available Liquidity ({isLong ? "Long" : "Short"})</span>
          <span className="text-emerald-400 font-semibold">
            {formatUsdCompact(isLong ? availableLongLiq : availableShortLiq)}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-400">
          <span>Est. 1h Funding</span>
          <span className={isLong ? (longFundingRate >= 0 ? "text-emerald-400" : "text-rose-400") : (shortFundingRate >= 0 ? "text-emerald-400" : "text-rose-400")}>
            {isLong ? `${longFundingRate >= 0 ? "+" : ""}${longFundingRate.toFixed(4)}%/h` : `${shortFundingRate >= 0 ? "+" : ""}${shortFundingRate.toFixed(4)}%/h`}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-400">
          <span>Liquidation Price</span>
          <span className="text-rose-400 font-semibold">
            ${quote?.liquidationPrice.toFixed(4) || "..."}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-400">
          <span>Trading Fee (USDC)</span>
          <span className="text-slate-300">
            ${quote?.tradingFeeUsdc.toFixed(2) || (marginUsdc * leverage * 0.0006).toFixed(2)} USDC
          </span>
        </div>
      </div>

      {/* Execution CTA Button */}
      <button
        onClick={onExecuteTrade}
        disabled={loadingQuote}
        className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide transition shadow-lg flex items-center justify-center gap-2 ${
          isLong
            ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20"
            : "bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20"
        }`}
      >
        <Zap className="h-4 w-4 fill-current" />
        {orderType === "limit" ? "Sign & Place Limit Order (0 Gas)" : `Execute ${isLong ? "Long" : "Short"} Against Vault`}
      </button>

      <div className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
        Option A • Avalanche C-Chain Native Circle USDC
      </div>
    </div>
  );
});

