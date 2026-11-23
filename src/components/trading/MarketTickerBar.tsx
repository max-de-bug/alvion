"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { MarketContext } from "@/lib/hyperliquid";
import { MarketMetadata } from "@/stores/useTradingStore";

interface MarketTickerBarProps {
  selectedMarketName: string;
  setSelectedMarketName: (name: string) => void;
  currentMarket: MarketContext;
  marketMeta: MarketMetadata;
  isEquity: boolean;
  longOi: number;
  shortOi: number;
  longOiRatio: number;
  shortOiRatio: number;
  longFundingRate: number;
  shortFundingRate: number;
  minutesToFunding: number;
  availableLongLiq: number;
  availableShortLiq: number;
  formatUsdCompact: (val: number) => string;
}

export const MarketTickerBar = React.memo<MarketTickerBarProps>(function MarketTickerBar({
  selectedMarketName,
  setSelectedMarketName,
  currentMarket,
  marketMeta,
  isEquity,
  longOi,
  shortOi,
  longOiRatio,
  shortOiRatio,
  longFundingRate,
  shortFundingRate,
  minutesToFunding,
  availableLongLiq,
  availableShortLiq,
  formatUsdCompact,
}) {
  const [showMarketMenu, setShowMarketMenu] = useState(false);

  const countdownFormatted = `00:${minutesToFunding.toString().padStart(2, "0")}:18`;
  const markPriceFormatted = currentMarket.markPx > 10
    ? currentMarket.markPx.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : currentMarket.markPx.toFixed(4);

  const oraclePriceFormatted = currentMarket.oraclePx > 10
    ? currentMarket.oraclePx.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : currentMarket.oraclePx.toFixed(4);

  return (
    <div className="container-in container-in-1 relative z-20 shrink-0 mb-3">
      <div className="h-[60px] rounded-[18px] border border-[var(--border)] bg-[var(--surface)] shadow-lg">
        <div className="strip-scroll flex h-full items-center gap-4 px-3 overflow-x-auto [scrollbar-width:none]">
          {/* Market Selector Pill */}
          <div className="shrink-0 relative">
            <button
              type="button"
              onClick={() => setShowMarketMenu((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-2 rounded-none border border-transparent hover:bg-[var(--surface-3)] hover:border-[var(--border)] transition-colors cursor-pointer"
            >
              <div className="flex items-center">
                <div className="w-[22px] h-[22px] rounded-none bg-amber-500/90 flex items-center justify-center text-[11px] font-bold text-black border border-slate-900 shadow-sm">
                  ₿
                </div>
                <div className="w-[22px] h-[22px] rounded-none bg-[#4ECCA3] flex items-center justify-center text-[10px] font-bold text-[#0A1612] border border-slate-900 shadow-sm -ml-1.5">
                  $
                </div>
              </div>
              <span className="font-semibold tracking-[-0.01em] text-[var(--t1)] text-[14.5px]">
                {selectedMarketName}-USDCX
              </span>
              <span className="lev-tag" aria-label="Up to 20x leverage">
                {marketMeta.maxLeverage || 20}x
              </span>
              <ChevronDown className="w-4 h-4 text-[var(--t3)]" />
            </button>

            {showMarketMenu && (
              <div className="absolute top-12 left-0 z-50 w-64 bg-[var(--surface)] border border-[var(--border-strong)] rounded-2xl p-2 shadow-2xl text-xs flex flex-col gap-1">
                {[
                  { sym: "BTC", name: "Bitcoin", lev: "50x" },
                  { sym: "ETH", name: "Ethereum", lev: "50x" },
                  { sym: "SOL", name: "Solana", lev: "50x" },
                  { sym: "SPY", name: "S&P 500 ETF", lev: "20x" },
                  { sym: "NVDA", name: "NVIDIA Corp", lev: "10x" },
                  { sym: "TSLA", name: "Tesla Inc", lev: "10x" },
                  { sym: "AAPL", name: "Apple Inc", lev: "10x" },
                ].map((item) => (
                  <button
                    key={item.sym}
                    onClick={() => {
                      setSelectedMarketName(item.sym);
                      setShowMarketMenu(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      selectedMarketName === item.sym
                        ? "bg-[var(--surface-3)] text-[#4ECCA3] font-semibold"
                        : "text-[var(--t1)] hover:bg-[var(--hover)]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{item.sym}-USDCX</span>
                      <span className="text-[11px] text-[var(--t3)]">{item.name}</span>
                    </div>
                    <span className="lev-tag">{item.lev}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mark Price */}
          <div className="flex shrink-0 items-center">
            <span className="flex flex-col gap-px leading-[1.15]">
              <span className="text-[9.5px] font-mono tracking-[.07em] text-[var(--t3)] font-semibold whitespace-nowrap">
                Mark
              </span>
              <span className="strip-mark text-[12px] font-mono tabular-nums font-semibold text-[var(--t1)]">
                ${markPriceFormatted}
              </span>
            </span>
          </div>

          {/* Stats Cluster */}
          <div className="strip-stats flex min-w-[150px] items-center gap-5 overflow-x-auto [scrollbar-width:none]">
            <div className="flex shrink-0 flex-col gap-px leading-[1.15]">
              <span className="text-[9.5px] font-mono tracking-[.07em] text-[var(--t3)] font-semibold whitespace-nowrap">
                Index
              </span>
              <span className="text-[12px] font-mono tabular-nums font-semibold text-[var(--t1)]">
                {oraclePriceFormatted}
              </span>
            </div>

            <div className="flex shrink-0 flex-col gap-px leading-[1.15]">
              <span className="text-[9.5px] font-mono tracking-[.07em] text-[var(--t3)] font-semibold whitespace-nowrap">
                24h Change
              </span>
              <span
                className={`text-[12px] font-mono tabular-nums font-semibold ${
                  currentMarket.change24h >= 0 ? "text-[var(--green)]" : "text-[var(--red)]"
                }`}
              >
                {currentMarket.change24h >= 0 ? "+" : ""}
                {(currentMarket.change24h * 598).toFixed(0)} / {currentMarket.change24h >= 0 ? "+" : ""}
                {currentMarket.change24h.toFixed(2)}%
              </span>
            </div>

            <div className="flex shrink-0 flex-col gap-px leading-[1.15] cursor-help">
              <span className="text-[9.5px] font-mono tracking-[.07em] text-[var(--t3)] font-semibold whitespace-nowrap">
                24h Vol
              </span>
              <span className="text-[12px] font-mono tabular-nums font-semibold text-[var(--t1)]">
                ${(currentMarket.dayVolumeUsd / 1_000_000).toFixed(1)}M
              </span>
            </div>

            <div className="flex shrink-0 flex-col gap-px leading-[1.15]">
              <span className="text-[9.5px] font-mono tracking-[.07em] text-[var(--t3)] font-semibold whitespace-nowrap">
                Open Int.
              </span>
              <span className="text-[12px] font-mono tabular-nums font-semibold text-[var(--t1)]">
                {formatUsdCompact(longOi + shortOi)}
              </span>
            </div>

            <div className="flex shrink-0 flex-col gap-px leading-[1.15] cursor-help">
              <span className="text-[9.5px] font-mono tracking-[.07em] text-[var(--t3)] font-semibold whitespace-nowrap">
                Funding (1h)
              </span>
              <span className="text-[12px] font-mono tabular-nums font-semibold text-[var(--warn)]">
                {(longFundingRate * 100).toFixed(4)}%
              </span>
            </div>

            <div className="flex shrink-0 flex-col gap-px leading-[1.15]">
              <span className="text-[9.5px] font-mono tracking-[.07em] text-[var(--t3)] font-semibold whitespace-nowrap">
                Countdown
              </span>
              <span className="text-[12px] font-mono tabular-nums font-semibold text-[var(--t1)]">
                {countdownFormatted}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
