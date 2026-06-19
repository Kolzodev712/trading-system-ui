import type { Order } from "@/gen/trading_cli_pb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/shared/DataTable";
import { SideText } from "@/components/shared/PnlText";

export function OrdersPanel({ orders }: { orders: Order[] }) {
  return (
    <Card className="h-full flex flex-col min-h-0">
      <CardHeader>
        <CardTitle>Open Orders</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-hidden">
        <DataTable
          maxRows={15}
          data={orders}
          emptyMessage="No orders data available"
          columns={[
            { key: "id", header: "Order ID", render: (o) => o.orderId },
            { key: "symbol", header: "Symbol", render: (o) => o.symbol },
            { key: "side", header: "Side", render: (o) => <SideText side={o.side} /> },
            { key: "price", header: "Price", render: (o) => o.price },
            { key: "qty", header: "Qty", render: (o) => o.quantity },
            {
              key: "level",
              header: "Level",
              render: (o) => (o.levelId ? o.levelId : "N/A"),
            },
            { key: "status", header: "Status", render: (o) => o.status },
          ]}
        />
      </CardContent>
    </Card>
  );
}
