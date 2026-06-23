import { useDexStreamHealth } from "@/lib/dexHealth";
import { cn } from "@/lib/utils";
import { useTradingStore } from "@/store/tradingStore";

export function DexMonitorHeader() {
  const data = useTradingStore((s) => s.monitoringData);
  const dex = data?.dex;
  const streamConnected = useTradingStore((s) => s.streamConnected);
  const health = useDexStreamHealth();

  if (!data || !dex) return null;

  return (
    <div className="px-4 py-2 border-b border-border bg-card/30 flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-sm font-semibold">
        DEX Monitor — {dex.venue || "venue"}
        {data.exchange ? ` · ${data.exchange}` : ""}
      </h2>
      <div className="flex items-center gap-2 text-xs">
        <span
          className={cn(
            "px-2 py-0.5 rounded-full border",
            streamConnected
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400 animate-pulse",
          )}
        >
          Stream: {streamConnected ? "live" : "reconnecting…"}
        </span>
        <span
          className={cn(
            "px-2 py-0.5 rounded-full border",
            health.status === "live"
              ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
              : "bg-muted/50 border-border text-muted-foreground",
          )}
        >
          {health.label}
        </span>
      </div>
    </div>
  );
}
