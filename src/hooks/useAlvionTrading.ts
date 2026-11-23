"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getOrCreateEmbeddedWallet,
  signOrderWithEmbeddedWallet,
  resetEmbeddedWallet,
  EmbeddedWalletState,
  SignOrderParams,
} from "@/lib/embeddedWallet";

export function useAlvionTrading() {
  const [wallet, setWallet] = useState<EmbeddedWalletState>(() => getOrCreateEmbeddedWallet());
  const [isSigning, setIsSigning] = useState(false);

  useEffect(() => {
    // Sync with localStorage on client mount
    const current = getOrCreateEmbeddedWallet();
    setWallet(current);
  }, []);

  const signOrder = useCallback(
    async (params: SignOrderParams) => {
      setIsSigning(true);
      try {
        const { signature, message } = await signOrderWithEmbeddedWallet(
          wallet.privateKey,
          params
        );
        setIsSigning(false);
        return {
          message,
          signature,
          isMock: false,
        };
      } catch (err) {
        setIsSigning(false);
        console.error("Embedded signing error:", err);
        throw err;
      }
    },
    [wallet.privateKey]
  );

  const resetAccount = useCallback(() => {
    const nextWallet = resetEmbeddedWallet();
    setWallet(nextWallet);
    return nextWallet;
  }, []);

  const exportPrivateKey = useCallback(() => {
    return wallet.privateKey;
  }, [wallet.privateKey]);

  return {
    address: wallet.address,
    alias: wallet.alias,
    isConnected: true, // Polymarket-style: user is always connected to their non-custodial embedded account
    chainId: 4663,
    isSigning,
    isEmbedded: true,
    connectWallet: () => {}, // No-op, always connected
    disconnect: resetAccount,
    signOrder,
    resetAccount,
    exportPrivateKey,
  };
}
