"use client";

import React from "react";
import { DomainData, SolvencyData } from "@/types/trading";
import { ShieldCheck, ShieldAlert, Activity } from "lucide-react";

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
  const dampenerStatus = domainInfo?.dampener_status || "OPTIMAL";
  const maxLeverage = domainInfo?.dynamic_max_leverage || 1000;

  return (
    <div className="bg-[#0E1318] border border-[#1E272C] rounded-none px-3.5 py-1.5 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
      <div className="flex items-center gap-4 flex-wrap text-[#8C9DA6]">
        {/* Domain Insurance Buffer */}
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="text-[#5D6F78]">Domain Cap:</span>
          <span className="text-white font-medium">
            ${domainInfo ? domainInfo.max_realizable_pnl_cap_usdc.toLocaleString() : "5,000,000"} USDC
          </span>
        </div>

        <div className="h-3 w-[1px] bg-[#1E272C] hidden sm:block" />

        {/* Vault Inventory Skew */}
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="text-[#5D6F78]">Vault Skew:</span>
          <span className="text-white font-medium">
            {skewPct}%
          </span>
        </div>

        <div className="h-3 w-[1px] bg-[#1E272C] hidden sm:block" />

        {/* Percolator Dynamic Leverage Dampener */}
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="text-[#5D6F78]">Leverage Ceiling:</span>
          <span className="text-white font-semibold font-mono">
            {maxLeverage}x
          </span>
          <span
            className={`px-1.5 py-0.2 text-[9.5px] font-bold rounded-none border ${
              dampenerStatus === "OPTIMAL"
                ? "bg-[#142921] text-[#4ECCA3] border-[#4ECCA3]/30"
                : dampenerStatus === "DAMPENED"
                ? "bg-[#14232c] text-cyan-400 border-cyan-500/30"
                : dampenerStatus === "GUARDED"
                ? "bg-amber-950/40 text-amber-400 border-amber-500/30"
                : "bg-rose-950/40 text-rose-400 border-rose-500/30"
            }`}
            title="Percolator Dynamic Risk Ceiling (Yakovenko Architecture)"
          >
            {dampenerStatus}
          </span>
        </div>

        <div className="h-3 w-[1px] bg-[#1E272C] hidden sm:block" />

        {/* Solvency Invariant Proof */}
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#4ECCA3]" />
          <span className="text-[#5D6F78]">Solvency Invariant:</span>
          <span className="font-semibold text-[#4ECCA3]">
            {solvency?.is_solvent !== false ? "Verified Active" : "Warning"}
          </span>
        </div>
      </div>
    </div>
  );
});
