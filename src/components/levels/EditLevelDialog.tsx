import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { stripFixed } from "@/api/transforms";
import { updateLevel } from "@/api/tradingCliService";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useInvalidateLevels } from "@/hooks/useLevelsPoll";
import { STALE_CONTROLS_MESSAGE } from "@/lib/operatorStatus";
import { useControlsEnabled, useSelectedLevel, useTradingStore } from "@/store/tradingStore";

export function EditLevelDialog() {
  const overlay = useTradingStore((s) => s.overlay);
  const closeOverlay = useTradingStore((s) => s.closeOverlay);
  const selectedLevel = useSelectedLevel();
  const invalidateLevels = useInvalidateLevels();
  const controlsEnabled = useControlsEnabled();

  const [enabled, setEnabled] = useState(true);
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [riskLimit, setRiskLimit] = useState("");
  const [maxPosition, setMaxPosition] = useState("");
  const [repostOnFill, setRepostOnFill] = useState(false);
  const [repostOnCancel, setRepostOnCancel] = useState(false);

  useEffect(() => {
    if (selectedLevel?.config) {
      const c = selectedLevel.config;
      setEnabled(selectedLevel.enabled);
      setPrice(c.price ? stripFixed(c.price) : "");
      setQuantity(c.quantity ? stripFixed(c.quantity) : "");
      setRiskLimit(c.riskLimit ?? "");
      setMaxPosition(c.maxPositionSize ?? "");
      setRepostOnFill(c.repostOnFill ?? false);
      setRepostOnCancel(c.repostOnCancel ?? false);
    }
  }, [selectedLevel]);

  const mutation = useMutation({
    mutationFn: () => {
      if (!controlsEnabled) throw new Error(STALE_CONTROLS_MESSAGE);
      if (!selectedLevel) throw new Error("No level selected");
      return updateLevel(selectedLevel.id, {
        enabled,
        price,
        quantity,
        riskLimit,
        maxPosition,
        repostOnFill,
        repostOnCancel,
      });
    },
    onSuccess: async () => {
      toast.success("Level updated");
      await invalidateLevels();
      closeOverlay();
    },
    onError: (err) => toast.error(String(err)),
  });

  return (
    <Dialog
      open={overlay === "editLevel"}
      onOpenChange={(o) => !o && closeOverlay()}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Level — {selectedLevel?.id ?? ""}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="flex items-center gap-2">
            <Switch checked={enabled} onCheckedChange={setEnabled} />
            <Label>Enabled</Label>
          </div>
          <Field label="Price (empty = keep)">
            <Input value={price} onChange={(e) => setPrice(e.target.value)} />
          </Field>
          <Field label="Quantity (empty = keep)">
            <Input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </Field>
          <Field label="Max Position">
            <Input
              value={maxPosition}
              onChange={(e) => setMaxPosition(e.target.value)}
            />
          </Field>
          <Toggle label="Repost on Fill" checked={repostOnFill} onChange={setRepostOnFill} />
          <Toggle
            label="Repost on Cancel"
            checked={repostOnCancel}
            onChange={setRepostOnCancel}
          />
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !selectedLevel || !controlsEnabled}
          >
            {mutation.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Switch checked={checked} onCheckedChange={onChange} />
      <Label>{label}</Label>
    </div>
  );
}
