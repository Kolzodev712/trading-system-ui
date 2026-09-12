import { create } from "zustand";
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

export type Screen = "main" | "spot" | "futures" | "dex";
export type Overlay =
  | "none"
  | "levelDetails"
  | "strategyDetails"
  | "createLevel"
  | "editLevel"
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
    })),
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
      selectedDexQuoteIndex: null,
      selectedDexStrategyIndex: null,
    }),
}));

export function useMode(): "levels" | "strategies" | "dex" {
  const dex = useTradingStore((s) => s.monitoringData?.dex);
  const cexStrategies = useTradingStore(
    (s) => s.monitoringData?.strategies ?? EMPTY_STRATEGIES,
  );
  if (dex) {
    const strategies = dex.dexStrategies ?? EMPTY_DEX_STRATEGIES;
    return strategies.length > 0 ? "strategies" : "levels";
  }
  return cexStrategies.length > 0 ? "strategies" : "levels";
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
