"use client";

import React from "react";
import { Activity } from "lucide-react";
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

export const MarketTickerBar: React.FC<MarketTickerBarProps> = ({
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
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <select
            value={selectedMarketName}
            onChange={(e) => setSelectedMarketName(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white font-bold text-base px-3 py-1.5 rounded-lg focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <optgroup label="🏛️ NYSE & NASDAQ 24/7 Tokenized Equities">
              <option value="SPY">SPY-USD (NYSE Arca S&P 500 ETF - 20x)</option>
              <option value="QQQ">QQQ-USD (Invesco Nasdaq-100 ETF - 20x)</option>
              <option value="NVDA">NVDA-USD (NVIDIA Corp - 10x)</option>
              <option value="TSLA">TSLA-USD (Tesla, Inc. - 10x)</option>
              <option value="AAPL">AAPL-USD (Apple Inc. - 10x)</option>
              <option value="MSFT">MSFT-USD (Microsoft Corp - 10x)</option>
              <option value="AMZN">AMZN-USD (Amazon.com Inc - 10x)</option>
              <option value="GOOGL">GOOGL-USD (Alphabet Google - 10x)</option>
              <option value="META">META-USD (Meta Platforms - 10x)</option>
              <option value="COIN">COIN-USD (Coinbase Global - 10x)</option>
              <option value="MSTR">MSTR-USD (MicroStrategy Inc - 10x)</option>
            </optgroup>
            <optgroup label="⚡ Avalanche & Crypto">
              <option value="AVAX">AVAX-USD (Avalanche Native - 25x)</option>
              <option value="BTC">BTC-USD (Bitcoin - 50x)</option>
              <option value="ETH">ETH-USD (Ethereum - 50x)</option>
              <option value="SOL">SOL-USD (Solana - 20x)</option>
            </optgroup>
          </select>
          {isEquity && (
            <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
              <span>🏛️</span>
              <span>{marketMeta.exchangeBadge}</span>
              <span className="text-emerald-400 font-mono">• 24/7</span>
            </span>
          )}
        </div>

        <div className="h-6 w-[1px] bg-slate-800 hidden md:block"></div>

        <div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
            Mark Price
          </div>
          <div className="text-lg font-mono font-bold text-white flex items-center gap-1.5">
            ${currentMarket.markPx > 10 ? currentMarket.markPx.toLocaleString(undefined, { minimumFractionDigits: 2 }) : currentMarket.markPx.toFixed(4)}
            <span
              className={`text-xs px-1.5 py-0.2 rounded font-semibold ${
                currentMarket.change24h >= 0
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
            {isEquity ? "NYSE / Tape Feed" : "Oracle Feed"}
            <span className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold ${isEquity ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-cyan-500/20 text-cyan-400"}`}>
              {isEquity ? "NYSE 24/7" : "AVAX"}
            </span>
          </div>
          <div className="text-sm font-mono text-cyan-300 font-semibold">
            ${currentMarket.oraclePx > 10 ? currentMarket.oraclePx.toLocaleString(undefined, { minimumFractionDigits: 2 }) : currentMarket.oraclePx.toFixed(4)}
          </div>
        </div>

        {/* TitanX Metric 1: Open Interest (Long % / Short %) */}
        <div className="flex flex-col min-w-[140px]">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium flex items-center justify-between gap-1">
            <span>Open Interest</span>
            <span className="font-mono text-[9px] text-slate-300 font-bold">
              ({longOiRatio.toFixed(0)}% / {shortOiRatio.toFixed(0)}%)
            </span>
          </div>
          <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5 mt-0.5">
            <span className="text-emerald-400" title="Long Open Interest">
              {formatUsdCompact(longOi)}
            </span>
            <span className="text-slate-500">/</span>
            <span className="text-rose-400" title="Short Open Interest">
              {formatUsdCompact(shortOi)}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex mt-1">
            <div
              className="bg-emerald-400 h-full transition-all duration-300"
              style={{ width: `${longOiRatio}%` }}
              title={`Long Open Interest: ${longOiRatio.toFixed(1)}%`}
            />
            <div
              className="bg-rose-500 h-full transition-all duration-300"
              style={{ width: `${shortOiRatio}%` }}
              title={`Short Open Interest: ${shortOiRatio.toFixed(1)}%`}
            />
          </div>
        </div>

        {/* TitanX Metric 2: Funding /h (Long rate / Short rate) */}
        <div className="flex flex-col min-w-[130px]">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium flex items-center justify-between gap-1">
            <span>Funding /h</span>
            <span className="text-[9px] text-indigo-400 font-mono">in {minutesToFunding}m</span>
          </div>
          <div className="text-xs font-mono font-bold flex items-center gap-1.5 mt-0.5">
            <span className={longFundingRate >= 0 ? "text-emerald-400" : "text-rose-400"} title="Long Hourly Funding Rate">
              {longFundingRate >= 0 ? "+" : ""}{longFundingRate.toFixed(4)}%
            </span>
            <span className="text-slate-500">/</span>
            <span className={shortFundingRate >= 0 ? "text-emerald-400" : "text-rose-400"} title="Short Hourly Funding Rate">
              {shortFundingRate >= 0 ? "+" : ""}{shortFundingRate.toFixed(4)}%
            </span>
          </div>
          <div className="text-[9px] text-slate-500 font-mono mt-0.5 flex items-center justify-between">
            <span>Long pays</span>
            <span>Short earns</span>
          </div>
        </div>

        {/* TitanX Metric 3: Available Liquidity (Long Capacity / Short Capacity) */}
        <div className="flex flex-col min-w-[130px]">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium flex items-center justify-between gap-1">
            <span>Available Liquidity</span>
            <span className="text-[9px] text-cyan-400 font-mono">DEPTH</span>
          </div>
          <div className="text-xs font-mono font-bold flex items-center gap-1.5 mt-0.5">
            <span className="text-emerald-400" title="Available Long / Ask Liquidity in Book & Vault">
              {formatUsdCompact(availableLongLiq)}
            </span>
            <span className="text-slate-500">/</span>
            <span className="text-rose-400" title="Available Short / Bid Liquidity in Book & Vault">
              {formatUsdCompact(availableShortLiq)}
            </span>
          </div>
          <div className="text-[9px] text-slate-500 font-mono mt-0.5 flex items-center justify-between">
            <span>Long Ask</span>
            <span>Short Bid</span>
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
  );
};

