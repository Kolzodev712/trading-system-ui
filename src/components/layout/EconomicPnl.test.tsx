/**
 * @vitest-environment happy-dom
 */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { EconomicPnl } from "@/components/layout/EconomicPnl";
import { MonitoringData } from "@/gen/trading_cli_pb";
import { useTradingStore } from "@/store/tradingStore";

describe("EconomicPnl", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    useTradingStore.getState().reset();
  });

  it("labels Paper economics as simulation", () => {
    useTradingStore.setState({
      monitoringData: new MonitoringData({
        venue: "PAPER",
        environment: "LOCAL",
        executionMode: "exchange",
        economicSource: "simulation",
        realizedPnl: "-1.5",
        unrealizedPnl: "2",
        dailyPnl: "0.5",
        feesPaid: "0.06",
        fundingPnl: "-0.2",
        ledgerEquity: "0.24",
      }),
    });
    render(<EconomicPnl />);
    expect(screen.getByTestId("economic-simulation-label").textContent).toBe(
      "SIMULATION",
    );
    expect(screen.getByTestId("economic-pnl").textContent).toContain("-1.5");
    expect(screen.getByTestId("economic-pnl").textContent).toContain("0.06");
  });

  it("does not label live exchange economics as simulation", () => {
    useTradingStore.setState({
      monitoringData: new MonitoringData({
        venue: "BYBIT",
        environment: "DEMO",
        executionMode: "exchange",
        economicSource: "exchange",
        realizedPnl: "1",
      }),
    });
    render(<EconomicPnl />);
    expect(screen.queryByTestId("economic-simulation-label")).toBeNull();
  });
});
