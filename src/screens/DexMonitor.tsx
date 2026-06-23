import { useCallback, useEffect, useMemo, useState } from "react";
import { OrderbookPanel } from "@/components/panels/OrderbookPanel";
import {
  DexBalancesPanel,
  DexIndicatorsPanel,
  DexOpenOrdersPanel,
  DexPendingPanel,
  DexVenuePanel,
} from "@/components/panels/dex/DexPanels";
import { DexBottomPanels } from "@/components/dex/DexBottomPanels";
import { CancelDexPoolDialog } from "@/components/dex/CancelDexPoolDialog";
import { DexMonitorHeader } from "@/components/dex/DexMonitorHeader";
import { DexMonitorToolbar } from "@/components/layout/DexMonitorToolbar";
import { useDexKeyboardShortcuts } from "@/hooks/useDexKeyboardShortcuts";
import { useDexMonitorActions } from "@/hooks/useDexMonitorActions";
import { normalizePool } from "@/lib/dexPool";
import {
  useFilteredDexStrategies,
  usePoolTabLabel,
  useTradingStore,
} from "@/store/tradingStore";

export function DexMonitor() {
  const data = useTradingStore((s) => s.monitoringData);
  const dex = data?.dex;
  const orderbooks = data?.orderbooks ?? [];
  const selectedOrderbookIndex = useTradingStore((s) => s.selectedOrderbookIndex);
  const selectedDexQuoteIndex = useTradingStore((s) => s.selectedDexQuoteIndex);
  const selectedDexStrategyIndex = useTradingStore((s) => s.selectedDexStrategyIndex);
  const setSelectedOrderbookIndex = useTradingStore((s) => s.setSelectedOrderbookIndex);
  const setSelectedDexQuoteIndex = useTradingStore((s) => s.setSelectedDexQuoteIndex);
  const setSelectedDexStrategyIndex = useTradingStore((s) => s.setSelectedDexStrategyIndex);
  const setOverlay = useTradingStore((s) => s.setOverlay);
  const leaveMonitor = useTradingStore((s) => s.leaveMonitor);
  const poolTab = usePoolTabLabel();
  const dexStrategies = useFilteredDexStrategies();
  const [cancelOpen, setCancelOpen] = useState(false);

  const {
    refresh,
    refreshing,
    toggleQuote,
    togglingQuote,
    toggleStrategy,
    togglingStrategy,
  } = useDexMonitorActions();

  useEffect(() => {
    setSelectedDexQuoteIndex(0);
    setSelectedDexStrategyIndex(0);
  }, [poolTab, setSelectedDexQuoteIndex, setSelectedDexStrategyIndex]);

  const cyclePool = useCallback(
    (delta: number) => {
      if (orderbooks.length === 0) return;
      const safe = Math.min(
        Math.max(0, selectedOrderbookIndex),
        orderbooks.length - 1,
      );
      const next = Math.min(orderbooks.length - 1, Math.max(0, safe + delta));
      setSelectedOrderbookIndex(next);
    },
    [orderbooks.length, selectedOrderbookIndex, setSelectedOrderbookIndex],
  );

  const keyboardActions = useMemo(
    () => ({
      onRefresh: refresh,
      onToggleQuote: toggleQuote,
      onToggleStrategy: toggleStrategy,
      onCancelPool: () => setCancelOpen(true),
      onBack: leaveMonitor,
      onPrevPool: () => cyclePool(-1),
      onNextPool: () => cyclePool(1),
      hasStrategy: dexStrategies.length > 0,
    }),
    [
      refresh,
      toggleQuote,
      toggleStrategy,
      leaveMonitor,
      cyclePool,
      dexStrategies.length,
    ],
  );

  useDexKeyboardShortcuts(keyboardActions);

  if (!data || !dex) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Loading DEX monitoring data…
      </div>
    );
  }

  const assetLabels = dex.assetLabels ?? {};
  const normalizedPool = normalizePool(poolTab);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <DexMonitorHeader />

      <DexMonitorToolbar
        onBack={leaveMonitor}
        onRefresh={refresh}
        onToggleQuote={toggleQuote}
        onToggleStrategy={toggleStrategy}
        onCancelPool={() => setCancelOpen(true)}
        refreshing={refreshing}
        togglingQuote={togglingQuote}
        togglingStrategy={togglingStrategy}
        cancelling={cancelOpen}
      />

      <p className="px-4 py-1 text-[10px] text-muted-foreground border-b border-border/50 hidden sm:block">
        Shortcuts: R refresh · T toggle quote · S toggle strategy · C cancel pool · ←/→ pool · Esc dashboard
      </p>

      <div className="flex-1 grid grid-rows-[1fr_auto] gap-2 p-2 min-h-0 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 min-h-0">
          <div className="flex flex-col gap-2 min-h-0">
            <div className="min-h-[88px]">
              <DexVenuePanel dex={dex} exchange={data.exchange} />
            </div>
            <div className="flex-1 min-h-[100px]">
              <DexIndicatorsPanel dex={dex} poolTab={poolTab} assetLabels={assetLabels} />
            </div>
            <div className="flex-1 min-h-[120px]">
              <DexOpenOrdersPanel dex={dex} poolTab={poolTab} assetLabels={assetLabels} />
            </div>
          </div>

          <div className="min-h-[220px]">
            <OrderbookPanel
              orderbooks={data.orderbooks}
              selectedIndex={selectedOrderbookIndex}
              onSelectIndex={setSelectedOrderbookIndex}
              showPoolNavigation
            />
          </div>

          <div className="flex flex-col gap-2 min-h-0">
            <div className="flex-1 min-h-[120px]">
              <DexBalancesPanel dex={dex} assetLabels={assetLabels} />
            </div>
            <div className="flex-1 min-h-[120px]">
              <DexPendingPanel dex={dex} />
            </div>
          </div>
        </div>

        <DexBottomPanels
          dex={dex}
          poolTab={poolTab}
          assetLabels={assetLabels}
          trades={data.trades}
          hasStrategies={dexStrategies.length > 0}
          selectedDexQuoteIndex={selectedDexQuoteIndex}
          selectedDexStrategyIndex={selectedDexStrategyIndex}
          onSelectQuote={setSelectedDexQuoteIndex}
          onSelectStrategy={setSelectedDexStrategyIndex}
          onQuoteDetails={() => setOverlay("dexQuoteDetails")}
          onStrategyDetails={() => setOverlay("dexStrategyDetails")}
        />
      </div>

      <CancelDexPoolDialog
        open={cancelOpen}
        pool={normalizedPool}
        poolLabel={poolTab || normalizedPool}
        onOpenChange={setCancelOpen}
      />
    </div>
  );
}
