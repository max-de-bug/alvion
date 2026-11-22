// Typed Data Definitions for Robinhood Chain (Arbitrum L2) CLOB

export interface EIP712Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}

export const ROBINHOOD_CHAIN_ID = 4663;
export const ROBINHOOD_TESTNET_CHAIN_ID = 46630;
export const ALVION_ROBINHOOD_CLEARINGHOUSE = "0x4663111111111111111111111111111111114663";
export const ROBINHOOD_USDC_ADDRESS = "0x538d689255850901eC5A206A2a9d80d283A44919";

export const ROBINHOOD_CONFIG = {
  name: "Alvion Perpetuals",
  network: "Robinhood Chain",
  chainId: ROBINHOOD_CHAIN_ID,
  clearinghouse: ALVION_ROBINHOOD_CLEARINGHOUSE,
  usdcAddress: ROBINHOOD_USDC_ADDRESS,
  rpcUrl: "https://rpc.mainnet.chain.robinhood.com",
  explorerUrl: "https://robinhoodchain.blockscout.com",
};

export const EIP712_DOMAIN = {
  name: "Alvion Perpetuals",
  version: "1",
  chainId: ROBINHOOD_CHAIN_ID,
  verifyingContract: ALVION_ROBINHOOD_CLEARINGHOUSE,
} as const;

export const ORDER_TYPES = {
  Order: [
    { name: "trader", type: "address" },
    { name: "market", type: "string" },
    { name: "isLong", type: "bool" },
    { name: "price", type: "uint256" }, // Scaled by 10^6
    { name: "sizeUsd", type: "uint256" }, // Scaled by 10^6
    { name: "marginUsdc", type: "uint256" }, // Scaled by 10^6
    { name: "leverage", type: "uint256" }, // 1 to 100
    { name: "nonce", type: "uint256" },
    { name: "expiry", type: "uint256" }, // Unix timestamp
  ],
} as const;

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
  status: "MATCHED_OFFCHAIN" | "SETTLED_ON_ROBINHOOD";
}
