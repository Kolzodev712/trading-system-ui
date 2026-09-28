/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it, beforeEach } from "vitest";
import { MonitoringData } from "@/gen/trading_cli_pb";
import {
  computeStatusFreshness,
  SNAPSHOT_STALE_MS,
  STREAM_SILENCE_MS,
  statusIsActionable,
} from "@/lib/operatorStatus";
import { useTradingStore } from "@/store/tradingStore";

function freshnessNow(nowMs: number) {
  const s = useTradingStore.getState();
  return computeStatusFreshness({
    connected: s.connected,
    receivedFirstStreamUpdate: s.receivedFirstStreamUpdate,
    streamEnded: s.streamEnded,
    streamConnected: s.streamConnected,
    lastStreamUpdateAtMs: s.lastStreamUpdateAtMs,
    snapshotUnixMs: s.monitoringData?.snapshotUnixMs,
    nowMs,
    venue: s.monitoringData?.venue,
    environment: s.monitoringData?.environment,
    executionMode: s.monitoringData?.executionMode,
  });
}

function liveSnapshot(nowMs: number) {
  return new MonitoringData({
    venue: "BYBIT",
    environment: "MAINNET",
    executionMode: "shadow",
    runnerMode: "strategies",
    snapshotUnixMs: BigInt(nowMs),
  });
}

describe("monitoring snapshot freshness", () => {
  beforeEach(() => {
    useTradingStore.getState().reset();
  });

  it("stays unknown until the first stream update even with a unary snapshot", () => {
    useTradingStore.setState({ connected: true });
    useTradingStore.getState().setMonitoringData(liveSnapshot(10_000));
    expect(freshnessNow(10_000)).toBe("unknown");
    expect(statusIsActionable(freshnessNow(10_000))).toBe(false);
  });

  it("becomes live after the first stream update", () => {
    useTradingStore.setState({ connected: true });
    useTradingStore.getState().applyStreamUpdate(liveSnapshot(10_000));
    expect(useTradingStore.getState().receivedFirstStreamUpdate).toBe(true);
    expect(useTradingStore.getState().streamConnected).toBe(true);
    expect(freshnessNow(10_000)).toBe("live");
  });

  it("marks a cleanly ended stream stale on every screen including main", () => {
    useTradingStore.setState({ connected: true, screen: "main" });
    useTradingStore.getState().applyStreamUpdate(liveSnapshot(10_000));
    useTradingStore.getState().markStreamEnded();
    expect(freshnessNow(10_500)).toBe("stale");
    expect(useTradingStore.getState().monitoringData?.venue).toBe("BYBIT");
  });

  it("marks a failed/silent stream stale after the silence window", () => {
    useTradingStore.setState({ connected: true, screen: "spot" });
    useTradingStore.getState().applyStreamUpdate(liveSnapshot(1_000));
    useTradingStore.getState().markStreamFailed();
    expect(freshnessNow(1_000 + STREAM_SILENCE_MS + 1)).toBe("stale");
  });

  it("marks an old snapshot stale even while the socket is still connected", () => {
    const start = 1_000;
    useTradingStore.setState({ connected: true, screen: "main" });
    useTradingStore.getState().applyStreamUpdate(liveSnapshot(start));
    useTradingStore.setState({
      lastStreamUpdateAtMs: start + SNAPSHOT_STALE_MS + 1,
      streamConnected: true,
    });
    expect(freshnessNow(start + SNAPSHOT_STALE_MS + 1)).toBe("stale");
  });

  it("reconnects to live after a later stream update", () => {
    useTradingStore.setState({ connected: true });
    useTradingStore.getState().applyStreamUpdate(liveSnapshot(1_000));
    useTradingStore.getState().markStreamFailed();
    useTradingStore.getState().beginStreamAttempt();
    expect(freshnessNow(2_000)).toBe("stale");
    useTradingStore.getState().applyStreamUpdate(liveSnapshot(2_000));
    expect(freshnessNow(2_000)).toBe("live");
  });

  it("treats incomplete venue labels as unknown", () => {
    useTradingStore.setState({ connected: true });
    useTradingStore.getState().applyStreamUpdate(
      new MonitoringData({
        venue: "UNKNOWN",
        environment: "LOCAL",
        executionMode: "exchange",
        snapshotUnixMs: BigInt(5_000),
      }),
    );
    expect(freshnessNow(5_000)).toBe("unknown");
  });

  it("treats generated MonitoringData defaults as unknown and not actionable", () => {
    const generated = new MonitoringData();
    expect(generated.executionMode).toBe("");
    expect(Number(generated.snapshotUnixMs)).toBe(0);
    useTradingStore.setState({ connected: true });
    useTradingStore.getState().applyStreamUpdate(generated);
    expect(freshnessNow(Date.now())).toBe("unknown");
    expect(statusIsActionable(freshnessNow(Date.now()))).toBe(false);
  });

  it("treats a zero snapshotUnixMs as unknown even with complete labels", () => {
    useTradingStore.setState({ connected: true });
    useTradingStore.getState().applyStreamUpdate(
      new MonitoringData({
        venue: "PAPER",
        environment: "LOCAL",
        executionMode: "exchange",
        snapshotUnixMs: BigInt(0),
      }),
    );
    expect(freshnessNow(10_000)).toBe("unknown");
    expect(statusIsActionable(freshnessNow(10_000))).toBe(false);
  });

  it("treats UNKNOWN execution mode as unknown even with a valid timestamp", () => {
    useTradingStore.setState({ connected: true });
    useTradingStore.getState().applyStreamUpdate(
      new MonitoringData({
        venue: "BYBIT",
        environment: "MAINNET",
        executionMode: "UNKNOWN",
        snapshotUnixMs: BigInt(5_000),
      }),
    );
    expect(freshnessNow(5_000)).toBe("unknown");
    expect(statusIsActionable(freshnessNow(5_000))).toBe(false);
  });
});
