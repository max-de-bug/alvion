"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  createChart,
  ColorType,
  CrosshairMode,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import type { Timeframe } from "@/stores/useTradingStore";

interface AlvionNativeChartProps {
  marketName: string;
  timeframe: Timeframe;
  className?: string;
  onPriceUpdate?: (price: number) => void;
}

function getIntervalSeconds(tf: Timeframe): number {
  switch (tf) {
    case "1s":
      return 1;
    case "1m":
      return 60;
    case "3m":
      return 180;
    case "5m":
      return 300;
    case "15m":
      return 900;
    case "30m":
      return 1800;
    case "1h":
      return 3600;
    case "4h":
      return 14400;
    case "1D":
      return 86400;
    case "1W":
      return 604800;
    default:
      return 900;
  }
}

// Generate realistic initial historical candlestick & volume series
function generateCandleData(basePrice: number, count: number = 80, intervalSeconds: number = 900) {
  const data = [];
  const volumeData = [];
  const maData = [];

  let currentPrice = basePrice * 0.94;
  const now = Math.floor(Date.now() / 1000);

  const maPeriod = 14;
  const closeHistory: number[] = [];

  for (let i = count; i >= 0; i--) {
    const time = (now - i * intervalSeconds) as UTCTimestamp;
    const volatility = currentPrice * 0.0035;
    const change = (Math.random() - 0.485) * volatility;
    
    const open = currentPrice;
    const close = Math.max(10, open + change);
    const high = Math.max(open, close) + Math.random() * (volatility * 0.6);
    const low = Math.min(open, close) - Math.random() * (volatility * 0.6);
    const volume = Math.floor(20 + Math.random() * 80);

    const isUp = close >= open;

    data.push({
      time,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
    });

    volumeData.push({
      time,
      value: volume,
      color: isUp ? "rgba(78, 204, 163, 0.35)" : "rgba(229, 57, 74, 0.35)",
    });

    closeHistory.push(close);
    if (closeHistory.length >= maPeriod) {
      const slice = closeHistory.slice(-maPeriod);
      const avg = slice.reduce((a, b) => a + b, 0) / maPeriod;
      maData.push({
        time,
        value: Number(avg.toFixed(2)),
      });
    }

    currentPrice = close;
  }

  return { data, volumeData, maData };
}

export const AlvionNativeChart = React.memo<AlvionNativeChartProps>(function AlvionNativeChart({
  marketName,
  timeframe,
  className = "",
  onPriceUpdate,
}) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  // Crosshair OHLC tooltip values
  const [legendData, setLegendData] = useState<{
    open: number;
    high: number;
    low: number;
    close: number;
    change: number;
    volume: number;
  } | null>(null);

  // Base price estimation by market
  const basePrice = useMemo(() => {
    const clean = marketName.replace("-PERP", "").replace("-USDCX", "").toUpperCase();
    switch (clean) {
      case "BTC":
        return 67450;
      case "ETH":
        return 3540;
      case "SOL":
        return 185;
      case "SPY":
        return 592;
      case "NVDA":
        return 142;
      case "TSLA":
        return 340;
      case "AAPL":
        return 228;
      default:
        return 100;
    }
  }, [marketName]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;

    const width = container.clientWidth > 0 ? container.clientWidth : 800;
    const height = container.clientHeight > 0 ? container.clientHeight : 420;

    // 1. Initialize TradingView Lightweight Chart with Alvion Design Tokens
    const chart = createChart(container, {
      width,
      height,
      layout: {
        background: { type: ColorType.Solid, color: "#0a0a0c" },
        textColor: "#9aa5b1",
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.03)" },
        horzLines: { color: "rgba(255, 255, 255, 0.03)" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: "rgba(78, 204, 163, 0.4)",
          width: 1,
          style: 3,
          labelBackgroundColor: "#162721",
        },
        horzLine: {
          color: "rgba(78, 204, 163, 0.4)",
          width: 1,
          style: 3,
          labelBackgroundColor: "#162721",
        },
      },
      rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.08)",
        scaleMargins: {
          top: 0.1,
          bottom: 0.2,
        },
      },
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.08)",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartInstanceRef.current = chart;

    // 2. Add Candlestick Series matching Alvion Mint Green / Coral Red
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#4ECCA3",
      downColor: "#e5394a",
      borderUpColor: "#4ECCA3",
      borderDownColor: "#e5394a",
      wickUpColor: "#4ECCA3",
      wickDownColor: "#e5394a",
    });
    candleSeriesRef.current = candleSeries;

    // 3. Add Volume Histogram Series pinned to the bottom 15%
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "volume-scale",
    });

    chart.priceScale("volume-scale").applyOptions({
      scaleMargins: {
        top: 0.82,
        bottom: 0,
      },
    });

    // 4. Add 14-period EMA Trend Overlay Line in Cyan
    const maSeries = chart.addSeries(LineSeries, {
      color: "#38bdf8",
      lineWidth: 2,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });

    // 5. Populate Initial High-Fidelity Data
    const intervalSeconds = getIntervalSeconds(timeframe);
    const { data, volumeData, maData } = generateCandleData(basePrice, 80, intervalSeconds);
    candleSeries.setData(data);
    volumeSeries.setData(volumeData);
    maSeries.setData(maData);
    chart.timeScale().fitContent();

    const last = data[data.length - 1];
    if (last) {
      setLegendData({
        open: last.open,
        high: last.high,
        low: last.low,
        close: last.close,
        change: Number((((last.close - last.open) / last.open) * 100).toFixed(2)),
        volume: volumeData[volumeData.length - 1]?.value || 50,
      });
      if (onPriceUpdate) onPriceUpdate(last.close);
    }

    // 6. Crosshair Move Handler for Live Legend Updating
    chart.subscribeCrosshairMove((param) => {
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > container.clientWidth ||
        param.point.y < 0 ||
        param.point.y > container.clientHeight
      ) {
        if (last) {
          setLegendData({
            open: last.open,
            high: last.high,
            low: last.low,
            close: last.close,
            change: Number((((last.close - last.open) / last.open) * 100).toFixed(2)),
            volume: volumeData[volumeData.length - 1]?.value || 50,
          });
        }
      } else {
        const candle = param.seriesData.get(candleSeries) as { open: number; high: number; low: number; close: number } | undefined;
        const volume = param.seriesData.get(volumeSeries) as { value: number } | undefined;
        if (candle) {
          setLegendData({
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
            change: Number((((candle.close - candle.open) / candle.open) * 100).toFixed(2)),
            volume: volume?.value || 0,
          });
        }
      }
    });

    // 7. Live Tick Simulation (Streaming Market Ticks)
    const tickInterval = setInterval(() => {
      if (!candleSeriesRef.current) return;
      const lastCandle = data[data.length - 1];
      if (!lastCandle) return;

      const delta = (Math.random() - 0.49) * (basePrice * 0.0004);
      const newClose = Number((lastCandle.close + delta).toFixed(2));
      const newHigh = Number(Math.max(lastCandle.high, newClose).toFixed(2));
      const newLow = Number(Math.min(lastCandle.low, newClose).toFixed(2));

      lastCandle.close = newClose;
      lastCandle.high = newHigh;
      lastCandle.low = newLow;

      candleSeriesRef.current.update(lastCandle);
      if (onPriceUpdate) onPriceUpdate(newClose);
    }, 1500);

    // 8. Responsive Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      if (chart && width > 0 && height > 0) {
        chart.applyOptions({ width, height });
      }
    });

    resizeObserver.observe(container);

    return () => {
      clearInterval(tickInterval);
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [basePrice, marketName, timeframe, onPriceUpdate]);

  return (
    <div className={`relative w-full h-full min-h-[380px] bg-[#0a0a0c] overflow-hidden ${className}`}>
      {/* Top Floating Crosshair OHLC Legend */}
      {legendData && (
        <div className="absolute top-2.5 left-3 z-10 flex flex-wrap items-center gap-3 text-[11px] font-mono pointer-events-none select-none bg-[#0a0a0c]/80 backdrop-blur-sm px-2.5 py-1 rounded-md border border-[var(--border)]">
          <span className="font-semibold text-white">{marketName}</span>
          <span className="text-[var(--t3)]">
            O: <span className="text-[var(--t1)]">{legendData.open.toFixed(2)}</span>
          </span>
          <span className="text-[var(--t3)]">
            H: <span className="text-[var(--t1)]">{legendData.high.toFixed(2)}</span>
          </span>
          <span className="text-[var(--t3)]">
            L: <span className="text-[var(--t1)]">{legendData.low.toFixed(2)}</span>
          </span>
          <span className="text-[var(--t3)]">
            C: <span className={legendData.change >= 0 ? "text-[#4ECCA3]" : "text-[var(--red)]"}>{legendData.close.toFixed(2)}</span>
          </span>
          <span className={`font-semibold ${legendData.change >= 0 ? "text-[#4ECCA3]" : "text-[var(--red)]"}`}>
            {legendData.change >= 0 ? "+" : ""}{legendData.change}%
          </span>
          <span className="text-[var(--t3)] hidden sm:inline">
            Vol: <span className="text-[var(--t2)]">{legendData.volume}</span>
          </span>
        </div>
      )}

      {/* Target Chart Div for Canvas */}
      <div ref={chartContainerRef} className="w-full h-full min-h-[420px]" />
    </div>
  );
});
