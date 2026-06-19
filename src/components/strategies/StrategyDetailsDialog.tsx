import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PnlText } from "@/components/shared/PnlText";
import { useSelectedStrategy, useTradingStore } from "@/store/tradingStore";

export function StrategyDetailsDialog() {
  const overlay = useTradingStore((s) => s.overlay);
  const closeOverlay = useTradingStore((s) => s.closeOverlay);
  const strategy = useSelectedStrategy();
  const globalTrading = useTradingStore((s) => s.tradingEnabled);

  return (
    <Dialog
      open={overlay === "strategyDetails"}
      onOpenChange={(o) => !o && closeOverlay()}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Strategy Details</DialogTitle>
        </DialogHeader>
        {strategy && (
          <div className="space-y-2 text-sm font-mono">
            <Row label="Strategy ID" value={strategy.strategyId} />
            <Row label="Name" value={strategy.strategyName} />
            <Row label="Symbol" value={strategy.symbol} />
            <Row label="Enabled" value={strategy.enabled ? "Yes" : "No"} />
            <Row label="Position Qty" value={strategy.positionQuantity} />
            <Row label="Avg Price" value={strategy.positionAvgPrice} />
            <Row
              label="Unrealized PnL"
              value={<PnlText value={strategy.unrealizedPnl} />}
            />
            <Row label="uPnL %" value={strategy.unrealizedPnlPercent} />
            <Row
              label="Active Orders"
              value={`${strategy.activeOrders}/${strategy.maxActiveOrders}`}
            />
            <Row label="Last Signal" value={strategy.lastSignal} />
            <Row label="Signal Strength" value={strategy.signalStrength} />
            <Row
              label="Status"
              value={globalTrading ? "Global trading ON" : "Global trading OFF"}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/50 py-1">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
