export type LevelEnabledIndicator = "active" | "paused" | "disabled";

export function levelEnabledIndicator(
  levelEnabled: boolean,
  globalTradingEnabled: boolean,
): LevelEnabledIndicator {
  if (!levelEnabled) return "disabled";
  if (globalTradingEnabled) return "active";
  return "paused";
}

export type LevelStatusVisual = {
  icon: string;
  className: string;
};

export function levelStatusVisual(status: string): LevelStatusVisual {
  switch (status) {
    case "Created":
    case "Posted":
      return { icon: "●", className: "text-yellow-400" };
    case "Filled":
      return { icon: "✓", className: "text-green-400" };
    case "Cancelled":
      return { icon: "✗", className: "text-red-400" };
    case "Paused":
      return { icon: "⏸", className: "text-fuchsia-400" };
    default:
      return { icon: "?", className: "text-muted-foreground" };
  }
}

export function strategyEnabledVisual(enabled: boolean): LevelStatusVisual {
  return enabled
    ? { icon: "●", className: "text-green-400" }
    : { icon: "⏸", className: "text-red-400" };
}

export function pnlClassName(value: string): string {
  return value.startsWith("-") ? "text-red-400" : "text-green-400";
}

export function sideClassName(side: string): string {
  if (side === "Long" || side === "Buy") return "text-green-400";
  if (side === "Short" || side === "Sell") return "text-red-400";
  return "text-foreground";
}

export function stripFixed(value: string): string {
  if (value.startsWith("Fixed(") && value.endsWith(")")) {
    return value.slice(6, -1);
  }
  return value;
}

export function wrapFixed(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("Fixed(")) return trimmed;
  return `Fixed(${trimmed})`;
}

export function reverseTrades<T>(trades: T[]): T[] {
  return [...trades].reverse();
}

/** CEX monitoring emits private account executions, newest first. Sort explicitly
 * before DataTable applies its 15-row limit; never reverse the latest page. */
export function newestTradesFirst<T extends { timestamp: bigint | number }>(
  trades: T[],
): T[] {
  return [...trades].sort((a, b) =>
    a.timestamp === b.timestamp ? 0 : a.timestamp > b.timestamp ? -1 : 1,
  );
}

const sofiaTradeTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Sofia",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
  timeZoneName: "short",
});

/** Trade.timestamp is Unix milliseconds from the exchange, not seconds. */
export function formatTradeTimeSofia(timestamp: bigint | number): string {
  const millis = Number(timestamp);
  if (!Number.isFinite(millis) || millis <= 0) return "—";
  const date = new Date(millis);
  return Number.isNaN(date.getTime()) ? "—" : sofiaTradeTime.format(date);
}

export function sumDecimalStrings(values: string[]): number {
  return values.reduce((sum, v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? sum + n : sum;
  }, 0);
}

export function findCollateralBalance(
  balances: { asset: string; total: string }[],
): string {
  const usdt = balances.find((b) => b.asset === "USDT" || b.asset === "USD");
  return usdt?.total ?? "0";
}

/** Resolve DEX mint to human label (TUI: asset_label). */
export function dexAssetLabel(
  mint: string,
  assetLabels: Record<string, string> | undefined,
): string {
  if (assetLabels?.[mint]) return assetLabels[mint];
  const segment = mint.split("::").pop();
  return segment || mint;
}

/** Show resolved price when available, else config price spec. */
export function dexQuotePriceDisplay(
  resolvedPrice: string,
  configPrice: string,
): string {
  return resolvedPrice?.trim() ? resolvedPrice : configPrice;
}

/** Truncate long on-chain ids for table display. */
export function truncateMiddle(value: string, head = 6, tail = 4): string {
  if (!value) return "—";
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

export function dexEnabledBadge(enabled: boolean): string {
  return enabled ? "on" : "off";
}
