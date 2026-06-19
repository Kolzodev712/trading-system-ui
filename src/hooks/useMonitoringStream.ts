import { useEffect, useRef } from "react";
import { streamMonitoringData } from "@/api/tradingCliService";
import { useTradingStore } from "@/store/tradingStore";

const INITIAL_BACKOFF_MS = 1_000;
const MAX_BACKOFF_MS = 30_000;

export function useMonitoringStream(active: boolean) {
  const setMonitoringData = useTradingStore((s) => s.setMonitoringData);
  const setStreamConnected = useTradingStore((s) => s.setStreamConnected);
  const attemptRef = useRef(0);

  useEffect(() => {
    if (!active) {
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const abortController = new AbortController();

    const run = async () => {
      while (!cancelled) {
        try {
          setStreamConnected(true);
          attemptRef.current = 0;
          const stream = streamMonitoringData(abortController.signal);
          for await (const update of stream) {
            if (cancelled) break;
            if (update.data) {
              setMonitoringData(update.data);
            }
          }
          if (cancelled) break;
        } catch {
          if (cancelled) break;
          setStreamConnected(false);
          attemptRef.current += 1;
          const backoff = Math.min(
            INITIAL_BACKOFF_MS * 2 ** (attemptRef.current - 1),
            MAX_BACKOFF_MS,
          );
          await new Promise<void>((resolve) => {
            timeoutId = setTimeout(resolve, backoff);
          });
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
      abortController.abort();
      if (timeoutId) clearTimeout(timeoutId);
      setStreamConnected(false);
    };
  }, [active, setMonitoringData, setStreamConnected]);
}
