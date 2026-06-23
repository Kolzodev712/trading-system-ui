import type {
  DexIndicator,
  DexOrder,
  DexQuote,
  DexStrategyStatus,
  Orderbook,
  StrategyStatus,
} from "@/gen/trading_cli_pb";

/** Stable fallbacks for Zustand selectors — never use `?? []` inline in selectors. */
export const EMPTY_STRATEGIES: readonly StrategyStatus[] = [];
export const EMPTY_ORDERBOOKS: readonly Orderbook[] = [];
export const EMPTY_DEX_QUOTES: readonly DexQuote[] = [];
export const EMPTY_DEX_STRATEGIES: readonly DexStrategyStatus[] = [];
export const EMPTY_DEX_INDICATORS: readonly DexIndicator[] = [];
export const EMPTY_DEX_ORDERS: readonly DexOrder[] = [];
