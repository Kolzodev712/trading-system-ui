/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it, beforeEach } from "vitest";
import { MonitoringData } from "@/gen/trading_cli_pb";
import { useTradingStore } from "@/store/tradingStore";

describe("monitoring snapshot freshness", () => {
  beforeEach(() => {
    useTradingStore.getState().reset();
  });

  it("keeps the last snapshot when the stream drops", () => {
    useTradingStore.setState({
      connected: true,
      streamConnected: true,
      screen: "futures",
      monitoringData: new MonitoringData({
        venue: "BYBIT",
        environment: "MAINNET",
        executionMode: "shadow",
        runnerMode: "strategies",
      }),
    });
    useTradingStore.getState().setStreamConnected(false);
    const data = useTradingStore.getState().monitoringData;
    expect(data?.venue).toBe("BYBIT");
    expect(data?.executionMode).toBe("shadow");
    expect(useTradingStore.getState().streamConnected).toBe(false);
  });
});
