import type { Balance, MonitoringData, Position } from "@/gen/trading_cli_pb";
import {
  findCollateralBalance,
  sumDecimalStrings,
} from "@/api/transforms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PnlText } from "@/components/shared/PnlText";

interface MarginPanelProps {
  positions: Position[];
  balances: Balance[];
}

export function MarginPanel({ positions, balances }: MarginPanelProps) {
  const marginUsed = sumDecimalStrings(positions.map((p) => p.marginUsed));
  const unrealizedPnl = sumDecimalStrings(positions.map((p) => p.unrealizedPnl));
  const collateral = findCollateralBalance(balances);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Margin Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm font-mono">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Margin Used</span>
          <span>{marginUsed.toFixed(4)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Unrealized PnL</span>
          <PnlText value={unrealizedPnl.toFixed(4)} />
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Collateral (USDT/USD)</span>
          <span>{collateral}</span>
        </div>
      </CardContent>
    </Card>
  );
}

interface AggregatedPanelProps {
  aggregated: MonitoringData["aggregated"];
}

export function AggregatedPanel({ aggregated }: AggregatedPanelProps) {
  if (!aggregated?.overall) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aggregated Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">No aggregated data</p>
        </CardContent>
      </Card>
    );
  }

  const o = aggregated.overall;
  const perPair = Object.entries(aggregated.perPair ?? {});
  const perLevel = Object.entries(aggregated.perLevel ?? {});

  return (
    <Card className="h-full flex flex-col min-h-0">
      <CardHeader>
        <CardTitle>Aggregated Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs font-mono overflow-auto">
        <div className="grid grid-cols-2 gap-2">
          <div>Orders: {o.totalOrders}</div>
          <div>Positions: {o.totalPositions}</div>
          <div>Active pairs: {o.activePairs}</div>
          <div>Active levels: {o.activeLevels}</div>
          <div>Total balance: {o.totalBalance}</div>
          <div>
            Total PnL: <PnlText value={o.totalPnl} />
          </div>
        </div>
        {perPair.length > 0 && (
          <div>
            <p className="font-semibold mb-1">Per Pair</p>
            {perPair.map(([key, stats]) => (
              <div key={key} className="text-muted-foreground">
                {stats.pair}: orders={stats.orderCount} pnl={stats.pnl}
              </div>
            ))}
          </div>
        )}
        {perLevel.length > 0 && (
          <div>
            <p className="font-semibold mb-1">Per Level</p>
            {perLevel.map(([key, stats]) => (
              <div key={key} className="text-muted-foreground">
                {stats.levelId}: orders={stats.orderCount} pnl={stats.pnl}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
