"use client";

import React, { useState, useEffect, useMemo, useRef, useDeferredValue, useCallback } from "react";
import { createPortal } from "react-dom";
import { Search, X, Star } from "lucide-react";
import { MarketContext } from "@/lib/hyperliquid";
import { MARKETS_METADATA, MarketMetadata } from "@/stores/useTradingStore";
import { MarketIcon } from "./MarketIcon";

type MarketCategory = "ALL" | "FAVORITES" | "COMMODITIES" | "EQUITY" | "CRYPTO";
type SortField = "name" | "price" | "change" | "volume";
type SortDirection = "asc" | "desc";

interface MarketSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMarketName: string;
  onSelectMarket: (marketName: string) => void;
  markets: MarketContext[];
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

const DEFAULT_FAVORITES = ["BTC", "ETH", "NATGAS", "NVDA", "TSLA"];

// Vercel Best Practice: server-hoist-static-io / pure utility hoisting
function formatPrice(val: number, decimals: number = 2): string {
  if (!val || isNaN(val)) return "0.00";
  if (val < 10) {
    return val.toFixed(Math.max(3, decimals));
  }
  return val.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatVolume(val: number): string {
  if (!val || isNaN(val)) return "$0";
  if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(2)}B`;
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
}

interface MarketRowProps {
  market: MarketContext & { meta: MarketMetadata };
  isSelected: boolean;
  isHighlighted: boolean;
  isFav: boolean;
  onSelect: (name: string) => void;
  onToggleFavorite: (symbol: string, e: React.MouseEvent) => void;
  onMouseEnter: () => void;
}

// Vercel Best Practice: rerender-memo & rendering-content-visibility
// 100% solid opaque row backgrounds (zero transparency)
const MarketRow = React.memo<MarketRowProps>(function MarketRow({
  market: m,
  isSelected,
  isHighlighted,
  isFav,
  onSelect,
  onToggleFavorite,
  onMouseEnter,
}) {
  const isPositive = m.change24h >= 0;

  return (
    <div
      onClick={() => onSelect(m.name)}
      onMouseEnter={onMouseEnter}
      style={{ contentVisibility: "auto", containIntrinsicSize: "0 48px" }}
      className={`grid grid-cols-[30px_1.7fr_1fr_1fr_1fr] px-3.5 py-2 items-center transition-colors cursor-pointer select-none h-[48px] border-b border-[#182028] ${
        isSelected
          ? "bg-[#112620] border-l-2 border-l-[#4ECCA3]"
          : isHighlighted
          ? "bg-[#18232C] border-l-2 border-l-[#4ECCA3]/60"
          : "bg-[#0E1318] hover:bg-[#151D25] border-l-2 border-l-transparent"
      }`}
    >
      {/* Star Favorite */}
      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={(e) => onToggleFavorite(m.name, e)}
          className="text-[#4E5E6B] hover:text-amber-400 transition-colors p-1 cursor-pointer"
          title={isFav ? "Remove favorite" : "Add to favorites"}
        >
          <Star
            className={`w-3.5 h-3.5 ${
              isFav ? "text-amber-400 fill-amber-400" : ""
            }`}
          />
        </button>
      </div>

      {/* Market & Icon */}
      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        <MarketIcon symbol={m.name} size={24} />
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 leading-tight">
            <span className="font-mono font-semibold text-xs text-white tracking-tight">
              {m.name}-USD
            </span>
            <span className="text-[9px] font-mono px-1 py-0.2 rounded-none bg-[#1A232C] border border-[#263340] text-[#8CA0AE]">
              {m.meta.maxLeverage || 1000}x
            </span>
          </div>
          <span className="text-[10.5px] text-[#718390] truncate leading-tight mt-0.5">
            {m.meta.name}
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="font-mono text-xs text-white text-right tabular-nums font-medium">
        ${formatPrice(m.markPx, m.szDecimals)}
      </div>

      {/* 24h Change */}
      <div
        className={`font-mono text-xs text-right tabular-nums font-medium ${
          isPositive ? "text-[#4ECCA3]" : "text-[#EB4D5C]"
        }`}
      >
        {isPositive ? "+" : ""}
        {m.change24h ? m.change24h.toFixed(2) : "0.00"}%
      </div>

      {/* 24h Volume */}
      <div className="font-mono text-xs text-[#8A9BA8] text-right tabular-nums">
        {formatVolume(m.dayVolumeUsd)}
      </div>
    </div>
  );
});

export const MarketSelectorModal = React.memo<MarketSelectorModalProps>(function MarketSelectorModal({
  isOpen,
  onClose,
  selectedMarketName,
  onSelectMarket,
  markets = [],
}) {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Vercel Best Practice: rerender-use-deferred-value keeps input 60fps responsive
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory>("ALL");
  const [sortField, setSortField] = useState<SortField>("volume");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  // Vercel Best Practice: rerender-lazy-state-init prevents duplicate render on mount
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === "undefined") return DEFAULT_FAVORITES;
    try {
      const saved = localStorage.getItem("alvion_favorite_markets");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_FAVORITES;
  });

  const favoritesSet = useMemo(() => new Set(favorites), [favorites]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll while modal is open to ensure rock-solid non-wonky scrolling
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Save favorites to localStorage with stable callback
  const handleToggleFavorite = useCallback((symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const updated = prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol];
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("alvion_favorite_markets", JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
      return updated;
    });
  }, []);

  const handleSelectMarket = useCallback((name: string) => {
    onSelectMarket(name);
    onClose();
  }, [onSelectMarket, onClose]);

  // Auto focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery("");
      setHighlightedIndex(0);
    }
  }, [isOpen]);

  // Combine full market info (from live API and fallback metadata)
  const fullMarketList = useMemo(() => {
    const list: (MarketContext & { meta: MarketMetadata })[] = [];
    const seen = new Set<string>();

    // 1. First add all markets from live API
    markets.forEach((m) => {
      const sym = m.name.replace("-PERP", "");
      seen.add(sym);
      const meta = MARKETS_METADATA[sym] || {
        symbol: sym,
        name: sym,
        category: "CRYPTO",
        exchangeBadge: "Robinhood Chain",
        maxLeverage: m.maxLeverage || 1000,
        initialMarginPct: 0.1,
        is24x7: true,
      };
      list.push({ ...m, name: sym, meta });
    });

    // 2. Also ensure all registered MARKETS_METADATA are present even if API response is partial
    Object.keys(MARKETS_METADATA).forEach((sym) => {
      if (!seen.has(sym)) {
        const meta = MARKETS_METADATA[sym];
        const defaultPx = sym === "NATGAS" ? 2.842 : sym === "CRUDE" ? 71.24 : sym === "GOLD" ? 2742.6 : sym === "SILVER" ? 31.85 : 100;
        list.push({
          name: sym,
          oraclePx: defaultPx,
          markPx: defaultPx,
          midPx: defaultPx,
          prevDayPx: defaultPx * 0.985,
          change24h: 1.52,
          fundingRate: 0.00001,
          dayVolumeUsd: 14_500_000,
          openInterest: 8_200_000,
          szDecimals: sym === "NATGAS" || sym === "SILVER" ? 3 : 2,
          maxLeverage: meta.maxLeverage,
          impactBidPx: defaultPx * 0.9995,
          impactAskPx: defaultPx * 1.0005,
          meta,
        });
      }
    });

    return list;
  }, [markets]);

  // Filter and sort markets with useDeferredValue
  // When search query is non-empty, search across ALL categories so results are never accidentally hidden
  const filteredMarkets = useMemo(() => {
    const q = deferredSearchQuery.toLowerCase().trim();
    const isFavTab = selectedCategory === "FAVORITES";
    const hasCategoryFilter = selectedCategory !== "ALL" && !isFavTab && !q;

    const result = fullMarketList.filter((m) => {
      if (!q && isFavTab && !favoritesSet.has(m.name)) return false;
      if (hasCategoryFilter && m.meta.category !== selectedCategory) return false;
      if (q) {
        return (
          m.name.toLowerCase().includes(q) ||
          m.meta.name.toLowerCase().includes(q) ||
          m.meta.exchangeBadge.toLowerCase().includes(q)
        );
      }
      return true;
    });

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === "price") {
        comparison = a.markPx - b.markPx;
      } else if (sortField === "change") {
        comparison = a.change24h - b.change24h;
      } else if (sortField === "volume") {
        comparison = a.dayVolumeUsd - b.dayVolumeUsd;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [fullMarketList, selectedCategory, favoritesSet, deferredSearchQuery, sortField, sortDirection]);

  // Reset highlightedIndex when search or category changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [deferredSearchQuery, selectedCategory]);

  // Handle keyboard navigation (ArrowUp, ArrowDown, Enter, Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) => Math.min(prev + 1, Math.max(0, filteredMarkets.length - 1)));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredMarkets[highlightedIndex]) {
          handleSelectMarket(filteredMarkets[highlightedIndex].name);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, filteredMarkets, highlightedIndex, handleSelectMarket]);

  const handleHeaderSort = useCallback((field: SortField) => {
    setSortField((prevField) => {
      if (prevField === field) {
        setSortDirection((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
        return prevField;
      }
      setSortDirection("desc");
      return field;
    });
  }, []);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    /* Rock-Solid Centered Screen Container (non-wonky, pure flexbox centering) */
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Select Market"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 select-none pointer-events-auto"
    >
      {/* 1. Backdrop with slight blur (clean, quiet, professional) */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-150 cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. 100% Solid, Opaque Modal Window in the Middle of the App */}
      <div
        ref={popoverRef}
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "min(580px, 86vh)" }}
        className="relative z-10 w-full max-w-[640px] bg-[#0E1318] border border-[#232C36] rounded-none shadow-[0_24px_64px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden text-white animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Search Bar Header with Close Button */}
        <div className="p-3 border-b border-[#1E2630] bg-[#121820] flex items-center gap-2.5">
          <div className="relative flex-1 flex items-center bg-[#090D11] border border-[#263340] px-3 py-1.5 rounded-none">
            <Search className="w-4 h-4 text-[#6A7B87] shrink-0 mr-2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search markets (e.g. NATGAS, BTC, NVDA)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder:text-[#556572] outline-none font-mono"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-[#6A7B87] hover:text-white cursor-pointer ml-1"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-none border border-[#263340] bg-[#090D11] hover:bg-[#18232D] text-[#8CA0AE] hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Minimal Category Tabs */}
        <div className="flex items-center px-3.5 border-b border-[#1E2630] bg-[#0E1318] gap-1 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => { setSelectedCategory("FAVORITES"); setSearchQuery(""); }}
            className={`px-3 py-2 font-medium transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
              selectedCategory === "FAVORITES"
                ? "border-amber-400 text-amber-300 bg-[#141B22]"
                : "border-transparent text-[#768794] hover:text-white hover:bg-[#121820]"
            }`}
          >
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>Favorites</span>
          </button>

          <button
            type="button"
            onClick={() => { setSelectedCategory("ALL"); setSearchQuery(""); }}
            className={`px-3 py-2 font-medium transition-colors cursor-pointer border-b-2 ${
              selectedCategory === "ALL"
                ? "border-[#4ECCA3] text-white bg-[#141B22]"
                : "border-transparent text-[#768794] hover:text-white hover:bg-[#121820]"
            }`}
          >
            All
          </button>

          <button
            type="button"
            onClick={() => { setSelectedCategory("COMMODITIES"); setSearchQuery(""); }}
            className={`px-3 py-2 font-medium transition-colors cursor-pointer border-b-2 ${
              selectedCategory === "COMMODITIES"
                ? "border-[#4ECCA3] text-white bg-[#141B22]"
                : "border-transparent text-[#768794] hover:text-white hover:bg-[#121820]"
            }`}
          >
            Commodities
          </button>

          <button
            type="button"
            onClick={() => { setSelectedCategory("EQUITY"); setSearchQuery(""); }}
            className={`px-3 py-2 font-medium transition-colors cursor-pointer border-b-2 ${
              selectedCategory === "EQUITY"
                ? "border-[#4ECCA3] text-white bg-[#141B22]"
                : "border-transparent text-[#768794] hover:text-white hover:bg-[#121820]"
            }`}
          >
            Shares
          </button>

          <button
            type="button"
            onClick={() => { setSelectedCategory("CRYPTO"); setSearchQuery(""); }}
            className={`px-3 py-2 font-medium transition-colors cursor-pointer border-b-2 ${
              selectedCategory === "CRYPTO"
                ? "border-[#4ECCA3] text-white bg-[#141B22]"
                : "border-transparent text-[#768794] hover:text-white hover:bg-[#121820]"
            }`}
          >
            Crypto
          </button>
        </div>

        {/* Opaque Table Header */}
        <div className="grid grid-cols-[30px_1.7fr_1fr_1fr_1fr] px-3.5 py-2.5 bg-[#090D11] border-b border-[#1E2630] text-[10px] font-mono tracking-wider text-[#6A7B87] select-none">
          <div className="flex items-center justify-center">★</div>

          <button
            type="button"
            onClick={() => handleHeaderSort("name")}
            className="flex items-center gap-1 hover:text-white text-left cursor-pointer transition-colors"
          >
            <span>MARKET</span>
            {sortField === "name" && (
              <span className="text-[#4ECCA3] text-[9px] font-bold">
                {sortDirection === "asc" ? "▲" : "▼"}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleHeaderSort("price")}
            className="flex items-center justify-end gap-1 hover:text-white text-right cursor-pointer transition-colors"
          >
            <span>PRICE</span>
            {sortField === "price" && (
              <span className="text-[#4ECCA3] text-[9px] font-bold">
                {sortDirection === "asc" ? "▲" : "▼"}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleHeaderSort("change")}
            className="flex items-center justify-end gap-1 hover:text-white text-right cursor-pointer transition-colors"
          >
            <span>24H CHANGE</span>
            {sortField === "change" && (
              <span className="text-[#4ECCA3] text-[9px] font-bold">
                {sortDirection === "asc" ? "▲" : "▼"}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleHeaderSort("volume")}
            className="flex items-center justify-end gap-1 hover:text-white text-right cursor-pointer transition-colors"
          >
            <span>24H VOLUME</span>
            {sortField === "volume" && (
              <span className="text-[#4ECCA3] text-[9px] font-bold">
                {sortDirection === "asc" ? "▲" : "▼"}
              </span>
            )}
          </button>
        </div>

        {/* Scrollable Market Rows */}
        <div
          ref={listContainerRef}
          className="overflow-y-auto max-h-[380px] bg-[#0E1318] divide-y divide-[#161D24] [scrollbar-width:thin] [scrollbar-color:#26343C_transparent] overscroll-contain flex-1"
        >
          {filteredMarkets.length === 0 ? (
            <div className="py-14 text-center text-xs text-[#6A7B87] flex flex-col items-center gap-2">
              <span>No markets found matching &quot;{searchQuery}&quot;</span>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("ALL");
                }}
                className="text-[#4ECCA3] hover:underline cursor-pointer text-xs"
              >
                Reset search
              </button>
            </div>
          ) : (
            filteredMarkets.map((m, index) => (
              <MarketRow
                key={m.name}
                market={m}
                isSelected={selectedMarketName === m.name}
                isHighlighted={highlightedIndex === index}
                isFav={favoritesSet.has(m.name)}
                onSelect={handleSelectMarket}
                onToggleFavorite={handleToggleFavorite}
                onMouseEnter={() => setHighlightedIndex(index)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
});
