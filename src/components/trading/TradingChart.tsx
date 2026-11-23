"use client";

import React, { useRef, useState } from "react";
import { TradingViewChart } from "./TradingViewChart";
import type { Timeframe } from "@/stores/useTradingStore";

interface TradingChartProps {
  currentMarketName: string;
  timeframe: Timeframe;
  setTimeframe: (tf: Timeframe) => void;
  className?: string;
}

export const TradingChart = React.memo<TradingChartProps>(function TradingChart({
  currentMarketName,
  timeframe,
  setTimeframe,
  className = "",
}) {
  const chartWrapperRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"chart" | "history" | "details">("chart");

  return (
    <div
      ref={chartWrapperRef}
      className={`trade-chart-in flex flex-col flex-1 h-full min-h-[580px] min-w-0 rounded-none border border-[#1e272c] bg-[#10171a] overflow-hidden shadow-lg select-none ${className}`}
    >
      {/* Top Controls Bar: View Tabs */}
      <div className="flex items-center justify-between border-b border-[#1e272c] px-4 pt-3 pb-2 shrink-0 gap-2 bg-[#10171a]">
        {/* Left: View Tabs (Chart | Historical Data | Details) */}
        <div className="flex items-center text-[13px] font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("chart")}
            className={`relative pb-2 transition-colors cursor-pointer mr-5 ${activeTab === "chart"
                ? "text-white font-semibold"
                : "text-[var(--t3)] hover:text-white"
              }`}
          >
            <span>Chart</span>
            {activeTab === "chart" && (
              <span className="absolute -bottom-[9px] left-0 right-0 h-[2.5px] bg-[#4ECCA3] rounded-none" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`relative pb-2 transition-colors cursor-pointer mr-5 ${activeTab === "history"
                ? "text-white font-semibold"
                : "text-[var(--t3)] hover:text-white"
              }`}
          >
            <span>Historical Data</span>
            {activeTab === "history" && (
              <span className="absolute -bottom-[9px] left-0 right-0 h-[2.5px] bg-[#4ECCA3] rounded-none" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`relative pb-2 transition-colors cursor-pointer ${activeTab === "details"
                ? "text-white font-semibold"
                : "text-[var(--t3)] hover:text-white"
              }`}
          >
            <span>Details</span>
            {activeTab === "details" && (
              <span className="absolute -bottom-[9px] left-0 right-0 h-[2.5px] bg-[#4ECCA3] rounded-none" />
            )}
          </button>
        </div>
      </div>

      {/* Chart Viewport: Full size edge-to-edge, seamlessly matching Alvion theme */}
      <div className="flex-1 relative w-full h-full min-h-0 bg-[#10171a] overflow-hidden">
        <TradingViewChart
          marketName={currentMarketName}
          timeframe={timeframe}
          className="w-full h-full"
        />
      </div>
    </div>
  );
});
