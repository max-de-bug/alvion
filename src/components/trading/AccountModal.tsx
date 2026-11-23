"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Copy,
  Check,
  Key,
  RotateCcw,
  Plus,
  ShieldCheck,
  Wallet,
  ArrowDownToLine,
  ExternalLink,
} from "lucide-react";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "deposit" | "account";
  address: string;
  alias: string;
  walletBalance: number;
  faucetWallet: (amount: number) => void;
  exportPrivateKey: () => string;
  resetAccount: () => void;
  onDepositSuccess?: (amount: number) => void;
}

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000];

export const AccountModal = React.memo<AccountModalProps>(function AccountModal({
  isOpen,
  onClose,
  initialTab = "deposit",
  address,
  alias,
  walletBalance,
  faucetWallet,
  exportPrivateKey,
  resetAccount,
  onDepositSuccess,
}) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"deposit" | "account">(initialTab);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [depositSuccessMsg, setDepositSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync initial tab when opened
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setShowKey(false);
      setDepositSuccessMsg(null);
    }
  }, [isOpen, initialTab]);

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

  const handleCopyAddress = useCallback(() => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  }, [address]);

  const handleCopyKey = useCallback(() => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(exportPrivateKey());
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  }, [exportPrivateKey]);

  const executeDeposit = useCallback((amount: number) => {
    if (amount <= 0 || isNaN(amount)) return;
    faucetWallet(amount);
    if (onDepositSuccess) onDepositSuccess(amount);
    setDepositSuccessMsg(`+$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC credited`);
    const timer = setTimeout(() => setDepositSuccessMsg(null), 3000);
    return () => clearTimeout(timer);
  }, [faucetWallet, onDepositSuccess]);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(customAmount);
    if (!isNaN(parsed) && parsed > 0) {
      executeDeposit(parsed);
      setCustomAmount("");
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[460px] bg-[#0E1318] border border-[#1E272C] rounded-none shadow-2xl flex flex-col overflow-hidden text-white select-none animate-in zoom-in-95 duration-150"
      >
        {/* Header & Segmented Nav */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#0A0E12] border-b border-[#1E272C]">
          <div className="flex items-center gap-1.5 p-1 bg-[#12191F] border border-[#1E272C] rounded-none">
            <button
              type="button"
              onClick={() => setActiveTab("deposit")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
                activeTab === "deposit"
                  ? "bg-[#1E2931] text-white shadow-xs"
                  : "text-[#8C9DA6] hover:text-white"
              }`}
            >
              <ArrowDownToLine className="w-3.5 h-3.5 text-[#4ECCA3]" />
              <span>Deposit</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("account")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
                activeTab === "account"
                  ? "bg-[#1E2931] text-white shadow-xs"
                  : "text-[#8C9DA6] hover:text-white"
              }`}
            >
              <Wallet className="w-3.5 h-3.5 text-[#8C9DA6]" />
              <span>Account</span>
            </button>
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
          {activeTab === "deposit" ? (
            /* =================== DEPOSIT VIEW =================== */
            <div className="flex flex-col gap-4">
              {/* Balance Card */}
              <div className="p-4 bg-[#12181C] border border-[#1E272C] rounded-none flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-mono text-[#8C9DA6] uppercase tracking-wider">
                    Available Cash
                  </span>
                  <div className="text-2xl font-mono font-bold text-white tabular-nums">
                    ${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-mono font-semibold text-[#4ECCA3] px-2 py-0.5 bg-[#4ECCA3]/10 border border-[#4ECCA3]/25 rounded-none">
                    USDC
                  </span>
                </div>
              </div>

              {/* Success Notification Banner */}
              {depositSuccessMsg && (
                <div className="flex items-center gap-2 p-2.5 bg-[#142820] border border-[#4ECCA3]/40 text-[#4ECCA3] text-xs font-mono font-medium rounded-none animate-in fade-in duration-200">
                  <Check className="w-3.5 h-3.5" />
                  <span>{depositSuccessMsg}</span>
                </div>
              )}

              {/* Quick Preset Deposit Buttons */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-medium text-[#8C9DA6]">
                  Select Amount
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => executeDeposit(amt)}
                      className="py-2.5 rounded-none border border-[#212D33] bg-[#141B1F] hover:bg-[#1E2931] hover:border-[#4ECCA3]/50 text-white font-mono font-semibold text-xs transition-colors cursor-pointer text-center"
                    >
                      +${amt >= 1000 ? `${amt / 1000}k` : amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Deposit Input */}
              <form onSubmit={handleCustomSubmit} className="flex flex-col gap-2 pt-1">
                <span className="text-[11px] font-medium text-[#8C9DA6]">
                  Custom Amount
                </span>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#8C9DA6]">
                      $
                    </span>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      placeholder="Enter USDC amount..."
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full h-9 pl-7 pr-14 bg-[#090E11] border border-[#212D33] focus:border-[#4ECCA3]/60 rounded-none text-xs text-white font-mono outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10.5px] font-mono text-[#8C9DA6]">
                      USDC
                    </span>
                  </div>
                  <button
                    type="submit"
                    className="h-9 px-4 bg-[#4ECCA3] hover:bg-[#43B892] text-black font-semibold text-xs rounded-none transition-colors cursor-pointer shrink-0"
                  >
                    Deposit
                  </button>
                </div>
              </form>

              {/* Settlement Footnote */}
              <div className="flex items-start gap-2 pt-2 border-t border-[#1A2429] text-[10.5px] text-[#728087] leading-relaxed">
                <ShieldCheck className="w-3.5 h-3.5 text-[#4ECCA3] shrink-0 mt-0.5" />
                <span>
                  Testnet funds settle directly to your embedded non-custodial address on Robinhood Chain L2 with zero gas fees.
                </span>
              </div>
            </div>
          ) : (
            /* =================== ACCOUNT & SECURITY VIEW =================== */
            <div className="flex flex-col gap-4">
              {/* Account Identity */}
              <div className="p-3.5 bg-[#12181C] border border-[#1E272C] rounded-none flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-[#182228] border border-[#2A3740] rounded-none flex items-center justify-center font-mono font-bold text-xs text-[#4ECCA3]">
                    {alias.slice(-2)}
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">{alias}</div>
                    <div className="text-[10.5px] text-[#728087] font-mono">
                      Robinhood Chain L2 • Chain ID 4663
                    </div>
                  </div>
                </div>

                <span className="px-2 py-0.5 bg-[#142921] border border-[#4ECCA3]/30 text-[#4ECCA3] text-[10px] font-mono font-semibold rounded-none">
                  Non-Custodial
                </span>
              </div>

              {/* Deposit Address */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-medium text-[#8C9DA6]">
                  Wallet Address
                </span>
                <div className="flex items-center justify-between gap-2 p-2.5 bg-[#090E11] border border-[#1A2429] rounded-none font-mono text-[11px]">
                  <span className="text-[#8C9DA6] truncate">{address}</span>
                  <button
                    type="button"
                    onClick={handleCopyAddress}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-none bg-[#141E24] hover:bg-[#1C2931] text-[#4ECCA3] border border-[#283842] transition-colors shrink-0 cursor-pointer"
                  >
                    {copiedAddress ? (
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
              </div>

              {/* Private Key & Self-Custody */}
              <div className="p-3.5 bg-[#12181C] border border-[#1E272C] rounded-none flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-white flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>Self-Custody Key Export</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowKey((prev) => !prev)}
                    className="text-[10.5px] font-mono text-[#8C9DA6] hover:text-white underline cursor-pointer"
                  >
                    {showKey ? "Hide Key" : "Reveal Private Key"}
                  </button>
                </div>

                {showKey ? (
                  <div className="p-2.5 bg-[#090E11] border border-amber-500/30 rounded-none flex flex-col gap-2">
                    <span className="text-[10px] text-amber-400 font-mono">
                      Keep this private key confidential. It provides direct ownership of this embedded wallet:
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
                ) : (
                  <p className="text-[10.5px] text-[#728087] leading-relaxed">
                    Your embedded wallet keys are held client-side. You can export them at any time to import into any external Web3 wallet.
                  </p>
                )}
              </div>

              {/* Reset Account */}
              <div className="flex items-center justify-between pt-2 border-t border-[#1A2429]">
                <span className="text-[10.5px] text-[#728087]">
                  Reset local wallet credentials
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Generate a new embedded wallet? This will replace your current address.")) {
                      resetAccount();
                      onClose();
                    }
                  }}
                  className="flex items-center gap-1 text-[10.5px] text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Create New Account</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#0A0E12] border-t border-[#1E272C] flex items-center justify-between text-[11px] font-mono text-[#728087]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#4ECCA3] rounded-none" />
            <span>Robinhood Chain L2 • Subsidized Gas</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:underline cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
});
