"use client";

import React from "react";
import { Shield, ListOrdered, Lock, Scale } from "lucide-react";

export const ArchitectureDocsTab: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-2">
          Option A Architecture: Hybrid CLOB on Avalanche C-Chain
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed mb-6">
          Fast off-chain matching with sub-millisecond execution, zero gas for limit order placement and cancellations, and on-chain settlement on Avalanche C-Chain with Native Circle USDC.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
            <h3 className="font-bold text-cyan-300 text-sm mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              1. High-Performance CLOB Matching Engine
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              In-memory Price-Time Priority matching engine written in Rust benchmarked at over 480,000 orders/sec.
            </p>
            <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
              <li>Sub-millisecond latency matching.</li>
              <li>Deterministic fixed-point price calculations.</li>
              <li>Dual-Gate margin verification (at placement and at match time).</li>
            </ul>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
            <h3 className="font-bold text-cyan-300 text-sm mb-3 flex items-center gap-2">
              <ListOrdered className="h-4 w-4" />
              2. EIP-712 Zero-Gas Limit Orders
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Traders sign typed data orders off-chain using their private key (EIP-712).
            </p>
            <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
              <li>0 gas to place limit orders.</li>
              <li>0 gas to cancel or edit limit orders.</li>
              <li>Only matched trades settle to Avalanche C-Chain via <code className="text-cyan-300">settleMatchedOrders()</code>.</li>
            </ul>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
            <h3 className="font-bold text-indigo-300 text-sm mb-3 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              3. Junior PnL & Domain Firewalls (Percolator Pattern)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Every trading pair operates as an isolated risk domain with its own insurance reserve.
            </p>
            <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
              <li>Long-tail profit payouts cannot exceed the market domain&apos;s insurance cap.</li>
              <li>Total core USDC vault TVL is completely protected from cascading market drain.</li>
              <li>Automated Vault Market Maker provides continuous dual-sided grid liquidity.</li>
            </ul>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
            <h3 className="font-bold text-emerald-300 text-sm mb-3 flex items-center gap-2">
              <Scale className="h-4 w-4" />
              4. Value Conservation & Adaptive Skew Funding
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Mathematical solvency is verified across all state changes in both Rust and Solidity.
            </p>
            <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
              <li>Formal Solvency Invariant: <code className="text-emerald-300">Assets &ge; Total Margin + PnL Liabilities</code>.</li>
              <li>Adaptive Funding = CLOB Impact Premium + Vault Skew Factor.</li>
              <li>Seamless on-chain settlement into Avalanche Native Circle USDC vault.</li>
            </ul>
          </div>
        </div>

        {/* Differentiation Matrix: Alvion vs Standalone Hyperliquid */}
        <div className="mt-8 border-t border-slate-800 pt-6">
          <h3 className="text-base font-bold text-white mb-2">
            Architectural Differentiation: Alvion vs. Standalone Hyperliquid
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Alvion borrows the best performance characteristics from Hyperliquid while designing a native Avalanche C-Chain hybrid model that avoids the drawbacks of a closed standalone L1.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="pb-2.5">Feature</th>
                  <th className="pb-2.5 text-slate-400">Hyperliquid (Standalone L1)</th>
                  <th className="pb-2.5 text-cyan-300">Alvion (Hybrid CLOB on Avalanche)</th>
                  <th className="pb-2.5 text-right">Alvion Advantage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                <tr>
                  <td className="py-2.5 font-bold text-white">Settlement Layer</td>
                  <td className="py-2.5 text-slate-400">Custom Cosmos/Hotstuff L1 app-chain</td>
                  <td className="py-2.5 text-cyan-300">Avalanche C-Chain (Circle Native USDC)</td>
                  <td className="py-2.5 text-right text-emerald-400">Zero bridge risk • Native EVM composability</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-white">Funding Rate Model</td>
                  <td className="py-2.5 text-slate-400">Pure Peer-to-Peer 8h Impact Premium</td>
                  <td className="py-2.5 text-cyan-300">Adaptive Skew Funding (CLOB + Vault Skew)</td>
                  <td className="py-2.5 text-right text-emerald-400">Compensates Vault LPs for directional skew</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-white">Tail Risk Firewalls</td>
                  <td className="py-2.5 text-slate-400">Global clearinghouse (cross-contamination)</td>
                  <td className="py-2.5 text-cyan-300">Percolator Junior PnL Source-Domains</td>
                  <td className="py-2.5 text-right text-emerald-400">Long-tail tokens cannot drain core USDC vault</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-white">Matching Engine</td>
                  <td className="py-2.5 text-slate-400">On-chain validator consensus execution</td>
                  <td className="py-2.5 text-cyan-300">Rust Zero-Copy Slabs + Avalanche Settlement</td>
                  <td className="py-2.5 text-right text-emerald-400">480k+ ops/sec with sub-millisecond fills</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-white">Liquidity Model</td>
                  <td className="py-2.5 text-slate-400">CLOB order book + HLP vault pool</td>
                  <td className="py-2.5 text-cyan-300">Hybrid CLOB + Automated Vault MM (Avellaneda-Stoikov)</td>
                  <td className="py-2.5 text-right text-emerald-400">Guaranteed instant fills even on illiquid pairs</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

