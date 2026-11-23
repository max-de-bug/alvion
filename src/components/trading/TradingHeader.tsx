"use client";

import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  X,
  Plus,
  ChevronDown,
  Settings,
} from "lucide-react";
import { AlvionBirdLogo } from "@/components/brand/AlvionBirdLogo";
import { useShallow } from "zustand/react/shallow";
import { useTradingStore, type ActiveTab } from "@/stores/useTradingStore";

// Vercel Best Practice: bundle-dynamic-imports
const AccountModal = dynamic(
  () => import("./AccountModal").then((m) => m.AccountModal),
  { ssr: false }
);

interface TradingHeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  walletBalance: number;
  faucetWallet: (amount: number) => void;
  isConnected?: boolean;
  address?: string;
  alias?: string;
  chainId?: number;
  connectWallet?: () => void;
  disconnect?: () => void;
  exportPrivateKey?: () => string;
  resetAccount?: () => void;
}

export const TradingHeader = React.memo<TradingHeaderProps>(function TradingHeader({
  activeTab,
  setActiveTab,
  walletBalance,
  faucetWallet,
  isConnected,
  address,
  alias,
  connectWallet,
  disconnect,
  exportPrivateKey,
  resetAccount,
}) {
  // Vercel Best Practice: rerender-defer-reads & shallow store subscription
  const { tradingMode, setTradingMode, credits } = useTradingStore(
    useShallow((s) => ({
      tradingMode: s.tradingMode,
      setTradingMode: s.setTradingMode,
      credits: s.credits,
    }))
  );
  const [showWarning, setShowWarning] = useState(true);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(showWarning ? 88 : 56);

  const displayAlias = alias || (address ? `Trader #${address.slice(2, 6).toUpperCase()}` : "Trader #4663");

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

          {/* 1. Cash Balance Pill (Polymarket Style) */}
          <button
            type="button"
            onClick={() => setShowAccountModal(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-none bg-[var(--surface-3)] hover:bg-[var(--hover)] border border-[var(--border)] transition-colors cursor-pointer"
            title="Cash Balance • Click to manage account"
          >
            <span className="text-[10px] text-[#728087] uppercase font-mono tracking-wider">Cash</span>
            <span className="text-xs font-mono font-bold text-white">
              ${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10.5px] text-[#4ECCA3] font-mono font-semibold">USDC</span>
          </button>

          {/* 2. Deposit Button (Polymarket Style) */}
          <button
            type="button"
            onClick={() => setShowAccountModal(true)}
            className="flex items-center gap-1.5 h-[var(--header-ctl-h)] px-3.5 bg-[#4ECCA3] hover:bg-[#43B892] text-black font-semibold text-[11.5px] uppercase tracking-wider rounded-none transition-colors cursor-pointer shrink-0 shadow-sm"
            title="Instant Deposit (Testnet Reload)"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Deposit</span>
          </button>

          {/* 3. Embedded Account Pill (Polymarket Style) */}
          <button
            type="button"
            onClick={() => setShowAccountModal(true)}
            className="flex items-center gap-2 h-[var(--header-ctl-h)] px-2.5 bg-[var(--surface-3)] hover:bg-[var(--hover)] border border-[var(--border)] rounded-none text-xs font-mono text-white transition-colors cursor-pointer shrink-0"
            title="Embedded Account • 1-Click Trading"
          >
            <div className="w-5 h-5 bg-[#1A252B] border border-[#2A3740] rounded-none flex items-center justify-center font-mono font-bold text-[10px] text-[#4ECCA3]">
              {displayAlias.slice(-2)}
            </div>
            <span className="hidden md:inline font-medium text-[11.5px]">{displayAlias}</span>
            <span className="w-1.5 h-1.5 bg-[#4ECCA3] rounded-none animate-pulse" title="1-Click Trading Active" />
            <ChevronDown className="w-3.5 h-3.5 text-[#728087]" />
          </button>
        </div>
      </header>
    </div>

    {/* Polymarket-Style Account & Embedded Wallet Modal (Vercel Best Practice: bundle-conditional) */}
    {showAccountModal ? (
      <AccountModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        address={address || "0x71C8364762A803325b335371b292723E59d64663"}
        alias={displayAlias}
        walletBalance={walletBalance}
        faucetWallet={faucetWallet}
        exportPrivateKey={exportPrivateKey || (() => "0x0000000000000000000000000000000000000000000000000000000000000000")}
        resetAccount={resetAccount || (() => {})}
      />
    ) : null}

    {/* Spacer to preserve normal document flow beneath fixed navbar */}
    <div style={{ height: headerHeight }} aria-hidden="true" className="shrink-0 pointer-events-none" />
  </>
  );
});
