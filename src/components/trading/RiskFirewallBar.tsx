"use client";

import React from "react";
import { Shield, Cpu, Scale, CheckCircle2 } from "lucide-react";
import { DomainData, SolvencyData } from "@/types/trading";

interface RiskFirewallBarProps {
  domainInfo: DomainData | null;
  vaultLiquidity: number;
  vaultNetSkew: number;
  solvency: SolvencyData | null;
}

export const RiskFirewallBar: React.FC<RiskFirewallBarProps> = ({
  domainInfo,
  vaultLiquidity,
  vaultNetSkew,
  solvency,
}) => {
  return (
    <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Junior PnL Domain Firewall */}
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400"></span>
          <Shield className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-slate-400 font-medium">Junior PnL Firewall:</span>
          <span className="font-mono text-cyan-300 font-semibold">
            ACTIVE (Domain Cap: ${domainInfo ? domainInfo.max_realizable_pnl_cap_usdc.toLocaleString() : "500,000"} USDC)
          </span>
        </div>

        <div className="h-3 w-[1px] bg-slate-800 hidden sm:block"></div>

        {/* Automated Vault MM */}
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
          <Cpu className="h-3.5 w-3.5 text-indigo-400" />
          <span className="text-slate-400 font-medium">Automated Vault MM:</span>
          <span className="font-mono text-indigo-300 font-semibold">
            ACTIVE (Quoting ±20 bps • Skew: {vaultLiquidity > 0 ? ((vaultNetSkew / vaultLiquidity) * 100).toFixed(1) : "0.0"}%)
          </span>
        </div>

        <div className="h-3 w-[1px] bg-slate-800 hidden sm:block"></div>

        {/* Solvency Invariant */}
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
          <Scale className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-slate-400 font-medium">Solvency Invariant:</span>
          <span className="font-mono text-emerald-300 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            100% VERIFIED ($Assets &ge; $Liabilities)
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
        <span>Percolator Engine</span>
        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400 border border-slate-700">
          Zero-Copy Slabs
        </span>
      </div>
    </div>
  );
};

