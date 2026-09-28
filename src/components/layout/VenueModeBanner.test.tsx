/**
 * @vitest-environment happy-dom
 */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { StrategiesPanel } from "@/components/panels/StrategiesPanel";
import { VenueModeBanner } from "@/components/layout/VenueModeBanner";
import { MonitoringData, StrategyStatus } from "@/gen/trading_cli_pb";
import { useTradingStore } from "@/store/tradingStore";

function liveBybit(nowMs = Date.now()) {
  return new MonitoringData({
    venue: "BYBIT",
    environment: "MAINNET",
    executionMode: "shadow",
    runnerMode: "strategies",
    snapshotUnixMs: BigInt(nowMs),
    strategies: [
      new StrategyStatus({
        strategyName: "BTCPriceMALongFlatV1",
        symbol: "BTC/USDT",
        researchDisposition: "REJECTED AS VALIDATED ALPHA",
        operationalRole: "BASELINE",
        executionMode: "shadow",
        activeOrders: 3,
        readiness: "ready",
      }),
    ],
  });
}

describe("operator status surfaces", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    useTradingStore.getState().reset();
  });

  it("shows unknown on the banner before the first stream update", () => {
    useTradingStore.setState({
      connected: true,
      monitoringData: liveBybit(),
    });
    render(<VenueModeBanner />);
    expect(screen.getByTestId("venue-mode-banner").textContent).toBe("STATUS UNKNOWN");
  });

  it("shows live venue mode after a stream snapshot", () => {
    useTradingStore.setState({ connected: true });
    useTradingStore.getState().applyStreamUpdate(liveBybit());
    render(<VenueModeBanner />);
    expect(screen.getByTestId("venue-mode-banner").textContent).toBe(
      "BYBIT MAINNET + SHADOW",
    );
  });

  it("shows the observed Shadow order count and flags a nonzero count", () => {
    useTradingStore.setState({ connected: true });
    useTradingStore.getState().applyStreamUpdate(liveBybit());
    render(
      <StrategiesPanel
        strategies={useTradingStore.getState().monitoringData!.strategies}
        selectedIndex={0}
        onSelect={() => undefined}
      />,
    );
    expect(screen.getByTestId("exchange-orders-BTCPriceMALongFlatV1").textContent).toBe(
      "3 exchange orders (shadow violation)",
    );
    expect(screen.getByText("REJECTED AS VALIDATED ALPHA")).toBeTruthy();
    expect(screen.getByText("BASELINE")).toBeTruthy();
    expect(screen.getByText("SHADOW")).toBeTruthy();
  });

  it("does not keep Ready on a stale stream", () => {
    useTradingStore.setState({ connected: true });
    useTradingStore.getState().applyStreamUpdate(liveBybit());
    useTradingStore.getState().markStreamEnded();
    render(
      <StrategiesPanel
        strategies={useTradingStore.getState().monitoringData!.strategies}
        selectedIndex={0}
        onSelect={() => undefined}
      />,
    );
    expect(screen.getByTestId("strategy-ready-BTCPriceMALongFlatV1").textContent).toBe(
      "unknown",
    );
  });
});
