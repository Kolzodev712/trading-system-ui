export type StatusFreshness = "live" | "stale" | "unknown";
export type RunnerMode = "levels" | "strategies" | "dex";

export function formatVenueMode(
  venue: string | undefined,
  environment: string | undefined,
  executionMode: string | undefined,
): string {
  const v = (venue || "UNKNOWN").toUpperCase();
  const e = (environment || "UNKNOWN").toUpperCase();
  const m = (executionMode || "UNKNOWN").toUpperCase();
  return `${v} ${e} + ${m}`;
}

export function formatSessionLabel(
  freshness: StatusFreshness,
  venue?: string,
  environment?: string,
  executionMode?: string,
): string {
  if (freshness === "unknown") return "STATUS UNKNOWN";
  const core = formatVenueMode(venue, environment, executionMode);
  if (freshness === "stale") return `STATUS STALE · last ${core}`;
  return core;
}

export function exchangeOrdersLabel(
  executionMode: string | undefined,
  activeOrders: number,
): string {
  if ((executionMode || "").toLowerCase() === "shadow") {
    return "0 exchange orders (shadow)";
  }
  return String(activeOrders);
}

export function displayReadiness(
  freshness: StatusFreshness,
  readiness: string | undefined,
): string {
  if (freshness !== "live") return "unknown";
  return readiness?.trim() ? readiness : "unknown";
}

export function resolveRunnerMode(
  runnerMode: string | undefined,
  hasDex: boolean,
  strategyCount: number,
): RunnerMode {
  if (runnerMode === "dex" || runnerMode === "strategies" || runnerMode === "levels") {
    return runnerMode;
  }
  if (hasDex) return "dex";
  return strategyCount > 0 ? "strategies" : "levels";
}

export function executionPausedNote(
  tradingEnabled: boolean,
  executionMode: string | undefined,
): string | null {
  const shadow = (executionMode || "").toLowerCase() === "shadow";
  if (shadow && !tradingEnabled) {
    return "Model status remains visible. Shadow forbids exchange orders; global execution is paused.";
  }
  if (shadow) {
    return "Shadow: model decisions only. Zero exchange order calls.";
  }
  if (!tradingEnabled) {
    return "Model status remains visible. Global execution is paused.";
  }
  return null;
}
