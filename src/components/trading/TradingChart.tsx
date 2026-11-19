"use client";

import React from "react";

interface TradingChartProps {
  currentMarketName: string;
  timeframe: "1m" | "5m" | "15m" | "1h";
  setTimeframe: (tf: "1m" | "5m" | "15m" | "1h") => void;
}

export const TradingChart = React.memo<TradingChartProps>(function TradingChart({
  currentMarketName,
  timeframe,
  setTimeframe,
}) {
  return (
    <div className="md:col-span-7 bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col h-[340px]">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs text-slate-200">
            {currentMarketName}/USD Perpetual
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
              className={`px-2 py-0.5 rounded font-medium transition ${
                timeframe === tf
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
  );
});

