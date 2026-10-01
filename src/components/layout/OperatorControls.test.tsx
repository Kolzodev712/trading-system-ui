/**
 * @vitest-environment happy-dom
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Toaster } from "sonner";
import { OperatorControls } from "@/components/layout/OperatorControls";
import { MonitoringData, OperatorCommandResponse, Position } from "@/gen/trading_cli_pb";
import { UNVERIFIED_STATUS_MESSAGE } from "@/lib/operatorCommands";
import { useTradingStore } from "@/store/tradingStore";
import {
  cancelWorking,
  flattenAndPause,
  getMonitoringData,
  pauseEntries,
  resumeEntries,
} from "@/api/tradingCliService";

vi.mock("@/api/tradingCliService", () => ({
  pauseEntries: vi.fn(),
  cancelWorking: vi.fn(),
  flattenAndPause: vi.fn(),
  resumeEntries: vi.fn(),
  getMonitoringData: vi.fn(),
}));

const pauseEntriesMock = vi.mocked(pauseEntries);
const cancelWorkingMock = vi.mocked(cancelWorking);
const flattenAndPauseMock = vi.mocked(flattenAndPause);
const resumeEntriesMock = vi.mocked(resumeEntries);
const getMonitoringDataMock = vi.mocked(getMonitoringData);

function rpc(partial: Partial<OperatorCommandResponse>) {
  return new OperatorCommandResponse({
    accepted: true,
    state: "completed",
    message: "ok",
    venue: "PAPER",
    environment: "LOCAL",
    scope: "account",
    orderIds: [],
    ...partial,
  });
}

function livePaper(nowMs = Date.now(), extra: Partial<MonitoringData> = {}) {
  return new MonitoringData({
    venue: "PAPER",
    environment: "LOCAL",
    executionMode: "exchange",
    runnerMode: "levels",
    snapshotUnixMs: BigInt(nowMs),
    entriesPaused: false,
    flattenLatched: false,
    positions: [],
    orders: [],
    ...extra,
  });
}

function renderControls() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <OperatorControls />
      <Toaster theme="dark" position="top-right" />
    </QueryClientProvider>,
  );
}

async function confirm(action: "PauseEntries" | "CancelWorking" | "FlattenAndPause" | "Resume") {
  fireEvent.click(screen.getByTestId(`operator-${action}`));
  fireEvent.click(screen.getByTestId("operator-confirm"));
}

function toastEl() {
  return document.querySelector("[data-sonner-toast]");
}

describe("OperatorControls command feedback", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  beforeEach(() => {
    useTradingStore.getState().reset();
    useTradingStore.setState({ connected: true });
    useTradingStore.getState().applyStreamUpdate(livePaper());
    getMonitoringDataMock.mockResolvedValue(livePaper());
  });

  it("shows an error toast for rejected PauseEntries and never success", async () => {
    pauseEntriesMock.mockResolvedValue(
      rpc({
        accepted: false,
        state: "failed",
        message: "PauseEntries unverified: REST lookup failed",
      }),
    );
    renderControls();
    await confirm("PauseEntries");
    await waitFor(() => {
      expect(screen.getByTestId("operator-command-status").getAttribute("data-kind")).toBe(
        "error",
      );
    });
    const status = screen.getByTestId("operator-command-status");
    expect(status.textContent).toContain("PauseEntries unverified: REST lookup failed");
    expect(status.textContent?.toLowerCase()).toContain("failed");
    await waitFor(() => expect(toastEl()?.textContent).toContain("REST lookup failed"));
    expect(toastEl()?.getAttribute("data-type")).not.toBe("success");
  });

  it("shows an error toast for rejected CancelWorking and does not claim orders were cancelled", async () => {
    cancelWorkingMock.mockResolvedValue(
      rpc({
        accepted: false,
        state: "failed",
        message: "CancelWorking unverified: REST GET /open_orders failed",
      }),
    );
    renderControls();
    await confirm("CancelWorking");
    await waitFor(() => {
      expect(screen.getByTestId("operator-command-status").getAttribute("data-kind")).toBe(
        "error",
      );
    });
    const status = screen.getByTestId("operator-command-status").textContent ?? "";
    const toast = toastEl()?.textContent ?? "";
    expect(status).toContain("REST GET /open_orders failed");
    expect(toast).toContain("REST GET /open_orders failed");
    expect(status.toLowerCase()).not.toMatch(/orders were cancelled/);
    expect(toast.toLowerCase()).not.toMatch(/orders were cancelled/);
    expect(toastEl()?.getAttribute("data-type")).not.toBe("success");
  });

  it("shows an error toast for rejected Resume", async () => {
    resumeEntriesMock.mockResolvedValue(
      rpc({ accepted: false, state: "failed", message: "Resume rejected" }),
    );
    renderControls();
    await confirm("Resume");
    await waitFor(() => {
      expect(screen.getByTestId("operator-command-status").textContent).toContain(
        "Resume rejected",
      );
    });
    expect(screen.getByTestId("operator-command-status").getAttribute("data-kind")).toBe(
      "error",
    );
    await waitFor(() => expect(toastEl()?.textContent).toContain("Resume rejected"));
    expect(toastEl()?.getAttribute("data-type")).not.toBe("success");
  });

  it("shows an error toast for rejected FlattenAndPause", async () => {
    flattenAndPauseMock.mockResolvedValue(
      rpc({
        accepted: false,
        state: "failed",
        message: "FlattenAndPause unverified",
      }),
    );
    renderControls();
    await confirm("FlattenAndPause");
    await waitFor(() => {
      expect(screen.getByTestId("operator-command-status").getAttribute("data-kind")).toBe(
        "error",
      );
    });
    expect(screen.getByTestId("operator-command-status").textContent).toContain(
      "FlattenAndPause unverified",
    );
    await waitFor(() =>
      expect(toastEl()?.textContent).toContain("FlattenAndPause unverified"),
    );
    expect(toastEl()?.getAttribute("data-type")).not.toBe("success");
  });

  it("shows in_progress flatten as progress, not completion", async () => {
    flattenAndPauseMock.mockResolvedValue(
      rpc({ accepted: true, state: "in_progress", message: "reduce-only submitted" }),
    );
    getMonitoringDataMock.mockResolvedValue(
      livePaper(Date.now(), {
        positions: [new Position({ symbol: "BTCUSDT", quantity: "0.001" })],
      }),
    );
    renderControls();
    await confirm("FlattenAndPause");
    await waitFor(() => {
      expect(screen.getByTestId("operator-command-status").getAttribute("data-kind")).toBe(
        "progress",
      );
    });
    const status = screen.getByTestId("operator-command-status").textContent ?? "";
    expect(status.toLowerCase()).toContain("in_progress");
    expect(status.toLowerCase()).not.toContain("flat account");
    await waitFor(() =>
      expect(toastEl()?.textContent?.toLowerCase()).toContain("in_progress"),
    );
    expect(toastEl()?.getAttribute("data-type")).not.toBe("success");
  });

  it("shows an RPC transport error as failure", async () => {
    cancelWorkingMock.mockRejectedValue(new Error("connect timeout"));
    renderControls();
    await confirm("CancelWorking");
    await waitFor(() => {
      expect(screen.getByTestId("operator-command-status").getAttribute("data-kind")).toBe(
        "error",
      );
    });
    expect(screen.getByTestId("operator-command-status").textContent).toContain(
      "connect timeout",
    );
    await waitFor(() => expect(toastEl()?.textContent).toContain("connect timeout"));
    expect(toastEl()?.getAttribute("data-type")).not.toBe("success");
  });

  it("does not claim CancelWorking succeeded when the refresh fails", async () => {
    cancelWorkingMock.mockResolvedValue(
      rpc({ accepted: true, state: "completed", message: "cancel accepted" }),
    );
    getMonitoringDataMock.mockRejectedValue(new Error("monitoring unavailable"));
    renderControls();
    await confirm("CancelWorking");
    await waitFor(() => {
      expect(screen.getByTestId("operator-command-status").textContent).toContain(
        UNVERIFIED_STATUS_MESSAGE,
      );
    });
    expect(screen.getByTestId("operator-command-status").getAttribute("data-kind")).toBe(
      "error",
    );
    const toast = toastEl()?.textContent ?? "";
    expect(toast).toContain(UNVERIFIED_STATUS_MESSAGE);
    expect(toast.toLowerCase()).not.toMatch(/orders were cancelled/);
    expect(toastEl()?.getAttribute("data-type")).not.toBe("success");
  });

  it("does not declare flatten complete when refresh returns no data", async () => {
    flattenAndPauseMock.mockResolvedValue(
      rpc({ accepted: true, state: "completed", message: "flatten accepted" }),
    );
    getMonitoringDataMock.mockResolvedValue(undefined);
    useTradingStore.getState().applyStreamUpdate(
      livePaper(Date.now(), {
        positions: [new Position({ symbol: "BTCUSDT", quantity: "0.001" })],
      }),
    );
    renderControls();
    await confirm("FlattenAndPause");
    await waitFor(() => {
      expect(screen.getByTestId("operator-command-status").textContent).toContain(
        UNVERIFIED_STATUS_MESSAGE,
      );
    });
    expect(screen.getByTestId("operator-command-status").getAttribute("data-kind")).toBe(
      "progress",
    );
    expect(screen.getByTestId("operator-command-status").textContent).toContain(
      "Not treated as flat",
    );
    expect(toastEl()?.getAttribute("data-type")).not.toBe("success");
  });
});
