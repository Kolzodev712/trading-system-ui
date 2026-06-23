import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSelectedDexStrategy, useTradingStore } from "@/store/tradingStore";

export function DexStrategyDetailsDialog() {
  const overlay = useTradingStore((s) => s.overlay);
  const closeOverlay = useTradingStore((s) => s.closeOverlay);
  const strategy = useSelectedDexStrategy();

  return (
    <Dialog
      open={overlay === "dexStrategyDetails"}
      onOpenChange={(o) => !o && closeOverlay()}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>DEX Strategy Details</DialogTitle>
        </DialogHeader>
        {strategy && (
          <div className="space-y-2 text-sm font-mono">
            <Row label="ID" value={strategy.id} />
            <Row label="Type" value={strategy.strategyType} />
            <Row label="Market" value={strategy.market} />
            <Row label="Enabled" value={strategy.enabled ? "Yes" : "No"} />
            <Row label="State" value={strategy.state} />
            <Row label="Last signal" value={strategy.lastSignal || "—"} />
            <Row label="Eval count" value={String(strategy.evalCount)} />
          </div>
        )}
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => closeOverlay()}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/50 py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right break-all">{value}</span>
    </div>
  );
}
