import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getLevels } from "@/api/tradingCliService";
import { useTradingStore } from "@/store/tradingStore";

export function useLevelsPoll(enabled: boolean, spotOnly: boolean) {
  const screen = useTradingStore((s) => s.screen);
  const setLevels = useTradingStore((s) => s.setLevels);
  const shouldPoll = enabled && (!spotOnly || screen === "spot");

  const query = useQuery({
    queryKey: ["levels"],
    queryFn: getLevels,
    enabled: shouldPoll,
    refetchInterval: shouldPoll ? 5_000 : false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.data) setLevels(query.data);
  }, [query.data, setLevels]);

  return query;
}

export function useInvalidateLevels() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["levels"] });
}
