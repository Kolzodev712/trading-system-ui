import type { Orderbook } from "@/gen/trading_cli_pb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/shared/DataTable";

interface OrderbookPanelProps {
  orderbooks: Orderbook[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
}

export function OrderbookPanel({
  orderbooks,
  selectedIndex,
  onSelectIndex,
}: OrderbookPanelProps) {
  if (orderbooks.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Orderbook</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">No orderbook data</p>
        </CardContent>
      </Card>
    );
  }

  const safeIndex = Math.min(selectedIndex, orderbooks.length - 1);
  const current = orderbooks[safeIndex]!;

  return (
    <Card className="h-full flex flex-col min-h-0">
      <CardHeader>
        <CardTitle>Orderbook</CardTitle>
        <Tabs
          value={String(safeIndex)}
          onValueChange={(v) => onSelectIndex(Number(v))}
        >
          <TabsList className="flex-wrap h-auto">
            {orderbooks.map((ob, idx) => (
              <TabsTrigger key={ob.pair} value={String(idx)}>
                {ob.pair}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-hidden space-y-2">
        <div className="text-xs text-muted-foreground font-mono">
          Bid {current.bestBid} · Ask {current.bestAsk} · Mid {current.midPrice} · Spread {current.spread}
        </div>
        <div className="grid grid-cols-2 gap-2 min-h-0">
          <div>
            <p className="text-xs font-medium text-green-400 mb-1">Bids</p>
            <DataTable
              data={current.bids}
              emptyMessage="—"
              columns={[
                { key: "p", header: "Price", render: (l) => l.price },
                { key: "q", header: "Qty", render: (l) => l.quantity },
              ]}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-red-400 mb-1">Asks</p>
            <DataTable
              data={current.asks}
              emptyMessage="—"
              columns={[
                { key: "p", header: "Price", render: (l) => l.price },
                { key: "q", header: "Qty", render: (l) => l.quantity },
              ]}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
