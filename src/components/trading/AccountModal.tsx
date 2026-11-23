"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Copy,
  Check,
  Zap,
  Key,
  RotateCcw,
  PlusCircle,
  ExternalLink,
} from "lucide-react";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
  alias: string;
  walletBalance: number;
  faucetWallet: (amount: number) => void;
  exportPrivateKey: () => string;
  resetAccount: () => void;
  onDepositSuccess?: (amount: number) => void;
}

export const AccountModal = React.memo<AccountModalProps>(function AccountModal({
  isOpen,
  onClose,
  address,
  alias,
  walletBalance,
  faucetWallet,
  exportPrivateKey,
  resetAccount,
  onDepositSuccess,
}) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(2500);
  const [customDeposit, setCustomDeposit] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopyAddress = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyKey = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(exportPrivateKey());
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleDeposit = (amount: number) => {
    faucetWallet(amount);
    if (onDepositSuccess) onDepositSuccess(amount);
  };

  const handleCustomDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(customDeposit);
    if (!isNaN(parsed) && parsed > 0) {
      handleDeposit(parsed);
      setCustomDeposit("");
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[480px] bg-[#0C1215] border border-[#1E272C] rounded-none shadow-2xl flex flex-col overflow-hidden text-white select-none animate-in zoom-in-95 duration-150"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#0E1518] border-b border-[#1E272C]">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 bg-[#4ECCA3] rounded-none animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Account & Embedded Wallet
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#162922] text-[#4ECCA3] border border-[#4ECCA3]/30 font-semibold rounded-none">
              Polymarket Mode
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-none border border-[#212D33] bg-[#141B1F] hover:bg-[#1E272C] text-[#8C9DA6] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-4 text-xs font-sans max-h-[80vh] overflow-y-auto">
          {/* 1. Account Identity & 1-Click Status */}
          <div className="p-3.5 bg-[#10171A] border border-[#1E272C] rounded-none flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#1A252B] border border-[#2A3740] rounded-none flex items-center justify-center font-mono font-bold text-xs text-[#4ECCA3]">
                  {alias.slice(-2)}
                </div>
                <div>
                  <div className="font-bold text-white text-xs">{alias}</div>
                  <div className="text-[10.5px] text-[#728087] font-mono">
                    Robinhood Chain L2 (EIP-155: 4663)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2 py-1 bg-[#142921] border border-[#4ECCA3]/30 text-[#4ECCA3] text-[10px] font-mono font-semibold rounded-none">
                <Zap className="w-3 h-3 fill-[#4ECCA3]" />
                <span>1-CLICK ACTIVE</span>
              </div>
            </div>

            {/* Address Row with 1-Click Copy */}
            <div className="flex items-center justify-between gap-2 p-2 bg-[#090E11] border border-[#1A2429] rounded-none font-mono text-[11px]">
              <span className="text-[#8C9DA6] truncate">{address}</span>
              <button
                type="button"
                onClick={handleCopyAddress}
                className="flex items-center gap-1 px-2 py-0.5 rounded-none bg-[#141E24] hover:bg-[#1C2931] text-[#4ECCA3] border border-[#283842] transition-colors shrink-0 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[10.5px] text-[#728087] leading-relaxed">
              Your non-custodial embedded wallet is created automatically. All orders are cryptographically signed locally without popups or gas delays.
            </p>
          </div>

          {/* 2. Balance & Instant Deposit */}
          <div className="p-3.5 bg-[#10171A] border border-[#1E272C] rounded-none flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#1A2429] pb-2.5">
              <span className="text-[11px] font-medium text-[#728087] uppercase tracking-wider">
                Available Cash Balance
              </span>
              <span className="font-mono text-base font-bold text-[#4ECCA3]">
                ${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold text-white flex items-center gap-1">
                <PlusCircle className="w-3.5 h-3.5 text-[#4ECCA3]" />
                <span>Instant Cash In (Testnet Reload)</span>
              </span>

              {/* Quick Reload Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {[1000, 2500, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleDeposit(amt)}
                    className="py-2 rounded-none border border-[#212D33] bg-[#141B1F] hover:bg-[#1C262C] hover:border-[#4ECCA3]/50 text-white font-mono font-semibold text-xs transition-colors cursor-pointer"
                  >
                    +${amt.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Custom Deposit Input */}
              <form onSubmit={handleCustomDepositSubmit} className="flex gap-2 mt-1">
                <input
                  type="number"
                  min="1"
                  step="any"
                  placeholder="Custom amount (e.g. 10000)..."
                  value={customDeposit}
                  onChange={(e) => setCustomDeposit(e.target.value)}
                  className="flex-1 h-8 px-2.5 bg-[#090E11] border border-[#212D33] focus:border-[#4ECCA3]/60 rounded-none text-xs text-white font-mono outline-none"
                />
                <button
                  type="submit"
                  className="h-8 px-3 bg-[#4ECCA3] hover:bg-[#43B892] text-black font-semibold text-xs rounded-none transition-colors cursor-pointer shrink-0"
                >
                  Deposit
                </button>
              </form>
            </div>
          </div>

          {/* 3. Self-Custody: Export Key & Reset */}
          <div className="p-3.5 bg-[#10171A] border border-[#1E272C] rounded-none flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-white flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Self-Custody & Key Export</span>
              </span>
              <button
                type="button"
                onClick={() => setShowKey((prev) => !prev)}
                className="text-[10.5px] font-mono text-[#728087] hover:text-white underline cursor-pointer"
              >
                {showKey ? "Hide Key" : "Reveal Private Key"}
              </button>
            </div>

            {showKey ? (
              <div className="p-2.5 bg-[#090E11] border border-amber-500/30 rounded-none flex flex-col gap-2">
                <span className="text-[10px] text-amber-400 font-mono">
                  Never share this private key. Anyone with it can control this embedded wallet:
                </span>
                <div className="font-mono text-[10px] text-slate-300 break-all bg-black/60 p-2 border border-[#1E272C]">
                  {exportPrivateKey()}
                </div>
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="self-end px-2.5 py-1 text-[10px] font-mono rounded-none bg-[#1A252B] text-amber-300 hover:bg-[#233139] border border-amber-500/40 transition-colors cursor-pointer"
                >
                  {copiedKey ? "Copied Key!" : "Copy Key"}
                </button>
              </div>
            ) : null}

            <div className="flex items-center justify-between pt-1 border-t border-[#1A2429]">
              <span className="text-[10.5px] text-[#728087]">
                Need a clean start?
              </span>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Generate a new embedded wallet? This will replace your current address.")) {
                    resetAccount();
                  }
                }}
                className="flex items-center gap-1 text-[10.5px] text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Create New Account</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#0E1518] border-t border-[#1E272C] flex items-center justify-between text-[11px] font-mono text-[#728087]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#4ECCA3] rounded-none" />
            <span>Zero Gas Subsidized • Robinhood Chain</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:underline cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
});

