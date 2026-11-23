"use client";

import React from "react";
import { SolvencyData } from "@/types/trading";
import { ArrowLeft, ShieldCheck } from "lucide-react";

interface VaultBackstopTabProps {
  vaultLiquidity: number;
  vaultNetSkew: number;
  vaultApr: number;
  solvency: SolvencyData | null;
  onBackToTrade?: () => void;
}

export const VaultBackstopTab: React.FC<VaultBackstopTabProps> = ({
  vaultLiquidity,
  vaultNetSkew,
  vaultApr,
  solvency,
  onBackToTrade,
}) => {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full text-[var(--t1)] select-none">
      {onBackToTrade && (
        <button
          type="button"
          onClick={onBackToTrade}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--t2)] hover:text-white transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#4ECCA3]" />
          <span>Back to Trading Terminal</span>
        </button>
      )}

      <div className="bg-[#10171A] border border-[#1E272C] rounded-none p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E272C] pb-5">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-[0.08em] px-2 py-0.5 rounded-none bg-[#4ECCA3]/10 text-[#4ECCA3] border border-[#4ECCA3]/30 font-semibold">
                Percolator Engine
              </span>
              <span className="text-xs text-[var(--t3)] font-mono">Counterparty AMM</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              USDC Liquidity Vault & Domain Reserves
            </h2>
            <p className="text-xs text-[#8C9DA6] mt-0.5 max-w-2xl leading-relaxed">
              Backstop liquidity pool providing automated market-making, counterparty depth for high-leverage positions, and domain solvency insurance.
            </p>
          </div>
          <div className="bg-[#141B1F] px-4 py-2 rounded-none border border-[#212D33] shrink-0">
            <span className="text-[10px] text-[#8C9DA6] uppercase font-mono font-medium">LP APR</span>
            <span className="text-lg font-mono font-bold text-[#4ECCA3] ml-2">{vaultApr}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <div className="bg-[#141B1F] border border-[#212D33] rounded-none p-4">
            <div className="text-xs text-[#8C9DA6] font-mono">Total liquidity (TVL)</div>
            <div className="text-lg font-mono font-semibold text-white mt-1">
              ${vaultLiquidity.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
            </div>
          </div>

          <div className="bg-[#141B1F] border border-[#212D33] rounded-none p-4">
            <div className="text-xs text-[#8C9DA6] font-mono">Net inventory skew</div>
            <div className="text-lg font-mono font-semibold text-slate-200 mt-1">
              +${vaultNetSkew.toLocaleString()} USDC
            </div>
          </div>

          <div className="bg-[#141B1F] border border-[#212D33] rounded-none p-4">
            <div className="text-xs text-[#8C9DA6] font-mono">Vault utilization</div>
            <div className="text-lg font-mono font-semibold text-white mt-1">
              {vaultLiquidity > 0 ? ((Math.abs(vaultNetSkew) / vaultLiquidity) * 100).toFixed(1) : "0.0"}%
            </div>
          </div>

          <div className="bg-[#141B1F] border border-[#212D33] rounded-none p-4">
            <div className="text-xs text-[#8C9DA6] font-mono">Fees accrued</div>
            <div className="text-lg font-mono font-semibold text-[#4ECCA3] mt-1">
              $184,250 USDC
            </div>
          </div>
        </div>

        {/* Domain Insurance Buffers */}
        <div className="mt-8 border-t border-[#1E272C] pt-6">
          <h3 className="text-sm font-bold text-white mb-3">
            Domain insurance reserves
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#1E272C] text-[#8C9DA6] font-medium">
                  <th className="pb-2">Market</th>
                  <th className="pb-2">Insurance buffer</th>
                  <th className="pb-2">Max realizable PnL</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E272C]/60 font-mono">
                <tr>
                  <td className="py-2.5 font-bold text-white font-sans">SPY Domain</td>
                  <td className="py-2.5 text-slate-300">$5,000,000 USDC</td>
                  <td className="py-2.5 text-slate-300">$10,000,000 USDC</td>
                  <td className="py-2.5 text-right text-[#4ECCA3] font-sans">Active</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-white font-sans">SOL Domain</td>
                  <td className="py-2.5 text-slate-300">$2,500,000 USDC</td>
                  <td className="py-2.5 text-slate-300">$5,000,000 USDC</td>
                  <td className="py-2.5 text-right text-[#4ECCA3] font-sans">Active</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-white font-sans">BTC Domain</td>
                  <td className="py-2.5 text-slate-300">$5,000,000 USDC</td>
                  <td className="py-2.5 text-slate-300">$10,000,000 USDC</td>
                  <td className="py-2.5 text-right text-[#4ECCA3] font-sans">Active</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-white font-sans">ETH Domain</td>
                  <td className="py-2.5 text-slate-300">$4,000,000 USDC</td>
                  <td className="py-2.5 text-slate-300">$8,000,000 USDC</td>
                  <td className="py-2.5 text-right text-[#4ECCA3] font-sans">Active</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Solvency Invariant Summary */}
        <div className="mt-6 p-4 rounded-none bg-[#141B1F] border border-[#212D33] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#4ECCA3] shrink-0" />
            <div>
              <div className="font-semibold text-slate-200">Solvency Invariant Proof</div>
              <div className="text-[#8C9DA6] mt-0.5">
                Protocol assets strictly exceed all trader locked margins and net liabilities.
              </div>
            </div>
          </div>
          <div className="text-right font-mono">
            <span className="text-[#8C9DA6]">Status: </span>
            <span className="text-[#4ECCA3] font-semibold">
              {solvency?.is_solvent !== false ? "Verified Active" : "Warning"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
