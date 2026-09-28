import { describe, expect, it } from "vitest";
import {
  displayReadiness,
  exchangeOrdersLabel,
  executionPausedNote,
  formatSessionLabel,
  formatVenueMode,
  resolveRunnerMode,
} from "@/lib/operatorStatus";

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
  it("shows zero exchange orders in shadow even if a count is present", () => {
    expect(exchangeOrdersLabel("shadow", 3)).toBe("0 exchange orders (shadow)");
    expect(exchangeOrdersLabel("exchange", 3)).toBe("3");
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
    expect(executionPausedNote(true, "shadow")).toContain("Zero exchange order calls");
    expect(executionPausedNote(true, "exchange")).toBeNull();
  });
});
