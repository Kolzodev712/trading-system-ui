import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getLevel,
  getMonitoringData,
  setTradingEnabled,
  toggleLevel,
  toggleStrategy,
} from "@/api/tradingCliService";
import { useInvalidateLevels } from "@/hooks/useLevelsPoll";
import { STALE_CONTROLS_MESSAGE } from "@/lib/operatorStatus";
import {
  useControlsEnabled,
  useMode,
  useSelectedLevel,
  useSelectedStrategy,
  useTradingStore,
} from "@/store/tradingStore";

export function useMonitorActions() {
  const invalidateLevels = useInvalidateLevels();
  const mode = useMode();
  const selectedLevel = useSelectedLevel();
  const selectedStrategy = useSelectedStrategy();
  const controlsEnabled = useControlsEnabled();

  const setMonitoringData = useTradingStore((s) => s.setMonitoringData);
  const setTradingEnabledStore = useTradingStore((s) => s.setTradingEnabled);
  const setOverlay = useTradingStore((s) => s.setOverlay);
  const setLevelDetails = useTradingStore((s) => s.setLevelDetails);

  const refreshMutation = useMutation({
    mutationFn: getMonitoringData,
    onSuccess: (data) => {
      if (data) setMonitoringData(data);
      toast.success("Monitoring data refreshed");
    },
    onError: (err) => toast.error(String(err)),
  });

  const toggleGlobalMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!controlsEnabled) throw new Error(STALE_CONTROLS_MESSAGE);
      return setTradingEnabled(enabled);
    },
    onSuccess: (res, enabled) => {
      setTradingEnabledStore(enabled);
      const cancelled = res.cancelledOrders?.length ?? 0;
      toast.success(
        res.message ||
          `Trading ${enabled ? "enabled" : "disabled"}${cancelled ? ` (${cancelled} orders cancelled)` : ""}`,
      );
    },
    onError: (err) => toast.error(String(err)),
  });

  const toggleItemMutation = useMutation({
    mutationFn: async () => {
      if (!controlsEnabled) throw new Error(STALE_CONTROLS_MESSAGE);
      if (mode === "strategies" && selectedStrategy) {
        return toggleStrategy(
          selectedStrategy.strategyName,
          selectedStrategy.symbol,
          !selectedStrategy.enabled,
        );
      }
      if (selectedLevel) {
        return toggleLevel(selectedLevel.id, !selectedLevel.enabled);
      }
      throw new Error("Select a level or strategy first");
    },
    onSuccess: async () => {
      toast.success("Updated successfully");
      await invalidateLevels();
      await refreshMutation.mutateAsync();
    },
    onError: (err) => toast.error(String(err)),
  });

  const showDetails = useCallback(async () => {
    if (mode === "strategies" && selectedStrategy) {
      setOverlay("strategyDetails");
      return;
    }
    if (selectedLevel) {
      try {
        const level = await getLevel(selectedLevel.id);
        if (level) {
          setLevelDetails(level);
          setOverlay("levelDetails");
        }
      } catch (err) {
        toast.error(String(err));
      }
      return;
    }
    toast.error("Select a level or strategy first");
  }, [mode, selectedLevel, selectedStrategy, setLevelDetails, setOverlay]);

  return {
    refresh: () => refreshMutation.mutate(),
    refreshing: refreshMutation.isPending,
    toggleGlobal: (enabled: boolean) => toggleGlobalMutation.mutate(enabled),
    togglingGlobal: toggleGlobalMutation.isPending,
    toggleSelected: () => toggleItemMutation.mutate(),
    togglingSelected: toggleItemMutation.isPending,
    showDetails,
    invalidateLevels,
  };
}
