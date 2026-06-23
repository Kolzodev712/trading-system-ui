import { useState } from "react";
import { BalancesPanel } from "@/components/panels/BalancesPanel";
import { AggregatedPanel } from "@/components/panels/ExtrasPanels";
import { IndicatorsPanel } from "@/components/panels/IndicatorsPanel";
import { LevelsPanel } from "@/components/panels/LevelsPanel";
import { OrderbookPanel } from "@/components/panels/OrderbookPanel";
import { OrdersPanel } from "@/components/panels/OrdersPanel";
import { StrategiesPanel } from "@/components/panels/StrategiesPanel";
import { TradesPanel } from "@/components/panels/TradesPanel";
import { MonitorToolbar } from "@/components/layout/MonitorToolbar";
import { useMonitorActions } from "@/hooks/useMonitorActions";
import { useMode, useTradingStore } from "@/store/tradingStore";

export function SpotMonitor() {
  const [showAllIndicators, setShowAllIndicators] = useState(false);
  const data = useTradingStore((s) => s.monitoringData);
  const mode = useMode();
  const levels = useTradingStore((s) => s.levels);
  const strategies = data?.strategies ?? [];
  const selectedLevelIndex = useTradingStore((s) => s.selectedLevelIndex);
  const selectedStrategyIndex = useTradingStore((s) => s.selectedStrategyIndex);
  const selectedOrderbookIndex = useTradingStore((s) => s.selectedOrderbookIndex);
  const setSelectedLevelIndex = useTradingStore((s) => s.setSelectedLevelIndex);
  const setSelectedStrategyIndex = useTradingStore((s) => s.setSelectedStrategyIndex);
  const setSelectedOrderbookIndex = useTradingStore((s) => s.setSelectedOrderbookIndex);
  const setOverlay = useTradingStore((s) => s.setOverlay);
  const leaveMonitor = useTradingStore((s) => s.leaveMonitor);

  const {
    refresh,
    refreshing,
    toggleSelected,
    togglingSelected,
    showDetails,
  } = useMonitorActions();

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Loading monitoring data…
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <MonitorToolbar
        onBack={leaveMonitor}
        onRefresh={refresh}
        onToggle={toggleSelected}
        onDetails={() => void showDetails()}
        onCreate={() => setOverlay("createLevel")}
        onEdit={() => setOverlay("editLevel")}
        refreshing={refreshing}
        toggling={togglingSelected}
      />

      <div className="flex-1 grid grid-rows-[1fr_auto_auto] gap-2 p-2 min-h-0 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 min-h-0">
          <div className="flex flex-col gap-2 min-h-0">
            <div className="flex-1 min-h-[120px]">
              <OrdersPanel orders={data.orders} />
            </div>
            <div className="flex-1 min-h-[100px]">
              <BalancesPanel balances={data.balances} />
            </div>
            <div className="flex-1 min-h-[120px]">
              {mode === "strategies" ? (
                <StrategiesPanel
                  strategies={strategies}
                  selectedIndex={selectedStrategyIndex}
                  onSelect={setSelectedStrategyIndex}
                  onOpenDetails={() => void showDetails()}
                />
              ) : (
                <LevelsPanel
                  levels={levels}
                  selectedIndex={selectedLevelIndex}
                  onSelect={setSelectedLevelIndex}
                  onOpenDetails={() => void showDetails()}
                />
              )}
            </div>
          </div>

          <div className="min-h-[200px]">
            <OrderbookPanel
              orderbooks={data.orderbooks}
              selectedIndex={selectedOrderbookIndex}
              onSelectIndex={setSelectedOrderbookIndex}
            />
          </div>

          <div className="flex flex-col gap-2 min-h-0">
            <div className="flex-1 min-h-[120px]">
              <IndicatorsPanel
                indicators={data.indicators}
                showAll={showAllIndicators}
              />
              <button
                type="button"
                className="text-xs text-cyan-400 mt-1 hover:underline"
                onClick={() => setShowAllIndicators((v) => !v)}
              >
                {showAllIndicators ? "Show top 10" : "Show all indicators"}
              </button>
            </div>
            {data.aggregated && (
              <AggregatedPanel aggregated={data.aggregated} />
            )}
          </div>
        </div>

        <div className="min-h-[140px]">
          <TradesPanel trades={data.trades} />
        </div>
      </div>
    </div>
  );
}
