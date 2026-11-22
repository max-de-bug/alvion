"use client";

import React from "react";
import { DomainData, SolvencyData } from "@/types/trading";

interface RiskFirewallBarProps {
  domainInfo: DomainData | null;
  vaultLiquidity: number;
  vaultNetSkew: number;
  solvency: SolvencyData | null;
}

export const RiskFirewallBar = React.memo<RiskFirewallBarProps>(function RiskFirewallBar({
  domainInfo,
  vaultLiquidity,
  vaultNetSkew,
  solvency,
}) {
  const skewPct = vaultLiquidity > 0 ? ((vaultNetSkew / vaultLiquidity) * 100).toFixed(1) : "0.0";

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-4 flex-wrap text-slate-400">
        <div className="flex items-center gap-1.5">
          <span>Domain cap:</span>
          <span className="font-mono text-slate-200">
            ${domainInfo ? domainInfo.max_realizable_pnl_cap_usdc.toLocaleString() : "500,000"} USDC
          </span>
        </div>

        <div className="h-3 w-[1px] bg-slate-800 hidden sm:block" />

        <div className="flex items-center gap-1.5">
          <span>Vault inventory skew:</span>
          <span className="font-mono text-slate-200">
            {skewPct}%
          </span>
        </div>

        <div className="h-3 w-[1px] bg-slate-800 hidden sm:block" />

        <div className="flex items-center gap-1.5">
          <span>Solvency:</span>
          <span className="font-mono text-emerald-400">
            {solvency?.is_solvent !== false ? "Verified" : "Warning"}
          </span>
        </div>
      </div>

      <div className="text-[11px] text-slate-500 font-mono">
        Fixed-point deterministic matching
      </div>
    </div>
  );
});
