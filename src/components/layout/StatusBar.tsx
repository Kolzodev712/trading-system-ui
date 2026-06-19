import type { ComponentType } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { useTradingStore, useMode } from "@/store/tradingStore";
import { cn } from "@/lib/utils";

export function StatusBar() {
  const connected = useTradingStore((s) => s.connected);
  const streamConnected = useTradingStore((s) => s.streamConnected);
  const endpoint = useTradingStore((s) => s.endpoint);
  const exchange = useTradingStore((s) => s.monitoringData?.exchange ?? "—");
  const mode = useMode();
  const screen = useTradingStore((s) => s.screen);

  return (
    <footer className="border-t border-border px-4 py-2 text-xs text-muted-foreground flex items-center justify-between gap-4 flex-wrap bg-card/20">
      <div className="flex items-center gap-2 flex-wrap">
        <StatusPill
          ok={connected}
          okLabel="Runner connected"
          badLabel="Runner offline"
          icon={connected ? Wifi : WifiOff}
        />
        {screen !== "main" && (
          <StatusPill
            ok={streamConnected}
            okLabel="Stream live"
            badLabel="Stream reconnecting"
            pulse={!streamConnected}
          />
        )}
        <span className="hidden md:inline text-muted-foreground/80 font-mono">
          {endpoint}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span>{exchange}</span>
        <span className="text-border">|</span>
        <span>{mode === "strategies" ? "Strategies" : "Levels"}</span>
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
