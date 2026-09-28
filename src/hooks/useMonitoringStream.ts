import { useEffect, useRef } from "react";
import { streamMonitoringData } from "@/api/tradingCliService";
import { useTradingStore } from "@/store/tradingStore";

const INITIAL_BACKOFF_MS = 1_000;
const MAX_BACKOFF_MS = 30_000;

export function useMonitoringStream(active: boolean) {
  const applyStreamUpdate = useTradingStore((s) => s.applyStreamUpdate);
  const beginStreamAttempt = useTradingStore((s) => s.beginStreamAttempt);
  const markStreamEnded = useTradingStore((s) => s.markStreamEnded);
  const markStreamFailed = useTradingStore((s) => s.markStreamFailed);
  const attemptRef = useRef(0);

  useEffect(() => {
    if (!active) {
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const abortController = new AbortController();

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        timeoutId = setTimeout(resolve, ms);
      });

    const run = async () => {
      while (!cancelled) {
        beginStreamAttempt();
        try {
          const stream = streamMonitoringData(abortController.signal);
          let received = false;
          for await (const update of stream) {
            if (cancelled) break;
            if (update.data) {
              received = true;
              applyStreamUpdate(update.data);
              attemptRef.current = 0;
            }
          }
          if (cancelled) break;
          if (received) {
            markStreamEnded();
          } else {
            markStreamFailed();
          }
        } catch {
          if (cancelled) break;
          markStreamFailed();
        }
        attemptRef.current += 1;
        const backoff = Math.min(
          INITIAL_BACKOFF_MS * 2 ** (attemptRef.current - 1),
          MAX_BACKOFF_MS,
        );
        await sleep(backoff);
      }
    };

    void run();

    return () => {
      cancelled = true;
      abortController.abort();
      if (timeoutId) clearTimeout(timeoutId);
      markStreamFailed();
    };
  }, [
    active,
    applyStreamUpdate,
    beginStreamAttempt,
    markStreamEnded,
    markStreamFailed,
  ]);
}
