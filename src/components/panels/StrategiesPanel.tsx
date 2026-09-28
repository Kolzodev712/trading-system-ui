import type { StrategyStatus } from "@/gen/trading_cli_pb";
import { strategyEnabledVisual } from "@/api/transforms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/shared/DataTable";
import { PnlText } from "@/components/shared/PnlText";
import {
  displayReadiness,
  exchangeOrdersLabel,
} from "@/lib/operatorStatus";
import { useStatusFreshness } from "@/store/tradingStore";

interface StrategiesPanelProps {
  strategies: StrategyStatus[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onOpenDetails?: () => void;
}

export function StrategiesPanel({
  strategies,
  selectedIndex,
  onSelect,
  onOpenDetails,
}: StrategiesPanelProps) {
  const freshness = useStatusFreshness();
  return (
    <Card className="h-full flex flex-col min-h-0">
      <CardHeader className="pb-2">
        <CardTitle>Strategies</CardTitle>
        <p className="text-xs text-muted-foreground font-normal">
          Click to select · double-click for details
        </p>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-hidden">
        <DataTable
          data={strategies}
          selectedIndex={selectedIndex}
          onSelect={onSelect}
          onRowDoubleClick={() => onOpenDetails?.()}
          emptyMessage="No strategies"
          columns={[
            { key: "name", header: "Name", render: (s) => s.strategyName },
            { key: "symbol", header: "Symbol", render: (s) => s.symbol },
            {
              key: "en",
              header: "En",
              render: (s) => {
                const v = strategyEnabledVisual(s.enabled);
                return <span className={v.className}>{v.icon}</span>;
              },
            },
            {
              key: "upnl",
              header: "uPnL",
              render: (s) => <PnlText value={s.unrealizedPnl} />,
            },
            {
              key: "cap",
              header: "Cap",
              render: (s) => s.maxPosition || "—",
            },
            { key: "signal", header: "Signal", render: (s) => s.modelDirection || s.lastSignal },
            {
              key: "target",
              header: "Target",
              render: (s) => s.desiredTarget || "—",
            },
            {
              key: "ready",
              header: "Ready",
              render: (s) => (
                <span data-testid={`strategy-ready-${s.strategyName}`}>
                  {displayReadiness(freshness, s.readiness)}
                </span>
              ),
            },
            {
              key: "research",
              header: "Research",
              render: (s) => s.researchDisposition || "—",
            },
            {
              key: "role",
              header: "Role",
              render: (s) => s.operationalRole || "—",
            },
            {
              key: "mode",
              header: "Mode",
              render: (s) => (s.executionMode || "—").toUpperCase(),
            },
            {
              key: "orders",
              header: "Orders",
              render: (s) => {
                const label = exchangeOrdersLabel(s.executionMode, s.activeOrders);
                return (
                  <span
                    className={label.violation ? "text-red-400 font-semibold" : undefined}
                    data-testid={`exchange-orders-${s.strategyName}`}
                  >
                    {label.text}
                  </span>
                );
              },
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
