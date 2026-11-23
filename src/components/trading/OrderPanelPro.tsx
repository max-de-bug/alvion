"use client";

import React, { useState, useId } from "react";
import {
  ChevronDown,
  Check,
  Info,
  Sliders,
  Maximize2,
} from "lucide-react";
import { MarketContext, QuoteResult } from "@/lib/hyperliquid";
import {
  useTradingStore,
  type ProOrderType,
  type MarginMode,
  type CollateralMode,
} from "@/stores/useTradingStore";

interface OrderPanelProProps {
  currentMarket: MarketContext;
  isLong: boolean;
  setIsLong: (b: boolean) => void;
  orderType: "market" | "limit";
  setOrderType: (t: "market" | "limit") => void;
  limitPrice: string;
  setLimitPrice: (p: string) => void;
  leverage: number;
  setLeverage: (l: number) => void;
  marginUsdc: number;
  setMarginUsdc: (m: number) => void;
  walletBalance: number;
  quote: QuoteResult | null;
  loadingQuote: boolean;
  availableLongLiq: number;
  availableShortLiq: number;
  longFundingRate: number;
  shortFundingRate: number;
  formatUsdCompact: (val: number) => string;
  onExecuteTrade: () => void;
}

const LEVERAGE_PRESETS = [2, 5, 10, 20, 25, 50, 100];
const SLIPPAGE_PRESETS = [0.1, 0.5, 1, 3];

export const OrderPanelPro = React.memo<OrderPanelProProps>(function OrderPanelPro({
  currentMarket,
  isLong,
  setIsLong,
  orderType,
  setOrderType,
  limitPrice,
  setLimitPrice,
  leverage,
  setLeverage,
  marginUsdc,
  setMarginUsdc,
  walletBalance,
  quote,
  loadingQuote,
  availableLongLiq,
  availableShortLiq,
  longFundingRate,
  shortFundingRate,
  formatUsdCompact,
  onExecuteTrade,
}) {
  const marginInputId = useId();
  const limitPriceInputId = useId();

  const {
    marginMode,
    setMarginMode,
    collateralMode,
    setCollateralMode,
    proOrderType,
    setProOrderType,
    sizeMode,
    setSizeMode,
    positions,
  } = useTradingStore();

  // Modal / Dropdown state
  const [showMarginModal, setShowMarginModal] = useState(false);
  const [showLeverageModal, setShowLeverageModal] = useState(false);
  const [showCollateralModal, setShowCollateralModal] = useState(false);
  const [showProMenu, setShowProMenu] = useState(false);
  const [showSizeUnitMenu, setShowSizeUnitMenu] = useState(false);
  const [showSlippageMenu, setShowSlippageMenu] = useState(false);
  const [selectedSlippage, setSelectedSlippage] = useState<number>(1.0);

  // Pro Order Parameters
  const [triggerPrice, setTriggerPrice] = useState("");
  const [reduceOnly, setReduceOnly] = useState(false);
  const [tpEnabled, setTpEnabled] = useState(false);
  const [tpPrice, setTpPrice] = useState("");
  const [tpGain, setTpGain] = useState("");
  const [slPrice, setSlPrice] = useState("");
  const [slLoss, setSlLoss] = useState("");

  // Base token symbol (e.g. BTC, ETH, SOL)
  const baseSymbol = currentMarket.name.replace("-PERP", "");

  // Position calculation for current market
  const currentPos = positions.find((p) => p.market === currentMarket.name);
  const currentPosSize = currentPos
    ? (currentPos.sizeUsdc / currentMarket.markPx).toFixed(currentMarket.szDecimals || 5)
    : "0.00000";

  // Calculate percentage of wallet balance (0 - 100)
  const currentPercent =
    walletBalance > 0
      ? Math.min(100, Math.max(0, Math.round((marginUsdc / walletBalance) * 100)))
      : 0;

  // Handle slider change from 0% to 100%
  const handleSliderChange = (pct: number) => {
    if (walletBalance <= 0) return;
    const computedMargin = Math.max(0, Math.round((pct / 100) * walletBalance));
    setMarginUsdc(computedMargin);
  };

  // Convert size depending on unit mode (USDC vs Asset like BTC)
  const displaySizeValue =
    sizeMode === "USDC"
      ? marginUsdc * leverage
      : currentMarket.markPx > 0
      ? Number(((marginUsdc * leverage) / currentMarket.markPx).toFixed(5))
      : 0;

  const handleSizeInputChange = (val: string) => {
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) {
      setMarginUsdc(0);
      return;
    }
    if (sizeMode === "USDC") {
      setMarginUsdc(Math.max(1, Math.round(num / leverage)));
    } else {
      const usdVal = num * currentMarket.markPx;
      setMarginUsdc(Math.max(1, Math.round(usdVal / leverage)));
    }
  };

  // Order value and fees
  const calculatedOrderValue = marginUsdc * leverage;
  const estimatedFee = calculatedOrderValue * 0.00045; // 0.045% taker fee
  const estLiqPrice =
    currentMarket.markPx > 0 && leverage > 0
      ? isLong
        ? currentMarket.markPx * (1 - 0.9 / leverage)
        : currentMarket.markPx * (1 + 0.9 / leverage)
      : null;

  // Active label for Pro tab
  const getProLabel = () => {
    switch (proOrderType) {
      case "stop_market":
        return "Stop Market";
      case "stop_limit":
        return "Stop Limit";
      case "twap":
        return "TWAP";
      case "trailing_stop":
        return "Trailing";
      default:
        return "Pro";
    }
  };

  const isProTypeSelected = proOrderType !== "market" && proOrderType !== "limit";

  return (
    <div className="flex flex-col shrink-0 rounded-2xl border border-[#1e272c] bg-[#10171a] overflow-hidden max-md:w-full select-none text-white shadow-xl">
      <div className="p-3.5 flex flex-col gap-3.5">
        {/* 1. TOP PILL BAR: [ Isolated ] [ 5x ] [ Unified ] */}
        <div className="grid grid-cols-3 gap-2 relative">
          {/* Isolated / Cross Button */}
          <button
            type="button"
            onClick={() => {
              setShowMarginModal((prev) => !prev);
              setShowLeverageModal(false);
              setShowCollateralModal(false);
              setShowProMenu(false);
            }}
            className="h-[40px] rounded-[10px] bg-[#1a2327] hover:bg-[#212c32] border border-[#232e34] text-[13.5px] font-medium text-[#e2e8ea] flex items-center justify-center transition-colors cursor-pointer"
          >
            <span>{marginMode === "isolated" ? "Isolated" : "Cross"}</span>
          </button>

          {/* Leverage Button */}
          <button
            type="button"
            onClick={() => {
              setShowLeverageModal((prev) => !prev);
              setShowMarginModal(false);
              setShowCollateralModal(false);
              setShowProMenu(false);
            }}
            className="h-[40px] rounded-[10px] bg-[#1a2327] hover:bg-[#212c32] border border-[#232e34] text-[13.5px] font-medium text-[#e2e8ea] flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="font-mono">{leverage}x</span>
          </button>

          {/* Collateral / Unified Button */}
          <button
            type="button"
            onClick={() => {
              setShowCollateralModal((prev) => !prev);
              setShowMarginModal(false);
              setShowLeverageModal(false);
              setShowProMenu(false);
            }}
            className="h-[40px] rounded-[10px] bg-[#1a2327] hover:bg-[#212c32] border border-[#232e34] text-[13.5px] font-medium text-[#e2e8ea] flex items-center justify-center transition-colors cursor-pointer"
          >
            <span>{collateralMode === "unified" ? "Unified" : "Single"}</span>
          </button>

          {/* MODAL 1: Margin Mode Popover */}
          {showMarginModal && (
            <div className="absolute top-[44px] left-0 right-0 z-50 bg-[#161d21] border border-[var(--border-strong)] rounded-xl p-3 shadow-2xl flex flex-col gap-2 backdrop-blur-md">
              <div className="text-xs font-semibold text-[var(--t1)]">Margin Mode</div>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setMarginMode("isolated");
                    setShowMarginModal(false);
                  }}
                  className={`p-2 rounded-lg text-left text-xs transition-colors cursor-pointer flex items-center justify-between ${
                    marginMode === "isolated"
                      ? "bg-[#1c272c] border border-[var(--fixed-green)]/40 text-white"
                      : "hover:bg-[var(--hover)] text-[var(--t2)]"
                  }`}
                >
                  <div>
                    <div className="font-semibold text-white">Isolated Margin</div>
                    <div className="text-[10px] text-[var(--t3)]">Risk is restricted to individual position</div>
                  </div>
                  {marginMode === "isolated" && <Check className="w-3.5 h-3.5 text-[var(--fixed-green)]" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMarginMode("cross");
                    setShowMarginModal(false);
                  }}
                  className={`p-2 rounded-lg text-left text-xs transition-colors cursor-pointer flex items-center justify-between ${
                    marginMode === "cross"
                      ? "bg-[#1c272c] border border-[var(--fixed-green)]/40 text-white"
                      : "hover:bg-[var(--hover)] text-[var(--t2)]"
                  }`}
                >
                  <div>
                    <div className="font-semibold text-white">Cross Margin</div>
                    <div className="text-[10px] text-[var(--t3)]">Margin shared across all open positions</div>
                  </div>
                  {marginMode === "cross" && <Check className="w-3.5 h-3.5 text-[var(--fixed-green)]" />}
                </button>
              </div>
            </div>
          )}

          {/* MODAL 2: Leverage Slider & Presets Popover */}
          {showLeverageModal && (
            <div className="absolute top-[44px] left-0 right-0 z-50 bg-[#161d21] border border-[var(--border-strong)] rounded-xl p-3 shadow-2xl flex flex-col gap-3 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--t1)]">Adjust Leverage</span>
                <span className="font-mono text-sm font-bold text-[var(--fixed-green)]">{leverage}x</span>
              </div>
              <input
                type="range"
                min="1"
                max={currentMarket.maxLeverage || 50}
                value={leverage}
                onChange={(e) => setLeverage(Number(e.target.value))}
                className="w-full accent-[var(--fixed-green)] cursor-pointer"
              />
              <div className="grid grid-cols-4 gap-1.5">
                {LEVERAGE_PRESETS.filter((p) => p <= (currentMarket.maxLeverage || 50)).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setLeverage(preset);
                      setShowLeverageModal(false);
                    }}
                    className={`py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                      leverage === preset
                        ? "bg-[var(--fixed-green)] text-slate-950 font-bold"
                        : "bg-[var(--surface-3)] text-[var(--t2)] hover:text-white"
                    }`}
                  >
                    {preset}x
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MODAL 3: Collateral Mode Popover */}
          {showCollateralModal && (
            <div className="absolute top-[44px] left-0 right-0 z-50 bg-[#161d21] border border-[var(--border-strong)] rounded-xl p-3 shadow-2xl flex flex-col gap-2 backdrop-blur-md">
              <div className="text-xs font-semibold text-[var(--t1)]">Collateral Account</div>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setCollateralMode("unified");
                    setShowCollateralModal(false);
                  }}
                  className={`p-2 rounded-lg text-left text-xs transition-colors cursor-pointer flex items-center justify-between ${
                    collateralMode === "unified"
                      ? "bg-[#1c272c] border border-[var(--fixed-green)]/40 text-white"
                      : "hover:bg-[var(--hover)] text-[var(--t2)]"
                  }`}
                >
                  <div>
                    <div className="font-semibold text-white">Unified Multi-Asset</div>
                    <div className="text-[10px] text-[var(--t3)]">Borrow against BTC, ETH, and USDCx</div>
                  </div>
                  {collateralMode === "unified" && <Check className="w-3.5 h-3.5 text-[var(--fixed-green)]" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCollateralMode("isolated");
                    setShowCollateralModal(false);
                  }}
                  className={`p-2 rounded-lg text-left text-xs transition-colors cursor-pointer flex items-center justify-between ${
                    collateralMode === "isolated"
                      ? "bg-[#1c272c] border border-[var(--fixed-green)]/40 text-white"
                      : "hover:bg-[var(--hover)] text-[var(--t2)]"
                  }`}
                >
                  <div>
                    <div className="font-semibold text-white">Single-Asset USDCx</div>
                    <div className="text-[10px] text-[var(--t3)]">Standard isolated stablecoin margin</div>
                  </div>
                  {collateralMode === "isolated" && <Check className="w-3.5 h-3.5 text-[var(--fixed-green)]" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 2. ORDER TYPE TABS: Market | Limit | Pro ∨ */}
        <div className="relative flex items-center border-b border-[#1d272c] text-[13.5px]">
          {/* Market Tab */}
          <button
            type="button"
            onClick={() => {
              setOrderType("market");
              setProOrderType("market");
              setShowProMenu(false);
            }}
            className={`relative pb-2.5 font-medium transition-colors mr-7 cursor-pointer ${
              orderType === "market" && !isProTypeSelected
                ? "text-white font-semibold"
                : "text-[#7a8990] hover:text-white"
            }`}
          >
            Market
            {orderType === "market" && !isProTypeSelected && (
              <span className="absolute -bottom-[1px] left-0 right-0 h-[2.5px] bg-[#5ec2a8] rounded-none" />
            )}
          </button>

          {/* Limit Tab */}
          <button
            type="button"
            onClick={() => {
              setOrderType("limit");
              setProOrderType("limit");
              setShowProMenu(false);
            }}
            className={`relative pb-2.5 font-medium transition-colors mr-7 cursor-pointer ${
              orderType === "limit" && !isProTypeSelected
                ? "text-white font-semibold"
                : "text-[#7a8990] hover:text-white"
            }`}
          >
            Limit
            {orderType === "limit" && !isProTypeSelected && (
              <span className="absolute -bottom-[1px] left-0 right-0 h-[2.5px] bg-[#5ec2a8] rounded-none" />
            )}
          </button>

          {/* Pro ∨ Tab */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProMenu((prev) => !prev)}
              className={`relative pb-2.5 font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                isProTypeSelected
                  ? "text-white font-semibold"
                  : "text-[#7a8990] hover:text-white"
              }`}
            >
              <span>{getProLabel()}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#7a8990]" />
              {isProTypeSelected && (
                <span className="absolute -bottom-[1px] left-0 right-0 h-[2.5px] bg-[#5ec2a8] rounded-none" />
              )}
            </button>

            {/* Pro Menu Dropdown */}
            {showProMenu && (
              <div className="absolute top-[32px] left-0 z-50 bg-[#161d21] border border-[var(--border-strong)] rounded-xl py-1 w-36 shadow-2xl flex flex-col backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => {
                    setProOrderType("stop_market");
                    setOrderType("market");
                    setShowProMenu(false);
                  }}
                  className="px-3 py-1.5 text-left text-xs text-[var(--t2)] hover:text-white hover:bg-[var(--hover)] transition-colors cursor-pointer"
                >
                  Stop Market
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProOrderType("stop_limit");
                    setOrderType("limit");
                    setShowProMenu(false);
                  }}
                  className="px-3 py-1.5 text-left text-xs text-[var(--t2)] hover:text-white hover:bg-[var(--hover)] transition-colors cursor-pointer"
                >
                  Stop Limit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProOrderType("twap");
                    setShowProMenu(false);
                  }}
                  className="px-3 py-1.5 text-left text-xs text-[var(--t2)] hover:text-white hover:bg-[var(--hover)] transition-colors cursor-pointer"
                >
                  TWAP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProOrderType("trailing_stop");
                    setShowProMenu(false);
                  }}
                  className="px-3 py-1.5 text-left text-xs text-[var(--t2)] hover:text-white hover:bg-[var(--hover)] transition-colors cursor-pointer"
                >
                  Trailing Stop
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3. LONG / SHORT TOGGLE: [ Buy / Long | Sell / Short ] */}
        <div className="relative grid grid-cols-2 p-[3px] rounded-[11px] bg-[#141b1f] border border-[#1d262b]">
          <button
            type="button"
            onClick={() => setIsLong(true)}
            className={`h-[36px] rounded-[8px] text-[13.5px] font-semibold transition-all cursor-pointer flex items-center justify-center ${
              isLong
                ? "bg-[#5ec2a8] text-[#0b1a16] shadow-sm font-bold"
                : "text-[#d6dee2] hover:text-white"
            }`}
          >
            Buy / Long
          </button>
          <button
            type="button"
            onClick={() => setIsLong(false)}
            className={`h-[36px] rounded-[8px] text-[13.5px] font-semibold transition-all cursor-pointer flex items-center justify-center ${
              !isLong
                ? "bg-[#eb4d5c] text-white shadow-sm font-bold"
                : "text-[#d6dee2] hover:text-white"
            }`}
          >
            Sell / Short
          </button>
        </div>

        {/* 4. AVAILABLE & CURRENT POSITION INFO */}
        <div className="flex flex-col gap-2 pt-0.5 text-[13px]">
          {/* Row 1: Available to Trade */}
          <div className="flex items-center justify-between">
            <span className="text-[#728087] font-normal">Available to Trade</span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center min-w-[54px] h-[20px] px-2 rounded-none bg-[#2c373b] font-mono text-[11px] font-semibold text-white/90">
                {walletBalance > 0
                  ? walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : ""}
              </span>
              <span className="font-semibold text-white text-[13px]">USDC</span>
            </div>
          </div>

          {/* Row 2: Current Position */}
          <div className="flex items-center justify-between">
            <span className="text-[#728087] font-normal">Current Position</span>
            <span className="font-mono text-white text-[13px] font-medium">
              {currentPosSize} {baseSymbol}
            </span>
          </div>
        </div>

        {/* 5. SIZE INPUT WITH DROPDOWN: [ Size ... USDC ∨ ] */}
        <div className="relative">
          <div className="flex items-center justify-between px-3.5 h-[46px] rounded-[10px] bg-[#141b1f] border border-[#202a2f] focus-within:border-[#5ec2a8]/60 transition-colors">
            <input
              id={marginInputId}
              type="text"
              inputMode="decimal"
              placeholder="Size"
              value={displaySizeValue > 0 ? displaySizeValue.toString() : ""}
              onChange={(e) => handleSizeInputChange(e.target.value)}
              className="bg-transparent font-mono text-[14px] text-white placeholder:text-[#6f7e85] outline-none flex-1 min-w-0"
            />
            <button
              type="button"
              onClick={() => setShowSizeUnitMenu((prev) => !prev)}
              className="flex items-center gap-1 px-1.5 py-1 rounded text-[13px] font-medium text-white hover:bg-white/5 transition-colors ml-2 shrink-0 cursor-pointer"
            >
              <span>{sizeMode === "USDC" ? "USDC" : baseSymbol}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#8b99a1]" />
            </button>
          </div>

          {/* Size unit dropdown */}
          {showSizeUnitMenu && (
            <div className="absolute right-0 top-[48px] z-50 bg-[#161d21] border border-[var(--border-strong)] rounded-xl py-1 w-28 shadow-2xl flex flex-col backdrop-blur-md">
              <button
                type="button"
                onClick={() => {
                  setSizeMode("USDC");
                  setShowSizeUnitMenu(false);
                }}
                className={`px-3 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                  sizeMode === "USDC" ? "text-[var(--fixed-green)] font-bold" : "text-[var(--t2)] hover:text-white"
                }`}
              >
                USDC
              </button>
              <button
                type="button"
                onClick={() => {
                  setSizeMode("ASSET");
                  setShowSizeUnitMenu(false);
                }}
                className={`px-3 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                  sizeMode === "ASSET" ? "text-[var(--fixed-green)] font-bold" : "text-[var(--t2)] hover:text-white"
                }`}
              >
                {baseSymbol}
              </button>
            </div>
          )}
        </div>

        {/* 6. SLIDER WITH 5 SNAP DOTS & STANDALONE PERCENTAGE BOX */}
        <div className="flex items-center gap-3 pt-0.5">
          {/* Snap Slider Track */}
          <div
            className="relative flex-1 h-[24px] flex items-center cursor-pointer select-none group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const pct = Math.round(Math.min(100, Math.max(0, (clickX / rect.width) * 100)));
              // Snap to nearest 25% if close
              const snaps = [0, 25, 50, 75, 100];
              const nearest = snaps.reduce((prev, curr) =>
                Math.abs(curr - pct) < Math.abs(prev - pct) ? curr : prev
              );
              const finalPct = Math.abs(nearest - pct) < 6 ? nearest : pct;
              handleSliderChange(finalPct);
            }}
          >
            {/* Background track line */}
            <div className="absolute inset-x-0 h-[2px] rounded-none bg-[#20292e]" />

            {/* Filled line up to current percentage */}
            <div
              className="absolute left-0 h-[2px] rounded-none bg-[#5ec2a8] transition-all duration-150"
              style={{ width: `${currentPercent}%` }}
            />

            {/* 5 snap dots: 0%, 25%, 50%, 75%, 100% */}
            {[0, 25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSliderChange(pct);
                }}
                className="absolute size-[5px] -translate-x-1/2 rounded-none transition-all hover:scale-125 z-10 cursor-pointer"
                style={{
                  left: `${pct}%`,
                  backgroundColor: pct <= currentPercent ? "#5ec2a8" : "#38464d",
                }}
                title={`${pct}%`}
              />
            ))}

            {/* Hollow Teal Ring Thumb */}
            <div
              className="absolute size-[18px] -translate-x-1/2 rounded-none border-[2.5px] border-[#5ec2a8] bg-[#10171a] shadow-sm transition-all duration-150 pointer-events-none z-20"
              style={{ left: `${currentPercent}%` }}
            />
          </div>

          {/* Standalone percentage box: [ 0 % ] */}
          <div className="w-[56px] h-[36px] rounded-[8px] bg-[#161e22] border border-[#202b31] flex items-center justify-center font-mono text-[13.5px] font-semibold text-white shrink-0">
            {currentPercent} %
          </div>
        </div>

        {/* 7. CONDITIONAL LIMIT / TRIGGER PRICE INPUTS */}
        {(orderType === "limit" || proOrderType === "stop_limit") && (
          <div className="flex flex-col gap-1 pt-1">
            <span className="text-[10px] tracking-[.06em] font-semibold text-[var(--t3)]">Limit Price</span>
            <div className="flex items-center gap-1.5 px-3 h-[44px] rounded-[10px] bg-[#141b1f] border border-[#202a2f] font-mono text-[13px] focus-within:border-[#5ec2a8]/60 transition-colors">
              <input
                id={limitPriceInputId}
                placeholder={currentMarket.markPx ? currentMarket.markPx.toFixed(1) : "0"}
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                className="flex-1 bg-transparent outline-none text-white placeholder:text-[var(--t4)]"
                inputMode="decimal"
              />
              <span className="text-[11px] text-[var(--t3)] shrink-0">USDCx</span>
              <button
                type="button"
                onClick={() => setLimitPrice(currentMarket.markPx.toFixed(1))}
                className="px-2 py-0.5 rounded-none bg-[var(--surface)] text-[10px] font-bold text-[var(--t2)] hover:text-white transition-colors cursor-pointer"
              >
                MID
              </button>
            </div>
          </div>
        )}

        {isProTypeSelected && (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] tracking-[.06em] font-semibold text-[var(--t3)]">Trigger Price</span>
            <div className="flex items-center gap-1.5 px-3 h-[40px] rounded-[10px] bg-[var(--surface-3)] border border-[var(--border)] font-mono text-[13px] focus-within:border-[#4ECCA3]/60 transition-colors">
              <input
                placeholder={currentMarket.markPx ? currentMarket.markPx.toFixed(1) : "0"}
                value={triggerPrice}
                onChange={(e) => setTriggerPrice(e.target.value)}
                className="flex-1 bg-transparent outline-none text-white placeholder:text-[var(--t4)]"
                inputMode="decimal"
              />
              <button
                type="button"
                onClick={() => setTriggerPrice(currentMarket.markPx.toFixed(1))}
                className="px-2 py-0.5 rounded-none bg-[var(--surface)] text-[10px] font-bold text-[var(--t2)] hover:text-white transition-colors cursor-pointer"
              >
                MARK
              </button>
            </div>
          </div>
        )}

        {/* 8. REDUCE ONLY SWITCH */}
        <button
          type="button"
          onClick={() => setReduceOnly((prev) => !prev)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--surface-3)] hover:bg-[var(--hover)] transition-all cursor-pointer"
        >
          <span className="flex items-center gap-1.5 text-[12px] text-white">
            <span>Reduce only</span>
            <Info className="w-3.5 h-3.5 text-[var(--t3)]" />
          </span>
          <span
            className={`relative w-[34px] h-[20px] rounded-none transition-colors ${
              reduceOnly ? "bg-[var(--fixed-green)]" : "bg-[var(--border-strong)]"
            }`}
          >
            <span
              className={`absolute top-[2px] size-[16px] rounded-none bg-white transition-transform ${
                reduceOnly ? "left-[16px]" : "left-[2px]"
              }`}
            />
          </span>
        </button>

        {/* 9. TAKE PROFIT / STOP LOSS TOGGLE */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setTpEnabled((prev) => !prev)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--surface-3)] hover:bg-[var(--hover)] transition-all cursor-pointer"
          >
            <span className="flex items-center gap-1.5 text-[12px] text-white">
              <span>Take Profit / Stop Loss</span>
              <Info className="w-3.5 h-3.5 text-[var(--t3)]" />
            </span>
            <span
              className={`relative w-[34px] h-[20px] rounded-none transition-colors ${
                tpEnabled ? "bg-[var(--fixed-green)]" : "bg-[var(--border-strong)]"
              }`}
            >
              <span
                className={`absolute top-[2px] size-[16px] rounded-none bg-white transition-transform ${
                  tpEnabled ? "left-[16px]" : "left-[2px]"
                }`}
              />
            </span>
          </button>

          {tpEnabled && (
            <div className="p-2.5 rounded-xl bg-[var(--surface-3)]/60 border border-[var(--border)] flex flex-col gap-2 text-xs">
              <span className="text-[10px] text-[var(--t3)]">Triggers on mark price, executed automatically</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[9.5px] font-semibold text-[var(--green)]">TP Price</span>
                  <input
                    placeholder="62,000"
                    value={tpPrice}
                    onChange={(e) => setTpPrice(e.target.value)}
                    className="h-8 px-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] font-mono text-xs text-white outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9.5px] font-semibold text-[var(--t3)]">Gain %</span>
                  <input
                    placeholder="10%"
                    value={tpGain}
                    onChange={(e) => setTpGain(e.target.value)}
                    className="h-8 px-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] font-mono text-xs text-white outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[9.5px] font-semibold text-[var(--red)]">SL Price</span>
                  <input
                    placeholder="58,500"
                    value={slPrice}
                    onChange={(e) => setSlPrice(e.target.value)}
                    className="h-8 px-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] font-mono text-xs text-white outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9.5px] font-semibold text-[var(--t3)]">Loss %</span>
                  <input
                    placeholder="5%"
                    value={slLoss}
                    onChange={(e) => setSlLoss(e.target.value)}
                    className="h-8 px-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] font-mono text-xs text-white outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 10. PRIMARY CTA BUTTON: Buy / Long or Sell / Short */}
        <button
          type="button"
          onClick={onExecuteTrade}
          className={`w-full flex items-center justify-center gap-1.5 py-3 rounded-none text-[13.5px] font-bold uppercase tracking-[0.05em] cursor-pointer transition-all shadow-lg active:scale-[0.98] ${
            isLong
              ? "bg-[#5ec2a8] hover:bg-[#52ad96] text-[#0b1a16] shadow-[#5ec2a8]/20"
              : "bg-[#eb4d5c] hover:bg-[#d43f4d] text-white shadow-[#eb4d5c]/20"
          }`}
        >
          {loadingQuote ? (
            <span>Calculating...</span>
          ) : (
            <span>
              {isLong ? "Buy / Long" : "Sell / Short"} {baseSymbol}
            </span>
          )}
        </button>

        {/* 11. EXECUTION SUMMARY CARD */}
        <div className="flex flex-col gap-1.5 px-3 py-2.5 rounded-[12px] bg-[var(--surface-3)] border border-[var(--border)] text-[11.5px]">
          <div className="flex items-center justify-between">
            <span className="text-[var(--t3)]">Liq. price</span>
            <span className="font-mono tabular-nums font-semibold text-[var(--t1)]">
              {estLiqPrice ? `$${estLiqPrice.toFixed(1)}` : "—"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[var(--t3)]">Order Value</span>
            <span className="font-mono tabular-nums font-semibold text-[var(--t1)]">
              ${calculatedOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[var(--t3)]">Margin</span>
            <span className="font-mono tabular-nums font-semibold text-[var(--t1)]">
              ${marginUsdc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[var(--t3)]">Fee (est.)</span>
            <span className="font-mono tabular-nums font-semibold text-[var(--t1)]">
              ${estimatedFee.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[var(--t3)]">Fees (taker / maker)</span>
            <span className="font-mono tabular-nums font-semibold text-[var(--t1)]">
              0.045% / 0.015%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[var(--t3)]">Maint. margin</span>
            <span className="font-mono tabular-nums font-semibold text-[var(--t1)]">2.5%</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[var(--t3)]">Max position</span>
            <span className="font-mono tabular-nums font-semibold text-[var(--t1)]">$100,000</span>
          </div>

          <div className="flex items-center justify-between pt-0.5 border-t border-[var(--border)]">
            <span className="text-[var(--t3)]">Slippage</span>
            <div className="flex items-center gap-1">
              <span className="font-mono text-[var(--t3)]">Est. — /</span>
              <button
                type="button"
                onClick={() => setShowSlippageMenu((prev) => !prev)}
                className="font-mono font-semibold text-[var(--t1)] underline decoration-dotted underline-offset-2 hover:bg-[var(--hover)] px-1 rounded cursor-pointer"
              >
                Max {selectedSlippage}%
              </button>
            </div>
          </div>

          {showSlippageMenu && (
            <div className="grid grid-cols-4 gap-1 pt-1">
              {SLIPPAGE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setSelectedSlippage(preset);
                    setShowSlippageMenu(false);
                  }}
                  className={`py-1 rounded-none border text-[10.5px] font-mono font-semibold transition-colors cursor-pointer ${
                    selectedSlippage === preset
                      ? "bg-[var(--surface)] border-[var(--fixed-green)] text-white"
                      : "bg-[var(--surface)] border-[var(--border)] text-[var(--t2)] hover:text-white"
                  }`}
                >
                  {preset}%
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
