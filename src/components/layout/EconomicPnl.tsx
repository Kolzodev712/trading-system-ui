import { PnlText } from "@/components/shared/PnlText";
import { useTradingStore } from "@/store/tradingStore";

export function EconomicPnl() {
  const data = useTradingStore((s) => s.monitoringData);
  if (!data) return null;
  const simulation = (data.economicSource || "").toLowerCase() === "simulation";
  return (
    <div
      data-testid="economic-pnl"
      className="hidden lg:flex items-center gap-2 text-[11px] font-mono min-w-0"
    >
      {simulation && (
        <span
          data-testid="economic-simulation-label"
          className="px-1.5 py-0.5 rounded border border-amber-500/40 bg-amber-500/15 text-amber-300 font-semibold tracking-wide"
        >
          SIMULATION
        </span>
      )}
      <span className="text-muted-foreground">R</span>
      <PnlText value={data.realizedPnl} />
      <span className="text-muted-foreground">U</span>
      <PnlText value={data.unrealizedPnl} />
      <span className="text-muted-foreground">D</span>
      {(data.ledgerSource || "").toLowerCase() === "unavailable" ? (
        <span data-testid="daily-pnl-unavailable" title="ledger unavailable">
          —
        </span>
      ) : (
        <PnlText value={data.dailyPnl} />
      )}
      <span className="text-muted-foreground">fee</span>
      <span>{data.feesPaid || "—"}</span>
      <span className="text-muted-foreground">fund</span>
      <PnlText value={data.fundingPnl} />
    </div>
  );
}
