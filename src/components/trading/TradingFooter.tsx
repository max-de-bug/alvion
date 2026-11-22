"use client";

import React from "react";
import { AlvionBirdLogo } from "@/components/brand/AlvionBirdLogo";

export const TradingFooter = React.memo(function TradingFooter() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 px-4 py-3 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlvionBirdLogo size={16} variant="light" className="opacity-70" />
          <span>Alvion Exchange</span>
        </div>
        <span className="font-mono text-[11px] text-slate-500">
          Clearinghouse: <code className="text-slate-400">0x4663111111111111111111111111111111114663</code> (Robinhood Chain L2)
        </span>
      </div>
    </footer>
  );
});
