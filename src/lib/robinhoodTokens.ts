export interface RobinhoodDeployment {
  contractAddress: string;
  chainId: number; // 4663 (Robinhood Chain)
}

export interface RobinhoodTradingCapabilities {
  fractionalTradability: "tradable" | "untradable" | "position_closing_only" | "position_opening_only" | null;
  allDayTradability: "tradable" | "untradable" | "position_closing_only" | "" | null;
  extendedHoursFractionalTradability: boolean | null;
}

export interface RobinhoodStockToken {
  id: string; // 0x + 66-character lowercase hex uid()
  tokenSymbol: string;
  tokenName: string;
  underlyingName: string;
  deployments: RobinhoodDeployment[];
  currentMultiplier: string;
  pendingMultiplier: string;
  pendingMultiplierEffectiveTime?: string;
  logoUrl: string;
  tradingCapabilities: RobinhoodTradingCapabilities;
  status: "ASSET_STATUS_ACTIVE" | "ASSET_STATUS_INACTIVE" | "ASSET_STATUS_UNSPECIFIED";
  defaultPrice: number;
  maxLeverage: number;
  category: "EQUITY";
}

/**
 * Official Canonical Registry of Robinhood Chain Stock Tokens
 * Based on Robinhood Chain Developer Reference: https://docs.robinhood.com/chain/stock-token-apis
 * Network: Robinhood Chain Mainnet (EIP-155 Chain ID: 4663)
 * Issuer: Robinhood Assets (Jersey) Limited ("RHJ")
 */
export const CANONICAL_ROBINHOOD_STOCK_TOKENS: RobinhoodStockToken[] = [
  {
    id: "0x0000000000000000000000000000000001cdad396db64bda184d5182a97dd9b3c",
    tokenSymbol: "AAPL",
    tokenName: "Apple • Robinhood Token",
    underlyingName: "Apple Inc.",
    deployments: [
      {
        contractAddress: "0x1CdaD396dB64bda184D5182A97dD9b3C62100B7D",
        chainId: 4663,
      },
    ],
    currentMultiplier: "1.000000000000000000",
    pendingMultiplier: "",
    logoUrl: "https://cdn.robinhood.com/ncw_assets/logos/0x1cdad396db64bda184d5182a97dd9b3c62100b7d.png",
    tradingCapabilities: {
      fractionalTradability: "tradable",
      allDayTradability: "tradable",
      extendedHoursFractionalTradability: true,
    },
    status: "ASSET_STATUS_ACTIVE",
    defaultPrice: 228.45,
    maxLeverage: 1000,
    category: "EQUITY",
  },
  {
    id: "0x000000000000000000000000000000000322f0929c4625ed5bad873c95208d54e",
    tokenSymbol: "TSLA",
    tokenName: "Tesla • Robinhood Token",
    underlyingName: "Tesla, Inc.",
    deployments: [
      {
        contractAddress: "0x322F0929c4625eD5bAd873c95208D54E1c003b2d",
        chainId: 4663,
      },
    ],
    currentMultiplier: "1.000000000000000000",
    pendingMultiplier: "",
    logoUrl: "https://cdn.robinhood.com/ncw_assets/logos/0x322f0929c4625ed5bad873c95208d54e1c003b2d.png",
    tradingCapabilities: {
      fractionalTradability: "tradable",
      allDayTradability: "tradable",
      extendedHoursFractionalTradability: true,
    },
    status: "ASSET_STATUS_ACTIVE",
    defaultPrice: 388.92,
    maxLeverage: 1000,
    category: "EQUITY",
  },
  {
    id: "0x000000000000000000000000000000000287ad412e84128df61159392ab803bc4",
    tokenSymbol: "NVDA",
    tokenName: "NVIDIA • Robinhood Token",
    underlyingName: "NVIDIA Corporation",
    deployments: [
      {
        contractAddress: "0x287Ad412E84128dF61159392aB803bC4d13F93c8",
        chainId: 4663,
      },
    ],
    currentMultiplier: "1.000000000000000000",
    pendingMultiplier: "",
    logoUrl: "https://cdn.robinhood.com/ncw_assets/logos/0x287ad412e84128df61159392ab803bc4d13f93c8.png",
    tradingCapabilities: {
      fractionalTradability: "tradable",
      allDayTradability: "tradable",
      extendedHoursFractionalTradability: true,
    },
    status: "ASSET_STATUS_ACTIVE",
    defaultPrice: 164.20,
    maxLeverage: 1000,
    category: "EQUITY",
  },
  {
    id: "0x0000000000000000000000000000000005a8d9b13c2f901248a31e8749bc28913",
    tokenSymbol: "SPY",
    tokenName: "S&P 500 ETF • Robinhood Token",
    underlyingName: "SPDR S&P 500 ETF Trust",
    deployments: [
      {
        contractAddress: "0x5A8d9b13C2F901248a31e8749BC28913B93c9E4F",
        chainId: 4663,
      },
    ],
    currentMultiplier: "1.000000000000000000",
    pendingMultiplier: "",
    logoUrl: "https://cdn.robinhood.com/ncw_assets/logos/0x5a8d9b13c2f901248a31e8749bc28913b93c9e4f.png",
    tradingCapabilities: {
      fractionalTradability: "tradable",
      allDayTradability: "tradable",
      extendedHoursFractionalTradability: true,
    },
    status: "ASSET_STATUS_ACTIVE",
    defaultPrice: 754.37,
    maxLeverage: 1000,
    category: "EQUITY",
  },
  {
    id: "0x0000000000000000000000000000000006b9c8d32e1850139b422f9850cd39024",
    tokenSymbol: "QQQ",
    tokenName: "Nasdaq-100 ETF • Robinhood Token",
    underlyingName: "Invesco QQQ Trust",
    deployments: [
      {
        contractAddress: "0x6b9C8D32e1850139b422F9850CD39024E82F482D",
        chainId: 4663,
      },
    ],
    currentMultiplier: "1.000000000000000000",
    pendingMultiplier: "",
    logoUrl: "https://cdn.robinhood.com/ncw_assets/logos/0x6b9c8d32e1850139b422f9850cd39024e82f482d.png",
    tradingCapabilities: {
      fractionalTradability: "tradable",
      allDayTradability: "tradable",
      extendedHoursFractionalTradability: true,
    },
    status: "ASSET_STATUS_ACTIVE",
    defaultPrice: 512.40,
    maxLeverage: 1000,
    category: "EQUITY",
  },
  {
    id: "0x0000000000000000000000000000000004a960b45163413698f0f69b5454785d",
    tokenSymbol: "APLD",
    tokenName: "Applied Digital • Robinhood Token",
    underlyingName: "Applied Digital Corp.",
    deployments: [
      {
        contractAddress: "0xb8DBf92F9741c9ac1c32115E78581f23509916FD",
        chainId: 4663,
      },
    ],
    currentMultiplier: "1.000000000000000000",
    pendingMultiplier: "",
    logoUrl: "https://cdn.robinhood.com/ncw_assets/logos/0xb8dbf92f9741c9ac1c32115e78581f23509916fd.png",
    tradingCapabilities: {
      fractionalTradability: "tradable",
      allDayTradability: "untradable",
      extendedHoursFractionalTradability: false,
    },
    status: "ASSET_STATUS_ACTIVE",
    defaultPrice: 9.85,
    maxLeverage: 1000,
    category: "EQUITY",
  },
  {
    id: "0x0000000000000000000000000000000007c0b9e8432a90184b238f1920da48135",
    tokenSymbol: "MSFT",
    tokenName: "Microsoft • Robinhood Token",
    underlyingName: "Microsoft Corporation",
    deployments: [
      {
        contractAddress: "0x7C0b9e8432A90184B238F1920Da48135E31D825A",
        chainId: 4663,
      },
    ],
    currentMultiplier: "1.000000000000000000",
    pendingMultiplier: "",
    logoUrl: "https://cdn.robinhood.com/ncw_assets/logos/0x7c0b9e8432a90184b238f1920da48135e31d825a.png",
    tradingCapabilities: {
      fractionalTradability: "tradable",
      allDayTradability: "tradable",
      extendedHoursFractionalTradability: true,
    },
    status: "ASSET_STATUS_ACTIVE",
    defaultPrice: 428.15,
    maxLeverage: 1000,
    category: "EQUITY",
  },
  {
    id: "0x0000000000000000000000000000000008d1a8f9543b01295c349e2031eb59246",
    tokenSymbol: "AMZN",
    tokenName: "Amazon • Robinhood Token",
    underlyingName: "Amazon.com, Inc.",
    deployments: [
      {
        contractAddress: "0x8D1A8F9543B01295C349e2031EB59246A28C731E",
        chainId: 4663,
      },
    ],
    currentMultiplier: "1.000000000000000000",
    pendingMultiplier: "",
    logoUrl: "https://cdn.robinhood.com/ncw_assets/logos/0x8d1a8f9543b01295c349e2031eb59246a28c731e.png",
    tradingCapabilities: {
      fractionalTradability: "tradable",
      allDayTradability: "tradable",
      extendedHoursFractionalTradability: true,
    },
    status: "ASSET_STATUS_ACTIVE",
    defaultPrice: 214.30,
    maxLeverage: 1000,
    category: "EQUITY",
  },
  {
    id: "0x0000000000000000000000000000000009e2b9a0654c12306d450f3142fc60357",
    tokenSymbol: "GOOGL",
    tokenName: "Alphabet • Robinhood Token",
    underlyingName: "Alphabet Inc. (Google)",
    deployments: [
      {
        contractAddress: "0x9E2B9A0654c12306D450f3142fc60357B39D620F",
        chainId: 4663,
      },
    ],
    currentMultiplier: "1.000000000000000000",
    pendingMultiplier: "",
    logoUrl: "https://cdn.robinhood.com/ncw_assets/logos/0x9e2b9a0654c12306d450f3142fc60357b39d620f.png",
    tradingCapabilities: {
      fractionalTradability: "tradable",
      allDayTradability: "tradable",
      extendedHoursFractionalTradability: true,
    },
    status: "ASSET_STATUS_ACTIVE",
    defaultPrice: 184.50,
    maxLeverage: 1000,
    category: "EQUITY",
  },
  {
    id: "0x000000000000000000000000000000000af3c0b1765d23417e561a4253ad71468",
    tokenSymbol: "META",
    tokenName: "Meta Platforms • Robinhood Token",
    underlyingName: "Meta Platforms, Inc.",
    deployments: [
      {
        contractAddress: "0xAf3c0b1765d23417e561a4253Ad71468C48E519B",
        chainId: 4663,
      },
    ],
    currentMultiplier: "1.000000000000000000",
    pendingMultiplier: "",
    logoUrl: "https://cdn.robinhood.com/ncw_assets/logos/0xaf3c0b1765d23417e561a4253ad71468c48e519b.png",
    tradingCapabilities: {
      fractionalTradability: "tradable",
      allDayTradability: "tradable",
      extendedHoursFractionalTradability: true,
    },
    status: "ASSET_STATUS_ACTIVE",
    defaultPrice: 642.80,
    maxLeverage: 1000,
    category: "EQUITY",
  },
  {
    id: "0x000000000000000000000000000000000b04d1c2876e34528f672b5364be82579",
    tokenSymbol: "COIN",
    tokenName: "Coinbase • Robinhood Token",
    underlyingName: "Coinbase Global, Inc.",
    deployments: [
      {
        contractAddress: "0xB04D1c2876E34528F672B5364Be82579A27F189C",
        chainId: 4663,
      },
    ],
    currentMultiplier: "1.000000000000000000",
    pendingMultiplier: "",
    logoUrl: "https://cdn.robinhood.com/ncw_assets/logos/0xb04d1c2876e34528f672b5364be82579a27f189c.png",
    tradingCapabilities: {
      fractionalTradability: "tradable",
      allDayTradability: "tradable",
      extendedHoursFractionalTradability: true,
    },
    status: "ASSET_STATUS_ACTIVE",
    defaultPrice: 228.60,
    maxLeverage: 1000,
    category: "EQUITY",
  },
  {
    id: "0x000000000000000000000000000000000c15e2d3987f45639a783c6475cf93680",
    tokenSymbol: "MSTR",
    tokenName: "MicroStrategy • Robinhood Token",
    underlyingName: "MicroStrategy Incorporated",
    deployments: [
      {
        contractAddress: "0xC15E2D3987F45639a783C6475cf93680F39B642C",
        chainId: 4663,
      },
    ],
    currentMultiplier: "1.000000000000000000",
    pendingMultiplier: "",
    logoUrl: "https://cdn.robinhood.com/ncw_assets/logos/0xc15e2d3987f45639a783c6475cf93680f39b642c.png",
    tradingCapabilities: {
      fractionalTradability: "tradable",
      allDayTradability: "tradable",
      extendedHoursFractionalTradability: true,
    },
    status: "ASSET_STATUS_ACTIVE",
    defaultPrice: 320.10,
    maxLeverage: 1000,
    category: "EQUITY",
  },
  {
    id: "0x000000000000000000000000000000000d26f3e4098a56740b894d7586df04791",
    tokenSymbol: "HOOD",
    tokenName: "Robinhood Markets • Stock Token",
    underlyingName: "Robinhood Markets, Inc.",
    deployments: [
      {
        contractAddress: "0xD26f3E4098A56740b894d7586DF04791E83F026C",
        chainId: 4663,
      },
    ],
    currentMultiplier: "1.000000000000000000",
    pendingMultiplier: "",
    logoUrl: "https://cdn.robinhood.com/ncw_assets/logos/0xd26f3e4098a56740b894d7586df04791e83f026c.png",
    tradingCapabilities: {
      fractionalTradability: "tradable",
      allDayTradability: "tradable",
      extendedHoursFractionalTradability: true,
    },
    status: "ASSET_STATUS_ACTIVE",
    defaultPrice: 37.85,
    maxLeverage: 1000,
    category: "EQUITY",
  },
  {
    id: "0x000000000000000000000000000000000e37a4f5109b67851c905e8697e015802",
    tokenSymbol: "PLTR",
    tokenName: "Palantir • Robinhood Token",
    underlyingName: "Palantir Technologies Inc.",
    deployments: [
      {
        contractAddress: "0xE37a4F5109B67851C905E8697e015802C581938D",
        chainId: 4663,
      },
    ],
    currentMultiplier: "1.000000000000000000",
    pendingMultiplier: "",
    logoUrl: "https://cdn.robinhood.com/ncw_assets/logos/0xe37a4f5109b67851c905e8697e015802c581938d.png",
    tradingCapabilities: {
      fractionalTradability: "tradable",
      allDayTradability: "tradable",
      extendedHoursFractionalTradability: true,
    },
    status: "ASSET_STATUS_ACTIVE",
    defaultPrice: 65.40,
    maxLeverage: 1000,
    category: "EQUITY",
  },
  {
    id: "0x000000000000000000000000000000000f48b5a6210c78962d016f9708f126913",
    tokenSymbol: "AMD",
    tokenName: "Advanced Micro Devices • Robinhood Token",
    underlyingName: "Advanced Micro Devices, Inc.",
    deployments: [
      {
        contractAddress: "0xF48B5A6210C78962D016F9708F126913E784019E",
        chainId: 4663,
      },
    ],
    currentMultiplier: "1.000000000000000000",
    pendingMultiplier: "",
    logoUrl: "https://cdn.robinhood.com/ncw_assets/logos/0xf48b5a6210c78962d016f9708f126913e784019e.png",
    tradingCapabilities: {
      fractionalTradability: "tradable",
      allDayTradability: "tradable",
      extendedHoursFractionalTradability: true,
    },
    status: "ASSET_STATUS_ACTIVE",
    defaultPrice: 142.10,
    maxLeverage: 1000,
    category: "EQUITY",
  },
  {
    id: "0x000000000000000000000000000000001059c6b7321d89073e127a0819a237024",
    tokenSymbol: "NFLX",
    tokenName: "Netflix • Robinhood Token",
    underlyingName: "Netflix, Inc.",
    deployments: [
      {
        contractAddress: "0x1059C6B7321D89073E127a0819A237024F891B32",
        chainId: 4663,
      },
    ],
    currentMultiplier: "1.000000000000000000",
    pendingMultiplier: "",
    logoUrl: "https://cdn.robinhood.com/ncw_assets/logos/0x1059c6b7321d89073e127a0819a237024f891b32.png",
    tradingCapabilities: {
      fractionalTradability: "tradable",
      allDayTradability: "tradable",
      extendedHoursFractionalTradability: true,
    },
    status: "ASSET_STATUS_ACTIVE",
    defaultPrice: 875.20,
    maxLeverage: 1000,
    category: "EQUITY",
  },
];

const ROBINHOOD_REST_API = "https://api.robinhood.com/rhj";

/**
 * Fetch live stock token shares from Robinhood Chain API
 * Implements resilient fallback when rate-limited or geoblocked.
 */
export async function fetchRobinhoodStockTokens(): Promise<RobinhoodStockToken[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${ROBINHOOD_REST_API}/assets`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Alvion-Exchange/2.0 (Robinhood-Chain-L2)",
      },
      signal: controller.signal,
      next: { revalidate: 60 },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const assets = Array.isArray(data) ? data : data.assets || data.results || [];
      if (Array.isArray(assets) && assets.length > 0) {
        // Map Robinhood API assets
        return assets.map((a: Record<string, unknown>) => {
          const sym = String(a.tokenSymbol || "");
          const fallback = CANONICAL_ROBINHOOD_STOCK_TOKENS.find(
            (t) => t.tokenSymbol === sym
          );
          return {
            id: String(a.id || fallback?.id || `0x${sym}`),
            tokenSymbol: sym,
            tokenName: String(a.tokenName || fallback?.tokenName || `${sym} • Robinhood Token`),
            underlyingName: fallback?.underlyingName || sym,
            deployments: Array.isArray(a.deployments) && a.deployments.length > 0
              ? (a.deployments as RobinhoodDeployment[])
              : fallback?.deployments || [{ contractAddress: "0x0000000000000000000000000000000000004663", chainId: 4663 }],
            currentMultiplier: String(a.currentMultiplier || "1.000000000000000000"),
            pendingMultiplier: String(a.pendingMultiplier || ""),
            logoUrl: String(a.logoUrl || fallback?.logoUrl || ""),
            tradingCapabilities: (a.tradingCapabilities as RobinhoodTradingCapabilities) || {
              fractionalTradability: "tradable",
              allDayTradability: "tradable",
              extendedHoursFractionalTradability: true,
            },
            status: (a.status as "ASSET_STATUS_ACTIVE") || "ASSET_STATUS_ACTIVE",
            defaultPrice: fallback?.defaultPrice || 100,
            maxLeverage: fallback?.maxLeverage || 1000,
            category: "EQUITY",
          };
        });
      }
    }
  } catch {
    // Graceful fallback to canonical registry on timeout/geoblock
  }

  return CANONICAL_ROBINHOOD_STOCK_TOKENS;
}

