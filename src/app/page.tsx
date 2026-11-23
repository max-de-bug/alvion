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

const CreditsTab = dynamic(
  () => import("@/components/trading/CreditsTab").then((m) => m.CreditsTab),
  { ssr: false }
);

const ArchitectureDocsTab = dynamic(
  () => import("@/components/trading/ArchitectureDocsTab").then((m) => m.ArchitectureDocsTab),
  { ssr: false }
);

export default function Home() {
  const {
    // State
    tradingMode,
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
    credits,

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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--t1)] flex flex-col font-sans selection:bg-[#4ECCA3] selection:text-black">
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
      <main className="flex-1 flex flex-col min-w-0">
        {/* Tab 1: Primary Trading Interface */}
        {activeTab === "trade" && (
          <div className="flex flex-col bg-[var(--bg)] text-[var(--t1)] flex-1">
            <div className="flex p-3 max-md:flex-col max-md:gap-3 flex-1">
              {/* Left Column: Ticker + Chart + (Order Book) + Positions */}
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex min-h-[660px] max-md:flex-col h-[82vh]">
                  {/* Chart Column */}
                  <div className="@container flex flex-col flex-1 min-w-0 h-full min-h-0">
                    <div className="container-in container-in-1 relative z-20 shrink-0 mb-3">
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
                    </div>

                    <TradingChart
                      currentMarketName={currentMarket.name}
                      timeframe={timeframe}
                      setTimeframe={setTimeframe}
                      className="flex-1 w-full h-full min-h-0"
                    />
                  </div>

                  {/* Pro CLOB Order Book */}
                  {tradingMode === "pro" && (
                    <>
                      <div
                        className="resize-handle w-3 max-md:hidden"
                        data-axis="x"
                        role="separator"
                        aria-orientation="vertical"
                      />
                      <OrderBookView
                        orderBook={orderBook}
                        markPrice={currentMarket.markPx}
                        onSelectPrice={setLimitPrice}
                      />
                    </>
                  )}
                </div>

                {/* Horizontal Divider */}
                <div
                  className="resize-handle h-3"
                  data-axis="y"
                  role="separator"
                  aria-orientation="horizontal"
                />

                {/* Bottom Drawer: Positions, Balances, Orders */}
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

              {/* Vertical Divider */}
              <div
                className="resize-handle self-stretch w-3 max-md:hidden"
                data-axis="x"
                role="separator"
                aria-orientation="vertical"
              />

              {/* Right Column: Order Entry Form */}
              <div className="w-[300px] shrink-0 max-md:w-full flex flex-col">
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
          </div>
        )}

        {/* Tab 2: Full CLOB Depth View */}
        {activeTab === "orderbook" && (
          <div className="p-3 max-w-7xl mx-auto w-full">
            <FullOrderBookTab
              currentMarket={currentMarket}
              orderBook={orderBook}
            />
          </div>
        )}

        {/* Tab 3: Single USDC Liquidity Vault & Percolator Backstop */}
        {activeTab === "vault" && (
          <div className="p-3 max-w-7xl mx-auto w-full">
            <VaultBackstopTab
              vaultLiquidity={vaultLiquidity}
              vaultNetSkew={vaultNetSkew}
              vaultApr={vaultApr}
              solvency={solvency}
            />
          </div>
        )}

        {/* Tab 4: Alvion Credits Rewards Program */}
        {activeTab === "credits" && (
          <div className="p-3 max-w-7xl mx-auto w-full">
            <CreditsTab
              credits={credits}
              onNavigateTrade={() => setActiveTab("trade")}
              onNavigateVault={() => setActiveTab("vault")}
            />
          </div>
        )}

        {/* Tab 5: Architecture & Robinhood Chain Docs */}
        {activeTab === "docs" && (
          <div className="p-3 max-w-7xl mx-auto w-full">
            <ArchitectureDocsTab />
          </div>
        )}
      </main>

      {/* 4. Footer */}
      <TradingFooter />
    </div>
  );
}
