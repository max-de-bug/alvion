"use client";

import React, { useState } from "react";
import { ChevronsRight, ArrowUpDown, ChevronDown } from "lucide-react";
import { OrderBookData } from "@/types/trading";

interface OrderBookViewProps {
  orderBook: OrderBookData | null;
  markPrice: number;
  onSelectPrice: (px: string) => void;
}

export const OrderBookView = React.memo<OrderBookViewProps>(function OrderBookView({
  orderBook,
  markPrice,
  onSelectPrice,
}) {
  const [activeTab, setActiveTab] = useState<"book" | "trades">("book");
  const [precision, setPrecision] = useState<"1" | "5" | "10">("1");

  const asks = [
    { px: "60,720", sz: "1.74436", tot: "15.17609", w: "87.4%" },
    { px: "60,711", sz: "1.54588", tot: "13.43173", w: "77.4%" },
    { px: "60,710", sz: "2.07128", tot: "11.88585", w: "68.5%" },
    { px: "60,709", sz: "1.75125", tot: "9.81457", w: "56.5%" },
    { px: "60,708", sz: "1.64129", tot: "8.06332", w: "46.5%" },
    { px: "60,707", sz: "1.63985", tot: "6.42203", w: "37.0%" },
    { px: "60,706", sz: "1.43318", tot: "4.78218", w: "27.6%" },
    { px: "60,705", sz: "1.28451", tot: "3.34900", w: "19.3%" },
    { px: "60,704", sz: "0.57233", tot: "2.06449", w: "11.9%" },
    { px: "60,703", sz: "0.54152", tot: "1.49216", w: "8.6%" },
  ];

  const bids = [
    { px: "60,699", sz: "0.77033", tot: "0.77033", w: "4.4%" },
    { px: "60,698", sz: "0.89469", tot: "1.66502", w: "9.6%" },
    { px: "60,697", sz: "1.03252", tot: "2.69754", w: "15.5%" },
    { px: "60,696", sz: "1.31097", tot: "4.00851", w: "23.1%" },
    { px: "60,695", sz: "2.31310", tot: "6.32161", w: "36.4%" },
    { px: "60,694", sz: "2.33382", tot: "8.65543", w: "49.9%" },
    { px: "60,693", sz: "1.51532", tot: "10.17075", w: "58.6%" },
    { px: "60,692", sz: "2.47804", tot: "12.64879", w: "72.9%" },
    { px: "60,690", sz: "1.92028", tot: "14.56907", w: "83.9%" },
    { px: "60,688", sz: "0.27817", tot: "14.84724", w: "85.5%" },
  ];

  return (
    <div
      className="flex flex-col shrink-0 rounded-[18px] border border-[var(--border)] bg-[var(--surface)] overflow-hidden max-md:w-full select-none shadow-lg"
      style={{ width: "230px" }}
    >
      <div className="trade-ob-in flex flex-col flex-1 min-h-0">
        <div className="flex flex-col w-full h-full">
          {/* Controls Bar */}
          <div className="flex flex-col gap-1.5 px-3 py-2 border-b border-[var(--border)] flex-shrink-0 relative">
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

              <button
                type="button"
                aria-label="Hide order book"
                title="Hide order book"
                className="ml-auto grid place-items-center w-6 h-6 rounded-none text-[var(--t3)] hover:text-[var(--t1)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  title="Aggregate book"
                  className="grid place-items-center size-6 rounded-none font-mono font-bold text-[11px] transition-colors cursor-pointer bg-[var(--surface-3)] text-[var(--t3)] hover:text-[var(--t1)]"
                >
                  Σ
                </button>
                <button
                  type="button"
                  onClick={() => setPrecision((p) => (p === "1" ? "5" : p === "5" ? "10" : "1"))}
                  className="flex items-center gap-1 px-[9px] py-1 rounded-none bg-[var(--surface-3)] font-mono text-[10.5px] text-[var(--t2)] hover:bg-[var(--hover)] hover:text-[var(--t1)] transition-colors cursor-pointer"
                >
                  <span>{precision}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--t3)]" />
                </button>
              </div>

              <button
                type="button"
                title="Display unit"
                className="flex items-center gap-1 px-[9px] py-1 rounded-none bg-[var(--surface-3)] font-mono text-[10.5px] text-[var(--t2)] hover:bg-[var(--hover)] hover:text-[var(--t1)] transition-colors cursor-pointer"
              >
                <span>BTC</span>
                <ArrowUpDown className="w-3.5 h-3.5 text-[var(--t3)]" />
              </button>
            </div>
          </div>

          {/* Table Header Labels */}
          <div className="ob-grid px-3 py-1 font-mono font-semibold text-[9.5px] tracking-[.06em] text-[var(--t3)]">
            <span>Price</span>
            <span className="text-right whitespace-nowrap tracking-normal text-[8.5px]">Size (BTC)</span>
            <span className="text-right whitespace-nowrap tracking-normal text-[8.5px]">Total (BTC)</span>
          </div>

          {/* Asks (Sells in Red) */}
          <div className="flex-1 overflow-hidden flex flex-col text-[11px] font-mono tabular-nums justify-between">
            <div className="flex flex-col">
              {asks.slice(0, 6).map((ask, i) => (
                <button
                  key={`ask-${i}`}
                  type="button"
                  onClick={() => onSelectPrice(ask.px.replace(",", ""))}
                  className="ob-grid px-3 py-[2.5px] relative text-left hover:bg-[var(--hover)] cursor-pointer"
                >
                  <span className="text-[var(--red)] z-10 font-medium">{ask.px}</span>
                  <span className="text-right text-[var(--t2)] z-10 text-[10px]">{ask.sz}</span>
                  <span className="text-right text-[var(--t2)] z-10 text-[10px]">{ask.tot}</span>
                  <span
                    className="absolute right-0 top-0 bottom-0 depth-bar depth-bar--ask pointer-events-none"
                    style={{ width: ask.w }}
                  />
                </button>
              ))}
            </div>

            {/* SPREAD Strip */}
            <div
              data-ob-fixed="true"
              className="flex items-center justify-center gap-3 px-4 py-1.5 bg-[var(--surface-3)] border-y border-[var(--border-strong)]"
            >
              <span className="text-[10px] text-[var(--t2)] font-mono tracking-wide">
                SPREAD 3.00 · 0.005%
              </span>
            </div>

            {/* Bids (Buys in Green) */}
            <div className="flex flex-col">
              {bids.slice(0, 6).map((bid, i) => (
                <button
                  key={`bid-${i}`}
                  type="button"
                  onClick={() => onSelectPrice(bid.px.replace(",", ""))}
                  className="ob-grid px-3 py-[2.5px] relative text-left hover:bg-[var(--hover)] cursor-pointer"
                >
                  <span className="text-[var(--green)] z-10 font-medium">{bid.px}</span>
                  <span className="text-right text-[var(--t2)] z-10 text-[10px]">{bid.sz}</span>
                  <span className="text-right text-[var(--t2)] z-10 text-[10px]">{bid.tot}</span>
                  <span
                    className="absolute right-0 top-0 bottom-0 depth-bar depth-bar--bid pointer-events-none"
                    style={{ width: bid.w }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
