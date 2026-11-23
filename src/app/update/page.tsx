"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Check, Share2 } from "lucide-react";
import { AlvionVolumeUpdateCard } from "@/components/brand/AlvionVolumeUpdateCard";

export default function UpdatePage() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const link = document.createElement("a");
      link.href = "/alvion-volume-update.png";
      link.download = "alvion-trading-volume-update.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#050A07",
        color: "#DFE4DA",
        fontFamily: 'var(--font-lato), "Lato", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
      className="min-h-screen flex flex-col justify-between p-4 sm:p-8 md:p-12 selection:bg-[#23412E] selection:text-[#DFE4DA]"
    >
      {/* Top Navigation Bar */}
      <header className="relative z-20 flex items-center justify-between max-w-[1240px] w-full mx-auto pb-6">
        <Link
          href="/waitlist"
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-[rgba(223,228,218,0.7)] hover:text-[#F4F7F2] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Waitlist</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-none border border-[rgba(223,228,218,0.2)] bg-[rgba(15,29,21,0.6)] backdrop-blur-md text-xs font-mono text-[#DFE4DA] hover:border-[#52B788] transition-colors cursor-pointer"
          >
            {copied ? <Check className="h-3 w-3 text-[#52B788]" /> : <Share2 className="h-3 w-3" />}
            <span>{copied ? "Link copied" : "Share"}</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-none bg-[#23412E] text-[#DFE4DA] border border-[rgba(223,228,218,0.3)] hover:bg-[#2d523b] text-xs font-mono font-medium transition-all shadow-md cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download PNG</span>
          </button>
        </div>
      </header>

      {/* Center Display Card */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center py-4 w-full">
        <div ref={cardRef} className="w-full max-w-[1100px] flex justify-center">
          <AlvionVolumeUpdateCard />
        </div>
      </main>

      {/* Bottom Subtitle */}
      <footer className="relative z-10 max-w-[1240px] w-full mx-auto pt-6 flex items-center justify-between text-xs font-mono text-[rgba(223,228,218,0.45)]">
        <span>Robinhood Chain L2</span>
        <a href="https://alvion.fi" target="_blank" rel="noreferrer" className="hover:text-[#52B788] transition-colors">
          alvion.fi
        </a>
      </footer>
    </div>
  );
}

