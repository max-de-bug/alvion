"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Copy, Check, ExternalLink, Share2, TrendingUp, TrendingDown } from "lucide-react";
import { AlvionBirdLogo } from "@/components/brand/AlvionBirdLogo";
import { MarketIcon } from "../shared/MarketIcon";
import { Position } from "@/stores/useTradingStore";
import { MarketContext } from "@/lib/hyperliquid";

interface SharePnlModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: Position | null;
  market: MarketContext | null;
}

export const SharePnlModal = React.memo<SharePnlModalProps>(function SharePnlModal({
  isOpen,
  onClose,
  position,
  market,
}) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted || !position) return null;

  const currentPrice = market?.markPx || position.entryPrice;
  const pnlRatio = position.isLong
    ? (currentPrice - position.entryPrice) / position.entryPrice
    : (position.entryPrice - currentPrice) / position.entryPrice;
  const pnlUsdc = position.sizeUsdc * pnlRatio;
  const pnlPct = pnlRatio * position.leverage * 100;
  const isProfit = pnlPct >= 0;

  const handleCopySummary = () => {
    if (typeof window !== "undefined") {
      const text = `${position.market}-USDCx ${position.isLong ? "Long" : "Short"} ${position.leverage}x on Alvion\n` +
        `ROE: ${isProfit ? "+" : ""}${pnlPct.toFixed(2)}% (${isProfit ? "+" : ""}$${pnlUsdc.toFixed(2)} USDC)\n` +
        `Entry: $${position.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })} | Mark: $${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n` +
        `https://alvion.exchange/waitlist?ref=ALVION_VANGUARD`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const tweetText = encodeURIComponent(
    `$${position.market} ${position.isLong ? "Long" : "Short"} ${position.leverage}x: ${isProfit ? "+" : ""}${pnlPct.toFixed(2)}% ROE on @AlvionExchange.\n\nhttps://alvion.exchange/waitlist?ref=ALVION_VANGUARD`
  );
  const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] bg-[#0E1318] border border-[#1E272C] rounded-none shadow-2xl flex flex-col overflow-hidden text-white select-none animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0A0E12] border-b border-[#1E272C]">
          <span className="text-xs font-mono font-medium text-[#8C9DA6] flex items-center gap-2">
            <Share2 className="w-3.5 h-3.5 text-[#4ECCA3]" />
            <span>Share position</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-none border border-[#212D33] bg-[#141B1F] hover:bg-[#1E272C] text-[#8C9DA6] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card Canvas */}
        <div className="p-4 flex flex-col">
          <div
            className={`border rounded-none p-4 flex flex-col gap-4 relative transition-colors ${
              isProfit
                ? "bg-[#0C1513] border-[#4ECCA3]/30"
                : "bg-[#170D10] border-rose-500/30"
            }`}
          >
            {/* Card Brand Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <AlvionBirdLogo size={20} variant="light" />
                <span className="font-semibold tracking-tight text-white text-sm">
                  ALVION
                </span>
              </div>
              <span className="text-xs font-mono text-[#8C9DA6]">
                Robinhood Chain L2
              </span>
            </div>

            {/* Market & Direction */}
            <div className="flex items-center justify-between pt-0.5">
              <div className="flex items-center gap-2">
                <MarketIcon symbol={position.market} size={28} />
                <span className="font-semibold text-white text-base">
                  {position.market}-USDCx
                </span>
              </div>

              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-none border font-mono font-medium text-xs ${
                  position.isLong
                    ? "bg-[#142921] text-[#4ECCA3] border-[#4ECCA3]/30"
                    : "bg-[#281318] text-[#F43F5E] border-[#F43F5E]/30"
                }`}
              >
                {position.isLong ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                <span>{position.isLong ? "Long" : "Short"} {position.leverage}x</span>
              </div>
            </div>

            {/* Primary ROE Metric */}
            <div className="flex flex-col py-1">
              <span className="text-[11px] font-mono text-[#8C9DA6]">
                Return on equity
              </span>
              <div
                className={`text-4xl font-mono font-bold tabular-nums tracking-tight mt-0.5 ${
                  isProfit ? "text-[#4ECCA3]" : "text-[#F43F5E]"
                }`}
              >
                {isProfit ? "+" : ""}{pnlPct.toFixed(2)}%
              </div>
              <div
                className={`text-xs font-mono tabular-nums mt-0.5 ${
                  isProfit ? "text-[#4ECCA3]/80" : "text-[#F43F5E]/80"
                }`}
              >
                {isProfit ? "+" : ""}${pnlUsdc.toFixed(2)} USDC
              </div>
            </div>

            {/* Matrix Data */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-black/30 border border-white/10 rounded-none text-xs font-mono">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-[#8C9DA6]">Entry price</span>
                <span className="text-white font-medium tabular-nums">
                  ${position.entryPrice > 10 ? position.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }) : position.entryPrice.toFixed(4)}
                </span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-[#8C9DA6]">Mark price</span>
                <span className="text-white font-medium tabular-nums">
                  ${currentPrice > 10 ? currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }) : currentPrice.toFixed(4)}
                </span>
              </div>

              <div className="flex flex-col gap-0.5 pt-1.5 border-t border-white/10">
                <span className="text-[10px] text-[#8C9DA6]">Size</span>
                <span className="text-white font-medium tabular-nums">
                  ${position.sizeUsdc.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex flex-col gap-0.5 pt-1.5 border-t border-white/10">
                <span className="text-[10px] text-[#8C9DA6]">Liquidation price</span>
                <span className="text-rose-400 font-medium tabular-nums">
                  ${position.liquidationPrice > 10 ? position.liquidationPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }) : position.liquidationPrice.toFixed(4)}
                </span>
              </div>
            </div>

            {/* Card Footer */}
            <div className="flex items-center justify-between border-t border-white/10 pt-2 text-xs font-mono text-[#8C9DA6]">
              <span>alvion.exchange</span>
              <span className="text-[#4ECCA3]">24/7 CLOB</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button
              type="button"
              onClick={handleCopySummary}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#141B1F] hover:bg-[#1E272C] border border-[#212D33] text-white text-xs font-medium rounded-none transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#4ECCA3]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#8C9DA6]" />
                  <span>Copy summary</span>
                </>
              )}
            </button>

            <a
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#4ECCA3] hover:bg-[#43B892] text-black text-xs font-medium rounded-none transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Share on X</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
});
