"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MarketContext, QuoteResult } from "@/lib/hyperliquid";
import { SignedOrder, MatchedTrade } from "@/lib/orderTypes";
import { useTradingStore, MARKETS_METADATA, type Position } from "@/stores/useTradingStore";
import { useAlvionTrading } from "@/hooks/useAlvionTrading";
import {
  OrderBookData,
  SolvencyData,
  DomainData,
  FundingData,
} from "@/types/trading";

export function formatUsdCompact(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(2)}K`;
  return `$${val.toFixed(2)}`;
}

const EMPTY_MARKETS: MarketContext[] = [];
const EMPTY_ORDERS: SignedOrder[] = [];
const EMPTY_TRADES: MatchedTrade[] = [];

const DEFAULT_MARKET: MarketContext = {
  name: "BTC",
  oraclePx: 67450.0,
  markPx: 67448.5,
  midPx: 67449.2,
  prevDayPx: 65800.0,
  change24h: 2.51,
  fundingRate: 0.000012,
  dayVolumeUsd: 184500000,
  openInterest: 42800000,
  szDecimals: 4,
  maxLeverage: 1000,
  impactBidPx: 67445.0,
  impactAskPx: 67452.0,
};

export function useTradingDashboard() {
  const queryClient = useQueryClient();

  // Global client state via Zustand
  const {
    tradingMode,
    setTradingMode,
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
    credits,
    setCredits,
  } = useTradingStore();

  // 1. Fetch live markets from Hyperliquid backend API via TanStack Query
  const { data: markets = EMPTY_MARKETS } = useQuery<MarketContext[]>({
    queryKey: ["markets"],
    queryFn: async () => {
      const res = await fetch("/api/markets");
      const data = await res.json();
      return data.success && data.markets ? (data.markets as MarketContext[]) : EMPTY_MARKETS;
    },
    refetchInterval: 4000,
  });

  const {
    address,
    alias,
    isConnected,
    chainId,
    connectWallet,
    disconnect,
    signOrder,
    exportPrivateKey,
    resetAccount,
  } = useAlvionTrading();

  const currentMarket = useMemo(() => {
    return (
      markets.find((m) => m.name === selectedMarketName) ||
      markets[0] ||
      DEFAULT_MARKET
    );
  }, [markets, selectedMarketName]);

  const marketMeta = MARKETS_METADATA[selectedMarketName] || {
    symbol: selectedMarketName,
    name: selectedMarketName,
    category: "CRYPTO",
    exchangeBadge: "Robinhood L2",
    maxLeverage: currentMarket.maxLeverage || 1000,
    initialMarginPct: 0.1,
    is24x7: true,
  };
  const isEquity = marketMeta.category === "EQUITY";

  // Set default limit price when switching markets without infinite loop
  const initializedMarketRef = useRef<string | null>(null);

  useEffect(() => {
    if (currentMarket && initializedMarketRef.current !== currentMarket.name) {
      initializedMarketRef.current = currentMarket.name;
      const defaultPrice =
        currentMarket.markPx > 10
          ? currentMarket.markPx.toFixed(2)
          : currentMarket.markPx.toFixed(4);
      setLimitPrice(defaultPrice);
    }
  }, [currentMarket, setLimitPrice]);

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
          : EMPTY_ORDERS) as SignedOrder[],
        recentTrades: (tradesData.success && tradesData.trades
          ? tradesData.trades
          : EMPTY_TRADES) as MatchedTrade[],
      };
    },
    refetchInterval: 2500,
  });

  const openOrders = useMemo(() => engineState?.openOrders ?? EMPTY_ORDERS, [engineState?.openOrders]);
  const recentTrades = useMemo(() => engineState?.recentTrades ?? EMPTY_TRADES, [engineState?.recentTrades]);

  // 3. Fetch Hyperliquid L2 Order Book via TanStack Query
  const { data: orderBook = null } = useQuery<OrderBookData | null>({
    queryKey: ["orderbook", currentMarket.name],
    queryFn: async () => {
      const res = await fetch(`/api/orderbook?coin=${currentMarket.name}`);
      const data = await res.json();
      return data.success && data.orderBook ? (data.orderBook as OrderBookData) : null;
    },
    refetchInterval: 1200,
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
    // Vercel Best Practice: async-cheap-condition-before-await (skip network call when inputs are invalid)
    enabled: marginUsdc > 0 && leverage > 0,
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

  // 6. Fetch Alvion Adaptive Skew Funding Rate (Hyperliquid Premium + Vault Inventory Skew)
  const { data: fundingInfo = null } = useQuery<FundingData | null>({
    queryKey: ["funding", selectedMarketName],
    queryFn: async () => {
      const res = await fetch(`/api/funding?market=${selectedMarketName}`);
      const data = await res.json();
      return data.success && data.funding ? (data.funding as FundingData) : null;
    },
    refetchInterval: 3000,
  });

  // TitanX Institutional Metrics: Open Interest, Funding /h, Available Liquidity
  const longOi = domainInfo?.long_open_interest_usd ?? 98_840_000;
  const shortOi = domainInfo?.short_open_interest_usd ?? 99_940_000;
  const totalOi = longOi + shortOi;
  const longOiRatio = totalOi > 0 ? (longOi / totalOi) * 100 : 50;
  const shortOiRatio = totalOi > 0 ? (shortOi / totalOi) * 100 : 50;

  const longFundingRate = fundingInfo?.long_funding_rate_1h_pct ?? fundingInfo?.funding_rate_1h_pct ?? 0.0022;
  const shortFundingRate = fundingInfo?.short_funding_rate_1h_pct ?? (longFundingRate > 0 ? -longFundingRate * 0.9 : -0.0010);

  const availableLongLiq = domainInfo?.available_long_liquidity_usd ?? 1_160_000;
  const availableShortLiq = domainInfo?.available_short_liquidity_usd ?? 57_280;

  const [minutesToFunding, setMinutesToFunding] = useState(48);

  useEffect(() => {
    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      if (fundingInfo?.next_funding_time) {
        const diff = Math.max(0, fundingInfo.next_funding_time - now);
        setMinutesToFunding(Math.max(1, Math.floor(diff / 60)));
      } else {
        const d = new Date();
        setMinutesToFunding(Math.max(1, 60 - d.getMinutes()));
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 15000);
    return () => clearInterval(interval);
  }, [fundingInfo?.next_funding_time]);

  // 7. Real-Time Liquidation Sentinel (Automated Invariant & Margin Enforcement)
  const liquidatingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (positions.length === 0 || markets.length === 0) return;

    for (const pos of positions) {
      if (liquidatingRef.current.has(pos.id)) continue;
      const market = markets.find((m) => m.name === pos.market);
      if (!market || market.markPx <= 0) continue;

      // Long liquidation triggered if mark price <= liquidation price
      // Short liquidation triggered if mark price >= liquidation price
      const isLiquidatable = pos.isLong
        ? market.markPx <= pos.liquidationPrice
        : market.markPx >= pos.liquidationPrice;

      if (isLiquidatable) {
        liquidatingRef.current.add(pos.id);
        removePosition(pos.id);
        notify(
          `⚠️ Position Liquidated: ${pos.market}-USDCx ${pos.isLong ? "Long" : "Short"} ${pos.leverage}x breached liquidation price ($${pos.liquidationPrice > 10 ? pos.liquidationPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }) : pos.liquidationPrice.toFixed(4)}). Collateral accrued to ${pos.market} Domain Insurance Reserve.`,
          7000
        );
        queryClient.invalidateQueries({ queryKey: ["solvency"] });
        queryClient.invalidateQueries({ queryKey: ["domain"] });

        // Clear sentinel lock after debounce window
        setTimeout(() => {
          liquidatingRef.current.delete(pos.id);
        }, 5000);
      }
    }
  }, [markets, positions, removePosition, notify, queryClient]);

  // Execute trade (Option A: EIP-712 Limit order or Vault Market order)
  const handleExecuteTrade = useCallback(async () => {
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
      const trader = (address || "0x71C8364762A803325b335371b292723E59d64663") as string;

      // 1-Click Cryptographic EIP-712 Signing via Embedded Non-Custodial Wallet
      const signRes = await signOrder({
        market: currentMarket.name,
        isLong,
        price: execPrice,
        sizeUsd,
        marginUsdc,
        leverage,
      });
      const signature = signRes.signature;

      // Submit signed order to Option A matching engine
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trader,
          market: currentMarket.name,
          isLong,
          orderType: orderType === "limit" ? "LIMIT" : "MARKET",
          price: execPrice,
          sizeUsd,
          marginUsdc,
          leverage,
          signature,
          chain: "robinhood",
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
            `Limit order placed on Robinhood Chain CLOB! (Zero Gas • EIP-712 signed)`,
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
  }, [
    quote,
    walletBalance,
    marginUsdc,
    orderType,
    limitPrice,
    leverage,
    address,
    signOrder,
    currentMarket.name,
    isLong,
    notify,
    setWalletBalance,
    addPosition,
    queryClient,
  ]);

  // Cancel resting limit order with 0 gas
  const handleCancelOrder = useCallback(
    async (orderId: string) => {
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
    },
    [notify, queryClient]
  );

  // Close position and settle PnL in USDC directly
  const handleClosePosition = useCallback(
    (posId: string) => {
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
      notify(`Position settled on Robinhood Chain for ${pnlFormatted} USDC.`, 5000);
    },
    [positions, markets, currentMarket, setWalletBalance, removePosition, notify]
  );

  return {
    // State from store
    tradingMode,
    setTradingMode,
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
    faucetWallet,
    positions,
    bottomTab,
    setBottomTab,
    activeTab,
    setActiveTab,
    timeframe,
    setTimeframe,
    notification,
    vaultLiquidity,
    vaultNetSkew,
    vaultApr,
    credits,
    setCredits,

    // Market and Engine data
    markets,
    currentMarket,
    marketMeta,
    isEquity,
    openOrders,
    recentTrades,
    orderBook,
    quote,
    loadingQuote,
    solvency,
    domainInfo,
    fundingInfo,

    // Wallet & Embedded Account
    address,
    alias,
    isConnected,
    chainId,
    connectWallet,
    disconnect,
    exportPrivateKey,
    resetAccount,

    // Computed metrics
    longOi,
    shortOi,
    longOiRatio,
    shortOiRatio,
    longFundingRate,
    shortFundingRate,
    availableLongLiq,
    availableShortLiq,
    minutesToFunding,
    formatUsdCompact,

    // Actions
    handleExecuteTrade,
    handleCancelOrder,
    handleClosePosition,
  };
}

