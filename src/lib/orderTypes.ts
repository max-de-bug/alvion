// EIP-712 Typed Data Definitions for Avalanche C-Chain Hybrid CLOB

export interface EIP712Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}

export const AVALANCHE_C_CHAIN_ID = 43114;
export const AVALANCHE_FUJI_CHAIN_ID = 43113;

export const EIP712_DOMAIN_AVALANCHE: EIP712Domain = {
  name: "AlvionExchange",
  version: "1.0",
  chainId: AVALANCHE_C_CHAIN_ID,
  verifyingContract: "0xAlvionPerpVaultContractAddress", // deployed on C-Chain
};

export const ORDER_TYPES = {
  Order: [
    { name: "trader", type: "address" },
    { name: "market", type: "string" },
    { name: "isLong", type: "bool" },
    { name: "price", type: "uint256" }, // 18 decimals
    { name: "sizeUsd", type: "uint256" }, // 6 decimals (scaled to USD)
    { name: "marginUsdc", type: "uint256" }, // 6 decimals
    { name: "leverage", type: "uint256" }, // 1 to 100
    { name: "nonce", type: "uint256" },
    { name: "expiry", type: "uint256" }, // Unix timestamp
  ],
};

export interface SignedOrder {
  id: string;
  trader: string;
  market: string;
  isLong: boolean;
  orderType: "LIMIT" | "MARKET";
  price: number;
  sizeUsd: number;
  marginUsdc: number;
  leverage: number;
  nonce: number;
  expiry: number;
  signature?: string;
  status: "OPEN" | "MATCHED" | "CANCELLED" | "EXPIRED";
  filledSizeUsd: number;
  createdAt: number;
}

export interface MatchedTrade {
  id: string;
  market: string;
  price: number;
  sizeUsd: number;
  makerOrderId?: string;
  takerOrderId: string;
  buyer: string;
  seller: string;
  isLong: boolean;
  timestamp: number;
  settlementTxHash?: string;
  status: "MATCHED_OFFCHAIN" | "SETTLED_ON_AVALANCHE";
}

