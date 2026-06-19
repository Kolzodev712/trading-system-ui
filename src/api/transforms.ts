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
