import type { Trade } from "@/gen/trading_cli_pb";
import { reverseTrades } from "@/api/transforms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/shared/DataTable";
import { SideText } from "@/components/shared/PnlText";
import { formatTimestamp } from "@/lib/utils";

export function TradesPanel({ trades }: { trades: Trade[] }) {
  const display = reverseTrades(trades);

  return (
    <Card className="h-full flex flex-col min-h-0">
      <CardHeader>
        <CardTitle>Recent Trades</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-hidden">
        <DataTable
          maxRows={15}
          data={display}
          emptyMessage="No trades"
          columns={[
            { key: "symbol", header: "Symbol", render: (t) => t.symbol },
            { key: "side", header: "Side", render: (t) => <SideText side={t.side} /> },
            { key: "price", header: "Price", render: (t) => t.price },
            { key: "qty", header: "Qty", render: (t) => t.quantity },
            {
              key: "time",
              header: "Time",
              render: (t) => formatTimestamp(t.timestamp),
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
