import { describe, expect, it } from "vitest";
import {
  computeStatusFreshness,
  displayReadiness,
  exchangeOrdersLabel,
  executionPausedNote,
  formatCandidateIdentity,
  formatSessionLabel,
  formatVenueMode,
  resolveRunnerMode,
  SNAPSHOT_STALE_MS,
  snapshotIsComplete,
  statusIsActionable,
  STREAM_SILENCE_MS,
} from "@/lib/operatorStatus";

describe("formatCandidateIdentity", () => {
  it("keeps rejected-alpha research, BASELINE role, and SHADOW mode distinct", () => {
    expect(
      formatCandidateIdentity({
        researchDisposition: "REJECTED AS VALIDATED ALPHA",
        operationalRole: "BASELINE",
        executionMode: "shadow",
      }),
    ).toBe("REJECTED AS VALIDATED ALPHA · BASELINE · SHADOW");
  });
});

describe("formatVenueMode", () => {
  it("keeps venue, environment and execution mode distinct", () => {
    expect(formatVenueMode("BYBIT", "MAINNET", "shadow")).toBe(
      "BYBIT MAINNET + SHADOW",
    );
    expect(formatVenueMode("PAPER", "LOCAL", "exchange")).toBe(
      "PAPER LOCAL + EXCHANGE",
    );
    expect(formatVenueMode("BYBIT", "DEMO", "exchange")).toBe(
      "BYBIT DEMO + EXCHANGE",
    );
    expect(formatVenueMode("BYBIT", "TESTNET", "exchange")).toBe(
      "BYBIT TESTNET + EXCHANGE",
    );
    expect(formatVenueMode("DEEPBOOK", "TESTNET", "exchange")).toBe(
      "DEEPBOOK TESTNET + EXCHANGE",
    );
  });
});

describe("formatSessionLabel", () => {
  it("marks disconnected and stale snapshots unready", () => {
    expect(formatSessionLabel("unknown")).toBe("STATUS UNKNOWN");
    expect(
      formatSessionLabel("stale", "BYBIT", "MAINNET", "shadow"),
    ).toBe("STATUS STALE · last BYBIT MAINNET + SHADOW");
    expect(
      formatSessionLabel("live", "BYBIT", "MAINNET", "shadow"),
    ).toBe("BYBIT MAINNET + SHADOW");
  });
});

describe("shadow order display", () => {
  it("shows the observed count and flags a nonzero shadow count", () => {
    expect(exchangeOrdersLabel("shadow", 0)).toEqual({
      text: "0",
      violation: false,
    });
    expect(exchangeOrdersLabel("shadow", 3)).toEqual({
      text: "3 exchange orders (shadow violation)",
      violation: true,
    });
    expect(exchangeOrdersLabel("exchange", 3)).toEqual({
      text: "3",
      violation: false,
    });
  });
});

describe("computeStatusFreshness", () => {
  const complete = {
    venue: "BYBIT",
    environment: "MAINNET",
    executionMode: "shadow",
  };

  it("waits for the first stream update", () => {
    expect(
      computeStatusFreshness({
        connected: true,
        receivedFirstStreamUpdate: false,
        streamEnded: false,
        streamConnected: false,
        lastStreamUpdateAtMs: null,
        nowMs: 10_000,
        ...complete,
      }),
    ).toBe("unknown");
  });

  it("marks a cleanly ended stream stale", () => {
    expect(
      computeStatusFreshness({
        connected: true,
        receivedFirstStreamUpdate: true,
        streamEnded: true,
        streamConnected: false,
        lastStreamUpdateAtMs: 9_000,
        snapshotUnixMs: 9_000,
        nowMs: 9_500,
        ...complete,
      }),
    ).toBe("stale");
  });

  it("marks a silent stream stale", () => {
    expect(
      computeStatusFreshness({
        connected: true,
        receivedFirstStreamUpdate: true,
        streamEnded: false,
        streamConnected: true,
        lastStreamUpdateAtMs: 1_000,
        snapshotUnixMs: 1_000,
        nowMs: 1_000 + STREAM_SILENCE_MS + 1,
        ...complete,
      }),
    ).toBe("stale");
  });

  it("marks an old snapshot stale even on the main screen", () => {
    expect(
      computeStatusFreshness({
        connected: true,
        receivedFirstStreamUpdate: true,
        streamEnded: false,
        streamConnected: true,
        lastStreamUpdateAtMs: 20_000,
        snapshotUnixMs: 1_000,
        nowMs: 1_000 + SNAPSHOT_STALE_MS + 1,
        ...complete,
      }),
    ).toBe("stale");
  });

  it("treats incomplete venue labels as unknown", () => {
    expect(snapshotIsComplete({ venue: "UNKNOWN", environment: "LOCAL", executionMode: "exchange" })).toBe(false);
    expect(
      computeStatusFreshness({
        connected: true,
        receivedFirstStreamUpdate: true,
        streamEnded: false,
        streamConnected: true,
        lastStreamUpdateAtMs: 5_000,
        snapshotUnixMs: 5_000,
        nowMs: 5_000,
        venue: "UNKNOWN",
        environment: "LOCAL",
        executionMode: "exchange",
      }),
    ).toBe("unknown");
  });

  it("treats UNKNOWN execution mode as unknown", () => {
    expect(
      snapshotIsComplete({
        venue: "BYBIT",
        environment: "MAINNET",
        executionMode: "UNKNOWN",
      }),
    ).toBe(false);
    expect(
      computeStatusFreshness({
        connected: true,
        receivedFirstStreamUpdate: true,
        streamEnded: false,
        streamConnected: true,
        lastStreamUpdateAtMs: 5_000,
        snapshotUnixMs: 5_000,
        nowMs: 5_000,
        venue: "BYBIT",
        environment: "MAINNET",
        executionMode: "UNKNOWN",
      }),
    ).toBe("unknown");
    expect(statusIsActionable("unknown")).toBe(false);
  });

  it("treats a missing, zero, or invalid snapshot timestamp as unknown", () => {
    const liveFields = {
      connected: true,
      receivedFirstStreamUpdate: true,
      streamEnded: false,
      streamConnected: true,
      lastStreamUpdateAtMs: 5_000,
      nowMs: 5_000,
      ...complete,
    };
    expect(computeStatusFreshness({ ...liveFields })).toBe("unknown");
    expect(computeStatusFreshness({ ...liveFields, snapshotUnixMs: 0 })).toBe(
      "unknown",
    );
    expect(computeStatusFreshness({ ...liveFields, snapshotUnixMs: -1 })).toBe(
      "unknown",
    );
    expect(
      computeStatusFreshness({ ...liveFields, snapshotUnixMs: Number.NaN }),
    ).toBe("unknown");
  });

  it("is live only after a fresh complete stream snapshot", () => {
    expect(
      computeStatusFreshness({
        connected: true,
        receivedFirstStreamUpdate: true,
        streamEnded: false,
        streamConnected: true,
        lastStreamUpdateAtMs: 5_000,
        snapshotUnixMs: 5_000,
        nowMs: 5_500,
        ...complete,
      }),
    ).toBe("live");
    expect(statusIsActionable("live")).toBe(true);
    expect(statusIsActionable("stale")).toBe(false);
    expect(statusIsActionable("unknown")).toBe(false);
  });
});

describe("displayReadiness", () => {
  it("does not keep Ready when the stream is stale", () => {
    expect(displayReadiness("stale", "ready")).toBe("unknown");
    expect(displayReadiness("unknown", "ready")).toBe("unknown");
    expect(displayReadiness("live", "ready")).toBe("ready");
  });
});

describe("resolveRunnerMode", () => {
  it("uses the server-reported mode instead of inferring from a nonempty list", () => {
    expect(resolveRunnerMode("levels", false, 2)).toBe("levels");
    expect(resolveRunnerMode("strategies", false, 0)).toBe("strategies");
    expect(resolveRunnerMode("", false, 2)).toBe("strategies");
  });
});

describe("executionPausedNote", () => {
  it("keeps model visibility when execution is paused or in shadow", () => {
    expect(executionPausedNote(false, "shadow")).toContain("Model status remains visible");
    expect(executionPausedNote(true, "shadow")).toContain("observed order count");
    expect(executionPausedNote(true, "exchange")).toBeNull();
  });
});
