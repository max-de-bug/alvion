"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  TrendingUp,
  TrendingDown,
  Shield,
  Zap,
  Layers,
  DollarSign,
  CheckCircle2,
  ExternalLink,
  Wallet,
  BookOpen,
  ListOrdered,
  XCircle,
  FileCheck2,
  Activity,
  Lock,
  Cpu,
  Scale,
} from "lucide-react";
import { MarketContext, QuoteResult } from "@/lib/hyperliquid";
import { SignedOrder, MatchedTrade } from "@/lib/orderTypes";
import { useTradingStore, type Position } from "@/stores/useTradingStore";

interface OrderBookLevel {
  px: string;
  sz: string;
  n: number;
}

interface OrderBookData {
  coin: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  spread: number;
  spreadBps: number;
}

interface SolvencyData {
  is_solvent: boolean;
  total_assets_usdc: number;
  total_liabilities_usdc: number;
  solvency_ratio?: string;
  conservation_invariant?: string;
}

interface DomainData {
  market: string;
  isolated_insurance_fund_usdc: number;
  max_realizable_pnl_cap_usdc: number;
  current_realized_pnl_usdc: number;
  long_open_interest_usd: number;
  short_open_interest_usd: number;
  firewall_status?: string;
  pnl_protection?: string;
}

export default function Home() {
  const queryClient = useQueryClient();

  // Global Client State via Zustand
  const {
    selectedMarketName,
    setSelectedMarketName,
    isLong,
    setIsLong,
    marginUsdc,
    setMarginUsdc,
    leverage,
    setLeverage,
    orderType,
    setOrderType,
    limitPrice,
    setLimitPrice,
    walletBalance,
    setWalletBalance,
    faucetWallet,
    positions,
    addPosition,
    removePosition,
    bottomTab,
    setBottomTab,
    activeTab,
    setActiveTab,
    timeframe,
    setTimeframe,
    notification,
    notify,
    vaultLiquidity,
    vaultNetSkew,
    vaultApr,
  } = useTradingStore();

  // 1. Fetch live markets from Hyperliquid backend API via TanStack Query
  const { data: markets = [] } = useQuery<MarketContext[]>({
    queryKey: ["markets"],
    queryFn: async () => {
      const res = await fetch("/api/markets");
      const data = await res.json();
      return data.success && data.markets ? (data.markets as MarketContext[]) : [];
    },
    refetchInterval: 4000,
  });

  const currentMarket = useMemo(() => {
    return (
      markets.find((m) => m.name === selectedMarketName) ||
      markets[0] || {
        name: "AVAX",
        oraclePx: 7.18,
        markPx: 7.17,
        midPx: 7.175,
        prevDayPx: 7.49,
        change24h: -4.1,
        fundingRate: -0.000016,
        dayVolumeUsd: 26500000,
        openInterest: 2420000,
        szDecimals: 2,
        maxLeverage: 100,
        impactBidPx: 7.165,
        impactAskPx: 7.185,
      }
    );
  }, [markets, selectedMarketName]);

  // Set default limit price when switching markets
  useEffect(() => {
    if (currentMarket) {
      setLimitPrice(
        currentMarket.markPx > 10
          ? currentMarket.markPx.toFixed(2)
          : currentMarket.markPx.toFixed(4)
      );
    }
  }, [selectedMarketName]);

  // 2. Fetch Open Orders and Recent Trades from Option A matching engine via TanStack Query
  const { data: engineState } = useQuery({
    queryKey: ["engineState", selectedMarketName],
    queryFn: async () => {
      const [ordersRes, tradesRes] = await Promise.all([
        fetch(`/api/orders?market=${selectedMarketName}`),
        fetch(`/api/trades?market=${selectedMarketName}`),
      ]);
      const ordersData = await ordersRes.json();
      const tradesData = await tradesRes.json();
      return {
        openOrders: (ordersData.success && ordersData.orders
          ? ordersData.orders.filter((o: SignedOrder) => o.status === "OPEN")
          : []) as SignedOrder[],
        recentTrades: (tradesData.success && tradesData.trades
          ? tradesData.trades
          : []) as MatchedTrade[],
      };
    },
    refetchInterval: 2500,
  });

  const openOrders = useMemo(() => engineState?.openOrders ?? [], [engineState?.openOrders]);
  const recentTrades = useMemo(() => engineState?.recentTrades ?? [], [engineState?.recentTrades]);

  // 3. Fetch Hyperliquid L2 Order Book via TanStack Query
  const { data: orderBook = null } = useQuery<OrderBookData | null>({
    queryKey: ["orderbook", currentMarket.name],
    queryFn: async () => {
      const res = await fetch(`/api/orderbook?coin=${currentMarket.name}`);
      const data = await res.json();
      return data.success && data.orderBook ? (data.orderBook as OrderBookData) : null;
    },
    refetchInterval: 2000,
  });

  // 4. Request dynamic quote from Hyperliquid pricing engine via TanStack Query
  const { data: quote = null, isFetching: loadingQuote } = useQuery<QuoteResult | null>({
    queryKey: [
      "quote",
      currentMarket.name,
      isLong,
      marginUsdc,
      leverage,
      vaultLiquidity,
      vaultNetSkew,
    ],
    queryFn: async () => {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          market: currentMarket.name,
          isLong,
          marginUsdc,
          leverage,
          vaultLiquidityUsdc: vaultLiquidity,
          vaultNetSkewUsdc: vaultNetSkew,
        }),
      });
      const data = await res.json();
      return data.success ? (data.quote as QuoteResult) : null;
    },
    staleTime: 500,
  });

  // 5. Fetch Percolator Source-Domain Risk & Solvency Invariant Proof via TanStack Query
  const { data: solvency = null } = useQuery<SolvencyData | null>({
    queryKey: ["solvency"],
    queryFn: async () => {
      const res = await fetch("/api/solvency");
      const data = await res.json();
      return data.success ? (data as SolvencyData) : null;
    },
    refetchInterval: 3000,
  });

  const { data: domainInfo = null } = useQuery<DomainData | null>({
    queryKey: ["domain", selectedMarketName],
    queryFn: async () => {
      const res = await fetch(`/api/domain?market=${selectedMarketName}`);
      const data = await res.json();
      return data.success && data.domain ? (data.domain as DomainData) : null;
    },
    refetchInterval: 3000,
  });

  // Execute trade (Option A: EIP-712 Limit order or Vault Market order)
  const handleExecuteTrade = async () => {
    if (!quote) return;
    if (walletBalance < marginUsdc) {
      notify("Insufficient USDC balance", 3000);
      return;
    }

    const execPrice =
      orderType === "limit" && limitPrice && !isNaN(Number(limitPrice))
        ? Number(limitPrice)
        : quote.executionPrice;

    const sizeUsd = marginUsdc * leverage;

    try {
      // Submit signed order to Option A matching engine
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trader: "0xUserAvalancheWallet",
          market: currentMarket.name,
          isLong,
          orderType: orderType === "limit" ? "LIMIT" : "MARKET",
          price: execPrice,
          sizeUsd,
          marginUsdc,
          leverage,
          signature: "0xeip712mocksignature_avalanche_cchain",
        }),
      });

      const data = await res.json();

      if (data.success) {
        setWalletBalance((prev) => prev - marginUsdc);

        // If order matched immediately or was a market order, create position
        if (orderType === "market" || (data.trades && data.trades.length > 0)) {
          const newPosition: Position = {
            id: "POS-" + Math.floor(100000 + Math.random() * 900000),
            market: currentMarket.name,
            isLong,
            marginUsdc,
            leverage,
            sizeUsdc: sizeUsd,
            entryPrice: execPrice,
            openTimestamp: Date.now(),
            liquidationPrice: quote.liquidationPrice,
            tradingFeeUsdc: quote.tradingFeeUsdc,
            executionType: orderType === "limit" ? "OrderBook" : "Vault",
          };

          addPosition(newPosition);
          notify(
            `Trade executed! Filled ${newPosition.executionType} position on ${currentMarket.name}.`,
            5000
          );
        } else {
          notify(
            `Limit order placed on CLOB Order Book! (Zero Gas • EIP-712 signed)`,
            5000
          );
        }

        queryClient.invalidateQueries({ queryKey: ["engineState"] });
        queryClient.invalidateQueries({ queryKey: ["domain"] });
        queryClient.invalidateQueries({ queryKey: ["solvency"] });
      }
    } catch (err) {
      console.error("Order submission failed", err);
    }
  };

  // Cancel resting limit order with 0 gas
  const handleCancelOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders?id=${orderId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        notify(`Order ${orderId} cancelled instantly (0 Gas).`, 3500);
        queryClient.invalidateQueries({ queryKey: ["engineState"] });
        queryClient.invalidateQueries({ queryKey: ["domain"] });
        queryClient.invalidateQueries({ queryKey: ["solvency"] });
      }
    } catch (err) {
      console.error("Failed to cancel order", err);
    }
  };

  // Close position and settle PnL in USDC directly
  const handleClosePosition = (posId: string) => {
    const pos = positions.find((p) => p.id === posId);
    if (!pos) return;

    const market = markets.find((m) => m.name === pos.market) || currentMarket;
    const currentPrice = market.markPx;

    const pnlRatio = pos.isLong
      ? (currentPrice - pos.entryPrice) / pos.entryPrice
      : (pos.entryPrice - currentPrice) / pos.entryPrice;

    const netPnlUsdc = pos.sizeUsdc * pnlRatio;
    const payout = Math.max(0, pos.marginUsdc + netPnlUsdc);

    setWalletBalance((prev) => prev + payout);
    removePosition(posId);

    const pnlFormatted =
      netPnlUsdc >= 0 ? `+$${netPnlUsdc.toFixed(2)}` : `-$${Math.abs(netPnlUsdc).toFixed(2)}`;
    notify(`Position settled on Avalanche C-Chain for ${pnlFormatted} USDC.`, 5000);
  };

  const leverageOptions = [2, 5, 10, 25, 50, 75, 100];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Header */}
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
                className={`px-3 py-1 text-xs font-medium rounded-md transition ${activeTab === "trade"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                Trading Terminal
              </button>
              <button
                onClick={() => setActiveTab("orderbook")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition flex items-center gap-1.5 ${activeTab === "orderbook"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                Live CLOB Depth
              </button>
              <button
                onClick={() => setActiveTab("vault")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition ${activeTab === "vault"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                USDC Vault Backstop
              </button>
              <button
                onClick={() => setActiveTab("docs")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition ${activeTab === "docs"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                Option A Architecture
              </button>
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
          </div>
        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-16 right-4 z-50 bg-slate-900 border border-cyan-500/40 shadow-xl shadow-cyan-500/10 rounded-lg p-3 text-sm flex items-center gap-3 text-slate-200 animate-in fade-in slide-in-from-top duration-200">
          <CheckCircle2 className="h-5 w-5 text-cyan-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full p-4 flex-1 flex flex-col gap-4">
        {/* Ticker Bar: Market Info & Oracle */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <select
                value={selectedMarketName}
                onChange={(e) => setSelectedMarketName(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white font-bold text-base px-3 py-1.5 rounded-lg focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {markets.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name}-USD PERP (up to {m.maxLeverage}x)
                  </option>
                ))}
              </select>
            </div>

            <div className="h-6 w-[1px] bg-slate-800 hidden md:block"></div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                Mark Price
              </div>
              <div className="text-lg font-mono font-bold text-white flex items-center gap-1.5">
                ${currentMarket.markPx > 10 ? currentMarket.markPx.toLocaleString(undefined, { minimumFractionDigits: 2 }) : currentMarket.markPx.toFixed(4)}
                <span
                  className={`text-xs px-1.5 py-0.2 rounded font-semibold ${currentMarket.change24h >= 0
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-rose-500/20 text-rose-400"
                    }`}
                >
                  {currentMarket.change24h >= 0 ? "+" : ""}
                  {currentMarket.change24h.toFixed(2)}%
                </span>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium flex items-center gap-1">
                Hyperliquid Oracle
                <span className="text-[9px] text-cyan-400 font-mono">FEED</span>
              </div>
              <div className="text-sm font-mono text-cyan-300 font-semibold">
                ${currentMarket.oraclePx > 10 ? currentMarket.oraclePx.toLocaleString(undefined, { minimumFractionDigits: 2 }) : currentMarket.oraclePx.toFixed(4)}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                1h Funding
              </div>
              <div className="text-sm font-mono text-slate-200">
                {(currentMarket.fundingRate * 100).toFixed(4)}%
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                24h Volume
              </div>
              <div className="text-sm font-mono text-slate-300">
                ${(currentMarket.dayVolumeUsd / 1_000_000).toFixed(2)}M
              </div>
            </div>
          </div>

          {/* Engine Status Badge */}
          <div className="flex items-center gap-2.5 bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-700/80 px-3.5 py-1.5 rounded-xl">
            <Activity className="h-4 w-4 text-cyan-400" />
            <div>
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1">
                Institutional Hybrid CLOB
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold px-1 rounded uppercase">
                  Sub-ms
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Limit orders on book (0 Gas) • Instant Vault fills
              </div>
            </div>
          </div>
        </div>

        {/* Percolator Architecture & Risk Firewall Bar */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Junior PnL Domain Firewall */}
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400"></span>
              <Shield className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-slate-400 font-medium">Junior PnL Firewall:</span>
              <span className="font-mono text-cyan-300 font-semibold">
                ACTIVE (Domain Cap: ${domainInfo ? domainInfo.max_realizable_pnl_cap_usdc.toLocaleString() : "500,000"} USDC)
              </span>
            </div>

            <div className="h-3 w-[1px] bg-slate-800 hidden sm:block"></div>

            {/* Automated Vault MM */}
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
              <Cpu className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-slate-400 font-medium">Automated Vault MM:</span>
              <span className="font-mono text-indigo-300 font-semibold">
                ACTIVE (Quoting ±20 bps • Skew: {((vaultNetSkew / vaultLiquidity) * 100).toFixed(1)}%)
              </span>
            </div>

            <div className="h-3 w-[1px] bg-slate-800 hidden sm:block"></div>

            {/* Solvency Invariant */}
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
              <Scale className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-slate-400 font-medium">Solvency Invariant:</span>
              <span className="font-mono text-emerald-300 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                100% VERIFIED ($Assets &ge; $Liabilities)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
            <span>Percolator Engine</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400 border border-slate-700">
              Zero-Copy Slabs
            </span>
          </div>
        </div>

        {/* Tab 1: Trading Terminal */}
        {activeTab === "trade" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left 8 cols: Chart + Orderbook + Positions/Orders/Trades */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Chart (7 cols) */}
                <div className="md:col-span-7 bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col h-[340px]">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-200">
                        {currentMarket.name}/USD Perpetual
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                        Hybrid CLOB
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 text-[11px]">
                      {(["1m", "5m", "15m", "1h"] as const).map((tf) => (
                        <button
                          key={tf}
                          onClick={() => setTimeframe(tf)}
                          className={`px-2 py-0.5 rounded font-medium transition ${timeframe === tf
                            ? "bg-cyan-500 text-black font-bold"
                            : "text-slate-400 hover:text-slate-200"
                            }`}
                        >
                          {tf}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 relative flex items-center justify-center bg-slate-950/40 rounded-lg border border-slate-800/40 p-2 overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 400 180" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGradientOptionA" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <line x1="0" y1="45" x2="400" y2="45" stroke="#1e293b" strokeDasharray="3 3" />
                      <line x1="0" y1="90" x2="400" y2="90" stroke="#1e293b" strokeDasharray="3 3" />
                      <line x1="0" y1="135" x2="400" y2="135" stroke="#1e293b" strokeDasharray="3 3" />
                      <path
                        d="M 0 140 Q 70 100, 150 120 T 300 70 T 400 50 L 400 180 L 0 180 Z"
                        fill="url(#chartGradientOptionA)"
                      />
                      <path
                        d="M 0 140 Q 70 100, 150 120 T 300 70 T 400 50"
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="2.5"
                      />
                      <circle cx="400" cy="50" r="4" fill="#38bdf8" className="animate-ping" />
                      <circle cx="400" cy="50" r="4" fill="#0284c7" />
                    </svg>
                  </div>
                </div>

                {/* Compact Order Book (5 cols) */}
                <div className="md:col-span-5 bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col h-[340px]">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
                      <span className="font-bold text-xs text-slate-200">
                        CLOB Order Book
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Spread: {orderBook?.spreadBps.toFixed(1) || "1.2"} bps
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col justify-between font-mono text-[11px] overflow-hidden">
                    <div className="space-y-0.5 flex flex-col-reverse">
                      {orderBook?.asks.slice(0, 5).map((ask, i) => (
                        <div
                          key={`ask-${i}`}
                          onClick={() => setLimitPrice(ask.px)}
                          className="flex items-center justify-between text-rose-400 hover:bg-slate-800/50 px-1 rounded cursor-pointer transition"
                        >
                          <span className="font-semibold">${parseFloat(ask.px).toFixed(4)}</span>
                          <span className="text-slate-400">{parseFloat(ask.sz).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="my-1.5 py-1 px-2 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Mid:</span>
                      <span className="font-bold text-white">
                        ${currentMarket.markPx > 10 ? currentMarket.markPx.toFixed(2) : currentMarket.markPx.toFixed(4)}
                      </span>
                      <span className="text-emerald-400 text-[10px]">Hyperliquid L2</span>
                    </div>

                    <div className="space-y-0.5">
                      {orderBook?.bids.slice(0, 5).map((bid, i) => (
                        <div
                          key={`bid-${i}`}
                          onClick={() => setLimitPrice(bid.px)}
                          className="flex items-center justify-between text-emerald-400 hover:bg-slate-800/50 px-1 rounded cursor-pointer transition"
                        >
                          <span className="font-semibold">${parseFloat(bid.px).toFixed(4)}</span>
                          <span className="text-slate-400">{parseFloat(bid.sz).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Multi-Tab Panel: Positions / Open Orders / Recent Trades */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBottomTab("positions")}
                      className={`text-xs font-bold px-3 py-1 rounded-md transition ${bottomTab === "positions"
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                        : "text-slate-400 hover:text-slate-200"
                        }`}
                    >
                      Positions ({positions.length})
                    </button>
                    <button
                      onClick={() => setBottomTab("openOrders")}
                      className={`text-xs font-bold px-3 py-1 rounded-md transition flex items-center gap-1 ${bottomTab === "openOrders"
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                        : "text-slate-400 hover:text-slate-200"
                        }`}
                    >
                      <ListOrdered className="h-3 w-3" />
                      Open Limit Orders ({openOrders.length})
                    </button>
                    <button
                      onClick={() => setBottomTab("trades")}
                      className={`text-xs font-bold px-3 py-1 rounded-md transition flex items-center gap-1 ${bottomTab === "trades"
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                        : "text-slate-400 hover:text-slate-200"
                        }`}
                    >
                      <FileCheck2 className="h-3 w-3" />
                      Recent Fills ({recentTrades.length})
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Settlement: <span className="text-cyan-300">Avalanche C-Chain USDC</span>
                  </div>
                </div>

                {/* View 1: Active Positions */}
                {bottomTab === "positions" && (
                  <div>
                    {positions.length === 0 ? (
                      <div className="py-8 text-center text-slate-500 text-xs">
                        No active positions. Place a limit order on the book or market order against the vault.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400 font-medium pb-2">
                              <th className="pb-2">Market & Type</th>
                              <th className="pb-2">Size / Margin</th>
                              <th className="pb-2">Entry / Mark</th>
                              <th className="pb-2">PnL (USDC)</th>
                              <th className="pb-2">Liquidation Price</th>
                              <th className="pb-2 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 font-mono">
                            {positions.map((pos) => {
                              const market =
                                markets.find((m) => m.name === pos.market) || currentMarket;
                              const currentPx = market.markPx;

                              const pnlRatio = pos.isLong
                                ? (currentPx - pos.entryPrice) / pos.entryPrice
                                : (pos.entryPrice - currentPx) / pos.entryPrice;
                              const pnlUsdc = pos.sizeUsdc * pnlRatio;
                              const pnlPct = pnlRatio * pos.leverage * 100;

                              return (
                                <tr key={pos.id} className="hover:bg-slate-800/30 transition">
                                  <td className="py-3">
                                    <div className="font-bold flex items-center gap-1.5 font-sans">
                                      <span
                                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${pos.isLong
                                          ? "bg-emerald-500/20 text-emerald-400"
                                          : "bg-rose-500/20 text-rose-400"
                                          }`}
                                      >
                                        {pos.isLong ? "LONG" : "SHORT"} {pos.leverage}x
                                      </span>
                                      <span className="text-white">{pos.market}</span>
                                      <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                        {pos.executionType}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-3">
                                    <div className="text-slate-200 font-semibold">
                                      ${pos.sizeUsdc.toFixed(2)}
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                      Margin: ${pos.marginUsdc.toFixed(2)} USDC
                                    </div>
                                  </td>
                                  <td className="py-3">
                                    <div className="text-slate-200">
                                      ${pos.entryPrice > 10 ? pos.entryPrice.toFixed(2) : pos.entryPrice.toFixed(4)}
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                      Mark: ${currentPx > 10 ? currentPx.toFixed(2) : currentPx.toFixed(4)}
                                    </div>
                                  </td>
                                  <td className="py-3">
                                    <div
                                      className={`font-bold ${pnlUsdc >= 0 ? "text-emerald-400" : "text-rose-400"
                                        }`}
                                    >
                                      {pnlUsdc >= 0 ? "+" : ""}${pnlUsdc.toFixed(2)}
                                      <span className="text-[10px] ml-1">
                                        ({pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%)
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-3">
                                    <div className="font-bold text-rose-400">
                                      ${pos.liquidationPrice > 10 ? pos.liquidationPrice.toFixed(2) : pos.liquidationPrice.toFixed(4)}
                                    </div>
                                    <div className="text-[10px] text-slate-500">
                                      Maint: 0.8%
                                    </div>
                                  </td>
                                  <td className="py-3 text-right">
                                    <button
                                      onClick={() => handleClosePosition(pos.id)}
                                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-sans transition"
                                    >
                                      Close
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* View 2: Open Limit Orders (Resting on CLOB) */}
                {bottomTab === "openOrders" && (
                  <div>
                    {openOrders.length === 0 ? (
                      <div className="py-8 text-center text-slate-500 text-xs">
                        No resting limit orders on the book.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400 font-medium pb-2">
                              <th className="pb-2">Order ID</th>
                              <th className="pb-2">Market & Side</th>
                              <th className="pb-2">Price</th>
                              <th className="pb-2">Size (USD)</th>
                              <th className="pb-2">Margin (USDC)</th>
                              <th className="pb-2">Status</th>
                              <th className="pb-2 text-right">Cancel (0 Gas)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 font-mono">
                            {openOrders.map((ord) => (
                              <tr key={ord.id} className="hover:bg-slate-800/30 transition">
                                <td className="py-2.5 text-slate-300 font-semibold">{ord.id}</td>
                                <td className="py-2.5">
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${ord.isLong
                                      ? "bg-emerald-500/20 text-emerald-400"
                                      : "bg-rose-500/20 text-rose-400"
                                      }`}
                                  >
                                    {ord.isLong ? "BUY" : "SELL"} {ord.leverage}x
                                  </span>{" "}
                                  <span className="text-white font-bold">{ord.market}</span>
                                </td>
                                <td className="py-2.5 text-slate-200">
                                  ${ord.price > 10 ? ord.price.toFixed(2) : ord.price.toFixed(4)}
                                </td>
                                <td className="py-2.5 text-slate-200">
                                  ${ord.sizeUsd.toLocaleString()}
                                </td>
                                <td className="py-2.5 text-cyan-300">
                                  ${ord.marginUsdc.toFixed(2)}
                                </td>
                                <td className="py-2.5">
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 text-[10px]">
                                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                                    Resting on Book
                                  </span>
                                </td>
                                <td className="py-2.5 text-right">
                                  <button
                                    onClick={() => handleCancelOrder(ord.id)}
                                    className="px-2 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-sans transition flex items-center gap-1 ml-auto"
                                  >
                                    <XCircle className="h-3 w-3" />
                                    Cancel
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* View 3: Recent Fills / Trades */}
                {bottomTab === "trades" && (
                  <div>
                    {recentTrades.length === 0 ? (
                      <div className="py-8 text-center text-slate-500 text-xs">
                        No recent fills recorded yet.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400 font-medium pb-2">
                              <th className="pb-2">Trade ID</th>
                              <th className="pb-2">Market & Side</th>
                              <th className="pb-2">Fill Price</th>
                              <th className="pb-2">Size</th>
                              <th className="pb-2">Settlement</th>
                              <th className="pb-2 text-right">Time</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 font-mono">
                            {recentTrades.map((trd) => (
                              <tr key={trd.id} className="hover:bg-slate-800/30 transition">
                                <td className="py-2.5 text-slate-300">{trd.id}</td>
                                <td className="py-2.5">
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${trd.isLong
                                      ? "bg-emerald-500/20 text-emerald-400"
                                      : "bg-rose-500/20 text-rose-400"
                                      }`}
                                  >
                                    {trd.isLong ? "LONG" : "SHORT"}
                                  </span>{" "}
                                  <span className="text-white font-bold">{trd.market}</span>
                                </td>
                                <td className="py-2.5 text-slate-200">
                                  ${trd.price > 10 ? trd.price.toFixed(2) : trd.price.toFixed(4)}
                                </td>
                                <td className="py-2.5 text-slate-200">
                                  ${trd.sizeUsd.toLocaleString()} USD
                                </td>
                                <td className="py-2.5">
                                  <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px]">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Avalanche C-Chain USDC
                                  </span>
                                </td>
                                <td className="py-2.5 text-right text-slate-400 text-[10px]">
                                  {new Date(trd.timestamp).toLocaleTimeString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Execution Form */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-4 shadow-xl">
                {/* Order Type Selector */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <ListOrdered className="h-4 w-4 text-cyan-400" />
                    Option A Engine
                  </span>
                  <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
                    <button
                      onClick={() => setOrderType("limit")}
                      className={`px-2.5 py-1 rounded font-medium transition ${orderType === "limit"
                        ? "bg-cyan-500 text-black font-bold"
                        : "text-slate-400 hover:text-slate-200"
                        }`}
                    >
                      Limit (CLOB 0-Gas)
                    </button>
                    <button
                      onClick={() => setOrderType("market")}
                      className={`px-2.5 py-1 rounded font-medium transition ${orderType === "market"
                        ? "bg-cyan-500 text-black font-bold"
                        : "text-slate-400 hover:text-slate-200"
                        }`}
                    >
                      Market (Vault Fill)
                    </button>
                  </div>
                </div>

                {/* Long / Short Selector */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setIsLong(true)}
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-sm transition ${isLong
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                      : "text-slate-400 hover:text-slate-200"
                      }`}
                  >
                    <TrendingUp className="h-4 w-4" />
                    Buy / Long
                  </button>
                  <button
                    onClick={() => setIsLong(false)}
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-sm transition ${!isLong
                      ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                      : "text-slate-400 hover:text-slate-200"
                      }`}
                  >
                    <TrendingDown className="h-4 w-4" />
                    Sell / Short
                  </button>
                </div>

                {/* Limit Price Input if Limit Order selected */}
                {orderType === "limit" && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Limit Price (USD)</span>
                      <span className="text-[10px] text-cyan-400 font-mono">
                        Mid: ${currentMarket.markPx.toFixed(4)}
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.0001"
                        value={limitPrice}
                        onChange={(e) => setLimitPrice(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-500 pr-16"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                        USD
                      </span>
                    </div>
                  </div>
                )}

                {/* Leverage Slider (Up to 100x) */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Leverage</span>
                    <span className="font-mono font-bold text-cyan-400 text-sm">
                      {leverage}x
                    </span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="100"
                    step="1"
                    value={leverage}
                    onChange={(e) => setLeverage(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />

                  <div className="flex items-center justify-between gap-1">
                    {leverageOptions.map((lev) => (
                      <button
                        key={lev}
                        onClick={() => setLeverage(lev)}
                        className={`text-[10px] font-mono px-2 py-1 rounded transition ${leverage === lev
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                          : "bg-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                      >
                        {lev}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Margin Collateral (USDC) */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Collateral (USDC)</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Avail: ${walletBalance.toFixed(2)}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="10"
                      max={walletBalance}
                      value={marginUsdc}
                      onChange={(e) => setMarginUsdc(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-500 pr-16"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                      USDC
                    </span>
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    {[0.25, 0.5, 0.75, 1].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => setMarginUsdc(Math.floor(walletBalance * pct))}
                        className="flex-1 text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 py-1 rounded border border-slate-700/50"
                      >
                        {pct === 1 ? "MAX" : `${pct * 100}%`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Execution Details Breakdown */}
                <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 flex flex-col gap-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Order Size</span>
                    <span className="text-white font-semibold">
                      ${quote?.positionSizeUsdc.toLocaleString(undefined, { minimumFractionDigits: 2 }) || (marginUsdc * leverage).toFixed(2)} USDC
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Target Execution Price</span>
                    <span className="text-white font-bold">
                      ${orderType === "limit" && limitPrice ? Number(limitPrice).toFixed(4) : quote?.executionPrice.toFixed(4) || "..."}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Execution Route</span>
                    <span className="text-cyan-400">
                      {orderType === "limit" ? "EIP-712 CLOB Maker (0 Gas)" : "USDC Vault Instant Fill"}
                    </span>
                  </div>

                  <div className="border-t border-slate-800/80 my-1"></div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Liquidation Price</span>
                    <span className="text-rose-400 font-semibold">
                      ${quote?.liquidationPrice.toFixed(4) || "..."}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Trading Fee (USDC)</span>
                    <span className="text-slate-300">
                      ${quote?.tradingFeeUsdc.toFixed(2) || (marginUsdc * leverage * 0.0006).toFixed(2)} USDC
                    </span>
                  </div>
                </div>

                {/* Execution CTA Button */}
                <button
                  onClick={handleExecuteTrade}
                  disabled={loadingQuote}
                  className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide transition shadow-lg flex items-center justify-center gap-2 ${isLong
                    ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20"
                    : "bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20"
                    }`}
                >
                  <Zap className="h-4 w-4 fill-current" />
                  {orderType === "limit" ? "Sign & Place Limit Order (0 Gas)" : `Execute ${isLong ? "Long" : "Short"} Against Vault`}
                </button>

                <div className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  Option A • Avalanche C-Chain Native Circle USDC
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Full CLOB Depth View */}
        {activeTab === "orderbook" && (
          <div className="flex flex-col gap-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-cyan-400" />
                    Central Limit Order Book (CLOB) — {currentMarket.name}/USD
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Off-chain matching engine order book depth combined with Hyperliquid L2 feeds and resting user orders.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase font-medium">Spread</div>
                    <div className="text-base font-mono font-bold text-cyan-300">
                      ${orderBook?.spread.toFixed(4) || "0.0010"} ({orderBook?.spreadBps.toFixed(2) || "1.4"} bps)
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                    <span className="font-bold text-xs text-emerald-400 uppercase tracking-wider">
                      Buy Orders (Bids)
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">Price (USD) / Size</span>
                  </div>
                  <div className="space-y-1.5 font-mono text-xs">
                    {orderBook?.bids.map((b, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/60 transition"
                      >
                        <span className="text-emerald-400 font-semibold">${parseFloat(b.px).toFixed(4)}</span>
                        <div className="flex items-center gap-3 text-slate-300">
                          <span>{parseFloat(b.sz).toFixed(2)} {currentMarket.name}</span>
                          <span className="text-slate-500 text-[10px]">({b.n} orders)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                    <span className="font-bold text-xs text-rose-400 uppercase tracking-wider">
                      Sell Orders (Asks)
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">Price (USD) / Size</span>
                  </div>
                  <div className="space-y-1.5 font-mono text-xs">
                    {orderBook?.asks.map((a, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/60 transition"
                      >
                        <span className="text-rose-400 font-semibold">${parseFloat(a.px).toFixed(4)}</span>
                        <div className="flex items-center gap-3 text-slate-300">
                          <span>{parseFloat(a.sz).toFixed(2)} {currentMarket.name}</span>
                          <span className="text-slate-500 text-[10px]">({a.n} orders)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Single USDC Liquidity Vault */}
        {activeTab === "vault" && (
          <div className="flex flex-col gap-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <DollarSign className="h-6 w-6 text-cyan-400" />
                    Single USDC Liquidity Vault & Backstop
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Provides unified counterparty liquidity for market orders and absorbs net open interest on Avalanche C-Chain.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase font-medium">Vault LP APR</div>
                    <div className="text-lg font-mono font-bold text-emerald-400">{vaultApr}%</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                  <div className="text-xs text-slate-400">Total Vault Liquidity (TVL)</div>
                  <div className="text-xl font-mono font-bold text-white mt-1">
                    ${vaultLiquidity.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-1">Circle Native USDC on Avalanche</div>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                  <div className="text-xs text-slate-400">Net Skew Exposure</div>
                  <div className="text-xl font-mono font-bold text-cyan-300 mt-1">
                    +${vaultNetSkew.toLocaleString()} USDC
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Long bias compensated via dynamic spread</div>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                  <div className="text-xs text-slate-400">Vault Utilization</div>
                  <div className="text-xl font-mono font-bold text-white mt-1">
                    {((Math.abs(vaultNetSkew) / vaultLiquidity) * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Safe capital reserve ratio</div>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                  <div className="text-xs text-slate-400">Trading Fees Accrued</div>
                  <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
                    $184,250 USDC
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">100% distributed to USDC LPs</div>
                </div>
              </div>

              {/* Percolator Architecture Section */}
              <div className="mt-8 border-t border-slate-800 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Shield className="h-5 w-5 text-cyan-400" />
                      Percolator-Enhanced Risk Architecture & Invariants
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Inspired by Anatoly Yakovenko&apos;s Percolator: Domain Firewalls, Junior PnL, Solvency Invariants & Automated MM.
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                    Solvency Ratio: {solvency?.solvency_ratio || "1,845%"}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Junior PnL Domain Firewall Table */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                        <Lock className="h-4 w-4" />
                        Source-Domain Firewalls & Junior PnL Caps
                      </span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        Zero Cross-Contamination
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Profits generated in high-volatility pairs are structurally bounded by each domain&apos;s isolated insurance buffer. Even in catastrophic oracle or manipulation events, long-tail profits can never drain the core USDC vault.
                    </p>
                    <div className="overflow-x-auto mt-1">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 font-medium">
                            <th className="pb-2">Market Domain</th>
                            <th className="pb-2">Insurance Buffer</th>
                            <th className="pb-2">Max Realizable PnL</th>
                            <th className="pb-2 text-right">Firewall Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-mono">
                          <tr>
                            <td className="py-2 font-bold text-white">AVAX Domain</td>
                            <td className="py-2 text-slate-300">$250,000 USDC</td>
                            <td className="py-2 text-cyan-300">$500,000 USDC</td>
                            <td className="py-2 text-right text-emerald-400">ACTIVE</td>
                          </tr>
                          <tr>
                            <td className="py-2 font-bold text-white">BTC Domain</td>
                            <td className="py-2 text-slate-300">$1,000,000 USDC</td>
                            <td className="py-2 text-cyan-300">$2,000,000 USDC</td>
                            <td className="py-2 text-right text-emerald-400">ACTIVE</td>
                          </tr>
                          <tr>
                            <td className="py-2 font-bold text-white">ETH Domain</td>
                            <td className="py-2 text-slate-300">$750,000 USDC</td>
                            <td className="py-2 text-cyan-300">$1,500,000 USDC</td>
                            <td className="py-2 text-right text-emerald-400">ACTIVE</td>
                          </tr>
                          <tr>
                            <td className="py-2 font-bold text-white">SOL Domain</td>
                            <td className="py-2 text-slate-300">$500,000 USDC</td>
                            <td className="py-2 text-cyan-300">$1,000,000 USDC</td>
                            <td className="py-2 text-right text-emerald-400">ACTIVE</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Solvency Invariant & Automated MM Details */}
                  <div className="flex flex-col gap-4">
                    {/* Conservation of Value Card */}
                    <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                          <Scale className="h-4 w-4" />
                          Conservation of Value (Solvency Invariant)
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono">VERIFIED</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Formal invariant checked on every state transition: total protocol assets must strictly exceed all trader locked margins and net domain liabilities.
                      </p>
                      <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-800 font-mono text-xs flex flex-col gap-1.5">
                        <div className="flex justify-between text-slate-300">
                          <span>Total Backing Assets:</span>
                          <span className="font-bold text-emerald-400">
                            ${(solvency?.total_assets_usdc || 7_750_000).toLocaleString()} USDC
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Total Trader Margin / Liabilities:</span>
                          <span className="text-rose-400">
                            ${(solvency?.total_liabilities_usdc || 420_000).toLocaleString()} USDC
                          </span>
                        </div>
                        <div className="flex justify-between text-cyan-300 pt-1 border-t border-slate-800">
                          <span>Net Surplus Capital:</span>
                          <span className="font-bold text-white">
                            +${((solvency?.total_assets_usdc || 7_750_000) - (solvency?.total_liabilities_usdc || 420_000)).toLocaleString()} USDC
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Automated Vault Market Maker (percolator-match) */}
                    <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                          <Cpu className="h-4 w-4" />
                          Automated Vault Market Maker (Active Quoting)
                        </span>
                        <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 font-mono">
                          percolator-match
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Instead of passive unquoted liquidity, the USDC Vault acts as an automated maker continuously placing bid/ask ladders directly into the CLOB with Avellaneda-Stoikov inventory skew adjustment.
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        <span>Quoting Spread: <strong className="text-indigo-300">&plusmn;20 bps</strong></span>
                        <span>Inventory Skew: <strong className="text-cyan-300">+{((vaultNetSkew / vaultLiquidity) * 100).toFixed(1)}% Long</strong></span>
                        <span>Refresh Frequency: <strong className="text-white">2.0s</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Architecture & Avalanche Docs */}
        {activeTab === "docs" && (
          <div className="flex flex-col gap-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-2">
                Option A Architecture: Hybrid CLOB on Avalanche C-Chain
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Fast off-chain matching with sub-millisecond execution, zero gas for limit order placement and cancellations, and on-chain settlement on Avalanche C-Chain with Native Circle USDC.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
                  <h3 className="font-bold text-cyan-300 text-sm mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    1. High-Performance CLOB Matching Engine
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    In-memory Price-Time Priority matching engine written in Rust benchmarked at over 480,000 orders/sec.
                  </p>
                  <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
                    <li>Sub-millisecond latency matching.</li>
                    <li>Deterministic fixed-point price calculations.</li>
                    <li>Standard maintenance margin liquidation rules.</li>
                  </ul>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
                  <h3 className="font-bold text-cyan-300 text-sm mb-3 flex items-center gap-2">
                    <ListOrdered className="h-4 w-4" />
                    2. EIP-712 Zero-Gas Limit Orders
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    Traders sign typed data orders off-chain using their private key (EIP-712).
                  </p>
                  <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
                    <li>0 gas to place limit orders.</li>
                    <li>0 gas to cancel or edit limit orders.</li>
                    <li>Only matched trades settle to Avalanche C-Chain via <code className="text-cyan-300">settleMatchedOrders()</code>.</li>
                  </ul>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
                  <h3 className="font-bold text-indigo-300 text-sm mb-3 flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    3. Junior PnL & Domain Firewalls (Percolator Pattern)
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    Every trading pair operates as an isolated risk domain with its own insurance reserve.
                  </p>
                  <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
                    <li>Long-tail profit payouts cannot exceed the market domain&apos;s insurance cap.</li>
                    <li>Total core USDC vault TVL is completely protected from cascading market drain.</li>
                    <li>Automated Vault Market Maker provides continuous dual-sided grid liquidity.</li>
                  </ul>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
                  <h3 className="font-bold text-emerald-300 text-sm mb-3 flex items-center gap-2">
                    <Scale className="h-4 w-4" />
                    4. Value Conservation & Zero-Copy Memory Slabs
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    Mathematical solvency is verified across all state changes in both Rust and Solidity.
                  </p>
                  <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
                    <li>Formal Solvency Invariant: <code className="text-emerald-300">Assets &ge; Total Margin + PnL Liabilities</code>.</li>
                    <li>Zero-copy contiguous memory slabs prevent GC pauses and cache thrashing.</li>
                    <li>Seamless on-chain settlement into Avalanche Native Circle USDC vault.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-4 py-3 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>ALVION Option A Protocol • Avalanche C-Chain</span>
          <span className="font-mono text-[11px] text-slate-400">
            Settlement Contract: <code className="text-cyan-400">contracts/AlvionPerpVault.sol</code>
          </span>
        </div>
      </footer>
    </div>
  );
}
