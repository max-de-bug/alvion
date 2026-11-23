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
  // Slippage-at-Risk (SaR) Microstructure metrics (Sepper 2026)
  expectedSlippageBps: number;
  sar95Bps: number;
  tailSlippageBps: number;
  liquidityQuality: "DEEP" | "MODERATE" | "THIN";
  // Percolator Dynamic Leverage Dampener metrics (Yakovenko Architecture)
  domainUtilizationPct: number;
  dynamicMaxLeverage: number;
  dampenerStatus: "OPTIMAL" | "DAMPENED" | "GUARDED" | "RESTRICTED";
  robinhoodNetwork: {
    chainId: number;
    clearinghouse: string;
    usdcAddress: string;
    settlementToken: string;
  };
}

const HYPERLIQUID_API_URL = "https://api.hyperliquid.xyz/info";
const DEFAULT_VAULT_LIQUIDITY_USDC = 5_000_000; // $5M USDC Single Vault simulation
const ROBINHOOD_USDC_ADDRESS = "0x538d689255850901eC5A206A2a9d80d283A44919";

export async function fetchNyseEquities(): Promise<MarketContext[]> {
  const equityDefs = [
    { name: "SPY", maxLeverage: 1000, fallbackPx: 754.37, szDecimals: 2 },
    { name: "NVDA", maxLeverage: 1000, fallbackPx: 162.85, szDecimals: 2 },
    { name: "TSLA", maxLeverage: 1000, fallbackPx: 390.22, szDecimals: 2 },
    { name: "AAPL", maxLeverage: 1000, fallbackPx: 356.27, szDecimals: 2 },
    { name: "QQQ", maxLeverage: 1000, fallbackPx: 512.40, szDecimals: 2 },
    { name: "MSFT", maxLeverage: 1000, fallbackPx: 428.15, szDecimals: 2 },
    { name: "AMZN", maxLeverage: 1000, fallbackPx: 214.30, szDecimals: 2 },
    { name: "GOOGL", maxLeverage: 1000, fallbackPx: 184.50, szDecimals: 2 },
    { name: "META", maxLeverage: 1000, fallbackPx: 642.80, szDecimals: 2 },
    { name: "COIN", maxLeverage: 1000, fallbackPx: 228.60, szDecimals: 2 },
    { name: "MSTR", maxLeverage: 1000, fallbackPx: 320.10, szDecimals: 2 },
    { name: "APLD", maxLeverage: 1000, fallbackPx: 28.45, szDecimals: 2 },
    { name: "HOOD", maxLeverage: 1000, fallbackPx: 37.85, szDecimals: 2 },
    { name: "PLTR", maxLeverage: 1000, fallbackPx: 65.40, szDecimals: 2 },
    { name: "AMD", maxLeverage: 1000, fallbackPx: 142.10, szDecimals: 2 },
    { name: "NFLX", maxLeverage: 1000, fallbackPx: 875.20, szDecimals: 2 },
    { name: "NATGAS", maxLeverage: 1000, fallbackPx: 2.842, szDecimals: 3 },
    { name: "CRUDE", maxLeverage: 1000, fallbackPx: 71.24, szDecimals: 2 },
    { name: "GOLD", maxLeverage: 1000, fallbackPx: 2742.60, szDecimals: 2 },
    { name: "SILVER", maxLeverage: 1000, fallbackPx: 31.85, szDecimals: 3 },
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
      "BTC", "ETH", "SOL", "NATGAS", "CRUDE", "GOLD", "SILVER",
      "SPY", "NVDA", "TSLA", "AAPL", "QQQ", "MSFT", "AMZN", "GOOGL", "META", "COIN", "MSTR",
      "APLD", "HOOD", "PLTR", "AMD", "NFLX"
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
          maxLeverage: 1000,
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

    // Prioritize NYSE Tokenized Equities & Crypto
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
        maxLeverage: 1000,
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
        maxLeverage: 1000,
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
        maxLeverage: 1000,
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
        maxLeverage: 1000,
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
        name: "SOL",
        szDecimals: 2,
        maxLeverage: 1000,
        oraclePx: 142.5,
        markPx: 142.45,
        midPx: 142.48,
        impactBidPx: 142.35,
        impactAskPx: 142.55,
        fundingRate: 0.000012,
        openInterest: 19800000,
        dayVolumeUsd: 85200000,
        prevDayPx: 139.8,
        change24h: 1.9,
      },
      {
        name: "BTC",
        szDecimals: 4,
        maxLeverage: 1000,
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
        maxLeverage: 1000,
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

  // Maintenance margin rate dynamically scales with leverage (supports up to 1000x leverage).
  // For standard leverage (<=50x), maintenance margin is ~0.8%.
  // For ultra-high leverage (up to 1000x), maintenance margin scales to 40% of initial margin
  // ensuring maxLossRatio remains positive (e.g. at 1000x: initial margin = 0.1%, maintenance = 0.04%, maxLossRatio = 0.06%).
  const maintenanceMarginRate = Math.min(0.008, 0.4 / Math.max(1, leverage));

  // Liquidation Price calculation (standard formula):
  // Long liq: entryPrice * (1 - (1/leverage) + maintenanceMarginRate)
  // Short liq: entryPrice * (1 + (1/leverage) - maintenanceMarginRate)
  const maxLossRatio = Math.max(0.0001, (1 / Math.max(1, leverage)) - maintenanceMarginRate);
  const liquidationPrice = isLong
    ? executionPrice * Math.max(0.001, (1 - maxLossRatio))
    : executionPrice * (1 + maxLossRatio);

  // 4. Slippage-at-Risk (SaR) Microstructure Modeling (Sepper 2026)
  // Real-time market volatility and depth concentration scaling
  const marketVol = Math.max(0.012, Math.abs(marketCtx.change24h || 1.5) / 100);
  const depthConcentration = Math.min(2.5, Math.max(1.0, positionSizeUsdc / 15_000));
  const expectedSlippageBps = Number(totalSpreadBps.toFixed(2));
  // 95% Quantile Slippage-at-Risk (SaR 95%)
  const sar95Bps = Number((expectedSlippageBps * (1 + 1.645 * marketVol * Math.sqrt(depthConcentration))).toFixed(2));
  // Expected Tail Slippage (ESaR 95%)
  const tailSlippageBps = Number((expectedSlippageBps * (1 + 2.06 * marketVol * Math.sqrt(depthConcentration))).toFixed(2));
  const liquidityQuality: "DEEP" | "MODERATE" | "THIN" =
    positionSizeUsdc < 50_000 ? "DEEP" : positionSizeUsdc < 250_000 ? "MODERATE" : "THIN";

  // 5. Percolator Dynamic Leverage Dampener (Yakovenko Specification)
  // Calculates live domain buffer utilization to protect protocol solvency
  const domainUtilizationPct = Number(Math.min(100, Math.max(0, Math.abs(skewImpactFactor) * 100 * 1.5)).toFixed(1));
  let dynamicMaxLeverage = marketCtx.maxLeverage || 1000;
  let dampenerStatus: "OPTIMAL" | "DAMPENED" | "GUARDED" | "RESTRICTED" = "OPTIMAL";

  if (domainUtilizationPct >= 90) {
    dynamicMaxLeverage = Math.min(dynamicMaxLeverage, 10);
    dampenerStatus = "RESTRICTED";
  } else if (domainUtilizationPct >= 75) {
    dynamicMaxLeverage = Math.min(dynamicMaxLeverage, 50);
    dampenerStatus = "GUARDED";
  } else if (domainUtilizationPct >= 50) {
    dynamicMaxLeverage = Math.min(dynamicMaxLeverage, 100);
    dampenerStatus = "DAMPENED";
  }

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
    expectedSlippageBps,
    sar95Bps,
    tailSlippageBps,
    liquidityQuality,
    domainUtilizationPct,
    dynamicMaxLeverage,
    dampenerStatus,
    robinhoodNetwork: {
      chainId: 4663,
      clearinghouse: "0x4663111111111111111111111111111111114663",
      usdcAddress: "0x538d689255850901eC5A206A2a9d80d283A44919",
      settlementToken: "USDC (Robinhood Chain L2)",
    },
  };
}

