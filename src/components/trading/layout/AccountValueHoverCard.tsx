"use client";

import React, { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import NumberFlow from "@number-flow/react";
import { useTradingStore, type Position } from "@/stores/useTradingStore";
import type { SignedOrder } from "@/lib/orderTypes";
import type { MarketContext } from "@/lib/hyperliquid";

export interface AccountValueHoverCardProps {
  walletBalance: number;
  positions?: Position[];
  openOrders?: SignedOrder[];
  markets?: MarketContext[];
  currentMarket?: MarketContext;
  onOpenDeposit?: () => void;
  onOpenAccount?: () => void;
}

export const AccountValueHoverCard = React.memo<AccountValueHoverCardProps>(function AccountValueHoverCard({
  walletBalance,
  positions,
  openOrders,
  markets,
  currentMarket,
  onOpenDeposit,
  onOpenAccount,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fallback to store positions if not explicitly passed
  const storePositions = useTradingStore((s) => s.positions);
  const effectivePositions = positions ?? storePositions;

  // 1. Available balance: unencumbered collateral ready to trade or withdraw
  const availableBalance = Math.max(0, walletBalance);

  // 2. Position margin: collateral currently locked across active open positions
  const positionMargin = useMemo(() => {
    return (effectivePositions || []).reduce((acc, pos) => acc + (pos.marginUsdc || 0), 0);
  }, [effectivePositions]);

  // 3. Order margin: collateral reserved for active resting unfilled limit orders
  const orderMargin = useMemo(() => {
    return (openOrders || []).reduce((acc, ord) => {
      if (ord.status === "OPEN" || !ord.status) {
        const remainingRatio =
          ord.sizeUsd > 0
            ? Math.max(0, (ord.sizeUsd - (ord.filledSizeUsd || 0)) / ord.sizeUsd)
            : 1;
        return acc + (ord.marginUsdc || 0) * remainingRatio;
      }
      return acc;
    }, 0);
  }, [openOrders]);

  // 4. Unrealized PnL: live floating mark-to-market PnL across active positions
  const unrealizedPnl = useMemo(() => {
    if (!effectivePositions || effectivePositions.length === 0) return 0;
    const marketMap = new Map((markets || []).map((m) => [m.name, m]));

    return effectivePositions.reduce((acc, pos) => {
      const market = marketMap.get(pos.market) || currentMarket;
      const currentPx = market?.markPx || pos.entryPrice;
      if (!currentPx || !pos.entryPrice) return acc;

      const pnlRatio = pos.isLong
        ? (currentPx - pos.entryPrice) / pos.entryPrice
        : (pos.entryPrice - currentPx) / pos.entryPrice;

      const positionSize = pos.sizeUsdc || (pos.marginUsdc || 0) * (pos.leverage || 1);
      return acc + positionSize * pnlRatio;
    }, 0);
  }, [effectivePositions, markets, currentMarket]);

  // 5. Account Value: Total account equity = Available + Position Margin + Order Margin + Unrealized PnL
  const accountValue = Math.max(0, availableBalance + positionMargin + orderMargin + unrealizedPnl);

  // Margin Ratio
  const totalMarginUsed = positionMargin + orderMargin;
  const marginUsagePct =
    accountValue > 0 ? Math.min(100, Math.max(0, (totalMarginUsed / accountValue) * 100)) : 0;

  // Grace period hover handlers (anti-flicker transit)
  const handleMouseEnter = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  }, []);

  // Keyboard accessibility (Escape key dismiss)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Outside click dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative hidden sm:inline-block select-none"
    >
      {/* Trigger: Quiet, high-contrast trading control matching header scale */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2.5 h-[var(--header-ctl-h)] px-3 bg-[var(--surface-3)] hover:bg-[var(--hover)] border border-[var(--border)] rounded-none transition-colors cursor-pointer group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--focus-ring)]"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <div className="flex flex-col items-start text-left leading-tight">
          <span className="text-[10px] text-[var(--t3)] group-hover:text-[var(--t2)] font-sans font-medium transition-colors">
            Account value
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xs font-mono font-semibold text-[var(--t1)] tabular-nums tracking-tight">
              <NumberFlow
                value={accountValue}
                format={{
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }}
                locales="en-US"
              />
            </span>
            <span className="text-[10px] text-[var(--fixed-green)] font-mono font-medium">USDC</span>
          </div>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[var(--t3)] transition-transform duration-150 ${
            isOpen ? "rotate-180 text-[var(--t1)]" : "group-hover:text-[var(--t2)]"
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Invisible hover bridge */}
      <div className="absolute top-full left-0 right-0 h-2" aria-hidden="true" />

      {/* Popover: 100% Solid Opaque Institutional Terminal Card */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Account equity breakdown"
          className="absolute top-full right-0 mt-1.5 w-76 bg-[#0E1318] border border-[#212D33] shadow-2xl shadow-black/95 p-4 z-[100] rounded-none text-white animate-in fade-in duration-120"
          style={{ backgroundColor: "#0E1318" }}
        >
          {/* Header: Equity & floating PnL */}
          <div className="flex items-baseline justify-between pb-3 border-b border-[#212D33]">
            <div>
              <div className="text-[11px] font-sans text-[#8C9DA6] font-medium">Total equity</div>
              <div className="text-base font-mono font-semibold text-white tabular-nums tracking-tight mt-0.5">
                <NumberFlow
                  value={accountValue}
                  format={{
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }}
                  locales="en-US"
                />
              </div>
            </div>
            {unrealizedPnl !== 0 && (
              <div className="text-right">
                <div className="text-[10px] font-sans text-[#8C9DA6] font-medium">Unrealized PnL</div>
                <div
                  className={`text-xs font-mono font-medium tabular-nums mt-0.5 ${
                    unrealizedPnl > 0 ? "text-[#4ECCA3]" : "text-[#F43F5E]"
                  }`}
                >
                  {unrealizedPnl > 0 ? "+" : ""}${unrealizedPnl.toFixed(2)}
                </div>
              </div>
            )}
          </div>

          {/* Breakdown Rows: Exact QFEX Specifications */}
          <div className="py-3 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[#8C9DA6] font-sans">Available balance</span>
              <span className="text-white font-medium tabular-nums">
                ${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#8C9DA6] font-sans">Position margin</span>
              <span className="text-white font-medium tabular-nums">
                ${positionMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                {effectivePositions.length > 0 && (
                  <span className="text-[#5F6E78] font-normal ml-1">
                    ({effectivePositions.length})
                  </span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#8C9DA6] font-sans">Order margin</span>
              <span className="text-white font-medium tabular-nums">
                ${orderMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                {(openOrders || []).length > 0 && (
                  <span className="text-[#5F6E78] font-normal ml-1">
                    ({(openOrders || []).length})
                  </span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px]">
              <span className="text-[#5F6E78] font-sans">Margin used</span>
              <span className="text-[#9AA5B1] font-medium tabular-nums">
                {marginUsagePct.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Actions: Disciplined, restrained buttons */}
          {(onOpenDeposit || onOpenAccount) && (
            <div className="pt-3 border-t border-[#212D33] flex items-center gap-2">
              {onOpenDeposit && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenDeposit();
                  }}
                  className="flex-1 h-7.5 px-3 bg-[#4ECCA3] hover:bg-[#43B892] text-black font-semibold text-xs rounded-none transition-colors cursor-pointer text-center"
                >
                  Deposit
                </button>
              )}
              {onOpenAccount && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenAccount();
                  }}
                  className="h-7.5 px-3 bg-[#141B1F] hover:bg-[#1C252B] text-[#9AA5B1] hover:text-white border border-[#212D33] text-xs font-medium rounded-none transition-colors cursor-pointer"
                >
                  Account
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
