"use client";

import React from "react";
import Link from "next/link";
import { Wallet } from "lucide-react";
import { AlvionBirdLogo } from "@/components/brand/AlvionBirdLogo";

interface TradingHeaderProps {
  activeTab: "trade" | "orderbook" | "vault" | "docs";
  setActiveTab: (tab: "trade" | "orderbook" | "vault" | "docs") => void;
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
  return (
    <header className="border-b border-slate-800 bg-slate-950 sticky top-0 z-50 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <AlvionBirdLogo
              size={28}
              variant="light"
              className="transition-transform duration-300 group-hover:scale-110"
            />
            <span className="font-bold text-base text-white tracking-tight group-hover:text-emerald-400 transition-colors">
              ALVION
            </span>
          </Link>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab("trade")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === "trade"
                  ? "bg-slate-800 text-white font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Trade
            </button>
            <button
              onClick={() => setActiveTab("orderbook")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === "orderbook"
                  ? "bg-slate-800 text-white font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Order book
            </button>
            <button
              onClick={() => setActiveTab("vault")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === "vault"
                  ? "bg-slate-800 text-white font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Vault
            </button>
            <button
              onClick={() => setActiveTab("docs")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === "docs"
                  ? "bg-slate-800 text-white font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Docs
            </button>
            <Link
              href="/waitlist"
              className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Waitlist
            </Link>
          </nav>
        </div>

        {/* Right side: Network & Wallet */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Robinhood Chain</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-md border border-slate-800">
            <div className="text-right">
              <span className="text-xs font-mono font-semibold text-slate-100">
                ${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[11px] text-slate-400 ml-1">USDC</span>
            </div>
            <button
              onClick={() => faucetWallet(1000)}
              title="Add 1,000 test USDC"
              className="ml-1 text-[11px] text-cyan-400 hover:text-cyan-300 px-1.5 py-0.5 rounded border border-slate-700 hover:border-slate-600 transition-colors"
            >
              +Faucet
            </button>
          </div>

          {/* Wallet Connect / Status */}
          {isConnected && address ? (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-md text-xs font-mono">
              <span className="text-slate-300 font-medium">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
              <button
                onClick={() => disconnect()}
                title="Disconnect wallet"
                className="text-slate-400 hover:text-rose-400 text-xs ml-1"
                aria-label="Disconnect wallet"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs px-3 py-1.5 rounded-md transition-colors cursor-pointer"
            >
              <Wallet className="h-3.5 w-3.5" />
              <span>Connect</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
});
