"use client";

import React, { useState } from "react";
import {
  Award,
  Zap,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Copy,
  Check,
  Shield,
  Layers,
  Sparkles,
} from "lucide-react";

interface CreditsTabProps {
  credits: number;
  onNavigateTrade?: () => void;
  onNavigateVault?: () => void;
}

export const CreditsTab = React.memo<CreditsTabProps>(function CreditsTab({
  credits = 250,
  onNavigateTrade,
  onNavigateVault,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyInvite = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText("https://alvion.exchange/waitlist?ref=ALVION_VANGUARD");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentTier = "Bronze Vanguard";
  const nextTier = "Silver Horizon";
  const tierThreshold = 500;
  const tierProgress = Math.min(100, Math.round((credits / tierThreshold) * 100));

  return (
    <div className="flex flex-col gap-6 text-[var(--t1)] select-none">
      {/* 1. Header Hero Banner */}
      <div className="bg-[#10171A] border border-[#1E272C] rounded-none p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#1E272C] pb-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-[0.08em] px-2 py-0.5 rounded-none bg-[#4ECCA3]/10 text-[#4ECCA3] border border-[#4ECCA3]/30 font-semibold">
                Robinhood Chain Rewards
              </span>
              <span className="text-xs text-[var(--t3)] font-mono">Season 1</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              Alvion Credits Dashboard
            </h1>
            <p className="text-xs text-[#8C9DA6] max-w-xl leading-relaxed">
              Earn platform credits by trading perpetuals, supplying liquidity to the USDC Vault,
              and expanding the Alvion network on Robinhood Chain.
            </p>
          </div>

          {/* Credits Summary Badge */}
          <div className="flex items-center gap-4 bg-[#141B1F] border border-[#212D33] p-4 rounded-none shrink-0">
            <div className="flex flex-col">
              <span className="text-[10.5px] uppercase font-mono tracking-wider text-[#8C9DA6]">
                Available Balance
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-3xl font-mono font-bold text-[#4ECCA3] tabular-nums">
                  {credits.toLocaleString()}
                </span>
                <span className="text-xs font-mono font-semibold text-white/80">CREDITS</span>
              </div>
            </div>
            <div className="h-10 w-[1px] bg-[#212D33]" />
            <div className="flex flex-col">
              <span className="text-[10.5px] uppercase font-mono tracking-wider text-[#8C9DA6]">
                Weekly Rank
              </span>
              <span className="text-sm font-semibold text-white mt-1">Top 5%</span>
            </div>
          </div>
        </div>

        {/* 2. Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          {/* Card 1: Total Credits */}
          <div className="bg-[#141B1F] border border-[#212D33] rounded-none p-3.5 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[#8C9DA6] text-xs">
              <span className="font-medium">Total Credits</span>
              <Award className="w-4 h-4 text-[#4ECCA3]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#4ECCA3] tabular-nums">
              {credits} cr
            </div>
            <div className="flex items-center justify-between text-[10.5px] text-[#8C9DA6] pt-1 border-t border-[#1C252A]">
              <span>Weekly ranking</span>
              <span className="text-[#4ECCA3] font-medium">Top 5%</span>
            </div>
          </div>

          {/* Card 2: First Trade Bonus */}
          <div className="bg-[#141B1F] border border-[#212D33] rounded-none p-3.5 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[#8C9DA6] text-xs">
              <span className="font-medium">First Trade Bonus</span>
              <CheckCircle2 className="w-4 h-4 text-[#4ECCA3]" />
            </div>
            <div className="text-2xl font-bold font-mono text-white tabular-nums">
              +250 cr
            </div>
            <div className="flex items-center justify-between text-[10.5px] text-[#8C9DA6] pt-1 border-t border-[#1C252A]">
              <span>Status</span>
              <span className="text-[#4ECCA3] font-semibold flex items-center gap-1">
                <span>Completed</span>
                <Check className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Card 3: Volume Multiplier */}
          <div className="bg-[#141B1F] border border-[#212D33] rounded-none p-3.5 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[#8C9DA6] text-xs">
              <span className="font-medium">Volume Multiplier</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white tabular-nums">
              1.25x
            </div>
            <div className="flex items-center justify-between text-[10.5px] text-[#8C9DA6] pt-1 border-t border-[#1C252A]">
              <span>Tier status</span>
              <span className="text-amber-300 font-medium">{currentTier}</span>
            </div>
          </div>

          {/* Card 4: Referral Network */}
          <div className="bg-[#141B1F] border border-[#212D33] rounded-none p-3.5 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[#8C9DA6] text-xs">
              <span className="font-medium">Referral Network</span>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white tabular-nums">
              +15% Credits
            </div>
            <div className="flex items-center justify-between text-[10.5px] text-[#8C9DA6] pt-1 border-t border-[#1C252A]">
              <span>Network status</span>
              <span className="text-cyan-300 font-medium">Waitlist referral</span>
            </div>
          </div>
        </div>

        {/* 3. Tier Progression Bar */}
        <div className="mt-6 p-4 bg-[#141B1F] border border-[#212D33] rounded-none flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{currentTier}</span>
              <span className="text-[#8C9DA6]">→</span>
              <span className="text-[#8C9DA6]">{nextTier}</span>
            </div>
            <span className="font-mono text-[11px] text-[#4ECCA3]">
              {credits} / {tierThreshold} Credits ({tierProgress}%)
            </span>
          </div>
          <div className="w-full h-2 bg-[#1C252A] rounded-none overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-[#32A882] to-[#4ECCA3] transition-all duration-500 rounded-none"
              style={{ width: `${tierProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#8C9DA6]">
            <span>Earn 250 more credits to unlock 1.5x Multiplier & fee rebates</span>
            <span className="font-mono text-white">Tier 1 of 4</span>
          </div>
        </div>
      </div>

      {/* 4. Two-Column Layout: How to Earn + Referral & Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: How to Earn Credits */}
        <div className="bg-[#10171A] border border-[#1E272C] rounded-none p-6 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#1E272C] pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#4ECCA3]" />
              <span>How to Earn Alvion Credits</span>
            </h2>
            <span className="text-[11px] font-mono text-[#8C9DA6]">Season 1 Rules</span>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            {/* Rule 1 */}
            <div className="p-3.5 bg-[#141B1F] border border-[#212D33] rounded-none flex items-start gap-3">
              <div className="w-7 h-7 rounded-none bg-[#4ECCA3]/10 border border-[#4ECCA3]/30 flex items-center justify-center text-[#4ECCA3] font-bold text-xs shrink-0 mt-0.5">
                01
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">Perpetual Trading Volume</span>
                  <span className="text-[#4ECCA3] font-mono font-bold">+10 cr / $1k</span>
                </div>
                <p className="text-[11.5px] text-[#8C9DA6] leading-relaxed">
                  Earn 10 credits for every $1,000 in notional volume executed across BTC, ETH, SOL, SPY, and NVDA perps.
                </p>
                {onNavigateTrade && (
                  <button
                    onClick={onNavigateTrade}
                    className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#4ECCA3] hover:underline mt-1 cursor-pointer w-fit"
                  >
                    <span>Launch Terminal</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Rule 2 */}
            <div className="p-3.5 bg-[#141B1F] border border-[#212D33] rounded-none flex items-start gap-3">
              <div className="w-7 h-7 rounded-none bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0 mt-0.5">
                02
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">USDC Liquidity Vault Backstop</span>
                  <span className="text-amber-400 font-mono font-bold">1.5x Multiplier</span>
                </div>
                <p className="text-[11.5px] text-[#8C9DA6] leading-relaxed">
                  Provide USDCx to the automated market-making vault to earn passive credit yields on top of standard LP APR.
                </p>
                {onNavigateVault && (
                  <button
                    onClick={onNavigateVault}
                    className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-amber-400 hover:underline mt-1 cursor-pointer w-fit"
                  >
                    <span>Go to Vault</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Rule 3 */}
            <div className="p-3.5 bg-[#141B1F] border border-[#212D33] rounded-none flex items-start gap-3">
              <div className="w-7 h-7 rounded-none bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs shrink-0 mt-0.5">
                03
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">Invite Traders & Friends</span>
                  <span className="text-cyan-400 font-mono font-bold">+15% Kickback</span>
                </div>
                <p className="text-[11.5px] text-[#8C9DA6] leading-relaxed">
                  Receive a permanent 15% credit kickback for every trade made by accounts registered through your waitlist invite link.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Referral Link & Ledger */}
        <div className="flex flex-col gap-6">
          {/* Referral Card */}
          <div className="bg-[#10171A] border border-[#1E272C] rounded-none p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#1E272C] pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Your Referral Link</span>
              </h2>
              <span className="text-[11px] font-mono text-[#4ECCA3]">Active</span>
            </div>

            <p className="text-xs text-[#8C9DA6] leading-relaxed">
              Share your link with colleagues and trading communities to earn bonus credits on their volume.
            </p>

            <div className="flex items-center gap-2 bg-[#141B1F] border border-[#212D33] rounded-none px-3.5 py-2.5">
              <span className="font-mono text-xs text-white flex-1 truncate select-all">
                https://alvion.exchange/waitlist?ref=ALVION_VANGUARD
              </span>
              <button
                type="button"
                onClick={handleCopyInvite}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-[#1C262B] hover:bg-[#253238] border border-[#283840] text-xs font-semibold text-white transition-colors cursor-pointer shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#4ECCA3]" />
                    <span className="text-[#4ECCA3]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#8C9DA6]" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Activity Ledger */}
          <div className="bg-[#10171A] border border-[#1E272C] rounded-none p-6 shadow-xl flex flex-col gap-4 flex-1">
            <div className="flex items-center justify-between border-b border-[#1E272C] pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#4ECCA3]" />
                <span>Credits Ledger</span>
              </h2>
              <span className="text-[11px] font-mono text-[#8C9DA6]">Recent Activity</span>
            </div>

            <div className="overflow-x-auto [scrollbar-width:none]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1E272C] text-[#728087] font-medium text-[11px]">
                    <th className="pb-2">Activity</th>
                    <th className="pb-2">Network</th>
                    <th className="pb-2 text-right">Amount</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C252A] font-mono text-[12px]">
                  <tr>
                    <td className="py-2.5 font-sans font-medium text-white">
                      First Trade Welcome Bonus
                    </td>
                    <td className="py-2.5 text-[#8C9DA6]">Robinhood Testnet</td>
                    <td className="py-2.5 text-right font-bold text-[#4ECCA3]">+250 cr</td>
                    <td className="py-2.5 text-right text-xs font-sans text-[#4ECCA3]">Settled</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-sans font-medium text-white">
                      Weekly Vanguard Rank Bonus
                    </td>
                    <td className="py-2.5 text-[#8C9DA6]">Robinhood Testnet</td>
                    <td className="py-2.5 text-right font-bold text-[#8C9DA6]">+0 cr</td>
                    <td className="py-2.5 text-right text-xs font-sans text-amber-400">Pending Sun</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

