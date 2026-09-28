import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  cancelDexPoolOrders,
  getMonitoringData,
  toggleDexQuote,
  toggleDexStrategy,
} from "@/api/tradingCliService";
import { STALE_CONTROLS_MESSAGE } from "@/lib/operatorStatus";
import {
  useControlsEnabled,
  useSelectedDexQuote,
  useSelectedDexStrategy,
  useTradingStore,
} from "@/store/tradingStore";

export function useDexMonitorActions() {
  const setMonitoringData = useTradingStore((s) => s.setMonitoringData);
  const selectedQuote = useSelectedDexQuote();
  const selectedStrategy = useSelectedDexStrategy();
  const controlsEnabled = useControlsEnabled();

  const refreshMutation = useMutation({
    mutationFn: getMonitoringData,
    onSuccess: (data) => {
      if (data) setMonitoringData(data);
      toast.success("Monitoring data refreshed");
    },
    onError: (err) => toast.error(String(err)),
  });

  const afterDexAction = async (message?: string) => {
    if (message) toast.success(message);
    await refreshMutation.mutateAsync();
  };

  const toggleQuoteMutation = useMutation({
    mutationFn: async () => {
      if (!controlsEnabled) throw new Error(STALE_CONTROLS_MESSAGE);
      if (!selectedQuote) throw new Error("Select a quote first");
      return toggleDexQuote(selectedQuote.id, !selectedQuote.enabled);
    },
    onSuccess: async (res) => {
      await afterDexAction(res.message || "Quote updated");
    },
    onError: (err) => toast.error(String(err)),
  });

  const toggleStrategyMutation = useMutation({
    mutationFn: async () => {
      if (!controlsEnabled) throw new Error(STALE_CONTROLS_MESSAGE);
      if (!selectedStrategy) throw new Error("Select a strategy first");
      return toggleDexStrategy(selectedStrategy.id, !selectedStrategy.enabled);
    },
    onSuccess: async (res) => {
      await afterDexAction(res.message || "Strategy updated");
    },
    onError: (err) => toast.error(String(err)),
  });

  const cancelPoolMutation = useMutation({
    mutationFn: (pool: string) => {
      if (!controlsEnabled) return Promise.reject(new Error(STALE_CONTROLS_MESSAGE));
      return cancelDexPoolOrders(pool);
    },
    onSuccess: async (res) => {
      const sigs = res.transactionSignatures?.length ?? 0;
      await afterDexAction(
        res.message || `Cancel submitted${sigs ? ` (${sigs} tx)` : ""}`,
      );
    },
    onError: (err) => toast.error(String(err)),
  });

  return {
    refresh: () => refreshMutation.mutate(),
    refreshing: refreshMutation.isPending,
    toggleQuote: () => toggleQuoteMutation.mutate(),
    togglingQuote: toggleQuoteMutation.isPending,
    toggleStrategy: () => toggleStrategyMutation.mutate(),
    togglingStrategy: toggleStrategyMutation.isPending,
    cancelPool: (pool: string) => cancelPoolMutation.mutate(pool),
    cancelling: cancelPoolMutation.isPending,
  };
}
