import type { Level } from "@/gen/trading_cli_pb";
import { stripFixed } from "@/api/transforms";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { pairFromLevel } from "@/lib/levelId";
import { useTradingStore } from "@/store/tradingStore";

export function LevelDetailsDialog() {
  const overlay = useTradingStore((s) => s.overlay);
  const level = useTradingStore((s) => s.levelDetails);
  const closeOverlay = useTradingStore((s) => s.closeOverlay);

  return (
    <Dialog open={overlay === "levelDetails"} onOpenChange={(o) => !o && closeOverlay()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Level Details</DialogTitle>
        </DialogHeader>
        {level && <LevelDetailsContent level={level} />}
      </DialogContent>
    </Dialog>
  );
}

function LevelDetailsContent({ level }: { level: Level }) {
  const c = level.config;
  return (
    <div className="space-y-2 text-sm font-mono">
      <Row label="ID" value={level.id} />
      <Row label="Config ID" value={c?.id ?? "—"} />
      <Row label="Pair" value={pairFromLevel(level)} />
      <Row label="Status" value={level.status} />
      <Row label="Enabled" value={level.enabled ? "Yes" : "No"} />
      <Row label="Side" value={c?.side ?? "—"} />
      <Row label="Order Type" value={c?.orderType ?? "—"} />
      <Row label="Price" value={c?.price ? stripFixed(c.price) : "—"} />
      <Row label="Quantity" value={c?.quantity ? stripFixed(c.quantity) : "—"} />
      <Row label="Risk Limit" value={c?.riskLimit ?? "—"} />
      <Row label="Max Position" value={c?.maxPositionSize ?? "—"} />
      <Row label="Repost on Fill" value={c?.repostOnFill ? "Yes" : "No"} />
      <Row label="Repost on Cancel" value={c?.repostOnCancel ? "Yes" : "No"} />
      <Row label="Active Orders" value={String(level.activeOrders.length)} />
      <Row label="Filled Count" value={String(level.filledCount)} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/50 py-1">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
