import { http, createConfig } from "wagmi";
import { avalanche, avalancheFuji } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

export const AVALANCHE_USDC_ADDRESS = "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E" as const;
export const FUJI_USDC_ADDRESS = "0x5425890298aed601595a70ab815c96711a31bc65" as const;

export const ALVION_VAULT_ADDRESS = "0xb3d1bcb79c7770f7d070ae6ac7b345a95372279e" as const;
export const FUJI_ALVION_VAULT_ADDRESS = "0xb3d1bcb79c7770f7d070ae6ac7b345a95372279e" as const;

export const wagmiConfig = createConfig({
  chains: [avalanche, avalancheFuji],
  connectors: [
    injected(),
  ],
  transports: {
    [avalanche.id]: http("https://api.avax.network/ext/bc/C/rpc"),
    [avalancheFuji.id]: http("https://api.avax-test.network/ext/bc/C/rpc"),
  },
  ssr: true,
});

// EIP-712 Domain and Types matching AlvionPerpVault.sol
export const EIP712_DOMAIN = {
  name: "AlvionExchange",
  version: "1.0",
  chainId: 43114,
  verifyingContract: ALVION_VAULT_ADDRESS,
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

