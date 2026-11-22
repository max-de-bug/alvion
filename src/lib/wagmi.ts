import { http, createConfig } from "wagmi";
import { defineChain } from "viem";
import { injected } from "wagmi/connectors";

export const robinhoodChain = defineChain({
  id: 4663,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.mainnet.chain.robinhood.com"] },
  },
  blockExplorers: {
    default: { name: "Robinhood Explorer", url: "https://robinhoodchain.blockscout.com" },
  },
});

export const robinhoodTestnet = defineChain({
  id: 46630,
  name: "Robinhood Chain Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.chain.robinhood.com"] },
  },
  blockExplorers: {
    default: { name: "Robinhood Explorer", url: "https://explorer.testnet.chain.robinhood.com" },
  },
});

export const ROBINHOOD_CLEARINGHOUSE = "0x4663111111111111111111111111111111114663" as const;
export const ROBINHOOD_USDC_ADDRESS = "0x538d689255850901eC5A206A2a9d80d283A44919" as const;
export const ROBINHOOD_RPC_URL = "https://rpc.mainnet.chain.robinhood.com" as const;

export const wagmiConfig = createConfig({
  chains: [robinhoodChain, robinhoodTestnet],
  connectors: [
    injected(),
  ],
  transports: {
    [robinhoodChain.id]: http(),
    [robinhoodTestnet.id]: http(),
  },
  ssr: true,
});

export const EIP712_DOMAIN = {
  name: "Alvion Perpetuals",
  version: "1",
  chainId: 4663,
  verifyingContract: ROBINHOOD_CLEARINGHOUSE,
} as const;

export const ORDER_TYPES = {
  Order: [
    { name: "trader", type: "address" },
    { name: "market", type: "string" },
    { name: "isLong", type: "bool" },
    { name: "price", type: "uint256" },
    { name: "sizeUsd", type: "uint256" },
    { name: "marginUsdc", type: "uint256" },
    { name: "leverage", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "expiry", type: "uint256" },
  ],
} as const;
