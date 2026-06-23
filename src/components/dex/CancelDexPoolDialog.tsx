import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cancelDexPoolOrders } from "@/api/tradingCliService";
import { getMonitoringData } from "@/api/tradingCliService";
import { useTradingStore } from "@/store/tradingStore";
import { toast } from "sonner";

interface CancelDexPoolDialogProps {
  open: boolean;
  pool: string;
  poolLabel: string;
  onOpenChange: (open: boolean) => void;
}

export function CancelDexPoolDialog({
  open,
  pool,
  poolLabel,
  onOpenChange,
}: CancelDexPoolDialogProps) {
  const setMonitoringData = useTradingStore((s) => s.setMonitoringData);
  const [submitting, setSubmitting] = useState(false);
  const [signatures, setSignatures] = useState<string[] | null>(null);

  const handleClose = () => {
    if (submitting) return;
    setSignatures(null);
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const res = await cancelDexPoolOrders(pool);
      const sigs = res.transactionSignatures ?? [];
      setSignatures(sigs);
      const data = await getMonitoringData();
      if (data) setMonitoringData(data);
      if (sigs.length === 0) {
        toast.success(res.message || "Cancel pool orders submitted");
      }
    } catch (err) {
      toast.error(String(err));
      handleClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {signatures ? "Cancel submitted" : "Cancel pool orders?"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {signatures
              ? `Submitted ${signatures.length} transaction(s) for pool ${poolLabel}.`
              : `This will cancel all open orders for pool ${poolLabel}. On-chain transactions may be submitted.`}
          </p>
        </DialogHeader>

        {signatures && signatures.length > 0 && (
          <ul className="max-h-40 overflow-auto text-xs font-mono space-y-1 border border-border rounded-md p-2">
            {signatures.map((sig) => (
              <li key={sig} className="break-all text-cyan-400/90">
                {sig}
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-end gap-2">
          {signatures ? (
            <Button onClick={handleClose}>Done</Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose} disabled={submitting}>
                Keep orders
              </Button>
              <Button variant="destructive" onClick={() => void handleConfirm()} disabled={submitting}>
                {submitting ? "Cancelling…" : "Cancel pool orders"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
