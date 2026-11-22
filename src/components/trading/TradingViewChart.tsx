"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import type { Timeframe } from "@/stores/useTradingStore";

declare global {
  interface Window {
    TradingView?: any;
  }
}

interface TradingViewChartProps {
  marketName: string;
  timeframe: Timeframe;
  showDrawingTools?: boolean;
  setShowDrawingTools?: (val: boolean | ((prev: boolean) => boolean)) => void;
  className?: string;
}

// Map Alvion perpetual markets to authentic, live real-time feeds
function getTradingViewSymbol(name: string): string {
  const upper = (name || "BTC").toUpperCase().trim();
  const clean = upper
    .replace("-PERP", "")
    .replace("-USDCX", "")
    .replace("-USDC", "")
    .replace("-USDT", "")
    .replace("-USD", "")
    .trim();

  const mapping: Record<string, string> = {
    BTC: "BINANCE:BTCUSDT",
    ETH: "BINANCE:ETHUSDT",
    SOL: "BINANCE:SOLUSDT",
    SPY: "AMEX:SPY",
    NVDA: "NASDAQ:NVDA",
    TSLA: "NASDAQ:TSLA",
    AAPL: "NASDAQ:AAPL",
    MSFT: "NASDAQ:MSFT",
    AMZN: "NASDAQ:AMZN",
    GOOGL: "NASDAQ:GOOGL",
    META: "NASDAQ:META",
    COIN: "NASDAQ:COIN",
    MSTR: "NASDAQ:MSTR",
    QQQ: "NASDAQ:QQQ",
  };

  return mapping[clean] || `BINANCE:${clean}USDT`;
}

// Map timeframe to TradingView interval string
function getTradingViewInterval(tf: Timeframe): string {
  switch (tf) {
    case "1s":
      return "1";
    case "1m":
      return "1";
    case "3m":
      return "3";
    case "5m":
      return "5";
    case "15m":
      return "15";
    case "30m":
      return "30";
    case "1h":
      return "60";
    case "4h":
      return "240";
    case "1D":
      return "D";
    case "1W":
      return "W";
    default:
      return "60";
  }
}

export const TradingViewChart = React.memo<TradingViewChartProps>(function TradingViewChart({
  marketName,
  timeframe,
  showDrawingTools = false,
  setShowDrawingTools,
  className = "",
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetContainerIdRef = useRef(`tv_chart_${Math.random().toString(36).substring(2, 9)}`);
  const [isLoading, setIsLoading] = useState(true);

  const tvSymbol = getTradingViewSymbol(marketName);
  const tvInterval = getTradingViewInterval(timeframe);

  useEffect(() => {
    let isMounted = true;
    const container = containerRef.current;
    if (!container) return;

    setIsLoading(true);
    container.innerHTML = "";

    // Generate unique container id for this render instance
    const currentContainerId = `tv_chart_${Math.random().toString(36).substring(2, 9)}`;
    widgetContainerIdRef.current = currentContainerId;

    const widgetDiv = document.createElement("div");
    widgetDiv.id = currentContainerId;
    widgetDiv.style.width = "100%";
    widgetDiv.style.height = "100%";
    container.appendChild(widgetDiv);

    const initWidget = () => {
      if (!isMounted || !window.TradingView) return;

      try {
        new window.TradingView.widget({
          autosize: true,
          width: "100%",
          height: "100%",
          symbol: tvSymbol,
          interval: tvInterval,
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1", // 1 = Japanese Candlesticks
          locale: "en",
          toolbar_bg: "#10171a",
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_side_toolbar: !showDrawingTools,
          withdateranges: true,
          hide_legend: false,
          save_image: false,
          container_id: currentContainerId,
          backgroundColor: "#10171a",
          gridColor: "rgba(255, 255, 255, 0.035)",
          overrides: {
            // Alvion Brand Canvas & Grid Palette
            "paneProperties.background": "#10171a",
            "paneProperties.backgroundType": "solid",
            "paneProperties.vertGridProperties.color": "rgba(255, 255, 255, 0.035)",
            "paneProperties.horzGridProperties.color": "rgba(255, 255, 255, 0.035)",

            // Alvion Brand Candlestick Palette: Mint Green Bullish (#4ECCA3), Coral Red Bearish (#EB4D5C)
            "mainSeriesProperties.candleStyle.upColor": "#4ECCA3",
            "mainSeriesProperties.candleStyle.downColor": "#EB4D5C",
            "mainSeriesProperties.candleStyle.drawWick": true,
            "mainSeriesProperties.candleStyle.drawBorder": true,
            "mainSeriesProperties.candleStyle.borderColor": "#4ECCA3",
            "mainSeriesProperties.candleStyle.borderUpColor": "#4ECCA3",
            "mainSeriesProperties.candleStyle.borderDownColor": "#EB4D5C",
            "mainSeriesProperties.candleStyle.wickUpColor": "#4ECCA3",
            "mainSeriesProperties.candleStyle.wickDownColor": "#EB4D5C",

            // Scales & Axis Typography
            "scalesProperties.textColor": "#8B9AA2",
            "scalesProperties.lineColor": "rgba(255, 255, 255, 0.06)",
          },
          studies_overrides: {
            "volume.volume.color.0": "#EB4D5C",
            "volume.volume.color.1": "#4ECCA3",
          },
        });
      } catch (err) {
        console.error("TradingView widget initialization error:", err);
      }

      setTimeout(() => {
        if (isMounted) setIsLoading(false);
      }, 900);
    };

    if (window.TradingView) {
      initWidget();
    } else {
      const existingScript = document.getElementById("tradingview-tvjs");
      if (existingScript) {
        existingScript.addEventListener("load", initWidget);
      } else {
        const script = document.createElement("script");
        script.id = "tradingview-tvjs";
        script.src = "https://s3.tradingview.com/tv.js";
        script.type = "text/javascript";
        script.async = true;
        script.onload = initWidget;
        document.head.appendChild(script);
      }
    }

    return () => {
      isMounted = false;
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [tvSymbol, tvInterval, showDrawingTools]);

  return (
    <div className={`relative w-full h-full min-h-[460px] overflow-hidden bg-[#10171a] ${className}`}>
      {/* Loading Skeleton matching Alvion Theme */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#10171a] text-[var(--t3)] gap-3 pointer-events-none transition-opacity duration-300">
          <Loader2 className="w-7 h-7 text-[#4ECCA3] animate-spin" />
          <div className="flex items-center gap-2 text-xs font-mono">
            <span>Connecting to Real-Time Feed</span>
            <span className="text-white font-semibold">{tvSymbol}</span>
          </div>
        </div>
      )}

      {/* TradingView Target Mount Node: Full Edge-to-Edge Size */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ width: "100%", height: "100%" }}
      />

      {/* QFEX-Style Teal Floating Toggle Tab on the bottom-left edge */}
      {setShowDrawingTools && (
        <button
          type="button"
          onClick={() => setShowDrawingTools((prev) => !prev)}
          className="absolute bottom-6 left-0 z-20 flex items-center justify-center w-4 h-7 rounded-r-md bg-[#4ECCA3] text-[#0a1815] hover:bg-[#3fb892] shadow-lg transition-all cursor-pointer group"
          title={showDrawingTools ? "Hide drawing tools" : "Show drawing tools"}
        >
          <ChevronRight
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              showDrawingTools ? "rotate-180" : ""
            }`}
          />
        </button>
      )}
    </div>
  );
});
