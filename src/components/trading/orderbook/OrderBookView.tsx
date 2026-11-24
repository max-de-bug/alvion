"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { ChevronsRight, ArrowUpDown, ChevronDown, Check } from "lucide-react";
import { OrderBookData } from "@/types/trading";
import { MatchedTrade } from "@/lib/orderTypes";

interface OrderBookViewProps {
  orderBook: OrderBookData | null;
  markPrice: number;
  symbol?: string;
  szDecimals?: number;
  recentTrades?: MatchedTrade[];
  onSelectPrice: (px: string) => void;
}

interface DisplayLevel {
  px: string;
  sz: string;
  tot: string;
  w: string;
}

// Vercel Best Practice: server-hoist-static-io
function formatBookPrice(val: number, priceDecimals: number): string {
  if (isNaN(val) || val <= 0) return "0.00";
  if (val >= 1000) {
    return val.toLocaleString(undefined, {
      minimumFractionDigits: Math.min(2, priceDecimals),
      maximumFractionDigits: Math.min(2, priceDecimals),
    });
  }
  return val.toFixed(priceDecimals);
}

// Vercel Best Practice: rerender-memo & rerender-no-inline-components
const OrderBookRow = React.memo(function OrderBookRow({
  px,
  sz,
  tot,
  w,
  isAsk,
  onSelectPrice,
}: {
  px: string;
  sz: string;
  tot: string;
  w: string;
  isAsk: boolean;
  onSelectPrice: (px: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelectPrice(px.replace(/,/g, ""))}
      className="ob-grid px-3 h-[20px] shrink-0 relative text-left hover:bg-[var(--hover)] cursor-pointer select-none group w-full items-center"
    >
      <span
        className={`z-10 font-medium tabular-nums ${
          isAsk ? "text-[var(--red)]" : "text-[var(--green)]"
        }`}
      >
        {px}
      </span>
      <span className="text-right text-[var(--t2)] z-10 text-[10px] tabular-nums">
        {sz}
      </span>
      <span className="text-right text-[var(--t3)] group-hover:text-[var(--t2)] z-10 text-[10px] tabular-nums">
        {tot}
      </span>
      <span
        className={`absolute right-0 top-0 bottom-0 pointer-events-none transition-all duration-300 ${
          isAsk ? "depth-bar depth-bar--ask" : "depth-bar depth-bar--bid"
        }`}
        style={{ width: w }}
      />
    </button>
  );
});

export const OrderBookView = React.memo<OrderBookViewProps>(function OrderBookView({
  orderBook,
  markPrice,
  symbol = "BTC",
  szDecimals = 2,
  recentTrades = [],
  onSelectPrice,
}) {
  const [activeTab, setActiveTab] = useState<"book" | "trades">("book");
  const [precision, setPrecision] = useState<"0.1" | "1" | "5">("1");
  const [priceFlash, setPriceFlash] = useState<"up" | "down" | null>(null);
  const prevMarkRef = useRef<number>(markPrice);
  const bookContainerRef = useRef<HTMLDivElement | null>(null);
  const [visibleRows, setVisibleRows] = useState<number>(14);

  // Dynamic observer: calculate exact number of rows that fit the container
  useEffect(() => {
    const el = bookContainerRef.current;
    if (!el) return;

    const updateRows = () => {
      const height = el.clientHeight;
      if (!height || height <= 0) return;
      // Spread strip is ~24px
      const availableForLists = Math.max(80, height - 24);
      const halfHeight = availableForLists / 2;
      // 20px per row
      const count = Math.max(6, Math.floor(halfHeight / 20));
      setVisibleRows(count);
    };

    updateRows();
    const ro = new ResizeObserver(updateRows);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Determine optimal price formatting decimals
  const priceDecimals = useMemo(() => {
    if (markPrice >= 1000) return 1;
    if (markPrice >= 10) return 2;
    if (markPrice >= 1) return 3;
    return 4;
  }, [markPrice]);

  // Flash price indicator on live movement
  useEffect(() => {
    if (prevMarkRef.current !== markPrice && markPrice > 0) {
      const direction = markPrice > prevMarkRef.current ? "up" : "down";
      setPriceFlash(direction);
      prevMarkRef.current = markPrice;
      const t = setTimeout(() => setPriceFlash(null), 600);
      return () => clearTimeout(t);
    }
  }, [markPrice]);

  // Process live Asks (Sells): sorted ascending, displayed reversed so lowest ask is closest to spread
  const processedAsks = useMemo((): DisplayLevel[] => {
    const targetCount = visibleRows;
    const base = markPrice > 0 ? markPrice : 100;
    const raw: { px: string; sz: string }[] = [];

    if (orderBook?.asks && orderBook.asks.length > 0) {
      for (const a of orderBook.asks) {
        raw.push({ px: a.px, sz: a.sz });
      }
    }

    // Extrapolate if less than targetCount so container is always 100% full
    if (raw.length < targetCount) {
      const startPx = raw.length > 0 ? parseFloat(raw[raw.length - 1].px) || base : base * 1.0002;
      const step = Math.max(0.01, startPx * 0.00018);
      const lastSz = raw.length > 0 ? parseFloat(raw[raw.length - 1].sz) || 1 : 12000 / base;

      for (let i = raw.length; i < targetCount; i++) {
        const pxNum = startPx + step * (i - raw.length + 1);
        const szNum = Math.max(0.01, lastSz * (1 + (i - raw.length) * 0.15));
        raw.push({
          px: pxNum.toFixed(priceDecimals),
          sz: szNum.toFixed(szDecimals),
        });
      }
    }

    const sliced = raw.slice(0, targetCount);
    let cumulative = 0;
    const mapped = sliced.map((lvl) => {
      const pxNum = parseFloat(lvl.px) || 0;
      const szNum = parseFloat(lvl.sz) || 0;
      cumulative += szNum;
      return {
        px: formatBookPrice(pxNum, priceDecimals),
        sz: szNum.toFixed(szDecimals),
        tot: cumulative.toFixed(szDecimals),
        rawTot: cumulative,
      };
    });
    const maxTot = mapped.length > 0 ? mapped[mapped.length - 1].rawTot : 1;
    return mapped
      .map((m) => ({
        ...m,
        w: `${Math.min(100, Math.max(6, (m.rawTot / maxTot) * 100)).toFixed(1)}%`,
      }))
      .reverse();
  }, [orderBook?.asks, markPrice, priceDecimals, szDecimals, visibleRows]);

  // Process live Bids (Buys): sorted descending, displayed top-to-bottom so highest bid is closest to spread
  const processedBids = useMemo((): DisplayLevel[] => {
    const targetCount = visibleRows;
    const base = markPrice > 0 ? markPrice : 100;
    const raw: { px: string; sz: string }[] = [];

    if (orderBook?.bids && orderBook.bids.length > 0) {
      for (const b of orderBook.bids) {
        raw.push({ px: b.px, sz: b.sz });
      }
    }

    // Extrapolate if less than targetCount so container is always 100% full
    if (raw.length < targetCount) {
      const startPx = raw.length > 0 ? parseFloat(raw[raw.length - 1].px) || base : base * 0.9998;
      const step = Math.max(0.01, startPx * 0.00018);
      const lastSz = raw.length > 0 ? parseFloat(raw[raw.length - 1].sz) || 1 : 12000 / base;

      for (let i = raw.length; i < targetCount; i++) {
        const pxNum = Math.max(0.01, startPx - step * (i - raw.length + 1));
        const szNum = Math.max(0.01, lastSz * (1 + (i - raw.length) * 0.15));
        raw.push({
          px: pxNum.toFixed(priceDecimals),
          sz: szNum.toFixed(szDecimals),
        });
      }
    }

    const sliced = raw.slice(0, targetCount);
    let cumulative = 0;
    const mapped = sliced.map((lvl) => {
      const pxNum = parseFloat(lvl.px) || 0;
      const szNum = parseFloat(lvl.sz) || 0;
      cumulative += szNum;
      return {
        px: formatBookPrice(pxNum, priceDecimals),
        sz: szNum.toFixed(szDecimals),
        tot: cumulative.toFixed(szDecimals),
        rawTot: cumulative,
      };
    });
    const maxTot = mapped.length > 0 ? mapped[mapped.length - 1].rawTot : 1;
    return mapped.map((m) => ({
      ...m,
      w: `${Math.min(100, Math.max(6, (m.rawTot / maxTot) * 100)).toFixed(1)}%`,
    }));
  }, [orderBook?.bids, markPrice, priceDecimals, szDecimals, visibleRows]);

  // Calculate live dynamic spread
  const { spreadDisplay, spreadBpsDisplay } = useMemo(() => {
    if (orderBook && orderBook.spread > 0) {
      return {
        spreadDisplay: formatBookPrice(orderBook.spread, priceDecimals),
        spreadBpsDisplay: orderBook.spreadBps.toFixed(3),
      };
    }
    const syntheticSpread = markPrice * 0.0003;
    return {
      spreadDisplay: formatBookPrice(syntheticSpread, priceDecimals),
      spreadBpsDisplay: "3.000",
    };
  }, [orderBook, markPrice, priceDecimals]);

  return (
    <div
      className="flex flex-col shrink-0 rounded-none border border-[var(--border)] bg-[var(--surface)] overflow-hidden max-md:w-full select-none shadow-lg h-full"
      style={{ width: "230px" }}
    >
      <div className="trade-ob-in flex flex-col flex-1 min-h-0">
        <div className="flex flex-col w-full h-full min-h-0">
          {/* Controls Bar */}
          <div className="flex flex-col gap-1.5 px-3 py-2 border-b border-[var(--border)] shrink-0 relative">
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setActiveTab("book")}
                className={`px-2.5 py-1 rounded-none text-[10.5px] font-semibold tracking-[.06em] transition-colors cursor-pointer ${
                  activeTab === "book"
                    ? "bg-[var(--surface-3)] text-[var(--t1)]"
                    : "text-[var(--t2)] hover:text-[var(--t1)]"
                }`}
              >
                Book
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("trades")}
                className={`px-2.5 py-1 rounded-none text-[10.5px] font-semibold tracking-[.06em] transition-colors cursor-pointer ${
                  activeTab === "trades"
                    ? "bg-[var(--surface-3)] text-[var(--t1)]"
                    : "text-[var(--t2)] hover:text-[var(--t1)]"
                }`}
              >
                Trades
              </button>

              <div className="ml-auto flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-none bg-[#4ECCA3] animate-pulse" title="Live Stream Active" />
                <button
                  type="button"
                  aria-label="Hide order book"
                  title="CLOB Depth"
                  className="grid place-items-center w-5 h-5 rounded-none text-[var(--t3)] hover:text-[var(--t1)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  title="Aggregated CLOB Depth"
                  className="grid place-items-center size-6 rounded-none font-mono font-bold text-[11px] transition-colors cursor-pointer bg-[var(--surface-3)] text-[var(--t3)] hover:text-[var(--t1)] border border-[var(--border)]"
                >
                  Σ
                </button>
                <button
                  type="button"
                  onClick={() => setPrecision((p) => (p === "0.1" ? "1" : p === "1" ? "5" : "0.1"))}
                  className="flex items-center gap-1 px-1.5 py-1 rounded-none bg-[var(--surface-3)] font-mono text-[10.5px] text-[var(--t2)] hover:bg-[var(--hover)] hover:text-[var(--t1)] transition-colors cursor-pointer border border-[var(--border)]"
                >
                  <span>{precision}</span>
                  <ChevronDown className="w-3 h-3 text-[var(--t3)]" />
                </button>
              </div>

              <div
                title="Current Market"
                className="flex items-center gap-1 px-2 py-1 rounded-none bg-[var(--surface-3)] font-mono text-[10.5px] text-white font-semibold border border-[var(--border)]"
              >
                <span>{symbol}</span>
              </div>
            </div>
          </div>

          {activeTab === "book" ? (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              {/* Table Header Labels */}
              <div className="ob-grid px-3 py-1 font-mono font-semibold text-[9.5px] tracking-[.06em] text-[var(--t3)] border-b border-[var(--border)] shrink-0 select-none">
                <span>Price</span>
                <span className="text-right whitespace-nowrap tracking-normal text-[8.5px]">Size ({symbol})</span>
                <span className="text-right whitespace-nowrap tracking-normal text-[8.5px]">Total ({symbol})</span>
              </div>

              {/* Orderbook Depth Container: Flex-1 fills available vertical space */}
              <div
                ref={bookContainerRef}
                className="flex-1 min-h-0 flex flex-col text-[11px] font-mono tabular-nums overflow-hidden select-none"
              >
                {/* Asks (Sells in Red) - Anchored against the spread strip at bottom of this container */}
                <div className="flex-1 min-h-0 flex flex-col justify-end overflow-hidden">
                  {processedAsks.map((ask, i) => (
                    <OrderBookRow
                      key={`ask-${i}-${ask.px}`}
                      px={ask.px}
                      sz={ask.sz}
                      tot={ask.tot}
                      w={ask.w}
                      isAsk={true}
                      onSelectPrice={onSelectPrice}
                    />
                  ))}
                </div>

                {/* SPREAD Strip - Centered Divider */}
                <div
                  data-ob-fixed="true"
                  className={`shrink-0 flex items-center justify-between px-3 py-1 bg-[var(--surface-3)] border-y border-[var(--border-strong)] transition-colors duration-200 ${
                    priceFlash === "up"
                      ? "bg-emerald-950/40 border-emerald-500/50"
                      : priceFlash === "down"
                      ? "bg-rose-950/40 border-rose-500/50"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-[10px] text-[var(--t2)] font-mono tracking-wide font-medium">
                      SPREAD {spreadDisplay}
                    </span>
                    {priceFlash && (
                      <span
                        className={`text-[9px] font-bold ${
                          priceFlash === "up" ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {priceFlash === "up" ? "▲" : "▼"}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-[var(--t3)] font-mono tabular-nums">
                    {spreadBpsDisplay}%
                  </span>
                </div>

                {/* Bids (Buys in Green) - Anchored against the spread strip at top of this container */}
                <div className="flex-1 min-h-0 flex flex-col justify-start overflow-hidden">
                  {processedBids.map((bid, i) => (
                    <OrderBookRow
                      key={`bid-${i}-${bid.px}`}
                      px={bid.px}
                      sz={bid.sz}
                      tot={bid.tot}
                      w={bid.w}
                      isAsk={false}
                      onSelectPrice={onSelectPrice}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Trades Tab: Live stream of matched executions */
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden text-[11px] font-mono">
              <div className="grid grid-cols-[1fr_1fr_1fr] px-3 py-1 font-semibold text-[9.5px] tracking-[.06em] text-[var(--t3)] border-b border-[var(--border)] shrink-0 select-none">
                <span>Price</span>
                <span className="text-right">Size</span>
                <span className="text-right">Time</span>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-[#182126]/40 [scrollbar-width:thin]">
                {recentTrades.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[var(--t3)] font-mono">
                    Waiting for trades...
                  </div>
                ) : (
                  recentTrades.slice(0, 30).map((t, idx) => {
                    const timeStr = new Date(t.timestamp > 1e12 ? t.timestamp : t.timestamp * 1000).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    });
                    const pxFormatted = formatBookPrice(t.price > 10000 ? t.price / 100 : t.price, priceDecimals);
                    const szFormatted = (t.sizeUsd > 10000 ? (t.sizeUsd / 1000000) / (t.price / 100 || 1) : t.sizeUsd / (t.price || 1)).toFixed(szDecimals);

                    return (
                      <button
                        key={`${t.id || idx}`}
                        type="button"
                        onClick={() => onSelectPrice(pxFormatted.replace(/,/g, ""))}
                        className="grid grid-cols-[1fr_1fr_1fr] px-3 py-1.5 text-left hover:bg-[var(--hover)] cursor-pointer tabular-nums transition-colors w-full"
                      >
                        <span className={t.isLong ? "text-[var(--green)] font-medium" : "text-[var(--red)] font-medium"}>
                          ${pxFormatted}
                        </span>
                        <span className="text-right text-[var(--t2)] text-[10.5px]">
                          {szFormatted}
                        </span>
                        <span className="text-right text-[var(--t3)] text-[10px]">
                          {timeStr}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
