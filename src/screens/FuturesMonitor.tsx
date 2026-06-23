import {
  AggregatedPanel,
  MarginPanel,
} from "@/components/panels/ExtrasPanels";
import { IndicatorsPanel } from "@/components/panels/IndicatorsPanel";
import { LevelsPanel } from "@/components/panels/LevelsPanel";
import { OrderbookPanel } from "@/components/panels/OrderbookPanel";
import { OrdersPanel } from "@/components/panels/OrdersPanel";
import { PositionsPanel } from "@/components/panels/PositionsPanel";
import { StrategiesPanel } from "@/components/panels/StrategiesPanel";
import { TradesPanel } from "@/components/panels/TradesPanel";
import { MonitorToolbar } from "@/components/layout/MonitorToolbar";
import { useMonitorActions } from "@/hooks/useMonitorActions";
import { useMode, useTradingStore } from "@/store/tradingStore";

export function FuturesMonitor() {
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

  const isStrategies = mode === "strategies";

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <MonitorToolbar
        onBack={leaveMonitor}
        onRefresh={refresh}
        onToggle={toggleSelected}
        onDetails={() => void showDetails()}
        onCreate={!isStrategies ? () => setOverlay("createLevel") : undefined}
        onEdit={!isStrategies ? () => setOverlay("editLevel") : undefined}
        refreshing={refreshing}
        toggling={togglingSelected}
      />

      <div className="flex-1 grid grid-rows-[1fr_auto] gap-2 p-2 min-h-0 overflow-hidden">
        <div
          className={
            isStrategies
              ? "grid grid-cols-1 lg:grid-cols-3 gap-2 min-h-0"
              : "grid grid-cols-1 lg:grid-cols-3 gap-2 min-h-0"
          }
        >
          {isStrategies ? (
            <>
              <div className="flex flex-col gap-2 min-h-0">
                <StrategiesPanel
                  strategies={strategies}
                  selectedIndex={selectedStrategyIndex}
                  onSelect={setSelectedStrategyIndex}
                  onOpenDetails={() => void showDetails()}
                />
                <OrdersPanel orders={data.orders} />
              </div>
              <OrderbookPanel
                orderbooks={data.orderbooks}
                selectedIndex={selectedOrderbookIndex}
                onSelectIndex={setSelectedOrderbookIndex}
              />
              <div className="flex flex-col gap-2 min-h-0">
                <MarginPanel
                  positions={data.positions}
                  balances={data.balances}
                />
                <IndicatorsPanel indicators={data.indicators} showAll />
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2 min-h-0">
                <PositionsPanel positions={data.positions} />
                <LevelsPanel
                  levels={levels}
                  selectedIndex={selectedLevelIndex}
                  onSelect={setSelectedLevelIndex}
                  onOpenDetails={() => void showDetails()}
                />
                <OrdersPanel orders={data.orders} />
              </div>
              <OrderbookPanel
                orderbooks={data.orderbooks}
                selectedIndex={selectedOrderbookIndex}
                onSelectIndex={setSelectedOrderbookIndex}
              />
              <div className="flex flex-col gap-2 min-h-0">
                <MarginPanel
                  positions={data.positions}
                  balances={data.balances}
                />
                <IndicatorsPanel indicators={data.indicators} />
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <TradesPanel trades={data.trades} />
          {data.aggregated && <AggregatedPanel aggregated={data.aggregated} />}
        </div>
      </div>
    </div>
  );
}
