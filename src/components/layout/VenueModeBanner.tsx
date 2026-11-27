import { useStatusFreshness, useTradingStore } from "@/store/tradingStore";
import {
  formatExposureHalt,
  formatSessionLabel,
  formatSourceAvailability,
} from "@/lib/operatorStatus";
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
  const halt = formatExposureHalt(
    data?.exposureHaltReason,
    data?.lastBlockReasonCode,
  );
  const unavailable = [
    formatSourceAvailability("order book", data?.orderbookSource),
    formatSourceAvailability("ledger", data?.ledgerSource),
    formatSourceAvailability("indicators", data?.indicatorsSource),
    formatSourceAvailability("trades", data?.tradesSource),
  ].filter(Boolean);
  return (
    <span
      data-testid="venue-mode-banner"
      className={cn(
        "inline-flex flex-wrap items-center gap-1 px-2 py-1 rounded-md border text-[11px] font-semibold tracking-wide font-mono",
        freshness === "live"
          ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/40"
          : "bg-yellow-500/15 text-yellow-300 border-yellow-500/40",
        className,
      )}
    >
      <span>{label}</span>
      {halt && (
        <span data-testid="exposure-halt" className="text-red-300">
          · {halt}
        </span>
      )}
      {unavailable.map((msg) => (
        <span
          key={msg}
          data-testid="source-unavailable"
          className="text-amber-200"
        >
          · {msg}
        </span>
      ))}
      {data?.workingOrdersUnfiltered ? (
        <span data-testid="orders-unfiltered" className="text-amber-200">
          · working orders unfiltered
        </span>
      ) : null}
    </span>
  );
}
