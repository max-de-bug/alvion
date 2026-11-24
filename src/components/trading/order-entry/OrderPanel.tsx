"use client";

import React from "react";
import { useTradingStore } from "@/stores/useTradingStore";
import { MarketContext, QuoteResult } from "@/lib/hyperliquid";
import { OrderPanelPro } from "./OrderPanelPro";
import { OrderPanelConsumer } from "./OrderPanelConsumer";

interface OrderPanelProps {
  orderType: "market" | "limit";
  setOrderType: (t: "market" | "limit") => void;
  isLong: boolean;
  setIsLong: (b: boolean) => void;
  limitPrice: string;
  setLimitPrice: (p: string) => void;
  currentMarket: MarketContext;
  leverage: number;
  setLeverage: (l: number) => void;
  marginUsdc: number;
  setMarginUsdc: (m: number) => void;
  walletBalance: number;
  quote: QuoteResult | null;
  loadingQuote: boolean;
  availableLongLiq: number;
  availableShortLiq: number;
  longFundingRate: number;
  shortFundingRate: number;
  formatUsdCompact: (val: number) => string;
  onExecuteTrade: () => void;
}

export const OrderPanel = React.memo<OrderPanelProps>(function OrderPanel(props) {
  const { tradingMode } = useTradingStore();

  return (
    <div className="w-full flex flex-col">
      {tradingMode === "consumer" ? (
        <OrderPanelConsumer
          currentMarket={props.currentMarket}
          isLong={props.isLong}
          setIsLong={props.setIsLong}
          leverage={props.leverage}
          setLeverage={props.setLeverage}
          marginUsdc={props.marginUsdc}
          setMarginUsdc={props.setMarginUsdc}
          walletBalance={props.walletBalance}
          quote={props.quote}
          loadingQuote={props.loadingQuote}
          onExecuteTrade={props.onExecuteTrade}
        />
      ) : (
        <OrderPanelPro
          currentMarket={props.currentMarket}
          isLong={props.isLong}
          setIsLong={props.setIsLong}
          orderType={props.orderType}
          setOrderType={props.setOrderType}
          limitPrice={props.limitPrice}
          setLimitPrice={props.setLimitPrice}
          leverage={props.leverage}
          setLeverage={props.setLeverage}
          marginUsdc={props.marginUsdc}
          setMarginUsdc={props.setMarginUsdc}
          walletBalance={props.walletBalance}
          quote={props.quote}
          loadingQuote={props.loadingQuote}
          availableLongLiq={props.availableLongLiq}
          availableShortLiq={props.availableShortLiq}
          longFundingRate={props.longFundingRate}
          shortFundingRate={props.shortFundingRate}
          formatUsdCompact={props.formatUsdCompact}
          onExecuteTrade={props.onExecuteTrade}
        />
      )}
    </div>
  );
});
