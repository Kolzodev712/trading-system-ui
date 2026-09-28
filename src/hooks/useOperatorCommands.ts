import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  cancelWorking,
  flattenAndPause,
  getMonitoringData,
  pauseEntries,
  resumeEntries,
} from "@/api/tradingCliService";
import { STALE_CONTROLS_MESSAGE } from "@/lib/operatorStatus";
import {
  flattenDisplayState,
  newOperatorRequestId,
  operatorActionConsequence,
  operatorActionLabel,
  type OperatorAction,
  type OperatorCommandView,
} from "@/lib/operatorCommands";
import { useControlsEnabled, useTradingStore } from "@/store/tradingStore";

function viewFromResponse(res: {
  accepted: boolean;
  state: string;
  message: string;
  venue: string;
  environment: string;
  scope: string;
  orderIds: string[];
}): OperatorCommandView {
  return {
    accepted: res.accepted,
    state: res.state,
    message: res.message,
    venue: res.venue,
    environment: res.environment,
    scope: res.scope,
    orderIds: res.orderIds ?? [],
  };
}

export function useOperatorCommands() {
  const controlsEnabled = useControlsEnabled();
  const data = useTradingStore((s) => s.monitoringData);
  const setMonitoringData = useTradingStore((s) => s.setMonitoringData);

  const run = async (action: OperatorAction) => {
    if (!controlsEnabled) throw new Error(STALE_CONTROLS_MESSAGE);
    const requestId = newOperatorRequestId();
    const symbol = "";
    const res =
      action === "PauseEntries"
        ? await pauseEntries(requestId, symbol)
        : action === "CancelWorking"
          ? await cancelWorking(requestId, symbol)
          : action === "FlattenAndPause"
            ? await flattenAndPause(requestId, symbol)
            : await resumeEntries(requestId, symbol);
    const view = viewFromResponse(res);
    const latest = await getMonitoringData();
    if (latest) setMonitoringData(latest);
    if (action === "FlattenAndPause") {
      const positions = (latest?.positions ?? data?.positions ?? []).map((p) => ({
        symbol: p.symbol,
        quantity: p.quantity,
      }));
      const shown = flattenDisplayState(view, positions);
      if (shown !== "completed") {
        toast.message(
          `Flatten ${shown}: ${view.message}. Positions still open are not treated as flat.`,
        );
        return view;
      }
    }
    toast.success(view.message || `${operatorActionLabel(action)} ${view.state}`);
    return view;
  };

  const mutation = useMutation({
    mutationFn: run,
    onError: (err) => toast.error(String(err)),
  });

  return {
    run: (action: OperatorAction) => mutation.mutate(action),
    running: mutation.isPending,
    last: mutation.data,
    consequence: operatorActionConsequence,
    label: operatorActionLabel,
  };
}

export function useOperatorConfirm() {
  const [pending, setPending] = useState<OperatorAction | null>(null);
  return { pending, setPending };
}
