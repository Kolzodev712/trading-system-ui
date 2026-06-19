import type { Position } from "@/gen/trading_cli_pb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/shared/DataTable";
import { PnlText, SideText } from "@/components/shared/PnlText";

export function PositionsPanel({ positions }: { positions: Position[] }) {
  return (
    <Card className="h-full flex flex-col min-h-0">
      <CardHeader>
        <CardTitle>Positions</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-hidden">
        <DataTable
          data={positions}
          emptyMessage="No positions"
          columns={[
            { key: "symbol", header: "Symbol", render: (p) => p.symbol },
            { key: "side", header: "Side", render: (p) => <SideText side={p.side} /> },
            { key: "qty", header: "Qty", render: (p) => p.quantity },
            { key: "avg", header: "Avg", render: (p) => p.avgPrice },
            { key: "mark", header: "Mark", render: (p) => p.markPrice },
            {
              key: "upnl",
              header: "uPnL",
              render: (p) => <PnlText value={p.unrealizedPnl} />,
            },
            { key: "lev", header: "Lev", render: (p) => p.leverage },
          ]}
        />
      </CardContent>
    </Card>
  );
}
