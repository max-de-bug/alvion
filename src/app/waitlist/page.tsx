"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Check, Copy, RefreshCw } from "lucide-react";
import { AlvionBirdLogo } from "@/components/brand/AlvionBirdLogo";
import { PeacefulBirdHeroArt } from "@/components/brand/PeacefulBirdHeroArt";

interface UserEntryInfo {
  address?: string;
  email?: string;
  passId?: string;
  rank?: number;
  tier?: "BRONZE" | "METAL" | "GOLD" | "PLATINUM" | "DIAMOND" | string;
  referralCode?: string;
  xp?: number;
  credits?: number;
  referralsCount?: number;
}

export interface ProtocolTier {
  id: "BRONZE" | "METAL" | "GOLD" | "PLATINUM" | "DIAMOND";
  name: string;
  role: string;
  invites: number;
  credits: number;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  perks: string[];
}

export const PROTOCOL_TIERS: ProtocolTier[] = [
  {
    id: "BRONZE",
    name: "Bronze",
    role: "Scout",
    invites: 0,
    credits: 200,
    color: "#97533B",
    badgeBg: "rgba(151, 83, 59, 0.1)",
    badgeBorder: "rgba(151, 83, 59, 0.28)",
    badgeText: "#97533B",
    perks: [
      "Standard testnet queue access",
      "1.0x liquidity vault yield multiplier",
      "Real-time CLOB WebSocket market data feed",
    ],
  },
  {
    id: "METAL",
    name: "Metal",
    role: "Vanguard",
    invites: 1,
    credits: 800,
    color: "#475569",
    badgeBg: "rgba(71, 85, 105, 0.1)",
    badgeBorder: "rgba(71, 85, 105, 0.28)",
    badgeText: "#334155",
    perks: [
      "15% maker fee rebates on synthetic orders",
      "Fast-lane priority testnet queue",
      "1.25x Genesis allocation multiplier",
    ],
  },
  {
    id: "GOLD",
    name: "Gold",
    role: "Sovereign",
    invites: 2,
    credits: 1800,
    color: "#B48220",
    badgeBg: "rgba(180, 130, 32, 0.12)",
    badgeBorder: "rgba(180, 130, 32, 0.3)",
    badgeText: "#8C6010",
    perks: [
      "0% borrow fees on synthetic equities (SPY, TSLA, NVDA)",
      "Guaranteed Wave 1 Genesis access pass",
      "1.5x vault yield boost and direct relayer access",
    ],
  },
  {
    id: "PLATINUM",
    name: "Platinum",
    role: "Syndicate",
    invites: 5,
    credits: 3000,
    color: "#1E6B7B",
    badgeBg: "rgba(30, 107, 123, 0.12)",
    badgeBorder: "rgba(30, 107, 123, 0.3)",
    badgeText: "#15535F",
    perks: [
      "Sub-10ms low-latency private relayer gateway",
      "Liquidation grace shield",
      "Institutional co-vault liquidity allocation",
    ],
  },
  {
    id: "DIAMOND",
    name: "Diamond",
    role: "Council",
    invites: 10,
    credits: 5000,
    color: "#23412E",
    badgeBg: "rgba(35, 65, 46, 0.15)",
    badgeBorder: "rgba(35, 65, 46, 0.35)",
    badgeText: "#23412E",
    perks: [
      "Lifetime zero-spread execution guarantee",
      "Direct revenue share from protocol settlement pool",
      "2.5x Genesis token allocation and core architect access",
    ],
  },
];

export default function WaitlistPage() {
  const [email, setEmail] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("alvion_waitlist_email") || "" : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [userInfo, setUserInfo] = useState<UserEntryInfo | null>(null);
  const [activeTierId, setActiveTierId] = useState<string>("BRONZE");

  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 1. Capture referral code from URL
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref) {
        sessionStorage.setItem("alvion_ref", ref);
      }

      // 2. Restore saved email if previously registered
      const savedEmail = localStorage.getItem("alvion_waitlist_email");
      if (savedEmail) {
        fetch(`/api/waitlist?email=${encodeURIComponent(savedEmail.trim().toLowerCase())}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.user) {
              setUserInfo(data.user);
              setIsJoined(true);
              if (data.user.tier) setActiveTierId(data.user.tier);
              const code = data.user.referralCode || "EARLY";
              setReferralLink(`${window.location.origin}/waitlist?ref=${code}`);
            }
          })
          .catch(() => {
            // Non-blocking fetch failure
          });
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address (e.g. name@domain.com).");
      inputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      const refCode = typeof window !== "undefined" ? sessionStorage.getItem("alvion_ref") : null;
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          referredBy: refCode || undefined,
        }),
      });

      const data = await res.json();

      if (data.success && data.user) {
        setUserInfo(data.user);
        setIsJoined(true);
        if (data.user.tier) setActiveTierId(data.user.tier);
        if (typeof window !== "undefined") {
          localStorage.setItem("alvion_waitlist_email", trimmedEmail);
        }
        const code = data.user.referralCode || "EARLY";
        const link = `${window.location.origin}/waitlist?ref=${code}`;
        setReferralLink(link);
      } else {
        setErrorMessage(data.error || "Unable to join at this moment. Please try again.");
      }
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAnother = () => {
    setIsJoined(false);
    setEmail("");
    setUserInfo(null);
    setReferralLink("");
    setErrorMessage("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("alvion_waitlist_email");
    }
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const copyInvite = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div
      style={{
        backgroundColor: "#DFE4DA",
        color: "#26241D",
        fontFamily: 'var(--font-lato), "Lato", system-ui, -apple-system, sans-serif',
      }}
      className="min-h-screen selection:bg-[#23412E] selection:text-[#DFE4DA]"
    >
      <style>{`
        .waitlist-grid {
          display: grid !important;
          grid-template-columns: minmax(0, 1fr) minmax(0, 0.95fr) !important;
          min-height: 100vh !important;
          width: 100% !important;
        }
        @media (max-width: 960px) {
          .waitlist-grid {
            grid-template-columns: 1fr !important;
          }
          .right-animation-block {
            min-height: 480px !important;
            height: 70vh !important;
            border-left: none !important;
            border-top: 1px solid rgba(38, 36, 29, 0.18) !important;
          }
        }

        .liquid-morph-container {
          display: flex !important;
          justify-content: flex-start !important;
          align-items: center !important;
          padding: 16px 0 !important;
          margin-top: 8px !important;
        }

        .liquid-morph-element {
          width: 250px !important;
          height: 76px !important;
          background: #23412E !important;
          background-color: #23412E !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          position: relative !important;
          border-radius: 50px !important;
          overflow: hidden !important;
          border: none !important;
          cursor: pointer !important;
          box-shadow: 0 10px 28px -6px rgba(35, 65, 46, 0.45) !important;
          transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) !important;
          user-select: none !important;
        }

        .liquid-morph-element span {
          color: #DFE4DA !important;
          font-size: 1.15rem !important;
          font-weight: 700 !important;
          letter-spacing: 0.05em !important;
          text-transform: uppercase !important;
          position: relative !important;
          z-index: 2 !important;
          transition: transform 0.3s ease, color 0.3s ease !important;
        }

        .liquid-morph-element::before {
          content: '' !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          background: conic-gradient(
            #52B788 0deg, 
            #23412E 120deg, 
            #DFE4DA 240deg
          ) !important;
          transition: all 0.6s ease !important;
          opacity: 0 !important;
          transform: scale(0) !important;
        }

        .liquid-morph-element:hover:not(:disabled) {
          border-radius: 12px !important;
          transform: translateY(-2px) scale(1.02) !important;
          box-shadow: 0 16px 36px -4px rgba(35, 65, 46, 0.5) !important;
        }

        .liquid-morph-element:hover:not(:disabled)::before {
          opacity: 0.6 !important;
          transform: scale(2) !important;
        }

        .liquid-morph-element:active:not(:disabled) {
          transform: translateY(0px) scale(0.98) !important;
        }

        .liquid-morph-element:disabled {
          opacity: 0.85 !important;
          cursor: default !important;
        }

        /* 1. Base input states: always completely transparent with brand text & caret */
        #waitlist-email-input,
        #waitlist-email-input:focus,
        #waitlist-email-input:active,
        #waitlist-email-input:valid,
        #waitlist-email-input:invalid {
          background-color: transparent !important;
          background: transparent !important;
          color: #26241D !important;
          caret-color: #23412E !important;
          outline: none !important;
          box-shadow: none !important;
          appearance: none !important;
          -webkit-appearance: none !important;
        }

        /* 2. WebKit / Blink autofill (Chrome, Edge, Safari, Brave, Opera) */
        #waitlist-email-input:-webkit-autofill,
        #waitlist-email-input:-webkit-autofill:hover,
        #waitlist-email-input:-webkit-autofill:focus,
        #waitlist-email-input:-webkit-autofill:active {
          -webkit-text-fill-color: #26241D !important;
          caret-color: #23412E !important;
          -webkit-box-shadow: 0 0 0 1000px #DFE4DA inset !important;
          box-shadow: 0 0 0 1000px #DFE4DA inset !important;
          transition: background-color 999999s ease-in-out 0s, color 999999s ease-in-out 0s !important;
          appearance: none !important;
          -webkit-appearance: none !important;
        }

        /* 3. Modern Standard CSS :autofill (CSS Pseudo-Elements Level 4) */
        #waitlist-email-input:autofill,
        #waitlist-email-input:autofill:hover,
        #waitlist-email-input:autofill:focus,
        #waitlist-email-input:autofill:active {
          -webkit-text-fill-color: #26241D !important;
          caret-color: #23412E !important;
          -webkit-box-shadow: 0 0 0 1000px #DFE4DA inset !important;
          box-shadow: 0 0 0 1000px #DFE4DA inset !important;
          transition: background-color 999999s ease-in-out 0s, color 999999s ease-in-out 0s !important;
          appearance: none !important;
        }

        /* 4. Gecko / Firefox autofill (isolated in its own block so Blink/WebKit does not drop rules) */
        #waitlist-email-input:-moz-autofill,
        #waitlist-email-input:-moz-autofill-preview {
          filter: none !important;
          background-color: transparent !important;
          transition: background-color 999999s ease-in-out 0s, color 999999s ease-in-out 0s !important;
        }
      `}</style>

      {/* Main 2-Block Layout */}
      <div className="waitlist-grid">
        {/* Block 1 (Left): Editorial Copy, Form & Navigation */}
        <section className="relative flex flex-col justify-between min-h-screen px-6 sm:px-10 md:px-14 py-8 overflow-hidden">
          {/* Ambient Botanical Aura Background Layer (Clean, Peaceful, No Grid Lines) */}
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              backgroundImage: `
                radial-gradient(circle 900px at 50% 280px, rgba(82, 183, 136, 0.12) 0%, transparent 70%),
                radial-gradient(circle 600px at 20% 12%, rgba(229, 192, 123, 0.08) 0%, transparent 60%),
                radial-gradient(circle 700px at 80% 85%, rgba(35, 65, 46, 0.06) 0%, transparent 65%)
              `,
              backgroundSize: "100% 100%",
            }}
          />

          {/* Header */}
          <header className="relative z-10 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <AlvionBirdLogo size={32} variant="brand" className="transition-transform duration-300 group-hover:scale-110" />
              <span
                style={{
                  fontFamily: 'var(--font-newsreader), "Newsreader", Georgia, serif',
                  letterSpacing: "-0.02em",
                }}
                className="text-2xl sm:text-3xl font-normal text-[#23412E] transition-opacity group-hover:opacity-80"
              >
                Alvion
              </span>
            </Link>

            <nav className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/"
                className="inline-flex items-center text-xs sm:text-[13px] text-[#26241D] hover:text-[#23412E] border border-[rgba(38,36,29,0.18)] hover:border-[#23412E] hover:bg-[rgba(35,65,46,0.05)] rounded-none px-3.5 sm:px-4 py-1.5 transition-colors bg-[#DFE4DA]/80 backdrop-blur-xs"
              >
                <span>Launch App</span>
              </Link>
              <div className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#26241D] border border-[rgba(38,36,29,0.18)] rounded-none px-3.5 py-1.5 opacity-80 bg-[#DFE4DA]/80 backdrop-blur-xs">
                <span className="h-1.5 w-1.5 rounded-none bg-[#23412E]" />
                <span>Robinhood Chain L2</span>
              </div>
            </nav>
          </header>

          {/* Main Hero & Waitlist Field */}
          <main className="relative z-10 max-w-[580px] my-auto py-10 sm:py-14">
            <h1
              style={{
                fontFamily: 'var(--font-newsreader), "Newsreader", Georgia, serif',
                fontSize: "clamp(38px, 4.2vw, 76px)",
                lineHeight: 1.02,
                letterSpacing: "-0.02em",
                color: "#23412E",
              }}
              className="font-normal"
            >
              <span>Tokenized markets,</span>
              <br />
              <span>finally permissionless.</span>
            </h1>

            <div className="mt-8 space-y-6">
              <p
                style={{ color: "rgba(38, 36, 29, 0.72)" }}
                className="text-base sm:text-[17px] leading-[1.55]"
              >
                Alvion turns synthetic exposure to equities, global indices, and crypto into liquid
                on-chain tokens on Robinhood Chain, with no spread or funding to pay. Hold it in your
                wallet, or trade with deep institutional liquidity. Join the waitlist for early access.
              </p>

              {/* Minimalistic Input Form & Liquid Morph Button */}
              {!isJoined ? (
                <form onSubmit={handleSubmit} noValidate className="pt-2 space-y-4">
                  <div
                    className={`flex items-center border-b pb-1 transition-colors duration-200 ${errorMessage
                      ? "border-[#97533B]"
                      : "border-[#26241D]/30 focus-within:border-[#23412E]"
                      }`}
                  >
                    <input
                      ref={inputRef}
                      id="waitlist-email-input"
                      type="email"
                      name="email"
                      autoComplete="off"
                      autoCapitalize="none"
                      spellCheck={false}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMessage) setErrorMessage("");
                      }}
                      placeholder="Your email address"
                      disabled={isSubmitting}
                      style={{
                        backgroundColor: "transparent",
                        color: "#26241D",
                        caretColor: "#23412E",
                        outline: "none",
                        boxShadow: "none",
                      }}
                      className="flex-1 min-w-0 bg-transparent border-0 outline-none py-3 text-lg sm:text-xl text-[#26241D] placeholder:text-[rgba(38,36,29,0.38)] font-sans"
                      required
                    />
                    {email && !isSubmitting && (
                      <button
                        type="button"
                        onClick={() => {
                          setEmail("");
                          setErrorMessage("");
                          inputRef.current?.focus();
                        }}
                        className="text-xs text-[rgba(38,36,29,0.45)] hover:text-[#23412E] py-1 px-2 transition-colors cursor-pointer"
                        aria-label="Clear email"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Error Status Box */}
                  {errorMessage && (
                    <p className="text-xs text-[#97533B] font-medium animate-fadeIn">
                      {errorMessage}
                    </p>
                  )}

                  {/* Liquid Morph Container & Button */}
                  <div className="liquid-morph-container">
                    <button
                      ref={buttonRef}
                      type="submit"
                      disabled={isSubmitting}
                      className="liquid-morph-element"
                      style={{ backgroundColor: "#23412E" }}
                      aria-label="Join the waitlist"
                    >
                      <span>
                        {isSubmitting ? "JOINING..." : "JOIN THE WAITLIST"}
                      </span>
                    </button>
                  </div>

                  {/* Pre-join Tier Privileges Preview */}
                  <div className="pt-5 border-t border-[rgba(38,36,29,0.12)] space-y-2.5">
                    <div className="text-xs font-mono text-[rgba(38,36,29,0.65)]">
                      <span>Protocol tiers & privileges</span>
                    </div>

                    {/* Tier selector tabs */}
                    <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-[rgba(38,36,29,0.05)] border border-[rgba(38,36,29,0.08)]">
                      {PROTOCOL_TIERS.map((t) => {
                        const isSelected = activeTierId === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setActiveTierId(t.id)}
                            className={`flex-1 min-w-[62px] py-1.5 px-2 rounded-lg text-xs font-mono text-center transition-all cursor-pointer ${
                              isSelected
                                ? "bg-white text-[#23412E] font-semibold shadow-xs"
                                : "text-[rgba(38,36,29,0.6)] hover:text-[#26241D]"
                            }`}
                          >
                            <span>{t.name}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Tier Details Card */}
                    {(() => {
                      const current = PROTOCOL_TIERS.find((t) => t.id === activeTierId) || PROTOCOL_TIERS[0];
                      return (
                        <div className="p-3.5 rounded-xl border border-[rgba(38,36,29,0.14)] bg-white/60 backdrop-blur-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span
                              style={{
                                backgroundColor: current.badgeBg,
                                borderColor: current.badgeBorder,
                                color: current.badgeText,
                              }}
                              className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-none border"
                            >
                              {current.name} &middot; {current.role}
                            </span>
                            <span className="text-xs font-mono text-[rgba(38,36,29,0.6)]">
                              {current.invites === 0
                                ? "0 invites · 200 credits"
                                : `${current.invites} ${current.invites === 1 ? "invite" : "invites"} · ${current.credits.toLocaleString()} credits`}
                            </span>
                          </div>

                          <ul className="space-y-1.5 text-xs text-[rgba(38,36,29,0.8)]">
                            {current.perks.map((perk, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-none bg-[#23412E] mt-1.5 shrink-0" />
                                <span>{perk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })()}
                  </div>
                </form>
              ) : (
                /* Done Confirmation & Verified Priority Pass Card */
                <div className="pt-2 space-y-4 animate-fadeIn">
                  <div className="p-5 rounded-2xl border border-[rgba(38,36,29,0.2)] bg-white/80 backdrop-blur-md shadow-sm space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[rgba(38,36,29,0.12)] pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-none bg-[#23412E] text-[#DFE4DA] flex items-center justify-center">
                          <Check className="h-4 w-4" />
                        </div>
                        <div>
                          <h2
                            style={{
                              fontFamily: 'var(--font-newsreader), "Newsreader", Georgia, serif',
                              color: "#23412E",
                            }}
                            className="text-xl font-normal leading-tight"
                          >
                            Priority Reservation Confirmed
                          </h2>
                          <p className="text-xs text-[rgba(38,36,29,0.65)] font-mono">
                            {userInfo?.email || email}
                          </p>
                        </div>
                      </div>

                      {(() => {
                        const userTier = PROTOCOL_TIERS.find((t) => t.id === (userInfo?.tier || "BRONZE")) || PROTOCOL_TIERS[0];
                        return (
                          <span
                            style={{
                              backgroundColor: userTier.badgeBg,
                              borderColor: userTier.badgeBorder,
                              color: userTier.badgeText,
                            }}
                            className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-none border"
                          >
                            {userTier.name} &middot; {userTier.role}
                          </span>
                        );
                      })()}
                    </div>

                    {/* 4-Stat Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                      <div className="p-3 rounded-xl bg-[rgba(35,65,46,0.04)] border border-[rgba(38,36,29,0.08)]">
                        <div className="text-[11px] text-[rgba(38,36,29,0.55)]">Waitlist rank</div>
                        <div className="font-mono text-base font-bold text-[#23412E] mt-0.5">
                          #{userInfo?.rank?.toLocaleString() || "48,924"}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-[rgba(35,65,46,0.04)] border border-[rgba(38,36,29,0.08)]">
                        <div className="text-[11px] text-[rgba(38,36,29,0.55)]">Pass identifier</div>
                        <div className="font-mono text-base font-bold text-[#23412E] mt-0.5 truncate">
                          {userInfo?.passId || "ALV-PASS"}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-[rgba(35,65,46,0.04)] border border-[rgba(38,36,29,0.08)]">
                        <div className="text-[11px] text-[rgba(38,36,29,0.55)]">Earned credits</div>
                        <div className="font-mono text-base font-bold text-[#23412E] mt-0.5">
                          {(userInfo?.xp || userInfo?.credits || 200).toLocaleString()}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-[rgba(35,65,46,0.04)] border border-[rgba(38,36,29,0.08)]">
                        <div className="text-[11px] text-[rgba(38,36,29,0.55)]">Traders invited</div>
                        <div className="font-mono text-base font-bold text-[#23412E] mt-0.5">
                          {userInfo?.referralsCount || 0}
                        </div>
                      </div>
                    </div>

                    {/* Next Tier Progression Bar */}
                    {(() => {
                      const userCredits = userInfo?.xp || userInfo?.credits || 200;
                      const userReferrals = userInfo?.referralsCount || 0;
                      const currentTierIndex = PROTOCOL_TIERS.findIndex((t) => t.id === (userInfo?.tier || "BRONZE"));
                      const nextTier = PROTOCOL_TIERS[currentTierIndex + 1];

                      if (!nextTier) {
                        return (
                          <div className="p-3 rounded-xl bg-[rgba(35,65,46,0.06)] border border-[#23412E]/20 text-xs font-mono text-[#23412E] flex items-center justify-between">
                            <span>Highest tier unlocked: Diamond Council</span>
                            <span className="font-bold">Max level</span>
                          </div>
                        );
                      }

                      const neededCredits = nextTier.credits;
                      const prevCredits = PROTOCOL_TIERS[currentTierIndex]?.credits || 0;
                      const progressPercent = Math.min(
                        100,
                        Math.max(10, Math.round(((userCredits - prevCredits) / (neededCredits - prevCredits)) * 100))
                      );
                      const invitesLeft = Math.max(1, nextTier.invites - userReferrals);

                      return (
                        <div className="p-3 rounded-xl bg-[rgba(35,65,46,0.04)] border border-[rgba(38,36,29,0.08)] space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-[rgba(38,36,29,0.7)]">
                              Next tier: <strong className="text-[#23412E]">{nextTier.name} &middot; {nextTier.role}</strong>
                            </span>
                            <span className="text-[11px] text-[rgba(38,36,29,0.6)]">
                              {invitesLeft} {invitesLeft === 1 ? "invite" : "invites"} left
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-none bg-[rgba(38,36,29,0.1)] overflow-hidden">
                            <div
                              style={{ width: `${progressPercent}%` }}
                              className="h-full bg-[#23412E] rounded-none transition-all duration-500"
                            />
                          </div>
                        </div>
                      );
                    })()}

                    {/* Interactive Tier Roadmap Tabs */}
                    <div className="space-y-2 pt-1">
                      <div className="text-[11px] font-mono text-[rgba(38,36,29,0.6)] uppercase tracking-wide">
                        Tier Roadmap &amp; Privileges
                      </div>
                      <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-[rgba(38,36,29,0.05)] border border-[rgba(38,36,29,0.08)]">
                        {PROTOCOL_TIERS.map((t) => {
                          const isSelected = activeTierId === t.id;
                          const isUserCurrent = (userInfo?.tier || "BRONZE") === t.id;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setActiveTierId(t.id)}
                              className={`flex-1 min-w-[62px] py-1.5 px-2 rounded-lg text-xs font-mono text-center transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-white text-[#23412E] font-semibold shadow-xs"
                                  : "text-[rgba(38,36,29,0.6)] hover:text-[#26241D]"
                              }`}
                            >
                              <span>{t.name}</span>
                              {isUserCurrent && (
                                <span className="block text-[9px] text-[#23412E] font-bold">You</span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {(() => {
                        const current = PROTOCOL_TIERS.find((t) => t.id === activeTierId) || PROTOCOL_TIERS[0];
                        return (
                          <div className="p-3.5 rounded-xl border border-[rgba(38,36,29,0.12)] bg-[rgba(35,65,46,0.02)] space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span
                                style={{
                                  backgroundColor: current.badgeBg,
                                  borderColor: current.badgeBorder,
                                  color: current.badgeText,
                                }}
                                className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-none border"
                              >
                                {current.name} &middot; {current.role}
                              </span>
                              <span className="font-mono text-[11px] text-[rgba(38,36,29,0.6)]">
                                {current.invites === 0
                                  ? "0 invites · 200 credits"
                                  : `${current.invites} ${current.invites === 1 ? "invite" : "invites"} · ${current.credits.toLocaleString()} credits`}
                              </span>
                            </div>
                            <ul className="space-y-1 text-xs text-[rgba(38,36,29,0.85)]">
                              {current.perks.map((p, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="h-1.5 w-1.5 rounded-none bg-[#23412E] mt-1.5 shrink-0" />
                                  <span>{p}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Referral Link Share Box */}
                    {referralLink && (
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[11px] font-medium text-[rgba(38,36,29,0.6)] flex items-center justify-between">
                          <span>Your personal invite link (+500 credits per trader):</span>
                        </div>
                        <div className="p-2.5 rounded-xl border border-[rgba(38,36,29,0.18)] bg-[rgba(35,65,46,0.03)] flex items-center justify-between gap-3 text-xs">
                          <span className="font-mono text-[#26241D] truncate">
                            {referralLink}
                          </span>
                          <button
                            onClick={copyInvite}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-[#23412E] text-[#DFE4DA] font-medium hover:opacity-90 transition-opacity shrink-0 cursor-pointer"
                          >
                            {copiedLink ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            <span>{copiedLink ? "Copied" : "Copy link"}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Reset Button */}
                    <div className="pt-2 flex items-center justify-between border-t border-[rgba(38,36,29,0.1)] text-xs text-[rgba(38,36,29,0.6)]">
                      <button
                        type="button"
                        onClick={handleResetAnother}
                        className="inline-flex items-center gap-1 text-[#23412E] hover:underline cursor-pointer"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Use different email</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* Footer */}
          <footer
            style={{
              borderColor: "rgba(38, 36, 29, 0.18)",
              color: "rgba(38, 36, 29, 0.54)",
            }}
            className="relative z-10 border-t pt-4 flex flex-wrap items-center justify-between gap-2 text-xs"
          >
            <span>© Alvion Solutions Limited</span>
            <span className="font-mono text-[11px]">
              Robinhood Chain (0x4663...4663)
            </span>
          </footer>
        </section>

        {/* Block 2 (Right): Peaceful Bird Visual Sanctuary */}
        <section
          style={{
            backgroundColor: "#07150E",
            borderLeft: "1px solid rgba(38, 36, 29, 0.18)",
            position: "relative",
          }}
          className="right-animation-block min-h-[520px] lg:min-h-screen overflow-hidden flex flex-col justify-center items-center"
          aria-label="Alvion peaceful visual sanctuary"
        >
          {/* Top Brand Emblem Badge - Centered at Top */}
          <div
            style={{
              position: "absolute",
              top: "28px",
              left: "0",
              right: "0",
              display: "flex",
              justifyContent: "center",
              zIndex: 30,
              pointerEvents: "none",
            }}
            className="select-none px-4"
          >
            <div className="pointer-events-auto inline-flex items-center gap-2 px-4 py-2 rounded-none border border-[rgba(223,228,218,0.22)] bg-[rgba(10,22,16,0.85)] backdrop-blur-xl text-xs font-mono text-[#DFE4DA] shadow-xl shadow-black/40">
              <AlvionBirdLogo size={16} variant="light" />
              <span>Alvion · Peaceful Financial Freedom</span>
            </div>
          </div>

          {/* Centerpiece Vector Brand Artwork */}
          <PeacefulBirdHeroArt />

          {/* Bottom Telemetry Ribbon - Centered at Bottom */}
          <div
            style={{
              position: "absolute",
              bottom: "28px",
              left: "0",
              right: "0",
              display: "flex",
              justifyContent: "center",
              zIndex: 30,
              pointerEvents: "none",
            }}
            className="select-none text-xs font-mono text-[#DFE4DA]/80 px-4"
          >
            <div className="pointer-events-auto inline-flex items-center gap-3 px-4 py-2 rounded-none border border-[rgba(223,228,218,0.18)] bg-[rgba(10,22,16,0.8)] backdrop-blur-xl shadow-lg shadow-black/30">
              <span>Robinhood Chain L2 Settlement</span>
              <span className="opacity-30">|</span>
              <span className="hidden sm:inline">Zero Spread</span>
              <span className="hidden sm:inline opacity-30">|</span>
              <span className="hidden sm:inline">Zero Borrow Fee</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
