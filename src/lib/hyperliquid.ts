export interface MarketContext {
  name: string;
  szDecimals: number;
  maxLeverage: number;
  oraclePx: number;
  markPx: number;
  midPx: number;
  impactBidPx: number;
  impactAskPx: number;
  fundingRate: number; // 1h funding rate
  openInterest: number;
  dayVolumeUsd: number;
  prevDayPx: number;
  change24h: number;
}

export interface QuoteParams {
  market: string;
  isLong: boolean;
  marginUsdc: number;
  leverage: number;
  vaultLiquidityUsdc?: number;
  vaultNetSkewUsdc?: number; // positive = long heavy, negative = short heavy
}

export interface QuoteResult {
  market: string;
  isLong: boolean;
  marginUsdc: number;
  leverage: number;
  positionSizeUsdc: number;
  oraclePrice: number;
  markPrice: number;
  baseSpreadBps: number;
  skewSpreadBps: number;
  impactSpreadBps: number;
  totalSpreadBps: number;
  executionPrice: number;
  priceImpactPct: number;
  liquidationPrice: number;
  borrowRatePerHour: number;
  tradingFeeUsdc: number;
  maxPayoutUsdc: number;
  avalancheNetwork: {
    chainId: number;
    name: string;
    usdcAddress: string;
    settlementToken: string;
  };
}

const HYPERLIQUID_API_URL = "https://api.hyperliquid.xyz/info";
const DEFAULT_VAULT_LIQUIDITY_USDC = 5_000_000; // $5M USDC Single Vault simulation
const AVALANCHE_USDC_ADDRESS = "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E";

export async function fetchNyseEquities(): Promise<MarketContext[]> {
  const equityDefs = [
    { name: "SPY", maxLeverage: 20, fallbackPx: 754.37, szDecimals: 2 },
    { name: "NVDA", maxLeverage: 10, fallbackPx: 162.85, szDecimals: 2 },
    { name: "TSLA", maxLeverage: 10, fallbackPx: 390.22, szDecimals: 2 },
    { name: "AAPL", maxLeverage: 10, fallbackPx: 356.27, szDecimals: 2 },
    { name: "QQQ", maxLeverage: 20, fallbackPx: 512.40, szDecimals: 2 },
    { name: "MSFT", maxLeverage: 10, fallbackPx: 428.15, szDecimals: 2 },
    { name: "AMZN", maxLeverage: 10, fallbackPx: 214.30, szDecimals: 2 },
    { name: "GOOGL", maxLeverage: 10, fallbackPx: 184.50, szDecimals: 2 },
    { name: "META", maxLeverage: 10, fallbackPx: 642.80, szDecimals: 2 },
    { name: "COIN", maxLeverage: 10, fallbackPx: 228.60, szDecimals: 2 },
    { name: "MSTR", maxLeverage: 10, fallbackPx: 320.10, szDecimals: 2 },
  ];

  const results: MarketContext[] = [];

  await Promise.all(
    equityDefs.map(async (eq) => {
      let price = eq.fallbackPx;
      let prevClose = eq.fallbackPx;
      let dayVol = 50_000_000;

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1200);
        const res = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${eq.name}?interval=1d&range=1d`,
          {
            headers: { "User-Agent": "Mozilla/5.0" },
            signal: controller.signal,
          }
        );
        clearTimeout(timeout);

        if (res.ok) {
          const json = await res.json();
          const meta = json.chart?.result?.[0]?.meta;
          if (meta) {
            price = Number(meta.regularMarketPrice || meta.fulldayPrice || eq.fallbackPx);
            prevClose = Number(meta.previousClose || meta.chartPreviousClose || price);
            dayVol = Number(meta.regularMarketVolume || 50_000_000);
          }
        }
      } catch {
        // Use resilient fallback on network timeout
      }

      const change24h = prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0;
      results.push({
        name: eq.name,
        szDecimals: eq.szDecimals,
        maxLeverage: eq.maxLeverage,
        oraclePx: price,
        markPx: price,
        midPx: price,
        impactBidPx: Number((price * 0.9998).toFixed(2)),
        impactAskPx: Number((price * 1.0002).toFixed(2)),
        fundingRate: 0.00008, // ~0.008% 1h adaptive funding
        openInterest: 25_000_000,
        dayVolumeUsd: dayVol * price * 0.0005,
        prevDayPx: prevClose,
        change24h: Number(change24h.toFixed(2)),
      });
    })
  );

  return results;
}

export async function fetchHyperliquidMarkets(): Promise<MarketContext[]> {
  try {
    const [nyseEquities, hlRes] = await Promise.all([
      fetchNyseEquities(),
      fetch(HYPERLIQUID_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "metaAndAssetCtxs" }),
        next: { revalidate: 2 }, // cache 2s
      }).catch(() => null),
    ]);

    const featuredTokens = [
      "SPY", "NVDA", "TSLA", "AAPL", "QQQ", "MSFT", "AMZN", "GOOGL", "META", "COIN", "MSTR",
      "AVAX", "BTC", "ETH", "SOL"
    ];
    const markets: MarketContext[] = [...nyseEquities];

    if (hlRes && hlRes.ok) {
      const data = await hlRes.json();
      const metaUniverse = data[0]?.universe || [];
      const assetContexts = data[1] || [];

      metaUniverse.forEach((u: { name: string; szDecimals: number; maxLeverage?: number }, idx: number) => {
        const ctx = assetContexts[idx];
        if (!ctx) return;

        const oraclePx = parseFloat(ctx.oraclePx || "0");
        const markPx = parseFloat(ctx.markPx || ctx.midPx || "0");
        const midPx = parseFloat(ctx.midPx || ctx.markPx || "0");
        const prevDayPx = parseFloat(ctx.prevDayPx || markPx.toString());
        const impactBids = ctx.impactPxs ? parseFloat(ctx.impactPxs[0] || markPx.toString()) : markPx;
        const impactAsks = ctx.impactPxs ? parseFloat(ctx.impactPxs[1] || markPx.toString()) : markPx;
        const fundingRate = parseFloat(ctx.funding || "0");
        const openInterest = parseFloat(ctx.openInterest || "0");
        const dayVolumeUsd = parseFloat(ctx.dayNtlVlm || "0");
        const change24h = prevDayPx > 0 ? ((markPx - prevDayPx) / prevDayPx) * 100 : 0;

        markets.push({
          name: u.name,
          szDecimals: u.szDecimals,
          maxLeverage: Math.min(100, Math.max(u.maxLeverage || 50, 100)),
          oraclePx,
          markPx,
          midPx,
          impactBidPx: impactBids,
          impactAskPx: impactAsks,
          fundingRate,
          openInterest,
          dayVolumeUsd,
          prevDayPx,
          change24h,
        });
      });
    }

    // Prioritize NYSE Tokenized Equities & Avalanche Crypto
    return markets.sort((a, b) => {
      const aFeatured = featuredTokens.indexOf(a.name);
      const bFeatured = featuredTokens.indexOf(b.name);
      if (aFeatured !== -1 && bFeatured !== -1) return aFeatured - bFeatured;
      if (aFeatured !== -1) return -1;
      if (bFeatured !== -1) return 1;
      return b.dayVolumeUsd - a.dayVolumeUsd;
    });
  } catch (error) {
    console.error("Error fetching markets:", error);
    return [
      {
        name: "SPY",
        szDecimals: 2,
        maxLeverage: 20,
        oraclePx: 754.37,
        markPx: 754.37,
        midPx: 754.37,
        impactBidPx: 754.2,
        impactAskPx: 754.5,
        fundingRate: 0.00008,
        openInterest: 25000000,
        dayVolumeUsd: 150000000,
        prevDayPx: 757.12,
        change24h: -0.36,
      },
      {
        name: "NVDA",
        szDecimals: 2,
        maxLeverage: 10,
        oraclePx: 162.85,
        markPx: 162.85,
        midPx: 162.85,
        impactBidPx: 162.8,
        impactAskPx: 162.9,
        fundingRate: 0.00009,
        openInterest: 18000000,
        dayVolumeUsd: 95000000,
        prevDayPx: 166.19,
        change24h: -2.01,
      },
      {
        name: "TSLA",
        szDecimals: 2,
        maxLeverage: 10,
        oraclePx: 390.22,
        markPx: 390.22,
        midPx: 390.22,
        impactBidPx: 390.1,
        impactAskPx: 390.35,
        fundingRate: 0.00008,
        openInterest: 14000000,
        dayVolumeUsd: 78000000,
        prevDayPx: 397.45,
        change24h: -1.82,
      },
      {
        name: "AAPL",
        szDecimals: 2,
        maxLeverage: 10,
        oraclePx: 356.27,
        markPx: 356.27,
        midPx: 356.27,
        impactBidPx: 356.2,
        impactAskPx: 356.35,
        fundingRate: 0.00008,
        openInterest: 20000000,
        dayVolumeUsd: 82000000,
        prevDayPx: 354.88,
        change24h: 0.39,
      },
      {
        name: "AVAX",
        szDecimals: 2,
        maxLeverage: 100,
        oraclePx: 7.18,
        markPx: 7.17,
        midPx: 7.175,
        impactBidPx: 7.165,
        impactAskPx: 7.185,
        fundingRate: -0.000016,
        openInterest: 2420000,
        dayVolumeUsd: 26500000,
        prevDayPx: 7.49,
        change24h: -4.1,
      },
      {
        name: "BTC",
        szDecimals: 4,
        maxLeverage: 100,
        oraclePx: 64550.0,
        markPx: 64530.0,
        midPx: 64520.0,
        impactBidPx: 64500.0,
        impactAskPx: 64540.0,
        fundingRate: 0.000004,
        openInterest: 35900,
        dayVolumeUsd: 6760000000,
        prevDayPx: 65900.0,
        change24h: -2.05,
      },
      {
        name: "ETH",
        szDecimals: 3,
        maxLeverage: 100,
        oraclePx: 2680.0,
        markPx: 2678.5,
        midPx: 2679.0,
        impactBidPx: 2677.0,
        impactAskPx: 2681.0,
        fundingRate: 0.000002,
        openInterest: 185000,
        dayVolumeUsd: 2150000000,
        prevDayPx: 2740.0,
        change24h: -2.2,
      },
    ];
  }
}

/**
 * Calculates execution quote using Hyperliquid Oracle Price + Dynamic Spread model
 * fills immediately against the single USDC liquidity vault.
 */
export function calculateQuote(
  marketCtx: MarketContext,
  params: QuoteParams
): QuoteResult {
  const {
    isLong,
    marginUsdc,
    leverage,
    vaultLiquidityUsdc = DEFAULT_VAULT_LIQUIDITY_USDC,
    vaultNetSkewUsdc = 350_000, // simulated net long bias in vault
  } = params;

  const positionSizeUsdc = marginUsdc * leverage;
  const oraclePrice = marketCtx.oraclePx > 0 ? marketCtx.oraclePx : marketCtx.markPx;

  // 1. Base Spread: 5 bps (0.05%)
  const baseSpreadBps = 5.0;

  // 2. Dynamic Skew Spread:
  // If traders are already net long and this order is LONG, spread increases to disincentivize skew.
  // If this trade decreases skew (SHORT when vault is net long), spread decreases/discounted.
  const skewImpactFactor = (vaultNetSkewUsdc / vaultLiquidityUsdc); // e.g. 0.07 (7%)
  const tradeDirectionFactor = isLong ? 1 : -1;
  const skewSpreadBps = Math.max(-2.0, (skewImpactFactor * tradeDirectionFactor) * 15.0);

  // 3. Size / Impact Spread (order size relative to vault single pool capacity)
  const sizeImpactRatio = positionSizeUsdc / vaultLiquidityUsdc;
  const impactSpreadBps = Math.min(50, sizeImpactRatio * 200.0); // e.g., 0.1% for $25k order on $5M vault

  // Total dynamic spread in bps
  const totalSpreadBps = Math.max(2.0, baseSpreadBps + skewSpreadBps + impactSpreadBps);
  const totalSpreadRatio = totalSpreadBps / 10_000;

  // Execution Price:
  // Longs pay Oracle * (1 + spread), Shorts receive Oracle * (1 - spread)
  const executionPrice = isLong
    ? oraclePrice * (1 + totalSpreadRatio)
    : oraclePrice * (1 - totalSpreadRatio);

  const priceImpactPct = (totalSpreadBps / 100);

  // Maintenance margin: 0.8% (allows up to 100x leverage)
  const maintenanceMarginRate = 0.008;

  // Liquidation Price calculation (standard formula):
  // Long liq: entryPrice * (1 - (1/leverage) + maintenanceMarginRate)
  // Short liq: entryPrice * (1 + (1/leverage) - maintenanceMarginRate)
  const maxLossRatio = (1 / leverage) - maintenanceMarginRate;
  const liquidationPrice = isLong
    ? executionPrice * Math.max(0.01, (1 - maxLossRatio))
    : executionPrice * (1 + maxLossRatio);

  // Trading fee: 6 bps of notional
  const tradingFeeUsdc = positionSizeUsdc * 0.0006;

  // Borrow rate per hour: 0.0015% (13% APR)
  const borrowRatePerHour = 0.000015;

  // Max payout capped at 400% of collateral (avoids vault drain on extreme outlier moves)
  const maxPayoutUsdc = marginUsdc * 4;

  return {
    market: marketCtx.name,
    isLong,
    marginUsdc,
    leverage,
    positionSizeUsdc,
    oraclePrice,
    markPrice: marketCtx.markPx,
    baseSpreadBps,
    skewSpreadBps,
    impactSpreadBps,
    totalSpreadBps,
    executionPrice,
    priceImpactPct,
    liquidationPrice,
    borrowRatePerHour,
    tradingFeeUsdc,
    maxPayoutUsdc,
    avalancheNetwork: {
      chainId: 43114, // Avalanche C-Chain
      name: "Avalanche C-Chain",
      usdcAddress: AVALANCHE_USDC_ADDRESS,
      settlementToken: "USDC (Native Circle)",
    },
  };
}

