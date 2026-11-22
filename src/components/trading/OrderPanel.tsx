"use client";

import React from "react";
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
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col gap-4">
      {/* Order Type Selector */}
      <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-md border border-slate-800 text-xs font-medium">
        <button
          onClick={() => setOrderType("limit")}
          className={`py-1.5 rounded transition-colors ${
            orderType === "limit"
              ? "bg-slate-800 text-white font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Limit
        </button>
        <button
          onClick={() => setOrderType("market")}
          className={`py-1.5 rounded transition-colors ${
            orderType === "market"
              ? "bg-slate-800 text-white font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Market
        </button>
      </div>

      {/* Buy / Sell Selector */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setIsLong(true)}
          className={`py-2 rounded-md font-semibold text-xs transition-colors ${
            isLong
              ? "bg-emerald-500 text-slate-950"
              : "bg-slate-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setIsLong(false)}
          className={`py-2 rounded-md font-semibold text-xs transition-colors ${
            !isLong
              ? "bg-rose-500 text-white"
              : "bg-slate-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          Sell
        </button>
      </div>

      {/* Limit Price Input */}
      {orderType === "limit" && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="limit-price-input" className="text-slate-400 font-medium">Limit price</label>
            <span className="text-[11px] text-slate-500 font-mono">
              Mid ${currentMarket.markPx.toFixed(4)}
            </span>
          </div>
          <div className="relative">
            <input
              id="limit-price-input"
              type="number"
              step="0.0001"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-500 pr-14"
            />
            <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">
              USD
            </span>
          </div>
        </div>
      )}

      {/* Leverage Slider */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Leverage</span>
          <span className="font-mono font-semibold text-slate-200">
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
          aria-label="Leverage slider"
          className="w-full accent-cyan-500 cursor-pointer"
        />

        <div className="flex items-center justify-between gap-1">
          {LEVERAGE_OPTIONS.map((lev) => (
            <button
              key={lev}
              onClick={() => setLeverage(lev)}
              className={`text-[10px] font-mono px-2 py-1 rounded transition-colors ${
                leverage === lev
                  ? "bg-slate-800 text-white font-semibold border border-slate-700"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200"
              }`}
            >
              {lev}x
            </button>
          ))}
        </div>
      </div>

      {/* Margin Collateral */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <label htmlFor="margin-input" className="text-slate-400 font-medium">Collateral</label>
          <span className="text-[11px] text-slate-400 font-mono">
            Balance: ${walletBalance.toFixed(2)} USDC
          </span>
        </div>
        <div className="relative">
          <input
            id="margin-input"
            type="number"
            min="10"
            max={walletBalance}
            value={marginUsdc}
            onChange={(e) => setMarginUsdc(Math.max(1, Number(e.target.value)))}
            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-500 pr-14"
          />
          <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">
            USDC
          </span>
        </div>
        <div className="flex gap-1.5 pt-1">
          {MARGIN_PERCENTAGES.map((pct) => (
            <button
              key={pct}
              onClick={() => setMarginUsdc(Math.floor(walletBalance * pct))}
              className="flex-1 text-[10px] font-mono bg-slate-950 hover:bg-slate-800 text-slate-300 py-1 rounded border border-slate-800 transition-colors"
            >
              {pct === 1 ? "100%" : `${pct * 100}%`}
            </button>
          ))}
        </div>
      </div>

      {/* Execution Details Breakdown */}
      <div className="bg-slate-950 rounded-md p-3 border border-slate-800 flex flex-col gap-2 text-xs font-mono">
        <div className="flex items-center justify-between text-slate-400">
          <span>Order size</span>
          <span className="text-white font-medium">
            ${quote?.positionSizeUsdc.toLocaleString(undefined, { minimumFractionDigits: 2 }) || (marginUsdc * leverage).toFixed(2)} USDC
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-400">
          <span>Target price</span>
          <span className="text-white font-medium">
            ${orderType === "limit" && limitPrice ? Number(limitPrice).toFixed(4) : quote?.executionPrice.toFixed(4) || "—"}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-400">
          <span>Route</span>
          <span className="text-slate-300">
            {orderType === "limit" ? "Order book" : "USDC vault"}
          </span>
        </div>

        <div className="border-t border-slate-800 my-0.5" />

        <div className="flex items-center justify-between text-slate-400">
          <span>Liquidity ({isLong ? "Long" : "Short"})</span>
          <span className="text-slate-200">
            {formatUsdCompact(isLong ? availableLongLiq : availableShortLiq)}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-400">
          <span>1h funding</span>
          <span className={isLong ? (longFundingRate >= 0 ? "text-emerald-400" : "text-rose-400") : (shortFundingRate >= 0 ? "text-emerald-400" : "text-rose-400")}>
            {isLong ? `${longFundingRate >= 0 ? "+" : ""}${longFundingRate.toFixed(4)}%/h` : `${shortFundingRate >= 0 ? "+" : ""}${shortFundingRate.toFixed(4)}%/h`}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-400">
          <span>Est. liquidation</span>
          <span className="text-rose-400">
            ${quote?.liquidationPrice.toFixed(4) || "—"}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-400">
          <span>Trading fee</span>
          <span className="text-slate-300">
            ${quote?.tradingFeeUsdc.toFixed(2) || (marginUsdc * leverage * 0.0006).toFixed(2)} USDC
          </span>
        </div>
      </div>

      {/* Execution CTA Button */}
      <button
        onClick={onExecuteTrade}
        disabled={loadingQuote}
        className={`w-full py-2.5 rounded-md font-semibold text-sm transition-colors cursor-pointer ${
          isLong
            ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
            : "bg-rose-500 hover:bg-rose-400 text-white"
        }`}
      >
        {orderType === "limit" ? `Place limit ${isLong ? "buy" : "sell"}` : `${isLong ? "Buy" : "Sell"} ${currentMarket.name}`}
      </button>
    </div>
  );
});
