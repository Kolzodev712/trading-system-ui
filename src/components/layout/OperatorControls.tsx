import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useOperatorCommands, useOperatorConfirm } from "@/hooks/useOperatorCommands";
import { operatorActionConsequence, operatorActionLabel, type OperatorAction } from "@/lib/operatorCommands";
import { useControlsEnabled, useTradingStore } from "@/store/tradingStore";
import { formatVenueMode } from "@/lib/operatorStatus";

const ACTIONS: OperatorAction[] = [
  "PauseEntries",
  "CancelWorking",
  "FlattenAndPause",
  "Resume",
];

export function OperatorControls() {
  const controlsEnabled = useControlsEnabled();
  const data = useTradingStore((s) => s.monitoringData);
  const { run, running } = useOperatorCommands();
  const { pending, setPending } = useOperatorConfirm();
  const venueLabel = formatVenueMode(data?.venue, data?.environment, data?.executionMode);
  const positions = data?.positions ?? [];
  const working = data?.orders ?? [];
  const scope = "account";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map((action) => (
          <Button
            key={action}
            variant={action === "FlattenAndPause" ? "destructive" : "outline"}
            size="sm"
            disabled={!controlsEnabled || running}
            onClick={() => setPending(action)}
          >
            {operatorActionLabel(action)}
          </Button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Pause/flatten are separate from the global toggle
        {data?.globalToggleSemantics ? ` (${data.globalToggleSemantics})` : ""}.
        Entries paused: {data?.entriesPaused ? "yes" : "no"}. Flatten latch:{" "}
        {data?.flattenLatched ? "held" : "clear"}.
      </p>

      <Dialog open={pending != null} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Confirm {pending ? operatorActionLabel(pending) : ""}
            </DialogTitle>
          </DialogHeader>
          {pending && (
            <div className="space-y-3 text-sm">
              <p>
                Venue / environment / mode: <span className="font-mono">{venueLabel}</span>
              </p>
              <p>
                Scope: <span className="font-mono">{scope}</span>
              </p>
              <p>
                Working orders: {working.length}. Positions:{" "}
                {positions.length === 0
                  ? "none reported"
                  : positions
                      .map((p) => `${p.symbol} qty=${p.quantity}`)
                      .join("; ")}
              </p>
              <p className="text-muted-foreground">
                {operatorActionConsequence(pending)}
              </p>
              {pending === "FlattenAndPause" && (
                <p className="text-amber-400">
                  A successful RPC does not mean the account is flat. Progress stays
                  in-progress until runner positions are verified empty.
                </p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setPending(null)}>
                  Cancel
                </Button>
                <Button
                  variant={pending === "FlattenAndPause" ? "destructive" : "default"}
                  disabled={running}
                  onClick={() => {
                    const action = pending;
                    setPending(null);
                    run(action);
                  }}
                >
                  Confirm
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
