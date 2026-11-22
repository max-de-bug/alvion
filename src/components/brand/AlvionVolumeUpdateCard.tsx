import React from "react";
import { AlvionBirdLogo } from "./AlvionBirdLogo";

export interface VolumeUpdateCardProps {
  currentVolume?: string;
  daysPeriod?: string;
  projectedVolume?: string;
  month1?: { name: string; volume: string; heightPercent?: number };
  month2?: { name: string; volume: string; heightPercent?: number };
  month3?: { name: string; volume: string; heightPercent?: number };
  className?: string;
  style?: React.CSSProperties;
}

export const AlvionVolumeUpdateCard: React.FC<VolumeUpdateCardProps> = ({
  currentVolume = "$142.8M",
  daysPeriod = "First 20 days of November",
  projectedVolume = "$250M+",
  month1 = { name: "September", volume: "$12.4M" },
  month2 = { name: "October", volume: "$86.2M" },
  month3 = { name: "November", volume: "$148.5M+" },
  className = "",
  style,
}) => {
  return (
    <div
      id="alvion-volume-update-card"
      style={{
        backgroundColor: "#050E09",
        color: "#DFE4DA",
        fontFamily: 'var(--font-lato), "Lato", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        ...style,
      }}
      className={`relative w-full max-w-[1200px] aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/11] rounded-3xl overflow-hidden select-none border border-[rgba(223,228,218,0.14)] shadow-2xl shadow-black/80 flex flex-col justify-between p-8 sm:p-12 md:p-14 ${className}`}
    >
      {/* 1. Deep Celestial Emerald Ambient Atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle 850px at 82% 38%, rgba(82, 183, 136, 0.22) 0%, transparent 68%),
            radial-gradient(circle 700px at 18% 75%, rgba(35, 65, 46, 0.38) 0%, transparent 72%),
            #050E09
          `,
        }}
      />

      {/* 2. Floor Horizon Radiant Light Shelf Underneath the Pillars */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "108px",
          right: "40px",
          width: "65%",
          height: "90px",
          background: "radial-gradient(ellipse 700px 70px at 50% 50%, rgba(82, 183, 136, 0.32) 0%, transparent 75%)",
          filter: "blur(18px)",
        }}
      />

      {/* Top Header & Brand Identity */}
      <header className="relative z-10 flex items-center justify-between w-full">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3">
          <AlvionBirdLogo size={36} variant="light" />
          <span
            style={{
              fontFamily: 'var(--font-newsreader), "Newsreader", Georgia, serif',
              letterSpacing: "-0.02em",
            }}
            className="text-2xl sm:text-3xl font-normal text-[#F4F7F2]"
          >
            Alvion
          </span>
          <span className="hidden sm:inline-block h-3.5 w-[1px] bg-[rgba(223,228,218,0.25)] mx-1" />
          <span className="hidden sm:inline-block text-xs font-mono text-[rgba(223,228,218,0.7)] tracking-wide">
            Robinhood Chain L2
          </span>
        </div>

        <span className="text-xs font-mono text-[rgba(223,228,218,0.6)]">
          Monthly volume
        </span>
      </header>

      {/* Main Grid: Left Metrics vs Right 3D Glass Pillars */}
      <main className="relative z-10 grid grid-cols-1 md:grid-cols-[1.1fr_1.5fr] gap-8 items-end my-auto py-4 sm:py-6">
        
        {/* Left Column: Big Typographic Numbers */}
        <div className="space-y-6 sm:space-y-8">
          <div>
            {/* Hero Volume Metric in Shimmering Champagne Gold */}
            <h1
              style={{
                fontFamily: 'var(--font-newsreader), "Newsreader", Georgia, serif',
                lineHeight: 0.95,
                letterSpacing: "-0.03em",
                background: "linear-gradient(135deg, #FFFDF8 0%, #F5ECC9 30%, #E5C07B 65%, #C29640 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
              className="text-6xl sm:text-7xl md:text-[84px] font-normal"
            >
              {currentVolume}
            </h1>
            
            <p className="font-mono text-xs sm:text-[13px] tracking-wide text-[rgba(223,228,218,0.85)] mt-3">
              {daysPeriod}
            </p>
          </div>

          {/* Thin Hairline Divider */}
          <div className="w-16 h-[1px] bg-[rgba(223,228,218,0.2)]" />

          {/* Secondary Metric */}
          <div className="space-y-1">
            <div
              style={{
                fontFamily: 'var(--font-newsreader), "Newsreader", Georgia, serif',
                letterSpacing: "-0.02em",
              }}
              className="text-3xl sm:text-4xl text-[#F4F7F2] font-normal"
            >
              {projectedVolume}
            </div>
            <p className="font-mono text-xs tracking-wide text-[rgba(223,228,218,0.65)]">
              Projected month close
            </p>
          </div>
        </div>

        {/* Right Column: 3 Glowing Glassmorphic Emerald Pillars with Spline */}
        <div className="relative w-full h-[280px] sm:h-[340px] md:h-[390px] flex items-end justify-between px-2 sm:px-6">
          
          {/* SVG Ascending Trajectory Spline & Glowing Nodes */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="curveGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E5C07B" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#52B788" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#FFFDF8" stopOpacity="1" />
              </linearGradient>
              <filter id="glowFilter" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="1.8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Smooth Continuous Trajectory Curve */}
            {/* Exactly touches top-center of each pillar: Node1 (16.6, 74), Node2 (50.0, 47), Node3 (83.3, 22) */}
            <path
              d="M 16.6 74 C 28 73, 38 59, 50 47 C 62 34, 72 23, 83.3 22"
              fill="none"
              stroke="url(#curveGradient)"
              strokeWidth="1.2"
              filter="url(#glowFilter)"
            />

            {/* Milestone Node 1 (September - 16.6%, 74%) */}
            <circle cx="16.6" cy="74" r="2.8" fill="rgba(82, 183, 136, 0.45)" stroke="#E5C07B" strokeWidth="0.8" />
            <circle cx="16.6" cy="74" r="1.3" fill="#FFFDF8" />

            {/* Milestone Node 2 (October - 50.0%, 47%) */}
            <circle cx="50" cy="47" r="3.2" fill="rgba(82, 183, 136, 0.45)" stroke="#52B788" strokeWidth="0.8" />
            <circle cx="50" cy="47" r="1.5" fill="#FFFDF8" />

            {/* Milestone Node 3 (November Pinnacle - 83.3%, 22%) */}
            <circle cx="83.3" cy="22" r="5.5" fill="rgba(82, 183, 136, 0.3)" filter="url(#glowFilter)" />
            <circle cx="83.3" cy="22" r="3.6" fill="rgba(82, 183, 136, 0.6)" stroke="#52B788" strokeWidth="1" filter="url(#glowFilter)" />
            <circle cx="83.3" cy="22" r="1.8" fill="#FFFDF8" />
          </svg>

          {/* Pillar 1: September (Body: 72px / Top Y: 74%) */}
          <div className="relative flex flex-col items-center w-[28%] sm:w-[26%] z-10 group">
            <div
              style={{
                fontFamily: 'var(--font-newsreader), "Newsreader", Georgia, serif',
                letterSpacing: "-0.01em",
              }}
              className="text-lg sm:text-xl font-normal text-[#F4F7F2] mb-4.5 transition-transform group-hover:-translate-y-1"
            >
              {month1.volume}
            </div>

            {/* Glass Pillar Body */}
            <div
              style={{
                height: "72px",
                background: "linear-gradient(180deg, rgba(82, 183, 136, 0.42) 0%, rgba(35, 65, 46, 0.32) 40%, rgba(7, 21, 14, 0.88) 100%)",
                border: "1.5px solid rgba(82, 183, 136, 0.45)",
                borderTop: "2.5px solid rgba(244, 247, 242, 0.9)",
                borderRadius: "16px 16px 6px 6px",
                boxShadow: "0 0 25px rgba(82, 183, 136, 0.22) inset, 0 12px 30px rgba(0, 0, 0, 0.7)",
              }}
              className="w-full relative overflow-hidden backdrop-blur-sm"
            >
              {/* Internal vertical refraction sheen */}
              <div className="absolute top-0 bottom-0 left-2 w-[1px] bg-white/20" />
            </div>

            <div className="mt-3 text-center">
              <span className="font-mono text-xs text-[rgba(223,228,218,0.7)] block">
                {month1.name}
              </span>
            </div>
          </div>

          {/* Pillar 2: October (Body: 180px / Top Y: 47%) */}
          <div className="relative flex flex-col items-center w-[28%] sm:w-[26%] z-10 group">
            <div
              style={{
                fontFamily: 'var(--font-newsreader), "Newsreader", Georgia, serif',
                letterSpacing: "-0.01em",
              }}
              className="text-xl sm:text-2xl font-normal text-[#F4F7F2] mb-4.5 transition-transform group-hover:-translate-y-1"
            >
              {month2.volume}
            </div>

            {/* Glass Pillar Body */}
            <div
              style={{
                height: "180px",
                background: "linear-gradient(180deg, rgba(82, 183, 136, 0.48) 0%, rgba(35, 65, 46, 0.35) 40%, rgba(7, 21, 14, 0.88) 100%)",
                border: "1.5px solid rgba(82, 183, 136, 0.55)",
                borderTop: "2.5px solid rgba(244, 247, 242, 0.92)",
                borderRadius: "18px 18px 6px 6px",
                boxShadow: "0 0 32px rgba(82, 183, 136, 0.28) inset, 0 16px 36px rgba(0, 0, 0, 0.75)",
              }}
              className="w-full relative overflow-hidden backdrop-blur-sm"
            >
              {/* Internal vertical refraction sheen */}
              <div className="absolute top-0 bottom-0 left-2.5 w-[1px] bg-white/25" />
            </div>

            <div className="mt-3 text-center">
              <span className="font-mono text-xs text-[rgba(223,228,218,0.75)] block">
                {month2.name}
              </span>
            </div>
          </div>

          {/* Pillar 3: November (Body: 280px / Top Y: 22%) */}
          <div className="relative flex flex-col items-center w-[28%] sm:w-[26%] z-10 group">
            <div
              style={{
                fontFamily: 'var(--font-newsreader), "Newsreader", Georgia, serif',
                letterSpacing: "-0.01em",
              }}
              className="text-2xl sm:text-3xl font-semibold text-[#F4F7F2] mb-4.5 transition-transform group-hover:-translate-y-1"
            >
              {month3.volume}
            </div>

            {/* Glass Pillar Body with intense top aura */}
            <div
              style={{
                height: "280px",
                background: "linear-gradient(180deg, rgba(82, 183, 136, 0.58) 0%, rgba(35, 65, 46, 0.4) 35%, rgba(7, 21, 14, 0.92) 100%)",
                border: "1.8px solid rgba(82, 183, 136, 0.72)",
                borderTop: "3px solid #FFFDF8",
                borderRadius: "20px 20px 6px 6px",
                boxShadow: "0 0 45px rgba(82, 183, 136, 0.42) inset, 0 20px 48px rgba(0, 0, 0, 0.8), 0 0 50px rgba(82, 183, 136, 0.35)",
              }}
              className="w-full relative overflow-hidden backdrop-blur-sm"
            >
              {/* Internal vertical refraction sheen */}
              <div className="absolute top-0 bottom-0 left-3 w-[1.5px] bg-white/35" />
              {/* Top ambient highlight bar */}
              <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/20 to-transparent" />
            </div>

            <div className="mt-3 text-center">
              <span className="font-mono text-xs text-[#52B788] font-medium block">
                {month3.name}
              </span>
            </div>
          </div>

        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 pt-4 border-t border-[rgba(223,228,218,0.12)] flex items-center justify-between text-xs font-mono text-[rgba(223,228,218,0.6)]">
        <span>November 2026 update</span>
        <span>alvion.fi</span>
      </footer>
    </div>
  );
};

export default AlvionVolumeUpdateCard;
