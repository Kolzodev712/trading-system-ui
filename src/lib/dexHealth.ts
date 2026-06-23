import type { DexIndicator } from "@/gen/trading_cli_pb";
import { formatTimestamp } from "@/lib/utils";
import { matchesPool } from "@/lib/dexPool";
import { useFilteredDexIndicators, useTradingStore } from "@/store/tradingStore";

export type DexStreamHealth =
  | { status: "waiting"; label: string }
  | { status: "live"; label: string; latestTimestamp: number };

export function dexIndicatorHealth(
  indicators: readonly DexIndicator[],
  poolTab: string,
): DexStreamHealth {
  const filtered = poolTab
    ? indicators.filter((i) => matchesPool(i.pool, poolTab))
    : indicators;

  if (filtered.length === 0) {
    return { status: "waiting", label: "Waiting for first indicator tick (~1s)" };
  }

  const latest = filtered.reduce((max, i) => {
    const ts = Number(i.timestamp);
    return Number.isFinite(ts) && ts > max ? ts : max;
  }, 0);

  return {
    status: "live",
    label: `Indicators live · ${formatTimestamp(latest)}`,
    latestTimestamp: latest,
  };
}

export function useDexStreamHealth(): DexStreamHealth {
  const poolTab = useTradingStore((s) => {
    const orderbooks = s.monitoringData?.orderbooks ?? [];
    const idx = s.selectedOrderbookIndex;
    if (orderbooks.length === 0) return "";
    const safe = Math.min(Math.max(0, idx), orderbooks.length - 1);
    return orderbooks[safe]?.pair ?? "";
  });
  const indicators = useFilteredDexIndicators();
  return dexIndicatorHealth(indicators, poolTab);
}
