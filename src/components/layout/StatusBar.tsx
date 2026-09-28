import type { ComponentType } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { VenueModeBanner } from "@/components/layout/VenueModeBanner";
import { useTradingStore, useMode, useStatusFreshness } from "@/store/tradingStore";
import { cn } from "@/lib/utils";

export function StatusBar() {
  const connected = useTradingStore((s) => s.connected);
  const freshness = useStatusFreshness();
  const endpoint = useTradingStore((s) => s.endpoint);
  const mode = useMode();
  const modeLabel =
    mode === "dex"
      ? "DEX"
      : mode === "strategies"
        ? "Strategies"
        : "Levels";
  const streamOk = freshness === "live";
  const streamLabel =
    freshness === "live"
      ? "Stream live"
      : freshness === "stale"
        ? "Stream stale"
        : "Stream waiting";

  return (
    <footer className="border-t border-border px-4 py-2 text-xs text-muted-foreground flex items-center justify-between gap-4 flex-wrap bg-card/20">
      <div className="flex items-center gap-2 flex-wrap">
        <StatusPill
          ok={connected}
          okLabel="Runner connected"
          badLabel="Runner offline"
          icon={connected ? Wifi : WifiOff}
        />
        <StatusPill
          ok={streamOk}
          okLabel="Stream live"
          badLabel={streamLabel}
          pulse={!streamOk}
        />
        <span className="hidden md:inline text-muted-foreground/80 font-mono">
          {endpoint}
        </span>
      </div>
      <div className="flex items-center gap-3 min-w-0">
        <VenueModeBanner className="truncate" />
        <span className="text-border">|</span>
        <span>{modeLabel}</span>
      </div>
    </footer>
  );
}

function StatusPill({
  ok,
  okLabel,
  badLabel,
  icon: Icon,
  pulse,
}: {
  ok: boolean;
  okLabel: string;
  badLabel: string;
  icon?: ComponentType<{ className?: string }>;
  pulse?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium",
        ok
          ? "bg-green-500/10 border-green-500/30 text-green-400"
          : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
        pulse && "animate-pulse",
      )}
    >
      {Icon ? (
        <Icon className="h-3 w-3" />
      ) : (
        <span className={cn("h-1.5 w-1.5 rounded-full", ok ? "bg-green-400" : "bg-yellow-400")} />
      )}
      {ok ? okLabel : badLabel}
    </span>
  );
}
