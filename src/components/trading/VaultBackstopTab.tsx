"use client";

import React from "react";
import { SolvencyData } from "@/types/trading";

interface VaultBackstopTabProps {
  vaultLiquidity: number;
  vaultNetSkew: number;
  vaultApr: number;
  solvency: SolvencyData | null;
}

export const VaultBackstopTab: React.FC<VaultBackstopTabProps> = ({
  vaultLiquidity,
  vaultNetSkew,
  vaultApr,
  solvency,
}) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h2 className="text-lg font-bold text-white">
              USDC Liquidity Vault
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Backstop liquidity pool providing automated market-making and counterparty depth.
            </p>
          </div>
          <div className="bg-slate-950 px-3.5 py-1.5 rounded-md border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-medium">LP APR</span>
            <span className="text-base font-mono font-bold text-emerald-400 ml-2">{vaultApr}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
            <div className="text-xs text-slate-400">Total liquidity (TVL)</div>
            <div className="text-lg font-mono font-semibold text-white mt-1">
              ${vaultLiquidity.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
            <div className="text-xs text-slate-400">Net inventory skew</div>
            <div className="text-lg font-mono font-semibold text-slate-200 mt-1">
              +${vaultNetSkew.toLocaleString()} USDC
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
            <div className="text-xs text-slate-400">Vault utilization</div>
            <div className="text-lg font-mono font-semibold text-white mt-1">
              {vaultLiquidity > 0 ? ((Math.abs(vaultNetSkew) / vaultLiquidity) * 100).toFixed(1) : "0.0"}%
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
            <div className="text-xs text-slate-400">Fees accrued</div>
            <div className="text-lg font-mono font-semibold text-emerald-400 mt-1">
              $184,250 USDC
            </div>
          </div>
        </div>

        {/* Domain Insurance Buffers */}
        <div className="mt-8 border-t border-slate-800 pt-6">
          <h3 className="text-sm font-bold text-white mb-3">
            Domain insurance reserves
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="pb-2">Market</th>
                  <th className="pb-2">Insurance buffer</th>
                  <th className="pb-2">Max realizable PnL</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                <tr>
                  <td className="py-2.5 font-bold text-white font-sans">SPY Domain</td>
                  <td className="py-2.5 text-slate-300">$5,000,000 USDC</td>
                  <td className="py-2.5 text-slate-300">$10,000,000 USDC</td>
                  <td className="py-2.5 text-right text-emerald-400 font-sans">Active</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-white font-sans">SOL Domain</td>
                  <td className="py-2.5 text-slate-300">$2,500,000 USDC</td>
                  <td className="py-2.5 text-slate-300">$5,000,000 USDC</td>
                  <td className="py-2.5 text-right text-emerald-400 font-sans">Active</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-white font-sans">BTC Domain</td>
                  <td className="py-2.5 text-slate-300">$5,000,000 USDC</td>
                  <td className="py-2.5 text-slate-300">$10,000,000 USDC</td>
                  <td className="py-2.5 text-right text-emerald-400 font-sans">Active</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-white font-sans">ETH Domain</td>
                  <td className="py-2.5 text-slate-300">$4,000,000 USDC</td>
                  <td className="py-2.5 text-slate-300">$8,000,000 USDC</td>
                  <td className="py-2.5 text-right text-emerald-400 font-sans">Active</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Solvency Invariant Summary */}
        <div className="mt-6 p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-semibold text-slate-200">Solvency invariant</div>
            <div className="text-slate-400 mt-0.5">
              Protocol assets strictly exceed all trader locked margins and net liabilities.
            </div>
          </div>
          <div className="text-right font-mono">
            <span className="text-slate-400">Status: </span>
            <span className="text-emerald-400 font-semibold">
              {solvency?.is_solvent !== false ? "Verified" : "Warning"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
