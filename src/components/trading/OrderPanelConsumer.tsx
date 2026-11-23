"use client";

import React, { useState } from "react";
import { TrendingUp, TrendingDown, Zap } from "lucide-react";
import { MarketContext, QuoteResult } from "@/lib/hyperliquid";

interface OrderPanelConsumerProps {
  currentMarket: MarketContext;
  isLong: boolean;
  setIsLong: (b: boolean) => void;
  leverage: number;
  setLeverage: (l: number) => void;
  marginUsdc: number;
  setMarginUsdc: (m: number) => void;
  walletBalance: number;
  quote: QuoteResult | null;
  loadingQuote: boolean;
  onExecuteTrade: () => void;
}

const CONSUMER_LEVERAGE_PRESETS = [
  { val: 5, label: "5x", tag: "Safe", tip: "Balanced exposure" },
  { val: 25, label: "25x", tag: "Popular", tip: "Dynamic swings" },
  { val: 100, label: "100x", tag: "High", tip: "Fast momentum" },
  { val: 250, label: "250x", tag: "Pro", tip: "High responsiveness" },
  { val: 500, label: "500x", tag: "Ultra", tip: "Extreme boost" },
  { val: 1000, label: "1000x", tag: "Max", tip: "1000x Maximum Power" },
];

const QUICK_AMOUNTS = [25, 50, 100, 250, 500];

export const OrderPanelConsumer = React.memo<OrderPanelConsumerProps>(function OrderPanelConsumer({
  currentMarket,
  isLong,
  setIsLong,
  leverage,
  setLeverage,
  marginUsdc,
  setMarginUsdc,
  walletBalance,
  quote,
  loadingQuote,
  onExecuteTrade,
}) {
  const [customAmount, setCustomAmount] = useState(marginUsdc.toString());

  // Dynamic Return Preview: what happens if price moves 5% in user's favor
  const priceMovePct = 5;
  const estimatedProfit = (marginUsdc * leverage * (priceMovePct / 100)).toFixed(2);
  const estimatedReturnPct = (priceMovePct * leverage).toFixed(0);

  const handleAmountChange = (val: string) => {
    setCustomAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setMarginUsdc(Math.min(walletBalance, num));
    }
  };

  const handleQuickAdd = (amt: number) => {
    const nextVal = Math.min(walletBalance, amt);
    setMarginUsdc(nextVal);
    setCustomAmount(nextVal.toString());
  };

  const handleMax = () => {
    const maxVal = Math.floor(walletBalance);
    setMarginUsdc(maxVal);
    setCustomAmount(maxVal.toString());
  };

  return (
    <div className="flex flex-col shrink-0 rounded-none border border-[var(--border)] bg-[var(--surface)] p-4 gap-4 text-[var(--t1)] select-none">
      {/* Friendly Header Badge */}
      <div className="flex items-center justify-between bg-[var(--surface-3)] border border-[var(--border)] rounded-none px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-none bg-[#4ECCA3]/10 border border-[#4ECCA3]/20 flex items-center justify-center text-[#4ECCA3] font-bold text-sm">
            {currentMarket.name.slice(0, 2)}
          </div>
          <div>
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <span>{currentMarket.name}</span>
              <span className="text-[10px] font-normal text-[#4ECCA3] bg-[#4ECCA3]/10 px-1.5 py-0.5 rounded-none">
                Live
              </span>
            </div>
            <div className="text-[11px] font-mono text-[var(--t2)]">
              ${currentMarket.markPx.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-[var(--t3)]">Wallet Balance</div>
          <div className="text-xs font-mono font-semibold text-white">
            ${walletBalance.toFixed(2)} USDCx
          </div>
        </div>
      </div>

      {/* STEP 1: DIRECTION (Up vs Down) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-white flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-none bg-[#4ECCA3]/20 text-[#4ECCA3] text-[10px] flex items-center justify-center font-bold">1</span>
            Select Direction
          </span>
          <span className="text-[11px] text-[var(--t3)]">
            {isLong ? "Profit when price goes up" : "Profit when price goes down"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* UP / LONG CARD */}
          <button
            type="button"
            onClick={() => setIsLong(true)}
            className={`p-3 rounded-none border text-left transition-all flex flex-col gap-1 relative cursor-pointer ${
              isLong
                ? "bg-[#10241E] border-[#4ECCA3] shadow-md shadow-[#4ECCA3]/10"
                : "bg-[var(--surface-3)] border-[var(--border)] hover:border-[var(--border-strong)] text-[var(--t2)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold flex items-center gap-1.5 ${isLong ? "text-[#4ECCA3]" : "text-[var(--t2)]"}`}>
                <TrendingUp className="w-4 h-4" />
                Up (Long)
              </span>
              {isLong && <span className="w-2 h-2 rounded-none bg-[#4ECCA3]" />}
            </div>
            <span className="text-[10px] text-[var(--t3)] leading-tight">
              Expect price will climb
            </span>
          </button>

          {/* DOWN / SHORT CARD */}
          <button
            type="button"
            onClick={() => setIsLong(false)}
            className={`p-3 rounded-none border text-left transition-all flex flex-col gap-1 relative cursor-pointer ${
              !isLong
                ? "bg-[#251319] border-[var(--red)] shadow-md shadow-[var(--red)]/10"
                : "bg-[var(--surface-3)] border-[var(--border)] hover:border-[var(--border-strong)] text-[var(--t2)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold flex items-center gap-1.5 ${!isLong ? "text-[var(--red)]" : "text-[var(--t2)]"}`}>
                <TrendingDown className="w-4 h-4" />
                Down (Short)
              </span>
              {!isLong && <span className="w-2 h-2 rounded-none bg-[var(--red)]" />}
            </div>
            <span className="text-[10px] text-[var(--t3)] leading-tight">
              Expect price will fall
            </span>
          </button>
        </div>
      </div>

      {/* STEP 2: LEVERAGE (Multiplier) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-white flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-none bg-[#4ECCA3]/20 text-[#4ECCA3] text-[10px] flex items-center justify-center font-bold">2</span>
            Select Multiplier
          </span>
          <span className="text-[11px] font-mono text-[#4ECCA3] font-semibold">
            {leverage}x Power
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {CONSUMER_LEVERAGE_PRESETS.map((preset) => (
            <button
              key={preset.val}
              type="button"
              onClick={() => setLeverage(preset.val)}
              className={`py-2 px-1 rounded-none border text-center transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                leverage === preset.val
                  ? "bg-[#182622] border-[#4ECCA3] text-[#4ECCA3] shadow-sm"
                  : "bg-[var(--surface-3)] border-[var(--border)] hover:border-[var(--border-strong)] text-[var(--t2)]"
              }`}
            >
              <span className="text-xs font-mono font-bold">{preset.label}</span>
              <span className="text-[9px] text-[var(--t3)] tracking-tight">{preset.tag}</span>
            </button>
          ))}
        </div>

        {/* Smooth Leverage Slider 1x - 1000x */}
        <div className="flex items-center gap-2 pt-0.5">
          <input
            type="range"
            min="1"
            max={currentMarket.maxLeverage || 1000}
            value={leverage}
            onChange={(e) => setLeverage(Number(e.target.value))}
            className="w-full accent-[#4ECCA3] cursor-pointer h-1.5 bg-[var(--surface-3)] rounded-none"
          />
        </div>
      </div>

      {/* STEP 3: SIZE & MARGIN */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-white flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-none bg-[#4ECCA3]/20 text-[#4ECCA3] text-[10px] flex items-center justify-center font-bold">3</span>
            Trade Size (USDCx)
          </span>
          <span className="text-[11px] text-[var(--t3)]">
            Total Power: <span className="font-mono text-white">${marginUsdc * leverage}</span>
          </span>
        </div>

        {/* Input box */}
        <div className="bg-[var(--surface-3)] border border-[var(--border)] focus-within:border-[#4ECCA3]/60 rounded-none px-3.5 py-2.5 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-1 text-sm font-mono text-[var(--t3)]">
            <span>$</span>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0"
              className="bg-transparent text-white font-mono text-base font-semibold outline-none w-32"
            />
          </div>
          <span className="text-xs font-bold text-white bg-[var(--surface)] px-2 py-1 rounded-none">
            USDCx
          </span>
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-5 gap-1.5">
          {QUICK_AMOUNTS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => handleQuickAdd(amt)}
              className={`py-1.5 text-xs font-mono rounded-none border transition-all cursor-pointer ${
                marginUsdc === amt
                  ? "bg-[#182622] border-[#4ECCA3] text-[#4ECCA3] font-bold"
                  : "bg-[var(--surface-3)] border-[var(--border)] hover:border-[var(--border-strong)] text-[var(--t2)]"
              }`}
            >
              ${amt}
            </button>
          ))}
        </div>
      </div>

      {/* PROJECTED RETURN CARD */}
      <div className="bg-[var(--surface-3)] border border-[var(--border)] rounded-none p-3 flex flex-col gap-2 text-xs">
        <div className="flex items-center justify-between text-[11px] text-[var(--t3)]">
          <span>If {currentMarket.name} moves 5%</span>
          <span className="font-mono font-bold text-[#4ECCA3]">+{estimatedReturnPct}% Return</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-[var(--t2)]">Estimated Gain:</span>
          <span className="text-sm font-mono font-bold text-[#4ECCA3]">+${estimatedProfit} USDCx</span>
        </div>
      </div>

      {/* EXECUTE CTA BUTTON */}
      <button
        type="button"
        onClick={onExecuteTrade}
        disabled={loadingQuote || marginUsdc <= 0}
        className={`w-full py-3.5 rounded-none font-bold text-sm tracking-wide transition-colors shadow-lg flex items-center justify-center cursor-pointer ${
          isLong
            ? "bg-[#4ECCA3] hover:bg-[#3fb892] text-slate-950 shadow-[#4ECCA3]/20"
            : "bg-[var(--red)] hover:bg-[#d42d3e] text-white shadow-[var(--red)]/20"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loadingQuote ? (
          <span>Calculating...</span>
        ) : (
          <span>{isLong ? "Open Long" : "Open Short"} (${marginUsdc * leverage})</span>
        )}
      </button>

      {/* SAFETY NOTICE & SLIPPAGE-AT-RISK */}
      <div className="flex items-center justify-between text-[11px] text-[var(--t3)] px-1">
        <span>Max loss: ${marginUsdc}</span>
        <span title="Forward-looking Slippage-at-Risk (SaR 95% • Sepper 2026)">
          SaR 95%: <span className="font-mono text-amber-400 font-semibold">{quote?.sar95Bps ? `${(quote.sar95Bps / 100).toFixed(3)}%` : "0.045%"}</span>
        </span>
      </div>
    </div>
  );
});
