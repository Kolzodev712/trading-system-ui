import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSelectedLevel, useTradingStore } from "@/store/tradingStore";

/** DeleteLevel is UNIMPLEMENTED on server — stub for future use. */
export function DeleteLevelStub() {
  const closeOverlay = useTradingStore((s) => s.closeOverlay);
  const selectedLevel = useSelectedLevel();

  return (
    <Dialog open={false} onOpenChange={() => closeOverlay()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Level</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          DeleteLevel RPC returns UNIMPLEMENTED on the server. This action is
          disabled until backend support ships.
        </p>
        <Button disabled variant="destructive">
          Delete {selectedLevel?.id ?? "level"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
