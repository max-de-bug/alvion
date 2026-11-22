import React, { useState } from "react";
import { AlvionBirdLogo } from "./AlvionBirdLogo";

export const PeacefulBirdHeroArt: React.FC = () => {
  const [waveKey, setWaveKey] = useState(0);

  const handleTriggerWave = () => {
    setWaveKey((prev) => prev + 1);
  };

  return (
    <div
      onMouseEnter={handleTriggerWave}
      className="relative w-full h-full min-h-[520px] lg:min-h-screen flex flex-col items-center justify-center overflow-hidden select-none px-6 py-12 cursor-pointer"
    >
      <style>{`
        /* ==============================================================
           Unslop UI: Precision 1px Hairline Acoustic Wavefront
           ============================================================== */
        @keyframes radar-pulse {
          0% {
            transform: scale(0.7);
            opacity: 0.7;
          }
          100% {
            transform: scale(2.4);
            opacity: 0;
          }
        }

        .radar-wave {
          position: absolute;
          width: 220px;
          height: 220px;
          border-radius: 9999px;
          border: 1px solid rgba(223, 228, 218, 0.45);
          pointer-events: none;
          animation: radar-pulse 1.4s cubic-bezier(0.1, 0.8, 0.2, 1) forwards;
          will-change: transform, opacity;
        }

        .radar-wave-delayed {
          animation-delay: 0.22s;
        }

        @media (prefers-reduced-motion: reduce) {
          .radar-wave {
            animation: none !important;
            display: none !important;
          }
        }
      `}</style>

      {/* Solid Deep Midnight Emerald Background with Subtle Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle 800px at 50% 48%, #0A1C12 0%, #050E09 70%, #030805 100%)",
        }}
      />

      {/* Concentric Precision Radar & Wave Guides */}
      <div className="relative flex items-center justify-center">
        {/* Hover-Launched Hairline Wave Rings */}
        {waveKey > 0 && (
          <div key={waveKey} className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="radar-wave" />
            <div className="radar-wave radar-wave-delayed" />
          </div>
        )}

        {/* Outer Guide Ring */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: "480px",
            height: "480px",
            border: "1px solid rgba(223, 228, 218, 0.08)",
          }}
        />

        {/* Mid Guide Ring */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: "340px",
            height: "340px",
            border: "1px solid rgba(223, 228, 218, 0.12)",
          }}
        />

        {/* Inner Guide Ring */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: "220px",
            height: "220px",
            border: "1px solid rgba(223, 228, 218, 0.18)",
          }}
        />

        {/* Centerpiece Vector Bird Emblem */}
        <div className="relative z-10 flex flex-col items-center justify-center p-8 transition-transform duration-200 hover:scale-[1.02]">
          <AlvionBirdLogo
            size={160}
            variant="light"
            style={{
              filter: "drop-shadow(0 12px 24px rgba(0, 0, 0, 0.6))",
            }}
          />
        </div>
      </div>

      {/* Editorial Identity */}
      <div className="relative z-10 mt-10 text-center max-w-[420px] px-4 space-y-2 select-none pointer-events-none">
        <h3
          style={{
            fontFamily: 'var(--font-newsreader), "Newsreader", Georgia, serif',
            letterSpacing: "-0.015em",
            color: "#F4F7F2",
          }}
          className="text-2xl sm:text-3xl font-normal leading-tight"
        >
          The Flight of Capital
        </h3>
        <p
          style={{ color: "rgba(223, 228, 218, 0.75)" }}
          className="text-xs sm:text-[13px] font-mono leading-relaxed max-w-[360px] mx-auto"
        >
          Permissionless synthetics on Robinhood Chain L2. Liquid institutional exposure without borders.
        </p>
      </div>
    </div>
  );
};

export default PeacefulBirdHeroArt;
