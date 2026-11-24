"use client";

import React, { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { ChevronDown } from "lucide-react";
import { MarketContext } from "@/lib/hyperliquid";
import { MarketMetadata } from "@/stores/useTradingStore";
import { MarketIcon } from "../shared/MarketIcon";

// Vercel Best Practice: bundle-dynamic-imports (lazy load 600-line modal)
const MarketSelectorModal = dynamic(
  () => import("../modals/MarketSelectorModal").then((m) => m.MarketSelectorModal),
  { ssr: false }
);

interface MarketTickerBarProps {
  selectedMarketName: string;
  setSelectedMarketName: (name: string) => void;
  currentMarket: MarketContext;
  marketMeta: MarketMetadata;
  longOi: number;
  shortOi: number;
  longFundingRate: number;
  minutesToFunding: number;
  formatUsdCompact: (val: number) => string;
  markets?: MarketContext[];
}

export const MarketTickerBar = React.memo<MarketTickerBarProps>(function MarketTickerBar({
  selectedMarketName,
  setSelectedMarketName,
  currentMarket,
  marketMeta,
  longOi,
  shortOi,
  longFundingRate,
  minutesToFunding,
  formatUsdCompact,
  markets = [],
}) {
  const [showMarketMenu, setShowMarketMenu] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const countdownFormatted = `00:${minutesToFunding.toString().padStart(2, "0")}:18`;
  const markPriceFormatted = currentMarket.markPx > 10
    ? currentMarket.markPx.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : currentMarket.markPx.toFixed(4);

  const oraclePriceFormatted = currentMarket.oraclePx > 10
    ? currentMarket.oraclePx.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : currentMarket.oraclePx.toFixed(4);

  return (
    <div className="container-in container-in-1 relative z-20 shrink-0 mb-3">
      <div className="h-[60px] rounded-none border border-[var(--border)] bg-[var(--surface)] shadow-lg">
        <div className="strip-scroll flex h-full items-center gap-4 px-3 overflow-x-auto [scrollbar-width:none]">
          {/* Market Selector Pill */}
          <div className="shrink-0 relative">
            <button
              ref={buttonRef}
              type="button"
              onClick={() => setShowMarketMenu((prev) => !prev)}
              aria-haspopup="dialog"
              aria-expanded={showMarketMenu}
              className={`flex items-center gap-2 px-3 py-2 rounded-none border transition-colors cursor-pointer ${
                showMarketMenu
                  ? "bg-[var(--surface-3)] border-[var(--border-strong)]"
                  : "border-transparent hover:bg-[var(--surface-3)] hover:border-[var(--border)]"
              }`}
            >
              <div className="flex items-center gap-2">
                <MarketIcon symbol={selectedMarketName} size={22} />
                <span className="font-semibold tracking-[-0.01em] text-[var(--t1)] text-[14.5px] font-mono">
                  {selectedMarketName}-USD
                </span>
                <span className="lev-tag" aria-label={`Up to ${marketMeta.maxLeverage || 1000}x leverage`}>
                  {marketMeta.maxLeverage || 1000}x
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-[var(--t3)] transition-transform duration-200 ${
                  showMarketMenu ? "rotate-180 text-white" : ""
                }`}
              />
            </button>

            {/* QFEX-Style Market Selection Popover (Vercel Best Practice: bundle-conditional & rendering-conditional-render) */}
            {showMarketMenu ? (
              <MarketSelectorModal
                isOpen={showMarketMenu}
                onClose={() => setShowMarketMenu(false)}
                selectedMarketName={selectedMarketName}
                onSelectMarket={setSelectedMarketName}
                markets={markets}
                triggerRef={buttonRef}
              />
            ) : null}
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
