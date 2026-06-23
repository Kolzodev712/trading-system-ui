import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { dexQuotePriceDisplay } from "@/api/transforms";
import { useSelectedDexQuote, useTradingStore } from "@/store/tradingStore";

export function DexQuoteDetailsDialog() {
  const overlay = useTradingStore((s) => s.overlay);
  const closeOverlay = useTradingStore((s) => s.closeOverlay);
  const quote = useSelectedDexQuote();

  return (
    <Dialog
      open={overlay === "dexQuoteDetails"}
      onOpenChange={(o) => !o && closeOverlay()}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>DEX Quote Details</DialogTitle>
        </DialogHeader>
        {quote && (
          <div className="space-y-2 text-sm font-mono">
            <Row label="ID" value={quote.id} />
            <Row label="Pool" value={quote.pool} />
            <Row label="Side" value={quote.side} />
            <Row label="Config price" value={quote.price} />
            <Row
              label="Resolved price"
              value={dexQuotePriceDisplay(quote.resolvedPrice, quote.price)}
            />
            <Row label="Quantity" value={quote.quantity} />
            <Row label="Enabled" value={quote.enabled ? "Yes" : "No"} />
            <Row label="Auto repost" value={quote.autoRepost ? "Yes" : "No"} />
            <Row label="State" value={quote.state} />
            <Row label="Order ID" value={quote.orderId || "—"} />
            <Row label="Last signature" value={quote.lastSignature || "—"} />
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
