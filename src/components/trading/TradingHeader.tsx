"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  X,
  Wallet,
  Settings,
} from "lucide-react";
import { AlvionBirdLogo } from "@/components/brand/AlvionBirdLogo";
import { useTradingStore, type ActiveTab } from "@/stores/useTradingStore";

interface TradingHeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  walletBalance: number;
  faucetWallet: (amount: number) => void;
  isConnected: boolean;
  address?: string;
  chainId?: number;
  connectWallet: () => void;
  disconnect: () => void;
}

export const TradingHeader = React.memo<TradingHeaderProps>(function TradingHeader({
  activeTab,
  setActiveTab,
  walletBalance,
  faucetWallet,
  isConnected,
  address,
  connectWallet,
  disconnect,
}) {
  const { tradingMode, setTradingMode, credits } = useTradingStore();
  const [showWarning, setShowWarning] = useState(true);
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(showWarning ? 88 : 56);

  useEffect(() => {
    if (!headerRef.current) return;
    const updateHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.getBoundingClientRect().height);
      }
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, [showWarning]);

  return (
    <>
      <div ref={headerRef} className="fixed top-0 left-0 right-0 z-40 flex flex-col w-full">
        {/* 1. Dismissible Testnet Banner */}
        {showWarning && (
          <div
            role="status"
            className="relative z-20 flex items-center justify-center gap-2 border-b border-[var(--border)] bg-[var(--warn-soft)] px-10 py-[6px]"
          >
            <span className="text-[12px] font-semibold tracking-[0.02em] text-[var(--warn)]">
              Testnet environment: funds and data are not real
            </span>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setShowWarning(false)}
              className="absolute right-2 grid size-[24px] cursor-pointer place-items-center rounded-none text-[var(--warn)] transition-colors hover:bg-[var(--hover)] focus-visible:outline-none"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 2. Main Header */}
        <header
          role="banner"
          className="flex items-center justify-between gap-[14px] px-[12px] sm:px-[20px] h-[var(--header-h)] border-b border-[var(--border)] bg-[rgba(10,10,12,0.85)] [backdrop-filter:blur(14px)_saturate(1.8)] [-webkit-backdrop-filter:blur(14px)_saturate(1.8)]"
        >
        {/* Left: Alvion Brand Lockup & Nav Tabs */}
        <div className="flex items-center gap-[16px] min-w-0">
          <Link
            href="/"
            aria-label="Alvion home"
            className="brand-lockup flex items-center gap-2.5 shrink-0 rounded-none cursor-pointer font-semibold tracking-[-0.01em] text-[var(--t1)] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fixed-green)]"
          >
            <AlvionBirdLogo
              size={28}
              variant="light"
              className="transition-transform duration-300 group-hover:scale-110"
            />
            <span className="text-[16px] font-bold tracking-[-0.015em] text-white group-hover:text-[#4ECCA3] transition-colors">
              ALVION
            </span>
          </Link>

          {/* Navigation Pill Container */}
          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-[2px] p-[3px] rounded-none bg-[var(--surface-3)]"
          >
            <button
              onClick={() => setActiveTab("trade")}
              aria-label="Trade"
              aria-current={activeTab === "trade" ? "page" : undefined}
              className={`inline-flex items-center px-[14px] py-[6px] rounded-none text-[13px] tracking-[-0.005em] transition-colors cursor-pointer ${
                activeTab === "trade"
                  ? "bg-[var(--surface)] text-[var(--t1)] font-semibold shadow-[0_1px_3px_rgba(0,0,0,.25)]"
                  : "text-[var(--t2)] hover:text-[var(--t1)] font-normal"
              }`}
            >
              <span>Trade</span>
            </button>

            <button
              onClick={() => setActiveTab("vault")}
              aria-label="Vault"
              aria-current={activeTab === "vault" ? "page" : undefined}
              className={`inline-flex items-center px-[14px] py-[6px] rounded-none text-[13px] tracking-[-0.005em] transition-colors cursor-pointer ${
                activeTab === "vault"
                  ? "bg-[var(--surface)] text-[var(--t1)] font-semibold shadow-[0_1px_3px_rgba(0,0,0,.25)]"
                  : "text-[var(--t2)] hover:text-[var(--t1)] font-normal"
              }`}
            >
              <span>Vault</span>
            </button>

            <button
              onClick={() => setActiveTab("credits")}
              aria-label="Credits"
              aria-current={activeTab === "credits" ? "page" : undefined}
              className={`inline-flex items-center gap-1.5 px-[14px] py-[6px] rounded-none text-[13px] tracking-[-0.005em] transition-colors cursor-pointer ${
                activeTab === "credits"
                  ? "bg-[var(--surface)] text-[var(--t1)] font-semibold shadow-[0_1px_3px_rgba(0,0,0,.25)]"
                  : "text-[var(--t2)] hover:text-[var(--t1)] font-normal"
              }`}
            >
              <span>Credits</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-none bg-[#4ECCA3]/10 text-[#4ECCA3] border border-[#4ECCA3]/25">
                {credits}
              </span>
            </button>

            <Link
              href="/waitlist"
              className="inline-flex items-center px-[14px] py-[6px] rounded-none text-[13px] tracking-[-0.005em] transition-colors cursor-pointer text-[var(--t2)] hover:text-[var(--t1)] font-normal"
            >
              <span>Waitlist</span>
            </Link>
          </nav>
        </div>

        {/* Right: Controls & Wallet */}
        <div className="flex items-center gap-[10px] min-w-0">
          {/* Mobile Credits Chip */}
          <button
            type="button"
            onClick={() => setActiveTab("credits")}
            aria-label="View Credits"
            className={`md:hidden flex items-center gap-1 px-2.5 py-1 rounded-none border text-xs font-mono font-semibold transition-colors cursor-pointer ${
              activeTab === "credits"
                ? "bg-[#162922] border-[#4ECCA3] text-[#4ECCA3]"
                : "bg-[var(--surface-3)] border-[var(--border)] text-[var(--t2)] hover:text-white"
            }`}
          >
            <span>{credits} CR</span>
          </button>

          {/* Dual Experience Mode Switcher (Consumer / Pro) */}
          <div className="flex items-center bg-[var(--surface-3)] p-[3px] rounded-none border border-[var(--border)] text-xs">
            <button
              onClick={() => setTradingMode("consumer")}
              className={`px-3 py-1 rounded-none font-medium transition-colors ${
                tradingMode === "consumer"
                  ? "bg-[var(--surface)] text-[#4ECCA3] font-semibold shadow-xs"
                  : "text-[var(--t3)] hover:text-[var(--t1)]"
              }`}
            >
              <span className="text-[12px]">Consumer</span>
            </button>
            <button
              onClick={() => setTradingMode("pro")}
              className={`px-3 py-1 rounded-none font-medium transition-colors ${
                tradingMode === "pro"
                  ? "bg-[var(--surface)] text-white font-semibold shadow-xs"
                  : "text-[var(--t3)] hover:text-[var(--t1)]"
              }`}
            >
              <span className="text-[12px]">Pro</span>
            </button>
          </div>

          {/* Faucet Balance Pill */}
          <div className="hidden sm:flex items-center gap-2 pl-3 pr-1.5 py-1 rounded-none bg-[var(--surface-3)] border border-[var(--border)]">
            <div className="text-right">
              <span className="text-xs font-mono font-semibold text-[var(--t1)]">
                ${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[11px] text-[#4ECCA3] font-mono ml-1 font-semibold">USDCx</span>
            </div>
            <button
              onClick={() => faucetWallet(10000)}
              title="Claim 10,000 test USDCx"
              className="text-[10.5px] font-semibold text-[#4ECCA3] hover:text-[#3db890] px-2 py-0.5 rounded-none border border-[#4ECCA3]/30 bg-[#162922] transition-colors"
            >
              +Faucet
            </button>
          </div>

          {/* Settings Icon Button */}
          <button
            type="button"
            aria-label="Settings"
            className="grid place-items-center size-[var(--header-ctl-h)] rounded-none bg-[var(--surface-3)] text-[var(--t2)] hover:text-[var(--t1)] hover:bg-[var(--hover)] transition-colors cursor-pointer border border-[var(--border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fixed-green)]"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Connect / Wallet Button */}
          {isConnected && address ? (
            <div className="flex items-center gap-2 bg-[var(--surface-3)] border border-[var(--border)] px-3 py-1.5 rounded-none text-xs font-mono">
              <span className="text-[var(--t1)] font-medium">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
              <button
                onClick={() => disconnect()}
                title="Disconnect wallet"
                className="text-[var(--t3)] hover:text-rose-400 text-xs ml-1"
                aria-label="Disconnect wallet"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="btn-chrome flex items-center gap-1.5 h-[var(--header-ctl-h)] px-[16px] rounded-none text-[11.5px] font-semibold uppercase tracking-[0.05em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fixed-green)] cursor-pointer shrink-0"
              aria-label="Connect Wallet"
            >
              <Wallet className="w-3.5 h-3.5 text-[#4ECCA3]" />
              <span>Connect</span>
            </button>
          )}
        </div>
      </header>
    </div>
    {/* Spacer to preserve normal document flow beneath fixed navbar */}
    <div style={{ height: headerHeight }} aria-hidden="true" className="shrink-0 pointer-events-none" />
  </>
  );
});
