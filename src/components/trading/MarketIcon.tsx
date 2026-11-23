"use client";

import React, { useState } from "react";

// Official high-resolution asset icons from QFEX CDN & CoinGecko / Robinhood canonical CDNs
export const ASSET_LOGOS: Record<string, string> = {
  // Commodities from QFEX official CDN (800x800 derivative icons)
  NATGAS: "https://assets.qfex.com/ticker-symbols/natgas/derivatives/800x800.png",
  CRUDE: "https://assets.qfex.com/ticker-symbols/oil/derivatives/800x800.png",
  GOLD: "https://assets.qfex.com/ticker-symbols/gold/derivatives/800x800.png",
  SILVER: "https://assets.qfex.com/ticker-symbols/silver/derivatives/800x800.png",

  // Equities & Shares from QFEX official CDN
  NVDA: "https://assets.qfex.com/ticker-symbols/nvda/derivatives/800x800.png",
  AAPL: "https://assets.qfex.com/ticker-symbols/aapl/derivatives/800x800.png",
  TSLA: "https://assets.qfex.com/ticker-symbols/tsla/derivatives/800x800.png",
  MSFT: "https://assets.qfex.com/ticker-symbols/msft/derivatives/800x800.png",
  AMZN: "https://assets.qfex.com/ticker-symbols/amzn/derivatives/800x800.png",
  GOOGL: "https://assets.qfex.com/ticker-symbols/googl/derivatives/800x800.png",
  META: "https://assets.qfex.com/ticker-symbols/meta/derivatives/800x800.png",
  COIN: "https://assets.qfex.com/ticker-symbols/coin/derivatives/800x800.png",
  MSTR: "https://assets.qfex.com/ticker-symbols/mstr/derivatives/800x800.png",
  HOOD: "https://assets.qfex.com/ticker-symbols/hood/derivatives/800x800.png",
  PLTR: "https://assets.qfex.com/ticker-symbols/pltr/derivatives/800x800.png",
  AMD: "https://assets.qfex.com/ticker-symbols/amd/derivatives/800x800.png",
  NFLX: "https://assets.qfex.com/ticker-symbols/nflx/derivatives/800x800.png",
  QQQ: "https://assets.qfex.com/ticker-symbols/us100/derivatives/800x800.png",

  // ETFs & Specialized Token Shares
  SPY: "https://cdn.robinhood.com/ncw_assets/logos/0x5a8d9b13c2f901248a31e8749bc28913b93c9e4f.png",
  APLD: "https://cdn.robinhood.com/ncw_assets/logos/0xb8dbf92f9741c9ac1c32115e78581f23509916fd.png",

  // Major Crypto & Altcoins
  BTC: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  ETH: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  SOL: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  AVAX: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
  SUI: "https://assets.coingecko.com/coins/images/26375/small/sui-ocean-square.png",
};

interface MarketIconProps {
  symbol: string;
  size?: number;
  className?: string;
}

// Vercel Best Practice: rerender-memo & isolated rendering
export const MarketIcon = React.memo<MarketIconProps>(function MarketIcon({
  symbol,
  size = 22,
  className = "",
}) {
  const [hasError, setHasError] = useState(false);
  const cleanSymbol = symbol.replace("-PERP", "").replace("-USD", "").replace("-USDCX", "");
  const logoUrl = ASSET_LOGOS[cleanSymbol];

  if (logoUrl && !hasError) {
    return (
      <div
        className={`shrink-0 overflow-hidden rounded-full bg-[#151D22] border border-[#232F36] flex items-center justify-center select-none ${className}`}
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt={cleanSymbol}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Minimalist fallback badge with 2-letter uppercase symbol
  return (
    <div
      className={`shrink-0 rounded-full bg-[#162026] border border-[#24333D] text-[#8EA2AF] flex items-center justify-center font-mono font-bold select-none ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(8, Math.round(size * 0.42)),
      }}
    >
      {cleanSymbol.slice(0, 2)}
    </div>
  );
});

