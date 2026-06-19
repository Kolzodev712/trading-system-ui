import type { Level } from "@/gen/trading_cli_pb";
import {
  levelEnabledIndicator,
  levelStatusVisual,
} from "@/api/transforms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/shared/DataTable";
import { EnabledBadge } from "@/components/shared/PnlText";
import { pairFromLevel } from "@/lib/levelId";
import { useTradingStore } from "@/store/tradingStore";

interface LevelsPanelProps {
  levels: Level[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onOpenDetails?: () => void;
}

export function LevelsPanel({
  levels,
  selectedIndex,
  onSelect,
  onOpenDetails,
}: LevelsPanelProps) {
  const globalTrading = useTradingStore((s) => s.tradingEnabled);

  return (
    <Card className="h-full flex flex-col min-h-0">
      <CardHeader className="pb-2">
        <CardTitle>Levels</CardTitle>
        <p className="text-xs text-muted-foreground font-normal">
          Click to select · double-click for details
        </p>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-hidden">
        <DataTable
          maxRows={10}
          data={levels}
          selectedIndex={selectedIndex}
          onSelect={onSelect}
          onRowDoubleClick={() => onOpenDetails?.()}
          emptyMessage="No active levels"
          columns={[
            { key: "id", header: "ID", render: (l) => l.id },
            { key: "pair", header: "Pair", render: (l) => pairFromLevel(l) },
            {
              key: "en",
              header: "En",
              render: (l) => (
                <EnabledBadge
                  indicator={levelEnabledIndicator(l.enabled, globalTrading)}
                />
              ),
            },
            {
              key: "st",
              header: "St",
              render: (l) => {
                const v = levelStatusVisual(l.status);
                return <span className={v.className}>{v.icon}</span>;
              },
            },
            {
              key: "orders",
              header: "Orders",
              render: (l) => String(l.activeOrders.length),
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
