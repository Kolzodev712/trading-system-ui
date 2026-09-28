import { useStatusFreshness, useTradingStore } from "@/store/tradingStore";
import { formatSessionLabel } from "@/lib/operatorStatus";
import { cn } from "@/lib/utils";

export function VenueModeBanner({ className }: { className?: string }) {
  const freshness = useStatusFreshness();
  const data = useTradingStore((s) => s.monitoringData);
  const label = formatSessionLabel(
    freshness,
    data?.venue,
    data?.environment,
    data?.executionMode,
  );
  return (
    <span
      data-testid="venue-mode-banner"
      className={cn(
        "inline-flex items-center px-2 py-1 rounded-md border text-[11px] font-semibold tracking-wide font-mono",
        freshness === "live"
          ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/40"
          : "bg-yellow-500/15 text-yellow-300 border-yellow-500/40",
        className,
      )}
    >
      {label}
    </span>
  );
}
