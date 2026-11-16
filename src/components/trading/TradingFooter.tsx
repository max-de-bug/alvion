"use client";

import React from "react";

export const TradingFooter: React.FC = () => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 px-4 py-3 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <span>ALVION Option A Protocol • Avalanche C-Chain</span>
        <span className="font-mono text-[11px] text-slate-400">
          Settlement Contract: <code className="text-cyan-400">contracts/AlvionPerpVault.sol</code>
        </span>
      </div>
    </footer>
  );
};

