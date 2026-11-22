import { create } from "zustand";

export interface MarketMetadata {
  symbol: string;
  name: string;
  category: "EQUITY" | "CRYPTO";
  exchangeBadge: string;
  maxLeverage: number;
  initialMarginPct: number;
  is24x7: boolean;
}

export const MARKETS_METADATA: Record<string, MarketMetadata> = {
  SPY: {
    symbol: "SPY",
    name: "SPDR S&P 500 ETF Trust",
    category: "EQUITY",
    exchangeBadge: "NYSE Arca",
    maxLeverage: 20,
    initialMarginPct: 5,
    is24x7: true,
  },
  NVDA: {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    category: "EQUITY",
    exchangeBadge: "NASDAQ / NYSE",
    maxLeverage: 10,
    initialMarginPct: 10,
    is24x7: true,
  },
  TSLA: {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    category: "EQUITY",
    exchangeBadge: "NASDAQ / NYSE",
    maxLeverage: 10,
    initialMarginPct: 10,
    is24x7: true,
  },
  AAPL: {
    symbol: "AAPL",
    name: "Apple Inc.",
    category: "EQUITY",
    exchangeBadge: "NASDAQ / NYSE",
    maxLeverage: 10,
    initialMarginPct: 10,
    is24x7: true,
  },
  QQQ: {
    symbol: "QQQ",
    name: "Invesco QQQ Trust (Nasdaq-100)",
    category: "EQUITY",
    exchangeBadge: "NASDAQ",
    maxLeverage: 20,
    initialMarginPct: 5,
    is24x7: true,
  },
  MSFT: {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    category: "EQUITY",
    exchangeBadge: "NASDAQ",
    maxLeverage: 10,
    initialMarginPct: 10,
    is24x7: true,
  },
  AMZN: {
    symbol: "AMZN",
    name: "Amazon.com, Inc.",
    category: "EQUITY",
    exchangeBadge: "NASDAQ",
    maxLeverage: 10,
    initialMarginPct: 10,
    is24x7: true,
  },
  GOOGL: {
    symbol: "GOOGL",
    name: "Alphabet Inc. (Google)",
    category: "EQUITY",
    exchangeBadge: "NASDAQ",
    maxLeverage: 10,
    initialMarginPct: 10,
    is24x7: true,
  },
  META: {
    symbol: "META",
    name: "Meta Platforms, Inc.",
    category: "EQUITY",
    exchangeBadge: "NASDAQ",
    maxLeverage: 10,
    initialMarginPct: 10,
    is24x7: true,
  },
  COIN: {
    symbol: "COIN",
    name: "Coinbase Global, Inc.",
    category: "EQUITY",
    exchangeBadge: "NASDAQ",
    maxLeverage: 10,
    initialMarginPct: 10,
    is24x7: true,
  },
  MSTR: {
    symbol: "MSTR",
    name: "MicroStrategy Inc.",
    category: "EQUITY",
    exchangeBadge: "NASDAQ",
    maxLeverage: 10,
    initialMarginPct: 10,
    is24x7: true,
  },
  SOL: {
    symbol: "SOL",
    name: "Solana",
    category: "CRYPTO",
    exchangeBadge: "Robinhood Crypto",
    maxLeverage: 50,
    initialMarginPct: 2,
    is24x7: true,
  },
  BTC: {
    symbol: "BTC",
    name: "Bitcoin",
    category: "CRYPTO",
    exchangeBadge: "Robinhood Crypto",
    maxLeverage: 50,
    initialMarginPct: 2,
    is24x7: true,
  },
  ETH: {
    symbol: "ETH",
    name: "Ethereum",
    category: "CRYPTO",
    exchangeBadge: "Robinhood Crypto",
    maxLeverage: 50,
    initialMarginPct: 2,
    is24x7: true,
  },
};

export interface Position {
  id: string;
  market: string;
  isLong: boolean;
  marginUsdc: number;
  leverage: number;
  sizeUsdc: number;
  entryPrice: number;
  openTimestamp: number;
  liquidationPrice: number;
  tradingFeeUsdc: number;
  executionType: "OrderBook" | "Vault";
}

export type OrderType = "market" | "limit";
export type BottomTab = "positions" | "openOrders" | "trades";
export type ActiveTab = "trade" | "orderbook" | "vault" | "docs";
export type Timeframe = "1m" | "5m" | "15m" | "1h";

interface TradingState {
  // Trade Form & Trader Preferences
  selectedMarketName: string;
  isLong: boolean;
  marginUsdc: number;
  leverage: number;
  orderType: OrderType;
  limitPrice: string;
  walletBalance: number;
  positions: Position[];

  // Navigation & UI Tabs
  bottomTab: BottomTab;
  activeTab: ActiveTab;
  timeframe: Timeframe;
  notification: string | null;

  // Single USDC Vault LP State
  vaultLiquidity: number;
  vaultNetSkew: number;
  vaultApr: number;

  // Actions
  setSelectedMarketName: (market: string) => void;
  setIsLong: (isLong: boolean) => void;
  setMarginUsdc: (margin: number) => void;
  setLeverage: (leverage: number) => void;
  setOrderType: (orderType: OrderType) => void;
  setLimitPrice: (price: string) => void;
  setWalletBalance: (balance: number | ((prev: number) => number)) => void;
  faucetWallet: (amount?: number) => void;

  addPosition: (pos: Position) => void;
  removePosition: (posId: string) => void;
  setPositions: (updater: Position[] | ((prev: Position[]) => Position[])) => void;

  setBottomTab: (tab: BottomTab) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setTimeframe: (tf: Timeframe) => void;
  setNotification: (msg: string | null) => void;
  notify: (msg: string, durationMs?: number) => void;

  setVaultLiquidity: (val: number) => void;
  setVaultNetSkew: (val: number) => void;
  setVaultApr: (val: number) => void;
}

let notificationTimer: NodeJS.Timeout | null = null;

export const useTradingStore = create<TradingState>((set) => ({
  // Initial values
  selectedMarketName: "SOL",
  isLong: true,
  marginUsdc: 100,
  leverage: 25,
  orderType: "limit",
  limitPrice: "",
  walletBalance: 5000,
  positions: [],

  bottomTab: "positions",
  activeTab: "trade",
  timeframe: "15m",
  notification: null,

  vaultLiquidity: 5_250_000,
  vaultNetSkew: 420_000,
  vaultApr: 24.8,

  // Setters
  setSelectedMarketName: (market) => set({ selectedMarketName: market }),
  setIsLong: (isLong) => set({ isLong }),
  setMarginUsdc: (marginUsdc) => set({ marginUsdc }),
  setLeverage: (leverage) => set({ leverage }),
  setOrderType: (orderType) => set({ orderType }),
  setLimitPrice: (limitPrice) => set({ limitPrice }),

  setWalletBalance: (updater) =>
    set((state) => ({
      walletBalance:
        typeof updater === "function" ? updater(state.walletBalance) : updater,
    })),

  faucetWallet: (amount = 1000) =>
    set((state) => ({ walletBalance: state.walletBalance + amount })),

  addPosition: (pos) =>
    set((state) => ({ positions: [pos, ...state.positions] })),

  removePosition: (posId) =>
    set((state) => ({
      positions: state.positions.filter((p) => p.id !== posId),
    })),

  setPositions: (updater) =>
    set((state) => ({
      positions:
        typeof updater === "function" ? updater(state.positions) : updater,
    })),

  setBottomTab: (bottomTab) => set({ bottomTab }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setTimeframe: (timeframe) => set({ timeframe }),

  setNotification: (notification) => set({ notification }),

  notify: (msg, durationMs = 4000) => {
    if (notificationTimer) {
      clearTimeout(notificationTimer);
    }
    set({ notification: msg });
    notificationTimer = setTimeout(() => {
      set({ notification: null });
      notificationTimer = null;
    }, durationMs);
  },

  setVaultLiquidity: (vaultLiquidity) => set({ vaultLiquidity }),
  setVaultNetSkew: (vaultNetSkew) => set({ vaultNetSkew }),
  setVaultApr: (vaultApr) => set({ vaultApr }),
}));

