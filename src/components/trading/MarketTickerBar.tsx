"use client";

import React from "react";
import { MarketContext } from "@/lib/hyperliquid";
import { MarketMetadata } from "@/stores/useTradingStore";

interface MarketTickerBarProps {
  selectedMarketName: string;
  setSelectedMarketName: (name: string) => void;
  currentMarket: MarketContext;
  marketMeta: MarketMetadata;
  isEquity: boolean;
  longOi: number;
  shortOi: number;
  longOiRatio: number;
  shortOiRatio: number;
  longFundingRate: number;
  shortFundingRate: number;
  minutesToFunding: number;
  availableLongLiq: number;
  availableShortLiq: number;
  formatUsdCompact: (val: number) => string;
}

export const MarketTickerBar = React.memo<MarketTickerBarProps>(function MarketTickerBar({
  selectedMarketName,
  setSelectedMarketName,
  currentMarket,
  marketMeta,
  isEquity,
  longOi,
  shortOi,
  longOiRatio,
  shortOiRatio,
  longFundingRate,
  shortFundingRate,
  minutesToFunding,
  availableLongLiq,
  availableShortLiq,
  formatUsdCompact,
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <select
            value={selectedMarketName}
            onChange={(e) => setSelectedMarketName(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white font-semibold text-sm px-2.5 py-1.5 rounded-md focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <optgroup label="Tokenized Equities">
              <option value="SPY">SPY · S&P 500 ETF (20x)</option>
              <option value="QQQ">QQQ · Nasdaq-100 ETF (20x)</option>
              <option value="NVDA">NVDA · NVIDIA Corp (10x)</option>
              <option value="TSLA">TSLA · Tesla, Inc. (10x)</option>
              <option value="AAPL">AAPL · Apple Inc. (10x)</option>
              <option value="MSFT">MSFT · Microsoft Corp (10x)</option>
              <option value="AMZN">AMZN · Amazon.com Inc (10x)</option>
              <option value="GOOGL">GOOGL · Alphabet Google (10x)</option>
              <option value="META">META · Meta Platforms (10x)</option>
              <option value="COIN">COIN · Coinbase Global (10x)</option>
              <option value="MSTR">MSTR · MicroStrategy Inc (10x)</option>
            </optgroup>
            <optgroup label="Crypto">
              <option value="SOL">SOL · Solana (50x)</option>
              <option value="BTC">BTC · Bitcoin (50x)</option>
              <option value="ETH">ETH · Ethereum (50x)</option>
            </optgroup>
          </select>
          {isEquity && (
            <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {marketMeta.exchangeBadge}
            </span>
          )}
        </div>

        <div className="h-5 w-[1px] bg-slate-800 hidden md:block" />

        {/* Mark Price */}
        <div>
          <div className="text-[10px] text-slate-400 font-medium">Mark</div>
          <div className="text-base font-mono font-semibold text-white flex items-center gap-1.5">
            ${currentMarket.markPx > 10 ? currentMarket.markPx.toLocaleString(undefined, { minimumFractionDigits: 2 }) : currentMarket.markPx.toFixed(4)}
            <span
              className={`text-xs font-semibold ${
                currentMarket.change24h >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {currentMarket.change24h >= 0 ? "+" : ""}
              {currentMarket.change24h.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Oracle Price */}
        <div>
          <div className="text-[10px] text-slate-400 font-medium">Oracle</div>
          <div className="text-sm font-mono text-slate-200">
            ${currentMarket.oraclePx > 10 ? currentMarket.oraclePx.toLocaleString(undefined, { minimumFractionDigits: 2 }) : currentMarket.oraclePx.toFixed(4)}
          </div>
        </div>

        {/* Open Interest */}
        <div className="flex flex-col min-w-[130px]">
          <div className="text-[10px] text-slate-400 font-medium flex items-center justify-between">
            <span>Open interest</span>
            <span className="font-mono text-[10px] text-slate-400">
              {longOiRatio.toFixed(0)}% / {shortOiRatio.toFixed(0)}%
            </span>
          </div>
          <div className="text-xs font-mono font-medium text-slate-200 mt-0.5 flex items-center gap-1">
            <span className="text-emerald-400">{formatUsdCompact(longOi)}</span>
            <span className="text-slate-600">/</span>
            <span className="text-rose-400">{formatUsdCompact(shortOi)}</span>
          </div>
        </div>

        {/* Funding /h */}
        <div className="flex flex-col min-w-[120px]">
          <div className="text-[10px] text-slate-400 font-medium flex items-center justify-between">
            <span>Funding (1h)</span>
            <span className="text-[10px] text-slate-500 font-mono">in {minutesToFunding}m</span>
          </div>
          <div className="text-xs font-mono font-medium mt-0.5 flex items-center gap-1">
            <span className={longFundingRate >= 0 ? "text-emerald-400" : "text-rose-400"}>
              {longFundingRate >= 0 ? "+" : ""}{longFundingRate.toFixed(4)}%
            </span>
            <span className="text-slate-600">/</span>
            <span className={shortFundingRate >= 0 ? "text-emerald-400" : "text-rose-400"}>
              {shortFundingRate >= 0 ? "+" : ""}{shortFundingRate.toFixed(4)}%
            </span>
          </div>
        </div>

        {/* Available Liquidity */}
        <div className="flex flex-col min-w-[120px]">
          <div className="text-[10px] text-slate-400 font-medium">Available liquidity</div>
          <div className="text-xs font-mono font-medium text-slate-200 mt-0.5 flex items-center gap-1">
            <span className="text-emerald-400">{formatUsdCompact(availableLongLiq)}</span>
            <span className="text-slate-600">/</span>
            <span className="text-rose-400">{formatUsdCompact(availableShortLiq)}</span>
          </div>
        </div>

        {/* 24h Volume */}
        <div>
          <div className="text-[10px] text-slate-400 font-medium">24h volume</div>
          <div className="text-sm font-mono text-slate-200">
            ${(currentMarket.dayVolumeUsd / 1_000_000).toFixed(2)}M
          </div>
        </div>
      </div>

      {/* Engine Status */}
      <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <span>CLOB online</span>
      </div>
    </div>
  );
});
