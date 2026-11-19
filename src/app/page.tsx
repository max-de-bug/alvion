"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useTradingDashboard } from "@/hooks/useTradingDashboard";
import {
  TradingHeader,
  NotificationToast,
  MarketTickerBar,
  RiskFirewallBar,
  TradingChart,
  OrderBookView,
  PositionsPanel,
  OrderPanel,
  TradingFooter,
} from "@/components/trading";

// Vercel Best Practice: bundle-dynamic-imports
// Lazy-load secondary tabs so initial JS payload is minimal and critical path renders instantly
const FullOrderBookTab = dynamic(
  () => import("@/components/trading/FullOrderBookTab").then((m) => m.FullOrderBookTab),
  { ssr: false }
);

const VaultBackstopTab = dynamic(
  () => import("@/components/trading/VaultBackstopTab").then((m) => m.VaultBackstopTab),
  { ssr: false }
);

const ArchitectureDocsTab = dynamic(
  () => import("@/components/trading/ArchitectureDocsTab").then((m) => m.ArchitectureDocsTab),
  { ssr: false }
);

export default function Home() {
  const {
    // State
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

    // Market & Engine Data
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

    // Wallet
    address,
    isConnected,
    chainId,
    connectWallet,
    disconnect,

    // Metrics
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
  } = useTradingDashboard();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* 1. Header & Navigation */}
      <TradingHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        walletBalance={walletBalance}
        faucetWallet={faucetWallet}
        isConnected={isConnected}
        address={address}
        chainId={chainId}
        connectWallet={connectWallet}
        disconnect={disconnect}
      />

      {/* 2. Notification Toast */}
      <NotificationToast notification={notification} />

      {/* 3. Main Dashboard Body */}
      <main className="max-w-7xl mx-auto w-full p-4 flex-1 flex flex-col gap-4">
        {/* Ticker Bar: Market Info, Oracle & TitanX Institutional Metrics */}
        <MarketTickerBar
          selectedMarketName={selectedMarketName}
          setSelectedMarketName={setSelectedMarketName}
          currentMarket={currentMarket}
          marketMeta={marketMeta}
          isEquity={isEquity}
          longOi={longOi}
          shortOi={shortOi}
          longOiRatio={longOiRatio}
          shortOiRatio={shortOiRatio}
          longFundingRate={longFundingRate}
          shortFundingRate={shortFundingRate}
          minutesToFunding={minutesToFunding}
          availableLongLiq={availableLongLiq}
          availableShortLiq={availableShortLiq}
          formatUsdCompact={formatUsdCompact}
        />

        {/* Percolator Architecture & Risk Firewall Bar */}
        <RiskFirewallBar
          domainInfo={domainInfo}
          vaultLiquidity={vaultLiquidity}
          vaultNetSkew={vaultNetSkew}
          solvency={solvency}
        />

        {/* Tab 1: Trading Terminal */}
        {activeTab === "trade" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left 8 cols: Chart + Order Book + Positions & Orders */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <TradingChart
                  currentMarketName={currentMarket.name}
                  timeframe={timeframe}
                  setTimeframe={setTimeframe}
                />
                <OrderBookView
                  orderBook={orderBook}
                  markPrice={currentMarket.markPx}
                  onSelectPrice={setLimitPrice}
                />
              </div>

              <PositionsPanel
                bottomTab={bottomTab}
                setBottomTab={setBottomTab}
                positions={positions}
                openOrders={openOrders}
                recentTrades={recentTrades}
                markets={markets}
                currentMarket={currentMarket}
                onClosePosition={handleClosePosition}
                onCancelOrder={handleCancelOrder}
              />
            </div>

            {/* Right 4 cols: Order Execution & Leverage Panel */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <OrderPanel
                orderType={orderType}
                setOrderType={setOrderType}
                isLong={isLong}
                setIsLong={setIsLong}
                limitPrice={limitPrice}
                setLimitPrice={setLimitPrice}
                currentMarket={currentMarket}
                leverage={leverage}
                setLeverage={setLeverage}
                marginUsdc={marginUsdc}
                setMarginUsdc={setMarginUsdc}
                walletBalance={walletBalance}
                quote={quote}
                loadingQuote={loadingQuote}
                availableLongLiq={availableLongLiq}
                availableShortLiq={availableShortLiq}
                longFundingRate={longFundingRate}
                shortFundingRate={shortFundingRate}
                formatUsdCompact={formatUsdCompact}
                onExecuteTrade={handleExecuteTrade}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Full CLOB Depth View */}
        {activeTab === "orderbook" && (
          <FullOrderBookTab
            currentMarket={currentMarket}
            orderBook={orderBook}
          />
        )}

        {/* Tab 3: Single USDC Liquidity Vault & Percolator Backstop */}
        {activeTab === "vault" && (
          <VaultBackstopTab
            vaultLiquidity={vaultLiquidity}
            vaultNetSkew={vaultNetSkew}
            vaultApr={vaultApr}
            solvency={solvency}
          />
        )}

        {/* Tab 4: Architecture & Avalanche Docs */}
        {activeTab === "docs" && <ArchitectureDocsTab />}
      </main>

      {/* 4. Footer */}
      <TradingFooter />
    </div>
  );
}
