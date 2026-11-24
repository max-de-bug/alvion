"use client";

import React from "react";

export const ArchitectureDocsTab: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h2 className="text-lg font-bold text-white mb-1">
          Architecture
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed mb-6">
          Off-chain Price-Time Priority matching in Rust with batched on-chain settlement on Robinhood Chain (Arbitrum L2).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
            <h3 className="font-semibold text-white text-xs mb-2">
              Matching engine
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              In-memory Price-Time Priority matching engine written in Rust using zero-copy slab arenas.
            </p>
            <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
              <li>Deterministic fixed-point price calculations.</li>
              <li>Dual-gate margin verification at submission and match.</li>
              <li>Independent memory arenas per market pair.</li>
            </ul>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
            <h3 className="font-semibold text-white text-xs mb-2">
              Order verification
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              Orders are cryptographically signed off-chain with EIP-712 structured typed data (secp256k1).
            </p>
            <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
              <li>Order placement and cancellations execute without network transactions.</li>
              <li>Only matched executions settle on-chain via the relayer.</li>
              <li>Replay prevention using unique timestamped nonces.</li>
            </ul>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
            <h3 className="font-semibold text-white text-xs mb-2">
              Risk domains
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              Each trading pair operates as an isolated risk domain with its own insurance reserve.
            </p>
            <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
              <li>Payouts cannot exceed the market domain&apos;s insurance cap.</li>
              <li>Core USDC vault assets remain isolated from volatile pairs.</li>
              <li>Automated vault market maker maintains dual-sided liquidity.</li>
            </ul>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
            <h3 className="font-semibold text-white text-xs mb-2">
              Solvency model
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              Solvency invariant verified across state transitions: Assets &ge; Total Margin + PnL Liabilities.
            </p>
            <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
              <li>Adaptive funding rate = order book premium + vault inventory skew.</li>
              <li>Real-time oracle price feeds integrated into tick evaluation.</li>
              <li>On-chain settlement into the Robinhood Chain USDC clearinghouse contract.</li>
            </ul>
          </div>
        </div>

        {/* Technical Overview Matrix */}
        <div className="mt-8 border-t border-slate-800 pt-6">
          <h3 className="text-sm font-semibold text-white mb-3">
            Technical characteristics
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="pb-2">Layer</th>
                  <th className="pb-2">Specification</th>
                  <th className="pb-2">Implementation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                <tr>
                  <td className="py-2.5 font-bold text-white font-sans">Settlement Layer</td>
                  <td className="py-2.5 text-slate-300">Robinhood Chain (Arbitrum Orbit L2 • Chain ID 4663)</td>
                  <td className="py-2.5 text-slate-400">Batched relayer transactions</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-white font-sans">Matching Engine</td>
                  <td className="py-2.5 text-slate-300">Rust Zero-Copy Slab Arena</td>
                  <td className="py-2.5 text-slate-400">Deterministic Price-Time Priority</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-white font-sans">Funding Rate</td>
                  <td className="py-2.5 text-slate-300">Adaptive Skew Funding</td>
                  <td className="py-2.5 text-slate-400">CLOB impact premium + vault skew factor</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-white font-sans">Risk Containment</td>
                  <td className="py-2.5 text-slate-300">Isolated Domain Insurance Buffers</td>
                  <td className="py-2.5 text-slate-400">Non-cross-contaminating loss bounds</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-white font-sans">Liquidity</td>
                  <td className="py-2.5 text-slate-300">Hybrid CLOB + Automated Vault MM</td>
                  <td className="py-2.5 text-slate-400">Avellaneda-Stoikov inventory skew quoting</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
