import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { ROBINHOOD_CLEARINGHOUSE, ORDER_TYPES, EIP712_DOMAIN } from "./wagmi";

const STORAGE_KEY = "alvion_embedded_wallet_v2";

export interface EmbeddedWalletState {
  address: `0x${string}`;
  alias: string;
  privateKey: `0x${string}`;
  isEmbedded: true;
}

export interface SignOrderParams {
  market: string;
  isLong: boolean;
  price: number;
  sizeUsd: number;
  marginUsdc: number;
  leverage: number;
}

/**
 * Retrieve or automatically generate a non-custodial embedded wallet
 * Stored securely in client storage (Polymarket-style zero-friction onboarding)
 */
export function getOrCreateEmbeddedWallet(): EmbeddedWalletState {
  if (typeof window === "undefined") {
    // SSR fallback dummy address
    const fallbackAddress = "0x71C8364762A803325b335371b292723E59d64663" as `0x${string}`;
    return {
      address: fallbackAddress,
      alias: "Trader #71C8",
      privateKey: "0x0000000000000000000000000000000000000000000000000000000000000000",
      isEmbedded: true,
    };
  }

  let privateKey = localStorage.getItem(STORAGE_KEY) as `0x${string}` | null;

  if (!privateKey || !privateKey.startsWith("0x") || privateKey.length !== 66) {
    privateKey = generatePrivateKey();
    try {
      localStorage.setItem(STORAGE_KEY, privateKey);
    } catch {
      // storage unavailable
    }
  }

  const account = privateKeyToAccount(privateKey);
  const alias = `Trader #${account.address.slice(2, 6).toUpperCase()}`;

  return {
    address: account.address,
    alias,
    privateKey,
    isEmbedded: true,
  };
}

/**
 * Sign an EIP-712 order payload instantaneously via local cryptographic ECDSA
 * Zero external wallet popups (1-Click execution on Robinhood Chain L2)
 */
export async function signOrderWithEmbeddedWallet(
  privateKey: `0x${string}`,
  params: SignOrderParams
): Promise<{ signature: string; message: Record<string, unknown> }> {
  const account = privateKeyToAccount(privateKey);
  const now = Math.floor(Date.now() / 1000);
  const nonce = BigInt(Date.now());
  const expiry = BigInt(now + 86400);

  const message = {
    trader: account.address,
    market: params.market,
    isLong: params.isLong,
    price: BigInt(Math.round(params.price * 1_000_000)),
    sizeUsd: BigInt(Math.round(params.sizeUsd * 1_000_000)),
    marginUsdc: BigInt(Math.round(params.marginUsdc * 1_000_000)),
    leverage: BigInt(params.leverage),
    nonce,
    expiry,
  };

  const signature = await account.signTypedData({
    domain: EIP712_DOMAIN,
    types: ORDER_TYPES,
    primaryType: "Order",
    message,
  });

  return { signature, message };
}

/**
 * Regenerate a fresh embedded wallet (Reset Account)
 */
export function resetEmbeddedWallet(): EmbeddedWalletState {
  if (typeof window === "undefined") return getOrCreateEmbeddedWallet();
  const newPrivateKey = generatePrivateKey();
  try {
    localStorage.setItem(STORAGE_KEY, newPrivateKey);
  } catch {
    // ignore
  }
  const account = privateKeyToAccount(newPrivateKey);
  return {
    address: account.address,
    alias: `Trader #${account.address.slice(2, 6).toUpperCase()}`,
    privateKey: newPrivateKey,
    isEmbedded: true,
  };
}

