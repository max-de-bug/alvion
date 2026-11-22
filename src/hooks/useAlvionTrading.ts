"use client";

import { useAccount, useConnect, useDisconnect, useSignTypedData } from "wagmi";
import { injected } from "wagmi/connectors";
import { ROBINHOOD_CLEARINGHOUSE, ORDER_TYPES } from "@/lib/wagmi";
import { useState, useCallback } from "react";

export interface EIP712OrderPayload {
  trader: `0x${string}`;
  market: string;
  isLong: boolean;
  price: bigint;
  sizeUsd: bigint;
  marginUsdc: bigint;
  leverage: bigint;
  nonce: bigint;
  expiry: bigint;
}

export function useAlvionTrading() {
  const { address, isConnected, chainId } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { signTypedDataAsync } = useSignTypedData();
  const [isSigning, setIsSigning] = useState(false);

  const connectWallet = useCallback(() => {
    connect({ connector: injected() });
  }, [connect]);

  const signOrder = useCallback(
    async (params: {
      market: string;
      isLong: boolean;
      price: number;
      sizeUsd: number;
      marginUsdc: number;
      leverage: number;
    }) => {
      const traderAddress = (address || "0x71C8364762A803325b335371b292723E59d64663") as `0x${string}`;
      const now = Math.floor(Date.now() / 1000);
      const nonce = BigInt(Date.now());
      const expiry = BigInt(now + 86400);

      const message: EIP712OrderPayload = {
        trader: traderAddress,
        market: params.market,
        isLong: params.isLong,
        price: BigInt(Math.round(params.price * 1_000_000)),
        sizeUsd: BigInt(Math.round(params.sizeUsd * 1_000_000)),
        marginUsdc: BigInt(Math.round(params.marginUsdc * 1_000_000)),
        leverage: BigInt(params.leverage),
        nonce,
        expiry,
      };

      if (!isConnected || !address) {
        // Return valid mock EIP-712 signature in demo mode
        return {
          message,
          signature: "0x" + "a1b2c3d4e5f67890".repeat(8) + "1b",
          isMock: true,
        };
      }

      setIsSigning(true);
      try {
        const domain = {
          name: "Alvion Perpetuals",
          version: "1",
          chainId: chainId ? Number(chainId) : 4663,
          verifyingContract: ROBINHOOD_CLEARINGHOUSE,
        };

        const signature = await signTypedDataAsync({
          domain,
          types: ORDER_TYPES,
          primaryType: "Order",
          message,
        });
        setIsSigning(false);
        return {
          message,
          signature,
          isMock: false,
        };
      } catch (err) {
        setIsSigning(false);
        throw err;
      }
    },
    [address, isConnected, chainId, signTypedDataAsync]
  );

  return {
    address,
    isConnected,
    chainId,
    isSigning,
    connectWallet,
    disconnect,
    signOrder,
  };
}
