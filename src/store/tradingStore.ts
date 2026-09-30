import { create } from "zustand";
import { useEffect, useState } from "react";
import type { Level, MonitoringData, StrategyStatus } from "@/gen/trading_cli_pb";
import {
  EMPTY_DEX_INDICATORS,
  EMPTY_DEX_ORDERS,
  EMPTY_DEX_QUOTES,
  EMPTY_DEX_STRATEGIES,
  EMPTY_ORDERBOOKS,
  EMPTY_STRATEGIES,
} from "@/lib/empty";
import { matchesPool, selectedTabLabel } from "@/lib/dexPool";
import { loadEndpoint, saveEndpoint } from "@/lib/endpoint";
import {
  computeStatusFreshness,
  resolveRunnerMode,
  statusIsActionable,
  type RunnerMode,
  type StatusFreshness,
} from "@/lib/operatorStatus";

export type Screen = "main" | "spot" | "futures" | "dex";
export type Overlay =
  | "none"
  | "levelDetails"
  | "strategyDetails"
  | "createLevel"
  | "editLevel"
  | "deleteLevel"
  | "dexQuoteDetails"
  | "dexStrategyDetails";

interface TradingStore {
  connected: boolean;
  connecting: boolean;
  endpoint: string;
  connectionError: string | null;

  tradingEnabled: boolean;
  screen: Screen;
  monitoringData: MonitoringData | null;
  levels: Level[];
  streamConnected: boolean;
  receivedFirstStreamUpdate: boolean;
  lastStreamUpdateAtMs: number | null;
  streamEnded: boolean;

  selectedLevelIndex: number | null;
  selectedStrategyIndex: number | null;
  selectedOrderbookIndex: number;
  selectedDexQuoteIndex: number | null;
  selectedDexStrategyIndex: number | null;

  levelDetails: Level | null;
  overlay: Overlay;

  setEndpoint: (endpoint: string) => void;
  setConnecting: (connecting: boolean) => void;
  setConnected: (connected: boolean) => void;
  setConnectionError: (error: string | null) => void;
  setTradingEnabled: (enabled: boolean) => void;
  setScreen: (screen: Screen) => void;
  setMonitoringData: (data: MonitoringData | null) => void;
  applyStreamUpdate: (data: MonitoringData) => void;
  beginStreamAttempt: () => void;
  markStreamEnded: () => void;
  markStreamFailed: () => void;
  setLevels: (levels: Level[]) => void;
  setStreamConnected: (connected: boolean) => void;
  setSelectedLevelIndex: (index: number | null) => void;
  setSelectedStrategyIndex: (index: number | null) => void;
  setSelectedOrderbookIndex: (index: number) => void;
  setSelectedDexQuoteIndex: (index: number | null) => void;
  setSelectedDexStrategyIndex: (index: number | null) => void;
  setLevelDetails: (level: Level | null) => void;
  setOverlay: (overlay: Overlay) => void;
  closeOverlay: () => void;
  enterMonitor: () => void;
  leaveMonitor: () => void;
  reset: () => void;
}

export function deriveMonitorScreen(data: MonitoringData): Screen {
  if (data.dex) return "dex";
  if (data.instrumentType === "Futures") return "futures";
  return "spot";
}

function deriveScreenFromStream(
  data: MonitoringData | null | undefined,
  current: Screen,
): Screen {
  if (current === "main") return "main";
  if (!data) return current;
  if (data.dex) return "dex";
  if (current === "dex") return "dex";
  return data.instrumentType === "Futures" ? "futures" : "spot";
}

const streamReset = {
  streamConnected: false,
  receivedFirstStreamUpdate: false,
  lastStreamUpdateAtMs: null as number | null,
  streamEnded: false,
};

export const useTradingStore = create<TradingStore>((set, get) => ({
  connected: false,
  connecting: false,
  endpoint: loadEndpoint(),
  connectionError: null,
  tradingEnabled: false,
  screen: "main",
  monitoringData: null,
  levels: [],
  ...streamReset,
  selectedLevelIndex: null,
  selectedStrategyIndex: null,
  selectedOrderbookIndex: 0,
  selectedDexQuoteIndex: null,
  selectedDexStrategyIndex: null,
  levelDetails: null,
  overlay: "none",

  setEndpoint: (endpoint) => {
    saveEndpoint(endpoint);
    set({ endpoint });
  },
  setConnecting: (connecting) => set({ connecting }),
  setConnected: (connected) => set({ connected }),
  setConnectionError: (connectionError) => set({ connectionError }),
  setTradingEnabled: (tradingEnabled) => set({ tradingEnabled }),
  setScreen: (screen) => set({ screen }),
  setMonitoringData: (data) =>
    set((state) => ({
      monitoringData: data,
      screen: deriveScreenFromStream(data, state.screen),
      tradingEnabled: data?.tradingEnabled ?? state.tradingEnabled,
    })),
  applyStreamUpdate: (data) =>
    set((state) => ({
      monitoringData: data,
      screen: deriveScreenFromStream(data, state.screen),
      tradingEnabled: data.tradingEnabled ?? state.tradingEnabled,
      streamConnected: true,
      receivedFirstStreamUpdate: true,
      lastStreamUpdateAtMs: Date.now(),
      streamEnded: false,
    })),
  beginStreamAttempt: () => set({ streamConnected: false, streamEnded: false }),
  markStreamEnded: () => set({ streamConnected: false, streamEnded: true }),
  markStreamFailed: () => set({ streamConnected: false, streamEnded: false }),
  setLevels: (levels) => set({ levels }),
  setStreamConnected: (streamConnected) => set({ streamConnected }),
  setSelectedLevelIndex: (selectedLevelIndex) => set({ selectedLevelIndex }),
  setSelectedStrategyIndex: (selectedStrategyIndex) => set({ selectedStrategyIndex }),
  setSelectedOrderbookIndex: (selectedOrderbookIndex) => set({ selectedOrderbookIndex }),
  setSelectedDexQuoteIndex: (selectedDexQuoteIndex) => set({ selectedDexQuoteIndex }),
  setSelectedDexStrategyIndex: (selectedDexStrategyIndex) =>
    set({ selectedDexStrategyIndex }),
  setLevelDetails: (levelDetails) => set({ levelDetails }),
  setOverlay: (overlay) => set({ overlay }),
  closeOverlay: () => set({ overlay: "none", levelDetails: null }),
  enterMonitor: () => {
    const data = get().monitoringData;
    set({
      screen: data ? deriveMonitorScreen(data) : "spot",
      selectedLevelIndex: 0,
      selectedStrategyIndex: 0,
      selectedOrderbookIndex: 0,
      selectedDexQuoteIndex: 0,
      selectedDexStrategyIndex: 0,
      overlay: "none",
    });
  },
  leaveMonitor: () =>
    set({
      screen: "main",
      overlay: "none",
      levelDetails: null,
    }),
  reset: () =>
    set({
      connected: false,
      connecting: false,
      connectionError: null,
      tradingEnabled: false,
      monitoringData: null,
      levels: [],
      ...streamReset,
      screen: "main",
      overlay: "none",
      levelDetails: null,
      selectedDexQuoteIndex: null,
      selectedDexStrategyIndex: null,
    }),
}));

export function useMode(): RunnerMode {
  const data = useTradingStore((s) => s.monitoringData);
  const dex = data?.dex;
  const cexStrategies = data?.strategies ?? EMPTY_STRATEGIES;
  const dexStrategies = dex?.dexStrategies ?? EMPTY_DEX_STRATEGIES;
  return resolveRunnerMode(
    data?.runnerMode,
    !!dex,
    dex ? dexStrategies.length : cexStrategies.length,
  );
}

export function useNowMs(intervalMs = 1_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function useStatusFreshness(): StatusFreshness {
  const nowMs = useNowMs();
  const connected = useTradingStore((s) => s.connected);
  const streamConnected = useTradingStore((s) => s.streamConnected);
  const receivedFirstStreamUpdate = useTradingStore((s) => s.receivedFirstStreamUpdate);
  const lastStreamUpdateAtMs = useTradingStore((s) => s.lastStreamUpdateAtMs);
  const streamEnded = useTradingStore((s) => s.streamEnded);
  const data = useTradingStore((s) => s.monitoringData);
  return computeStatusFreshness({
    connected,
    receivedFirstStreamUpdate,
    streamEnded,
    streamConnected,
    lastStreamUpdateAtMs,
    snapshotUnixMs: data?.snapshotUnixMs,
    nowMs,
    venue: data?.venue,
    environment: data?.environment,
    executionMode: data?.executionMode,
  });
}

export function useControlsEnabled(): boolean {
  return statusIsActionable(useStatusFreshness());
}

export function useSelectedStrategy(): StrategyStatus | null {
  const strategies = useTradingStore(
    (s) => s.monitoringData?.strategies ?? EMPTY_STRATEGIES,
  );
  const idx = useTradingStore((s) => s.selectedStrategyIndex);
  if (idx === null || idx < 0 || idx >= strategies.length) return null;
  return strategies[idx] ?? null;
}

export function useSelectedLevel(): Level | null {
  const levels = useTradingStore((s) => s.levels);
  const idx = useTradingStore((s) => s.selectedLevelIndex);
  if (idx === null || idx < 0 || idx >= levels.length) return null;
  return levels[idx] ?? null;
}

export function usePoolTabLabel(): string {
  const orderbooks = useTradingStore(
    (s) => s.monitoringData?.orderbooks ?? EMPTY_ORDERBOOKS,
  );
  const selectedOrderbookIndex = useTradingStore((s) => s.selectedOrderbookIndex);
  return selectedTabLabel(orderbooks, selectedOrderbookIndex);
}

export function useFilteredDexQuotes() {
  const dex = useTradingStore((s) => s.monitoringData?.dex);
  const quotes = dex?.quotes ?? EMPTY_DEX_QUOTES;
  const tab = usePoolTabLabel();
  if (!tab) return quotes;
  return quotes.filter((q) => matchesPool(q.pool, tab));
}

export function useFilteredDexStrategies() {
  const dex = useTradingStore((s) => s.monitoringData?.dex);
  const strategies = dex?.dexStrategies ?? EMPTY_DEX_STRATEGIES;
  const tab = usePoolTabLabel();
  if (!tab) return strategies;
  return strategies.filter((s) => matchesPool(s.market, tab));
}

export function useFilteredDexIndicators() {
  const dex = useTradingStore((s) => s.monitoringData?.dex);
  const indicators = dex?.dexIndicators ?? EMPTY_DEX_INDICATORS;
  const tab = usePoolTabLabel();
  if (!tab) return indicators;
  return indicators.filter((i) => matchesPool(i.pool, tab));
}

export function useFilteredDexOpenOrders() {
  const dex = useTradingStore((s) => s.monitoringData?.dex);
  const orders = dex?.openOrders ?? EMPTY_DEX_ORDERS;
  const tab = usePoolTabLabel();
  if (!tab) return orders;
  return orders.filter((o) => matchesPool(o.pool, tab));
}

export function useSelectedDexQuote() {
  const quotes = useFilteredDexQuotes();
  const idx = useTradingStore((s) => s.selectedDexQuoteIndex);
  if (idx === null || idx < 0 || idx >= quotes.length) return null;
  return quotes[idx] ?? null;
}

export function useSelectedDexStrategy() {
  const strategies = useFilteredDexStrategies();
  const idx = useTradingStore((s) => s.selectedDexStrategyIndex);
  if (idx === null || idx < 0 || idx >= strategies.length) return null;
  return strategies[idx] ?? null;
}
