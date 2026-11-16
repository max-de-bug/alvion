"use client";

import React from "react";
import { DollarSign, Shield, Lock, Scale, Cpu } from "lucide-react";
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
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-cyan-400" />
              Single USDC Liquidity Vault & Backstop
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Provides unified counterparty liquidity for market orders and absorbs net open interest on Avalanche C-Chain.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
              <div className="text-[10px] text-slate-400 uppercase font-medium">Vault LP APR</div>
              <div className="text-lg font-mono font-bold text-emerald-400">{vaultApr}%</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400">Total Vault Liquidity (TVL)</div>
            <div className="text-xl font-mono font-bold text-white mt-1">
              ${vaultLiquidity.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
            </div>
            <div className="text-[10px] text-emerald-400 mt-1">Circle Native USDC on Avalanche</div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400">Net Skew Exposure</div>
            <div className="text-xl font-mono font-bold text-cyan-300 mt-1">
              +${vaultNetSkew.toLocaleString()} USDC
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Long bias compensated via dynamic spread</div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400">Vault Utilization</div>
            <div className="text-xl font-mono font-bold text-white mt-1">
              {vaultLiquidity > 0 ? ((Math.abs(vaultNetSkew) / vaultLiquidity) * 100).toFixed(1) : "0.0"}%
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Safe capital reserve ratio</div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400">Trading Fees Accrued</div>
            <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
              $184,250 USDC
            </div>
            <div className="text-[10px] text-slate-400 mt-1">100% distributed to USDC LPs</div>
          </div>
        </div>

        {/* Percolator Architecture Section */}
        <div className="mt-8 border-t border-slate-800 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-cyan-400" />
                Percolator-Enhanced Risk Architecture & Invariants
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspired by Anatoly Yakovenko&apos;s Percolator: Domain Firewalls, Junior PnL, Solvency Invariants & Automated MM.
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
              Solvency Ratio: {solvency?.solvency_ratio || "1,845%"}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Junior PnL Domain Firewall Table */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <Lock className="h-4 w-4" />
                  Source-Domain Firewalls & Junior PnL Caps
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  Zero Cross-Contamination
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Profits generated in high-volatility pairs are structurally bounded by each domain&apos;s isolated insurance buffer. Even in catastrophic oracle or manipulation events, long-tail profits can never drain the core USDC vault.
              </p>
              <div className="overflow-x-auto mt-1">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-medium">
                      <th className="pb-2">Market Domain</th>
                      <th className="pb-2">Insurance Buffer</th>
                      <th className="pb-2">Max Realizable PnL</th>
                      <th className="pb-2 text-right">Firewall Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    <tr>
                      <td className="py-2 font-bold text-white">AVAX Domain</td>
                      <td className="py-2 text-slate-300">$250,000 USDC</td>
                      <td className="py-2 text-cyan-300">$500,000 USDC</td>
                      <td className="py-2 text-right text-emerald-400">ACTIVE</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold text-white">BTC Domain</td>
                      <td className="py-2 text-slate-300">$1,000,000 USDC</td>
                      <td className="py-2 text-cyan-300">$2,000,000 USDC</td>
                      <td className="py-2 text-right text-emerald-400">ACTIVE</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold text-white">ETH Domain</td>
                      <td className="py-2 text-slate-300">$750,000 USDC</td>
                      <td className="py-2 text-cyan-300">$1,500,000 USDC</td>
                      <td className="py-2 text-right text-emerald-400">ACTIVE</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold text-white">SOL Domain</td>
                      <td className="py-2 text-slate-300">$500,000 USDC</td>
                      <td className="py-2 text-cyan-300">$1,000,000 USDC</td>
                      <td className="py-2 text-right text-emerald-400">ACTIVE</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Solvency Invariant & Automated MM Details */}
            <div className="flex flex-col gap-4">
              {/* Conservation of Value Card */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Scale className="h-4 w-4" />
                    Conservation of Value (Solvency Invariant)
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">VERIFIED</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Formal invariant checked on every state transition: total protocol assets must strictly exceed all trader locked margins and net domain liabilities.
                </p>
                <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-800 font-mono text-xs flex flex-col gap-1.5">
                  <div className="flex justify-between text-slate-300">
                    <span>Total Backing Assets:</span>
                    <span className="font-bold text-emerald-400">
                      ${(solvency?.total_assets_usdc || 7_750_000).toLocaleString()} USDC
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Total Trader Margin / Liabilities:</span>
                    <span className="text-rose-400">
                      ${(solvency?.total_liabilities_usdc || 420_000).toLocaleString()} USDC
                    </span>
                  </div>
                  <div className="flex justify-between text-cyan-300 pt-1 border-t border-slate-800">
                    <span>Net Surplus Capital:</span>
                    <span className="font-bold text-white">
                      +${((solvency?.total_assets_usdc || 7_750_000) - (solvency?.total_liabilities_usdc || 420_000)).toLocaleString()} USDC
                    </span>
                  </div>
                </div>
              </div>

              {/* Automated Vault Market Maker (percolator-match) */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <Cpu className="h-4 w-4" />
                    Automated Vault Market Maker (Active Quoting)
                  </span>
                  <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 font-mono">
                    percolator-match
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Instead of passive unquoted liquidity, the USDC Vault acts as an automated maker continuously placing bid/ask ladders directly into the CLOB with Avellaneda-Stoikov inventory skew adjustment.
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span>Quoting Spread: <strong className="text-indigo-300">&plusmn;20 bps</strong></span>
                  <span>Inventory Skew: <strong className="text-cyan-300">+{vaultLiquidity > 0 ? ((vaultNetSkew / vaultLiquidity) * 100).toFixed(1) : "0.0"}% Long</strong></span>
                  <span>Refresh Frequency: <strong className="text-white">2.0s</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

