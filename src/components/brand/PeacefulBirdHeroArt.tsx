import React from "react";
import { AlvionBirdLogo } from "./AlvionBirdLogo";

export const PeacefulBirdHeroArt: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-[520px] lg:min-h-screen flex flex-col items-center justify-center overflow-hidden select-none px-6 py-12">
      {/* 1. Deep Midnight Emerald Sanctuary Atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle 900px at 50% 46%, #0D2318 0%, #07150E 50%, #030A06 100%)
          `,
        }}
      />

      {/* 2. Ethereal Aurora Light Waves (Soft Botanical Radiance, No Grid) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-80"
        style={{
          backgroundImage: `
            radial-gradient(circle 550px at 50% 44%, rgba(82, 183, 136, 0.22) 0%, transparent 70%),
            radial-gradient(circle 420px at 52% 42%, rgba(229, 192, 123, 0.14) 0%, transparent 65%),
            radial-gradient(circle 700px at 50% 60%, rgba(35, 65, 46, 0.35) 0%, transparent 80%)
          `,
        }}
      />

      {/* 3. Subtle Constellation Dust & Celestial Micro-Points */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="22%" cy="18%" r="1.5" fill="#E5C07B" opacity="0.4" />
        <circle cx="78%" cy="24%" r="1" fill="#DFE4DA" opacity="0.35" />
        <circle cx="15%" cy="72%" r="1.2" fill="#52B788" opacity="0.3" />
        <circle cx="85%" cy="68%" r="1.5" fill="#E5C07B" opacity="0.4" />
        <circle cx="28%" cy="84%" r="1" fill="#DFE4DA" opacity="0.25" />
        <circle cx="74%" cy="82%" r="1.2" fill="#52B788" opacity="0.3" />
        <circle cx="48%" cy="14%" r="1" fill="#DFE4DA" opacity="0.3" />
      </svg>

      {/* 4. Radiant Orbital Resonance Rings & Bird Centerpiece */}
      <div className="relative flex items-center justify-center">
        {/* Ring 4 - Farthest Celestial Orbit */}
        <div
          className="absolute rounded-full pointer-events-none transition-transform duration-1000"
          style={{
            width: "500px",
            height: "500px",
            border: "1px solid rgba(223, 228, 218, 0.12)",
          }}
        />

        {/* Ring 3 - Golden Dashed Orbit */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: "400px",
            height: "400px",
            border: "1px dashed rgba(229, 192, 123, 0.35)",
          }}
        />

        {/* Ring 2 - Sage Harmonic Ring */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: "300px",
            height: "300px",
            border: "1.5px solid rgba(223, 228, 218, 0.22)",
          }}
        />

        {/* Ring 1 - Inner Luminous Halo */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: "210px",
            height: "210px",
            border: "2px solid rgba(223, 228, 218, 0.4)",
            background: "radial-gradient(circle, rgba(82, 183, 136, 0.28) 0%, transparent 72%)",
          }}
        />

        {/* Luminous Core Aura Bloom */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: "260px",
            height: "260px",
            background:
              "radial-gradient(circle, rgba(244, 247, 242, 0.45) 0%, rgba(82, 183, 136, 0.32) 40%, rgba(229, 192, 123, 0.2) 65%, transparent 80%)",
            filter: "blur(24px)",
          }}
        />

        {/* Centerpiece Peaceful Bird Vector Emblem */}
        <div className="relative z-10 flex flex-col items-center justify-center p-8 transition-transform duration-700 hover:scale-105 cursor-default">
          <AlvionBirdLogo
            size={160}
            variant="light"
            style={{
              filter:
                "drop-shadow(0 16px 36px rgba(0, 0, 0, 0.65)) drop-shadow(0 0 55px rgba(244, 247, 242, 0.5))",
            }}
          />
        </div>
      </div>

      {/* 5. Editorial Identity & Typography */}
      <div className="relative z-10 mt-8 text-center max-w-[420px] px-4 space-y-2.5 select-none">
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
          style={{ color: "rgba(223, 228, 218, 0.82)" }}
          className="text-xs sm:text-[13px] font-mono leading-relaxed max-w-[360px] mx-auto"
        >
          Permissionless synthetics on Robinhood Chain L2. Liquid institutional exposure without borders.
        </p>
      </div>
    </div>
  );
};

export default PeacefulBirdHeroArt;
