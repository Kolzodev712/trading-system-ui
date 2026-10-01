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
  newOperatorRequestId,
  operatorActionConsequence,
  operatorActionLabel,
  operatorCommandFeedback,
  type MonitoringRefresh,
  type OperatorAction,
  type OperatorCommandView,
  type OperatorFeedback,
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

function showOperatorToast(feedback: OperatorFeedback) {
  if (feedback.kind === "error") {
    toast.error(feedback.toast);
    return;
  }
  if (feedback.kind === "progress") {
    toast.message(feedback.toast);
    return;
  }
  toast.success(feedback.toast);
}

async function refreshMonitoring(): Promise<{
  refresh: MonitoringRefresh;
  data: Awaited<ReturnType<typeof getMonitoringData>>;
}> {
  try {
    const latest = await getMonitoringData();
    if (!latest) {
      return { refresh: { status: "empty" }, data: undefined };
    }
    return {
      refresh: {
        status: "ok",
        positions: (latest.positions ?? []).map((p) => ({
          symbol: p.symbol,
          quantity: p.quantity,
        })),
      },
      data: latest,
    };
  } catch {
    return { refresh: { status: "failed" }, data: undefined };
  }
}

export function useOperatorCommands() {
  const controlsEnabled = useControlsEnabled();
  const setMonitoringData = useTradingStore((s) => s.setMonitoringData);
  const [feedback, setFeedback] = useState<OperatorFeedback | null>(null);

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
    const { refresh, data } = await refreshMonitoring();
    if (data) setMonitoringData(data);
    const next = operatorCommandFeedback(action, view, refresh);
    setFeedback(next);
    showOperatorToast(next);
    return view;
  };

  const mutation = useMutation({
    mutationFn: run,
    onError: (err) => {
      const message = String(err);
      const next: OperatorFeedback = {
        kind: "error",
        toast: message,
        status: message,
      };
      setFeedback(next);
      toast.error(message);
    },
  });

  return {
    run: (action: OperatorAction) => mutation.mutate(action),
    running: mutation.isPending,
    last: mutation.data,
    feedback,
    consequence: operatorActionConsequence,
    label: operatorActionLabel,
  };
}

export function useOperatorConfirm() {
  const [pending, setPending] = useState<OperatorAction | null>(null);
  return { pending, setPending };
}
