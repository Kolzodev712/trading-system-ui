import type { Orderbook, StrategyStatus } from "@/gen/trading_cli_pb";

/** Stable fallbacks for Zustand selectors — never use `?? []` inline in selectors. */
export const EMPTY_STRATEGIES: readonly StrategyStatus[] = [];
export const EMPTY_ORDERBOOKS: readonly Orderbook[] = [];
