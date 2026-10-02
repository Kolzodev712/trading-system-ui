import type { Trade } from "@/gen/trading_cli_pb";
import { formatTradeTimeSofia, newestTradesFirst, truncateMiddle } from "@/api/transforms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/shared/DataTable";
import { SideText } from "@/components/shared/PnlText";

export function TradesPanel({ trades, title = "Recent Trades" }: { trades: Trade[]; title?: string }) {
  const display = newestTradesFirst(trades);

  return (
    <Card className="h-full flex flex-col min-h-0">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
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
              key: "ids",
              header: "Order / Exec ID",
              render: (t) => (
                <span title={`Order: ${t.orderId}\nExecution: ${t.tradeId}`}>
                  {truncateMiddle(t.orderId, 6, 4)} / {truncateMiddle(t.tradeId, 6, 4)}
                </span>
              ),
            },
            {
              key: "time",
              header: "Time",
              render: (t) => formatTradeTimeSofia(t.timestamp),
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
