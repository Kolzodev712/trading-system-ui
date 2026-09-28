export type StatusFreshness = "live" | "stale" | "unknown";
export type RunnerMode = "levels" | "strategies" | "dex";

export const SNAPSHOT_STALE_MS = 15_000;
export const STREAM_SILENCE_MS = 8_000;

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

export function snapshotUnixMsNumber(
  value: bigint | number | undefined,
): number | undefined {
  if (value === undefined || value === null) return undefined;
  const n = typeof value === "bigint" ? Number(value) : value;
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return n;
}

export function snapshotIsComplete(args: {
  venue?: string;
  environment?: string;
  executionMode?: string;
}): boolean {
  const venue = (args.venue || "").trim().toUpperCase();
  const environment = (args.environment || "").trim().toUpperCase();
  const mode = (args.executionMode || "").trim().toLowerCase();
  const knownMode = mode === "shadow" || mode === "exchange";
  return Boolean(
    venue &&
      venue !== "UNKNOWN" &&
      environment &&
      environment !== "UNKNOWN" &&
      knownMode,
  );
}

export function computeStatusFreshness(args: {
  connected: boolean;
  receivedFirstStreamUpdate: boolean;
  streamEnded: boolean;
  streamConnected: boolean;
  lastStreamUpdateAtMs: number | null;
  snapshotUnixMs?: bigint | number;
  nowMs: number;
  venue?: string;
  environment?: string;
  executionMode?: string;
}): StatusFreshness {
  if (!args.connected) return "unknown";
  if (!args.receivedFirstStreamUpdate) return "unknown";
  if (!snapshotIsComplete(args)) return "unknown";
  const snapMs = snapshotUnixMsNumber(args.snapshotUnixMs);
  if (snapMs == null) return "unknown";
  if (args.streamEnded || !args.streamConnected) return "stale";
  if (
    args.lastStreamUpdateAtMs != null &&
    args.nowMs - args.lastStreamUpdateAtMs > STREAM_SILENCE_MS
  ) {
    return "stale";
  }
  if (args.nowMs - snapMs > SNAPSHOT_STALE_MS) {
    return "stale";
  }
  return "live";
}

export const STALE_CONTROLS_MESSAGE =
  "Status is stale or incomplete; controls are blocked until a live snapshot arrives.";

export function statusIsActionable(freshness: StatusFreshness): boolean {
  return freshness === "live";
}

export function formatCandidateIdentity(args: {
  researchDisposition?: string;
  operationalRole?: string;
  executionMode?: string;
}): string {
  const research = (args.researchDisposition || "—").trim() || "—";
  const role = (args.operationalRole || "—").trim() || "—";
  const mode = (args.executionMode || "unknown").toUpperCase();
  return `${research} · ${role} · ${mode}`;
}

export function exchangeOrdersLabel(
  executionMode: string | undefined,
  activeOrders: number,
): { text: string; violation: boolean } {
  const shadow = (executionMode || "").toLowerCase() === "shadow";
  if (shadow && activeOrders > 0) {
    return {
      text: `${activeOrders} exchange orders (shadow violation)`,
      violation: true,
    };
  }
  return { text: String(activeOrders), violation: false };
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
  entriesPaused?: boolean,
  flattenLatched?: boolean,
): string | null {
  const shadow = (executionMode || "").toLowerCase() === "shadow";
  if (flattenLatched) {
    return "Flatten latch is held. Strategy target cannot reopen until Resume. A successful flatten RPC is not a verified flat account.";
  }
  if (entriesPaused) {
    return "PauseEntries: evaluation continues; exposure increases are blocked. This is not the legacy global toggle.";
  }
  if (shadow && !tradingEnabled) {
    return "Model status remains visible. Shadow forbids new exchange orders; global execution is paused.";
  }
  if (shadow) {
    return "Shadow: model decisions only. New exchange orders are forbidden; the observed order count is shown separately.";
  }
  if (!tradingEnabled) {
    return "Model status remains visible. Global execution is paused (legacy toggle cancels working orders).";
  }
  return null;
}
