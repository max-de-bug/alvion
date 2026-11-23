"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { MarketContext } from "@/lib/hyperliquid";
import { MarketMetadata } from "@/stores/useTradingStore";
import { MarketSelectorModal } from "./MarketSelectorModal";

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
  markets?: MarketContext[];
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
  markets = [],
}) {
  const [showMarketMenu, setShowMarketMenu] = useState(false);

  const countdownFormatted = `00:${minutesToFunding.toString().padStart(2, "0")}:18`;
  const markPriceFormatted = currentMarket.markPx > 10
    ? currentMarket.markPx.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : currentMarket.markPx.toFixed(4);

  const oraclePriceFormatted = currentMarket.oraclePx > 10
    ? currentMarket.oraclePx.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : currentMarket.oraclePx.toFixed(4);

  // Asset icon badge
  const getAssetIcon = (sym: string) => {
    switch (sym) {
      case "BTC":
        return "₿";
      case "ETH":
        return "Ξ";
      case "SOL":
        return "◎";
      case "NATGAS":
        return "🔥";
      case "CRUDE":
        return "🛢";
      case "GOLD":
        return "✦";
      case "SILVER":
        return "◇";
      default:
        return sym.slice(0, 1);
    }
  };

  return (
    <div className="container-in container-in-1 relative z-20 shrink-0 mb-3">
      <div className="h-[60px] rounded-none border border-[var(--border)] bg-[var(--surface)] shadow-lg">
        <div className="strip-scroll flex h-full items-center gap-4 px-3 overflow-x-auto [scrollbar-width:none]">
          {/* Market Selector Pill */}
          <div className="shrink-0 relative">
            <button
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
              <div className="flex items-center">
                <div className="w-[22px] h-[22px] rounded-none bg-amber-500/90 flex items-center justify-center text-[11px] font-bold text-black border border-slate-900 shadow-sm">
                  {getAssetIcon(selectedMarketName)}
                </div>
                <div className="w-[22px] h-[22px] rounded-none bg-[#4ECCA3] flex items-center justify-center text-[10px] font-bold text-[#0A1612] border border-slate-900 shadow-sm -ml-1.5">
                  $
                </div>
              </div>
              <span className="font-semibold tracking-[-0.01em] text-[var(--t1)] text-[14.5px]">
                {selectedMarketName}-USDCX
              </span>
              <span className="lev-tag" aria-label={`Up to ${marketMeta.maxLeverage || 20}x leverage`}>
                {marketMeta.maxLeverage || 20}x
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[var(--t3)] transition-transform duration-200 ${
                  showMarketMenu ? "rotate-180 text-white" : ""
                }`}
              />
            </button>

            {/* QFEX-Style Market Selection Popover */}
            <MarketSelectorModal
              isOpen={showMarketMenu}
              onClose={() => setShowMarketMenu(false)}
              selectedMarketName={selectedMarketName}
              onSelectMarket={setSelectedMarketName}
              markets={markets}
            />
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
