"use client";

import React from "react";
import Link from "next/link";
import { MessageSquareText, Globe, ExternalLink, ShieldCheck } from "lucide-react";
import { AlvionBirdLogo } from "@/components/brand/AlvionBirdLogo";

export const TradingFooter = React.memo(function TradingFooter() {
  return (
    <footer
      role="contentinfo"
      className="flex items-center justify-between gap-4 mx-3 mb-3 px-5 py-3 rounded-none border border-[var(--border)] bg-[var(--surface)] text-[var(--t1)] select-none"
    >
      {/* Left: Brand & Latency */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <AlvionBirdLogo size={18} variant="light" className="opacity-90" />
          <span className="text-[12px] font-semibold tracking-[-0.01em] text-[var(--t1)]">
            © 2026 Alvion
          </span>
        </div>

        <span className="text-[var(--border-strong)]">|</span>

        {/* API Latency */}
        <div
          aria-label="API latency"
          className="flex items-center gap-1.5 text-[11.5px] font-mono text-[var(--t3)]"
        >
          <span
            aria-hidden="true"
            className="inline-block size-1.5 rounded-none bg-[var(--fixed-green)]"
          />
          <span className="tabular-nums">54 ms</span>
        </div>

        <span className="hidden md:inline text-[var(--border-strong)]">|</span>

        {/* Chain & Settlement Engine */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] text-[var(--t3)] font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--fixed-green)]" />
          <span>Robinhood Chain</span>
        </div>
      </div>

      {/* Right: Quick Links */}
      <div className="flex items-center gap-2">
        <Link
          href="/waitlist"
          title="Waitlist"
          className="grid size-[28px] place-items-center rounded-none text-[var(--t3)] hover:text-[var(--t1)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5" />
        </Link>

        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          title="Documentation & GitHub"
          className="grid size-[28px] place-items-center rounded-none text-[var(--t3)] hover:text-[var(--t1)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <a
          href="mailto:support@alvion.exchange"
          title="Contact & Feedback"
          className="grid size-[28px] place-items-center rounded-none text-[var(--t3)] hover:text-[var(--t1)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
        >
          <MessageSquareText className="w-3.5 h-3.5" />
        </a>
      </div>
    </footer>
  );
});
