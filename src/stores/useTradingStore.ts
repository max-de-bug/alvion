import { create } from "zustand";

export interface MarketMetadata {
  symbol: string;
  name: string;
  category: "EQUITY" | "CRYPTO" | "COMMODITIES";
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
  APLD: {
    symbol: "APLD",
    name: "Applied Digital Corporation",
    category: "EQUITY",
    exchangeBadge: "Robinhood Chain",
    maxLeverage: 10,
    initialMarginPct: 10,
    is24x7: true,
  },
  HOOD: {
    symbol: "HOOD",
    name: "Robinhood Markets, Inc.",
    category: "EQUITY",
    exchangeBadge: "Robinhood Chain",
    maxLeverage: 10,
    initialMarginPct: 10,
    is24x7: true,
  },
  PLTR: {
    symbol: "PLTR",
    name: "Palantir Technologies Inc.",
    category: "EQUITY",
    exchangeBadge: "Robinhood Chain",
    maxLeverage: 10,
    initialMarginPct: 10,
    is24x7: true,
  },
  AMD: {
    symbol: "AMD",
    name: "Advanced Micro Devices, Inc.",
    category: "EQUITY",
    exchangeBadge: "Robinhood Chain",
    maxLeverage: 10,
    initialMarginPct: 10,
    is24x7: true,
  },
  NFLX: {
    symbol: "NFLX",
    name: "Netflix, Inc.",
    category: "EQUITY",
    exchangeBadge: "Robinhood Chain",
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
  NATGAS: {
    symbol: "NATGAS",
    name: "Natural Gas (Henry Hub)",
    category: "COMMODITIES",
    exchangeBadge: "NYMEX",
    maxLeverage: 50,
    initialMarginPct: 2,
    is24x7: true,
  },
  CRUDE: {
    symbol: "CRUDE",
    name: "WTI Crude Oil",
    category: "COMMODITIES",
    exchangeBadge: "NYMEX",
    maxLeverage: 50,
    initialMarginPct: 2,
    is24x7: true,
  },
  GOLD: {
    symbol: "GOLD",
    name: "Gold Spot / Comex",
    category: "COMMODITIES",
    exchangeBadge: "COMEX",
    maxLeverage: 50,
    initialMarginPct: 2,
    is24x7: true,
  },
  SILVER: {
    symbol: "SILVER",
    name: "Silver Spot / Comex",
    category: "COMMODITIES",
    exchangeBadge: "COMEX",
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
export type ProOrderType = "market" | "limit" | "stop_market" | "stop_limit" | "trailing_stop" | "twap";
export type TradingMode = "consumer" | "pro";
export type MarginMode = "isolated" | "cross";
export type CollateralMode = "unified" | "isolated";
export type BottomTab = "positions" | "openOrders" | "trades";
export type ActiveTab = "trade" | "orderbook" | "vault" | "credits" | "docs";
export type Timeframe = "1s" | "1m" | "3m" | "5m" | "15m" | "30m" | "1h" | "4h" | "1D" | "1W";

interface TradingState {
  // Trading Experience Mode
  tradingMode: TradingMode;
  setTradingMode: (mode: TradingMode) => void;

  // Margin & Account Modes (Pro)
  marginMode: MarginMode;
  setMarginMode: (mode: MarginMode) => void;
  collateralMode: CollateralMode;
  setCollateralMode: (mode: CollateralMode) => void;
  proOrderType: ProOrderType;
  setProOrderType: (t: ProOrderType) => void;
  sizeMode: "USDC" | "ASSET";
  setSizeMode: (mode: "USDC" | "ASSET") => void;

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

  // Platform Credits Program
  credits: number;
  setCredits: (credits: number) => void;

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

const getSavedTradingMode = (): TradingMode => {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("alvion_trading_mode");
      if (saved === "consumer" || saved === "pro") return saved;
    } catch {
      // ignore
    }
  }
  return "pro";
};

export const useTradingStore = create<TradingState>((set) => ({
  // Trading Experience Mode
  tradingMode: getSavedTradingMode(),
  setTradingMode: (tradingMode) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("alvion_trading_mode", tradingMode);
      } catch {
        // ignore
      }
    }
    set({ tradingMode });
  },

  // Margin & Account Modes
  marginMode: "isolated",
  setMarginMode: (marginMode) => set({ marginMode }),
  collateralMode: "unified",
  setCollateralMode: (collateralMode) => set({ collateralMode }),
  proOrderType: "market",
  setProOrderType: (proOrderType) => set({
    proOrderType,
    orderType: proOrderType === "limit" ? "limit" : "market",
  }),
  sizeMode: "USDC",
  setSizeMode: (sizeMode) => set({ sizeMode }),

  // Initial values
  selectedMarketName: "BTC",
  isLong: true,
  marginUsdc: 250,
  leverage: 5,
  orderType: "market",
  limitPrice: "",
  walletBalance: 10000,
  positions: [],

  bottomTab: "positions",
  activeTab: "trade",
  timeframe: "15m",
  notification: null,

  vaultLiquidity: 5_250_000,
  vaultNetSkew: 420_000,
  vaultApr: 24.8,

  credits: 250,

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

  setCredits: (credits) => set({ credits }),
}));

