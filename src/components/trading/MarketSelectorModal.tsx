"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Search, X, Star, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { MarketContext } from "@/lib/hyperliquid";
import { MARKETS_METADATA, MarketMetadata } from "@/stores/useTradingStore";

type MarketCategory = "ALL" | "FAVORITES" | "CRYPTO" | "COMMODITIES" | "EQUITY";

type SortField = "name" | "price" | "change" | "volume";
type SortDirection = "asc" | "desc";

interface MarketSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMarketName: string;
  onSelectMarket: (marketName: string) => void;
  markets: MarketContext[];
}

const DEFAULT_FAVORITES = ["BTC", "ETH", "NATGAS", "SPY", "NVDA"];

export const MarketSelectorModal = React.memo<MarketSelectorModalProps>(function MarketSelectorModal({
  isOpen,
  onClose,
  selectedMarketName,
  onSelectMarket,
  markets = [],
}) {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory>("ALL");
  const [sortField, setSortField] = useState<SortField>("volume");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [favorites, setFavorites] = useState<string[]>(DEFAULT_FAVORITES);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Load favorites from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("alvion_favorite_markets");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setFavorites(parsed);
          }
        }
      } catch {
        // use fallback
      }
    }
  }, []);

  // Save favorites to localStorage
  const toggleFavorite = (symbol: string, e: React.MouseEvent) => {
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
  };

  // Auto focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

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
        maxLeverage: m.maxLeverage || 50,
        initialMarginPct: 5,
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

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      ALL: fullMarketList.length,
      FAVORITES: fullMarketList.filter((m) => favorites.includes(m.name)).length,
      CRYPTO: fullMarketList.filter((m) => m.meta.category === "CRYPTO").length,
      COMMODITIES: fullMarketList.filter((m) => m.meta.category === "COMMODITIES").length,
      EQUITY: fullMarketList.filter((m) => m.meta.category === "EQUITY").length,
    };
  }, [fullMarketList, favorites]);

  // Filter and sort markets
  const filteredMarkets = useMemo(() => {
    let result = [...fullMarketList];

    // Filter by category
    if (selectedCategory === "FAVORITES") {
      result = result.filter((m) => favorites.includes(m.name));
    } else if (selectedCategory === "CRYPTO") {
      result = result.filter((m) => m.meta.category === "CRYPTO");
    } else if (selectedCategory === "COMMODITIES") {
      result = result.filter((m) => m.meta.category === "COMMODITIES");
    } else if (selectedCategory === "EQUITY") {
      result = result.filter((m) => m.meta.category === "EQUITY");
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.meta.name.toLowerCase().includes(q) ||
          m.meta.exchangeBadge.toLowerCase().includes(q)
      );
    }

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
  }, [fullMarketList, selectedCategory, favorites, searchQuery, sortField, sortDirection]);

  const handleHeaderSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const formatPrice = (val: number, decimals: number = 2) => {
    if (!val || isNaN(val)) return "0.00";
    if (val < 10) {
      return val.toFixed(Math.max(3, decimals));
    }
    return val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatVolume = (val: number) => {
    if (!val || isNaN(val)) return "$0";
    if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(2)}B`;
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
    return `$${val.toFixed(0)}`;
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Select Market"
      className="fixed inset-0 z-[100]"
    >
      {/* 1. Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-[3px] transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* 2. QFEX Screen-Centered Modal Window with position: absolute */}
      <div
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[94vw] max-w-[680px] bg-[#0C1215] border border-[#1E272C] rounded-none shadow-2xl shadow-black/95 flex flex-col overflow-hidden text-white select-none animate-in zoom-in-95 fade-in duration-150"
        style={{ maxHeight: "min(640px, 88vh)" }}
      >
        {/* Top Header with Title and Close Button */}
        <div className="px-4 py-3 border-b border-[#1E272C] bg-[#10171A] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              <span>Select Market</span>
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-none bg-[#162922] text-[#4ECCA3] border border-[#4ECCA3]/30 font-semibold">
              {fullMarketList.length} Markets
            </span>
            <span className="hidden sm:inline-block text-[11px] font-mono text-[#728087]">
              Robinhood Chain Perps
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-[10px] font-mono text-[#52636B] border border-[#212D33] px-1.5 py-0.5 rounded-none">
              ESC
            </span>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-none border border-[#212D33] bg-[#141B1F] hover:bg-[#1E272C] text-[#8C9DA6] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="p-3 border-b border-[#1E272C] bg-[#0E1518] flex items-center gap-2.5">
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-[#728087] pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search market or symbol (e.g. NATGAS, BTC, NVDA)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[40px] pl-9 pr-8 bg-[#141B1F] border border-[#212D33] focus:border-[#4ECCA3]/60 rounded-none text-xs text-white placeholder:text-[#6F7E85] outline-none font-mono transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 text-[#728087] hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center px-3 border-b border-[#1E272C] bg-[#0E1518] overflow-x-auto [scrollbar-width:none] text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory("ALL")}
            className={`py-2.5 px-3 rounded-none font-semibold transition-colors shrink-0 cursor-pointer border-b-2 flex items-center gap-1.5 ${selectedCategory === "ALL"
                ? "border-[#4ECCA3] text-white bg-[#141D21]"
                : "border-transparent text-[#8C9DA6] hover:text-white hover:bg-[#121A1E]"
              }`}
          >
            <span>All</span>
            <span className="text-[10px] font-mono px-1 py-0.2 bg-[#1A252B] rounded-none text-[#8C9DA6]">
              {categoryCounts.ALL}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("FAVORITES")}
            className={`py-2.5 px-3 rounded-none font-semibold transition-colors shrink-0 cursor-pointer border-b-2 flex items-center gap-1.5 ${selectedCategory === "FAVORITES"
                ? "border-amber-400 text-amber-300 bg-[#141D21]"
                : "border-transparent text-[#8C9DA6] hover:text-white hover:bg-[#121A1E]"
              }`}
          >
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>Favorites</span>
            <span className="text-[10px] font-mono px-1 py-0.2 bg-[#1A252B] rounded-none text-[#8C9DA6]">
              {categoryCounts.FAVORITES}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("COMMODITIES")}
            className={`py-2.5 px-3 rounded-none font-semibold transition-colors shrink-0 cursor-pointer border-b-2 flex items-center gap-1.5 ${selectedCategory === "COMMODITIES"
                ? "border-[#4ECCA3] text-white bg-[#141D21]"
                : "border-transparent text-[#8C9DA6] hover:text-white hover:bg-[#121A1E]"
              }`}
          >
            <span>Commodities</span>
            <span className="text-[10px] font-mono px-1 py-0.2 bg-[#1A252B] rounded-none text-[#8C9DA6]">
              {categoryCounts.COMMODITIES}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("CRYPTO")}
            className={`py-2.5 px-3 rounded-none font-semibold transition-colors shrink-0 cursor-pointer border-b-2 flex items-center gap-1.5 ${selectedCategory === "CRYPTO"
                ? "border-[#4ECCA3] text-white bg-[#141D21]"
                : "border-transparent text-[#8C9DA6] hover:text-white hover:bg-[#121A1E]"
              }`}
          >
            <span>Crypto</span>
            <span className="text-[10px] font-mono px-1 py-0.2 bg-[#1A252B] rounded-none text-[#8C9DA6]">
              {categoryCounts.CRYPTO}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("EQUITY")}
            className={`py-2.5 px-3 rounded-none font-semibold transition-colors shrink-0 cursor-pointer border-b-2 flex items-center gap-1.5 ${selectedCategory === "EQUITY"
                ? "border-[#4ECCA3] text-white bg-[#141D21]"
                : "border-transparent text-[#8C9DA6] hover:text-white hover:bg-[#121A1E]"
              }`}
          >
            <span>Shares</span>
            <span className="text-[10px] font-mono px-1 py-0.2 bg-[#1A252B] rounded-none text-[#8C9DA6]">
              {categoryCounts.EQUITY}
            </span>
          </button>
        </div>

        {/* Sortable Column Headers */}
        <div className="grid grid-cols-[36px_1.6fr_1fr_1fr_1fr] px-4 py-2.5 bg-[#0E1518] border-b border-[#1E272C] text-[11px] font-medium text-[#728087]">
          <div className="flex items-center justify-center">★</div>

          <button
            type="button"
            onClick={() => handleHeaderSort("name")}
            className="flex items-center gap-1 hover:text-white text-left cursor-pointer transition-colors"
          >
            <span>Market</span>
            {sortField === "name" ? (
              sortDirection === "asc" ? (
                <ChevronUp className="w-3 h-3 text-[#4ECCA3]" />
              ) : (
                <ChevronDown className="w-3 h-3 text-[#4ECCA3]" />
              )
            ) : (
              <ArrowUpDown className="w-2.5 h-2.5 opacity-40" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleHeaderSort("price")}
            className="flex items-center justify-end gap-1 hover:text-white text-right cursor-pointer transition-colors"
          >
            <span>Price</span>
            {sortField === "price" ? (
              sortDirection === "asc" ? (
                <ChevronUp className="w-3 h-3 text-[#4ECCA3]" />
              ) : (
                <ChevronDown className="w-3 h-3 text-[#4ECCA3]" />
              )
            ) : (
              <ArrowUpDown className="w-2.5 h-2.5 opacity-40" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleHeaderSort("change")}
            className="flex items-center justify-end gap-1 hover:text-white text-right cursor-pointer transition-colors"
          >
            <span>24h Change</span>
            {sortField === "change" ? (
              sortDirection === "asc" ? (
                <ChevronUp className="w-3 h-3 text-[#4ECCA3]" />
              ) : (
                <ChevronDown className="w-3 h-3 text-[#4ECCA3]" />
              )
            ) : (
              <ArrowUpDown className="w-2.5 h-2.5 opacity-40" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleHeaderSort("volume")}
            className="flex items-center justify-end gap-1 hover:text-white text-right cursor-pointer transition-colors"
          >
            <span>24h Volume</span>
            {sortField === "volume" ? (
              sortDirection === "asc" ? (
                <ChevronUp className="w-3 h-3 text-[#4ECCA3]" />
              ) : (
                <ChevronDown className="w-3 h-3 text-[#4ECCA3]" />
              )
            ) : (
              <ArrowUpDown className="w-2.5 h-2.5 opacity-40" />
            )}
          </button>
        </div>

        {/* Scrollable Market Rows */}
        <div className="overflow-y-auto flex-1 max-h-[380px] divide-y divide-[#182126] [scrollbar-width:thin] [scrollbar-color:#26343C_transparent]">
          {filteredMarkets.length === 0 ? (
            <div className="py-14 text-center text-xs text-[#728087] flex flex-col items-center gap-2">
              <span>No markets found matching &quot;{searchQuery}&quot;</span>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("ALL");
                }}
                className="text-[#4ECCA3] hover:underline cursor-pointer text-xs"
              >
                Reset search filters
              </button>
            </div>
          ) : (
            filteredMarkets.map((m) => {
              const isSelected = selectedMarketName === m.name;
              const isFav = favorites.includes(m.name);
              const isPositive = m.change24h >= 0;

              return (
                <div
                  key={m.name}
                  onClick={() => {
                    onSelectMarket(m.name);
                    onClose();
                  }}
                  className={`grid grid-cols-[36px_1.6fr_1fr_1fr_1fr] px-4 py-3 items-center transition-colors cursor-pointer ${isSelected
                      ? "bg-[#142320] border-l-2 border-[#4ECCA3]"
                      : "hover:bg-[#141D22] border-l-2 border-transparent"
                    }`}
                >
                  {/* Star Favorite */}
                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(m.name, e)}
                      className="text-[#52636B] hover:text-amber-400 transition-colors p-1 cursor-pointer"
                      title={isFav ? "Remove favorite" : "Add to favorites"}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${isFav ? "text-amber-400 fill-amber-400" : ""
                          }`}
                      />
                    </button>
                  </div>

                  {/* Market & Metadata */}
                  <div className="flex flex-col min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-xs text-white tracking-tight">
                        {m.name}-USDCX
                      </span>
                      <span className="text-[9.5px] font-mono px-1 py-0.2 rounded-none bg-[#1C262B] border border-[#26343C] text-[#8C9DA6]">
                        {m.meta.maxLeverage || 20}x
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10.5px] text-[#728087] truncate">
                      <span className="truncate">{m.meta.name}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="font-mono text-xs font-semibold text-white text-right tabular-nums">
                    ${formatPrice(m.markPx, m.szDecimals)}
                  </div>

                  {/* 24h Change */}
                  <div
                    className={`font-mono text-xs font-semibold text-right tabular-nums ${isPositive ? "text-[#4ECCA3]" : "text-[#EB4D5C]"
                      }`}
                  >
                    {isPositive ? "+" : ""}
                    {m.change24h ? m.change24h.toFixed(2) : "0.00"}%
                  </div>

                  {/* 24h Volume */}
                  <div className="font-mono text-xs text-[#8C9DA6] text-right tabular-nums">
                    {formatVolume(m.dayVolumeUsd)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer with Status & Keyboard Hints */}
        <div className="px-4 py-2.5 bg-[#0E1518] border-t border-[#1E272C] flex items-center justify-between text-[11px] text-[#728087] font-mono">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 bg-[#4ECCA3] rounded-none animate-pulse" />
            <span>Robinhood Chain Live Oracle & CLOB</span>
          </div>
          <div className="flex items-center gap-3 text-[10.5px]">
            <span className="hidden sm:inline">
              Press <kbd className="px-1 py-0.5 bg-[#141B1F] border border-[#212D33] text-white/80">ESC</kbd> to exit
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
});
