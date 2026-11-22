"use client";

import React, { useRef, useCallback, useState } from "react";
import { Maximize2, Minimize2, PenTool } from "lucide-react";
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chart" | "history" | "details">("chart");
  const [showDrawingTools, setShowDrawingTools] = useState(false);

  const toggleFullscreen = useCallback(() => {
    if (!chartWrapperRef.current) return;
    if (!document.fullscreenElement) {
      chartWrapperRef.current
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  }, []);

  return (
    <div
      ref={chartWrapperRef}
      className={`trade-chart-in flex flex-col flex-1 h-full min-h-[580px] min-w-0 rounded-[16px] border border-[#1e272c] bg-[#10171a] overflow-hidden shadow-lg select-none ${className}`}
    >
      {/* Top Controls Bar: Identical to QFEX (Clean View Tabs on Left, Fullscreen & Tools on Right) */}
      <div className="flex items-center justify-between border-b border-[#1e272c] px-4 pt-3 pb-2 shrink-0 gap-2 bg-[#10171a]">
        {/* Left: View Tabs (Chart | Historical Data | Details) */}
        <div className="flex items-center text-[13px] font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("chart")}
            className={`relative pb-2 transition-colors cursor-pointer mr-5 ${
              activeTab === "chart"
                ? "text-white font-semibold"
                : "text-[var(--t3)] hover:text-white"
            }`}
          >
            <span>Chart</span>
            {activeTab === "chart" && (
              <span className="absolute -bottom-[9px] left-0 right-0 h-[2.5px] bg-[#4ECCA3] rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`relative pb-2 transition-colors cursor-pointer mr-5 ${
              activeTab === "history"
                ? "text-white font-semibold"
                : "text-[var(--t3)] hover:text-white"
            }`}
          >
            <span>Historical Data</span>
            {activeTab === "history" && (
              <span className="absolute -bottom-[9px] left-0 right-0 h-[2.5px] bg-[#4ECCA3] rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`relative pb-2 transition-colors cursor-pointer ${
              activeTab === "details"
                ? "text-white font-semibold"
                : "text-[var(--t3)] hover:text-white"
            }`}
          >
            <span>Details</span>
            {activeTab === "details" && (
              <span className="absolute -bottom-[9px] left-0 right-0 h-[2.5px] bg-[#4ECCA3] rounded-full" />
            )}
          </button>
        </div>

        {/* Right: Drawing Tools Toggle & Fullscreen Button */}
        <div className="flex items-center gap-2">
          {/* Drawing Tools Toggle Button */}
          <button
            type="button"
            onClick={() => setShowDrawingTools((prev) => !prev)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              showDrawingTools
                ? "bg-[#4ECCA3]/15 text-[#4ECCA3] border border-[#4ECCA3]/30"
                : "bg-[#182228] text-[var(--t3)] hover:text-white border border-[#232e34]"
            }`}
            title={showDrawingTools ? "Hide drawing tools" : "Show drawing tools"}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{showDrawingTools ? "Hide Tools" : "Tools"}</span>
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-[#182228] hover:bg-[#202b32] text-[var(--t3)] hover:text-white border border-[#232e34] transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Chart Viewport: Full size edge-to-edge, seamlessly matching Alvion theme */}
      <div className="flex-1 relative w-full h-full min-h-0 bg-[#10171a] overflow-hidden">
        <TradingViewChart
          marketName={currentMarketName}
          timeframe={timeframe}
          showDrawingTools={showDrawingTools}
          setShowDrawingTools={setShowDrawingTools}
          className="w-full h-full"
        />
      </div>
    </div>
  );
});
