import type { StrategyStatus } from "@/gen/trading_cli_pb";
import { strategyEnabledVisual } from "@/api/transforms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/shared/DataTable";
import { PnlText } from "@/components/shared/PnlText";

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
            {
              key: "orders",
              header: "Orders",
              render: (s) => `${s.activeOrders}/${s.maxActiveOrders}`,
            },
            { key: "signal", header: "Signal", render: (s) => s.lastSignal },
          ]}
        />
      </CardContent>
    </Card>
  );
}
