import { create } from "zustand";
import type { Level, MonitoringData, StrategyStatus } from "@/gen/trading_cli_pb";
import { EMPTY_STRATEGIES } from "@/lib/empty";
import { loadEndpoint, saveEndpoint } from "@/lib/endpoint";

export type Screen = "main" | "spot" | "futures";
export type Overlay =
  | "none"
  | "levelDetails"
  | "strategyDetails"
  | "createLevel"
  | "editLevel";

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

  selectedLevelIndex: number | null;
  selectedStrategyIndex: number | null;
  selectedOrderbookIndex: number;

  levelDetails: Level | null;
  overlay: Overlay;

  setEndpoint: (endpoint: string) => void;
  setConnecting: (connecting: boolean) => void;
  setConnected: (connected: boolean) => void;
  setConnectionError: (error: string | null) => void;
  setTradingEnabled: (enabled: boolean) => void;
  setScreen: (screen: Screen) => void;
  setMonitoringData: (data: MonitoringData | null) => void;
  setLevels: (levels: Level[]) => void;
  setStreamConnected: (connected: boolean) => void;
  setSelectedLevelIndex: (index: number | null) => void;
  setSelectedStrategyIndex: (index: number | null) => void;
  setSelectedOrderbookIndex: (index: number) => void;
  setLevelDetails: (level: Level | null) => void;
  setOverlay: (overlay: Overlay) => void;
  closeOverlay: () => void;
  enterMonitor: () => void;
  leaveMonitor: () => void;
  reset: () => void;
}

function deriveScreen(instrumentType: string | undefined, current: Screen): Screen {
  if (current === "main") return "main";
  return instrumentType === "Futures" ? "futures" : "spot";
}

export const useTradingStore = create<TradingStore>((set, get) => ({
  connected: false,
  connecting: false,
  endpoint: loadEndpoint(),
  connectionError: null,
  tradingEnabled: false,
  screen: "main",
  monitoringData: null,
  levels: [],
  streamConnected: false,
  selectedLevelIndex: null,
  selectedStrategyIndex: null,
  selectedOrderbookIndex: 0,
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
      screen: deriveScreen(data?.instrumentType, state.screen),
    })),
  setLevels: (levels) => set({ levels }),
  setStreamConnected: (streamConnected) => set({ streamConnected }),
  setSelectedLevelIndex: (selectedLevelIndex) => set({ selectedLevelIndex }),
  setSelectedStrategyIndex: (selectedStrategyIndex) => set({ selectedStrategyIndex }),
  setSelectedOrderbookIndex: (selectedOrderbookIndex) => set({ selectedOrderbookIndex }),
  setLevelDetails: (levelDetails) => set({ levelDetails }),
  setOverlay: (overlay) => set({ overlay }),
  closeOverlay: () => set({ overlay: "none", levelDetails: null }),
  enterMonitor: () => {
    const instrumentType = get().monitoringData?.instrumentType;
    set({
      screen: instrumentType === "Futures" ? "futures" : "spot",
      selectedLevelIndex: 0,
      selectedStrategyIndex: 0,
      selectedOrderbookIndex: 0,
      overlay: "none",
    });
  },
  leaveMonitor: () =>
    set({
      screen: "main",
      overlay: "none",
      levelDetails: null,
      streamConnected: false,
    }),
  reset: () =>
    set({
      connected: false,
      connecting: false,
      connectionError: null,
      tradingEnabled: false,
      monitoringData: null,
      levels: [],
      streamConnected: false,
      screen: "main",
      overlay: "none",
      levelDetails: null,
    }),
}));

export function useMode(): "levels" | "strategies" {
  const strategies = useTradingStore(
    (s) => s.monitoringData?.strategies ?? EMPTY_STRATEGIES,
  );
  return strategies.length > 0 ? "strategies" : "levels";
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
