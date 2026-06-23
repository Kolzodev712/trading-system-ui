import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Orderbook } from "@/gen/trading_cli_pb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/shared/DataTable";

interface OrderbookPanelProps {
  orderbooks: Orderbook[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  showPoolNavigation?: boolean;
}

export function OrderbookPanel({
  orderbooks,
  selectedIndex,
  onSelectIndex,
  showPoolNavigation = false,
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
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Orderbook</CardTitle>
          {showPoolNavigation && orderbooks.length > 1 && (
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                aria-label="Previous pool"
                disabled={safeIndex <= 0}
                onClick={() => onSelectIndex(safeIndex - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs font-mono text-muted-foreground min-w-[5rem] text-center">
                {current.pair}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                aria-label="Next pool"
                disabled={safeIndex >= orderbooks.length - 1}
                onClick={() => onSelectIndex(safeIndex + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
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
