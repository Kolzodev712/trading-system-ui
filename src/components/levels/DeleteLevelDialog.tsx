import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteLevel } from "@/api/tradingCliService";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInvalidateLevels } from "@/hooks/useLevelsPoll";
import { STALE_CONTROLS_MESSAGE } from "@/lib/operatorStatus";
import { useControlsEnabled, useSelectedLevel, useTradingStore } from "@/store/tradingStore";

export function DeleteLevelDialog() {
  const overlay = useTradingStore((s) => s.overlay);
  const closeOverlay = useTradingStore((s) => s.closeOverlay);
  const selectedLevel = useSelectedLevel();
  const invalidateLevels = useInvalidateLevels();
  const controlsEnabled = useControlsEnabled();

  const mutation = useMutation({
    mutationFn: () => {
      if (!controlsEnabled) throw new Error(STALE_CONTROLS_MESSAGE);
      if (!selectedLevel) throw new Error("No level selected");
      return deleteLevel(selectedLevel.id);
    },
    onSuccess: async () => {
      toast.success("Level deleted");
      await invalidateLevels();
      closeOverlay();
    },
    onError: (err) => toast.error(String(err)),
  });

  return (
    <Dialog
      open={overlay === "deleteLevel"}
      onOpenChange={(o) => !o && closeOverlay()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Level</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Cancel this level&apos;s owned orders, verify they are gone on the
          venue, then remove the instance. This does not cancel other orders on
          the pair.
        </p>
        <Button
          variant="destructive"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !selectedLevel || !controlsEnabled}
        >
          {mutation.isPending
            ? "Deleting…"
            : `Delete ${selectedLevel?.id ?? "level"}`}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
