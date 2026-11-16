"use client";

import React from "react";
import Link from "next/link";
import { Zap, BookOpen, Wallet, Sparkles } from "lucide-react";

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

export const TradingHeader: React.FC<TradingHeaderProps> = ({
  activeTab,
  setActiveTab,
  walletBalance,
  faucetWallet,
  isConnected,
  address,
  chainId,
  connectWallet,
  disconnect,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-rose-500 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-white">
                  ALVION
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  OPTION A: HYBRID CLOB
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Off-Chain EIP-712 Matching • Avalanche C-Chain Settlement • Up to 100x Leverage
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 ml-4 bg-slate-800/60 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab("trade")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                activeTab === "trade"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Trading Terminal
            </button>
            <button
              onClick={() => setActiveTab("orderbook")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition flex items-center gap-1.5 ${
                activeTab === "orderbook"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              Live CLOB Depth
            </button>
            <button
              onClick={() => setActiveTab("vault")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                activeTab === "vault"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              USDC Vault Backstop
            </button>
            <button
              onClick={() => setActiveTab("docs")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                activeTab === "docs"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Option A Architecture
            </button>
            <Link
              href="/waitlist"
              className="px-3 py-1 text-xs font-bold rounded-md transition flex items-center gap-1.5 bg-gradient-to-r from-red-600/30 via-rose-600/30 to-red-600/40 text-rose-300 border border-red-500/50 hover:from-red-600/50 hover:to-rose-600/60 shadow-sm"
            >
              <Sparkles className="h-3 w-3 text-red-400" />
              <span>VIP Waitlist</span>
            </Link>
          </nav>
        </div>

        {/* Right side: Wallet & Network */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Hyperliquid L2 Stream</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <Wallet className="h-4 w-4 text-cyan-400" />
            <div className="text-right">
              <div className="text-xs font-mono font-semibold text-slate-100">
                ${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-400">USDC (Avalanche C-Chain)</div>
            </div>
            <button
              onClick={() => faucetWallet(1000)}
              title="Add 1,000 test USDC"
              className="ml-1 text-[10px] bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30"
            >
              +Faucet
            </button>
          </div>

          {/* Web3 Wallet Connect / Status */}
          {isConnected && address ? (
            <div className="flex items-center gap-2 bg-cyan-950/60 border border-cyan-500/40 px-2.5 py-1.5 rounded-lg text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-mono text-cyan-300 font-medium">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700 font-mono">
                {chainId === 43113 ? "Fuji" : chainId === 43114 ? "Avalanche" : `ID:${chainId}`}
              </span>
              <button
                onClick={() => disconnect()}
                title="Disconnect Wallet"
                className="text-slate-400 hover:text-rose-400 text-xs ml-1 font-bold"
              >
                ×
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs px-3 py-2 rounded-lg shadow-md transition-all cursor-pointer"
            >
              <Wallet className="h-3.5 w-3.5" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

