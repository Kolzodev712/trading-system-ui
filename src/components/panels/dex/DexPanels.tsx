import type { DexVenueSnapshot } from "@/gen/trading_cli_pb";
import {
  dexAssetLabel,
  dexEnabledBadge,
  dexQuotePriceDisplay,
  truncateMiddle,
} from "@/api/transforms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/shared/DataTable";
import { SideText } from "@/components/shared/PnlText";
import { matchesPool } from "@/lib/dexPool";

interface DexPanelBaseProps {
  dex: DexVenueSnapshot;
  poolTab: string;
  assetLabels: Record<string, string>;
}

export function DexVenuePanel({
  dex,
  exchange,
}: {
  dex: DexVenueSnapshot;
  exchange: string;
}) {
  return (
    <Card className="h-full flex flex-col min-h-0">
      <CardHeader className="py-2">
        <CardTitle className="text-sm">Venue</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 text-xs space-y-2">
        <Row label="Venue" value={dex.venue || "—"} />
        <Row label="Exchange" value={exchange || "—"} />
        <Row label="Mode" value="DEX monitor" />
      </CardContent>
    </Card>
  );
}

export function DexIndicatorsPanel({
  dex,
  poolTab,
}: DexPanelBaseProps) {
  const rows = dex.dexIndicators.filter((i) => matchesPool(i.pool, poolTab));

  return (
    <Card className="h-full flex flex-col min-h-0">
      <CardHeader className="py-2">
        <CardTitle className="text-sm">DEX Indicators</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-hidden">
        <DataTable
          data={rows}
          emptyMessage="No DEX indicators"
          columns={[
            { key: "name", header: "Kind", render: (r) => r.name },
            { key: "pool", header: "Pool", render: (r) => r.pool },
            { key: "value", header: "Value", render: (r) => r.value },
          ]}
        />
      </CardContent>
    </Card>
  );
}

export function DexOpenOrdersPanel({ dex, poolTab }: DexPanelBaseProps) {
  const rows = dex.openOrders.filter((o) => matchesPool(o.pool, poolTab));

  return (
    <Card className="h-full flex flex-col min-h-0">
      <CardHeader className="py-2">
        <CardTitle className="text-sm">Open Orders</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-hidden">
        <DataTable
          data={rows}
          emptyMessage="No open orders"
          columns={[
            {
              key: "orderId",
              header: "Order ID",
              render: (r) => truncateMiddle(r.orderId),
            },
            { key: "pool", header: "Pool", render: (r) => r.pool },
            { key: "side", header: "Side", render: (r) => <SideText side={r.side} /> },
            { key: "price", header: "Price", render: (r) => r.price },
            { key: "qty", header: "Qty", render: (r) => r.quantity },
            { key: "status", header: "Status", render: (r) => r.status },
          ]}
        />
      </CardContent>
    </Card>
  );
}

export function DexBalancesPanel({
  dex,
  assetLabels,
}: {
  dex: DexVenueSnapshot;
  assetLabels: Record<string, string>;
}) {
  return (
    <Card className="h-full flex flex-col min-h-0">
      <CardHeader className="py-2">
        <CardTitle className="text-sm">Venue Balances</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-hidden">
        <DataTable
          data={dex.balances}
          emptyMessage="No balances"
          columns={[
            {
              key: "asset",
              header: "Asset",
              render: (b) => dexAssetLabel(b.mint, assetLabels),
            },
            { key: "amount", header: "Amount", render: (b) => b.amount },
          ]}
        />
      </CardContent>
    </Card>
  );
}

export function DexPendingPanel({ dex }: { dex: DexVenueSnapshot }) {
  return (
    <Card className="h-full flex flex-col min-h-0">
      <CardHeader className="py-2">
        <CardTitle className="text-sm">Pending Transactions</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-hidden">
        <DataTable
          data={dex.pendingTransactions}
          emptyMessage="No pending transactions"
          columns={[
            {
              key: "signature",
              header: "Signature",
              render: (tx) => truncateMiddle(tx.signature, 8, 6),
            },
            { key: "status", header: "Status", render: (tx) => tx.status },
          ]}
        />
      </CardContent>
    </Card>
  );
}

interface DexQuotesPanelProps extends DexPanelBaseProps {
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onRowDoubleClick?: () => void;
}

export function DexQuotesPanel({
  dex,
  poolTab,
  selectedIndex,
  onSelect,
  onRowDoubleClick,
}: DexQuotesPanelProps) {
  const rows = dex.quotes.filter((q) => matchesPool(q.pool, poolTab));

  return (
    <Card className="h-full flex flex-col min-h-0">
      <CardHeader className="py-2">
        <CardTitle className="text-sm">Quotes</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-hidden">
        <DataTable
          data={rows}
          emptyMessage="No configured quotes"
          selectedIndex={selectedIndex}
          onSelect={onSelect}
          onRowDoubleClick={onRowDoubleClick}
          columns={[
            { key: "id", header: "ID", render: (r) => r.id },
            { key: "side", header: "Side", render: (r) => <SideText side={r.side} /> },
            {
              key: "price",
              header: "Price",
              render: (r) => dexQuotePriceDisplay(r.resolvedPrice, r.price),
            },
            { key: "qty", header: "Qty", render: (r) => r.quantity },
            {
              key: "en",
              header: "En",
              render: (r) => dexEnabledBadge(r.enabled),
            },
            { key: "state", header: "State", render: (r) => r.state },
          ]}
        />
      </CardContent>
    </Card>
  );
}

interface DexStrategiesPanelProps extends DexPanelBaseProps {
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onRowDoubleClick?: () => void;
}

export function DexStrategiesPanel({
  dex,
  poolTab,
  selectedIndex,
  onSelect,
  onRowDoubleClick,
}: DexStrategiesPanelProps) {
  const rows = dex.dexStrategies.filter((s) => matchesPool(s.market, poolTab));

  return (
    <Card className="h-full flex flex-col min-h-0">
      <CardHeader className="py-2">
        <CardTitle className="text-sm">Strategies</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-hidden">
        <DataTable
          data={rows}
          emptyMessage="No configured strategies"
          selectedIndex={selectedIndex}
          onSelect={onSelect}
          onRowDoubleClick={onRowDoubleClick}
          columns={[
            { key: "id", header: "ID", render: (r) => r.id },
            { key: "type", header: "Type", render: (r) => r.strategyType },
            { key: "market", header: "Market", render: (r) => r.market },
            {
              key: "en",
              header: "En",
              render: (r) => dexEnabledBadge(r.enabled),
            },
            { key: "state", header: "State", render: (r) => r.state },
            {
              key: "signal",
              header: "Signal",
              render: (r) => truncateMiddle(r.lastSignal, 10, 8),
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-right">{value}</span>
    </div>
  );
}
