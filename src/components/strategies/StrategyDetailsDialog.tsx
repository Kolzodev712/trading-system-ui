import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { OperatorStrategyConfig } from "@/gen/trading_cli_pb";
import {
  getStrategyConfig,
  requestRestart,
  updateStrategyCap,
  updateStrategyConfig,
} from "@/api/tradingCliService";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PnlText } from "@/components/shared/PnlText";
import { useSelectedStrategy, useStatusFreshness, useTradingStore } from "@/store/tradingStore";
import {
  displayReadiness,
  exchangeOrdersLabel,
  executionPausedNote,
  formatCandidateIdentity,
  STALE_CONTROLS_MESSAGE,
} from "@/lib/operatorStatus";

export function StrategyDetailsDialog() {
  const overlay = useTradingStore((s) => s.overlay);
  const closeOverlay = useTradingStore((s) => s.closeOverlay);
  const strategy = useSelectedStrategy();
  const globalTrading = useTradingStore((s) => s.tradingEnabled);
  const freshness = useStatusFreshness();
  const open = overlay === "strategyDetails";
  const controlsLive = freshness === "live";

  const configQuery = useQuery({
    queryKey: ["strategy-config", strategy?.strategyName, strategy?.symbol],
    queryFn: () => {
      if (!strategy) throw new Error("No strategy selected");
      return getStrategyConfig(strategy.strategyName, strategy.symbol);
    },
    enabled: open && !!strategy,
  });

  const [strategyType, setStrategyType] = useState("");
  const [maxPosition, setMaxPosition] = useState("");
  const [positionSize, setPositionSize] = useState("");
  const [buyThreshold, setBuyThreshold] = useState("");
  const [sellThreshold, setSellThreshold] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [maxActiveOrders, setMaxActiveOrders] = useState("");
  const [priceHistorySize, setPriceHistorySize] = useState("");
  const [minPriceHistory, setMinPriceHistory] = useState("");

  useEffect(() => {
    const c = configQuery.data;
    if (!c) return;
    setStrategyType(c.strategyType || strategy?.strategyName || "");
    setMaxPosition(c.maxPosition);
    setPositionSize(c.positionSize);
    setBuyThreshold(c.buyThresholdPercent);
    setSellThreshold(c.sellThresholdPercent);
    setStopLoss(c.stopLossPercent);
    setTakeProfit(c.takeProfitPercent);
    setMaxActiveOrders(String(c.maxActiveOrders || ""));
    setPriceHistorySize(String(c.priceHistorySize || ""));
    setMinPriceHistory(String(c.minPriceHistory || ""));
  }, [configQuery.data, strategy?.strategyName]);

  const capMutation = useMutation({
    mutationFn: () => {
      if (!controlsLive) throw new Error(STALE_CONTROLS_MESSAGE);
      if (!strategy) throw new Error("No strategy selected");
      return updateStrategyCap(strategy.strategyName, strategy.symbol, maxPosition);
    },
    onSuccess: (res) => {
      toast.success(res.message || "Cap applied live");
    },
    onError: (err) => toast.error(String(err)),
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!controlsLive) throw new Error(STALE_CONTROLS_MESSAGE);
      if (!strategy) throw new Error("No strategy selected");
      return updateStrategyConfig(
        new OperatorStrategyConfig({
          strategyType: strategyType || strategy.strategyName,
          symbol: strategy.symbol,
          positionSize,
          maxPosition,
          buyThresholdPercent: buyThreshold,
          sellThresholdPercent: sellThreshold,
          stopLossPercent: stopLoss,
          takeProfitPercent: takeProfit,
          maxActiveOrders: Number(maxActiveOrders) || 0,
          priceHistorySize: Number(priceHistorySize) || 0,
          minPriceHistory: Number(minPriceHistory) || 0,
        }),
      );
    },
    onSuccess: (res) => {
      if (res.needsRestart) {
        toast.success(res.message || "Saved. Restart the runner to apply.");
      } else {
        toast.success(res.message || "Saved");
      }
      void configQuery.refetch();
    },
    onError: (err) => toast.error(String(err)),
  });

  const restartMutation = useMutation({
    mutationFn: () => {
      if (!controlsLive) throw new Error(STALE_CONTROLS_MESSAGE);
      return requestRestart("cancel_working");
    },
    onSuccess: (res) => {
      toast.success(res.message || "Restart requested");
      closeOverlay();
    },
    onError: (err) => toast.error(String(err)),
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && closeOverlay()}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Strategy Details</DialogTitle>
        </DialogHeader>
        {strategy && (
          <div className="space-y-4">
            <div className="space-y-2 text-sm font-mono">
              <Row label="Strategy ID" value={strategy.strategyId} />
              <Row label="Version" value={strategy.strategyVersion || "—"} />
              <Row label="Config hash" value={strategy.configHash || "—"} />
              <Row label="Name" value={strategy.strategyName} />
              <Row label="Symbol" value={strategy.symbol} />
              <Row label="Enabled" value={strategy.enabled ? "Yes" : "No"} />
              <Row
                label="Candidate identity"
                value={formatCandidateIdentity({
                  researchDisposition: strategy.researchDisposition,
                  operationalRole: strategy.operationalRole,
                  executionMode: strategy.executionMode,
                })}
              />
              <Row
                label="Research"
                value={strategy.researchDisposition || "—"}
              />
              <Row
                label="Operational role"
                value={strategy.operationalRole || "—"}
              />
              <Row
                label="Execution mode"
                value={strategy.executionMode || "—"}
              />
              <Row
                label="Readiness"
                value={displayReadiness(freshness, strategy.readiness)}
              />
              <Row label="Ready reason" value={strategy.readinessReason || "—"} />
              <Row
                label="Last candle start"
                value={
                  strategy.lastCompletedCandleStartMs
                    ? String(strategy.lastCompletedCandleStartMs)
                    : "—"
                }
              />
              <Row
                label="Last candle end"
                value={
                  strategy.lastCompletedCandleEndMs
                    ? String(strategy.lastCompletedCandleEndMs)
                    : "—"
                }
              />
              <Row label="Last close" value={strategy.lastClose || "—"} />
              <Row label="Geometric mean" value={strategy.geometricMean || "—"} />
              <Row label="Log spread" value={strategy.logSpread || "—"} />
              <Row
                label="Model direction"
                value={strategy.modelDirection || strategy.lastSignal}
              />
              <Row
                label="Previous direction"
                value={strategy.previousDirection || "—"}
              />
              <Row label="Desired target" value={strategy.desiredTarget || "—"} />
              <Row label="Filled position" value={strategy.filledPosition || "—"} />
              <Row label="Working qty" value={strategy.workingQty || "—"} />
              <Row label="Reserved qty" value={strategy.reservedQty || "—"} />
              <Row label="Effective qty" value={strategy.effectiveQty || "—"} />
              <Row
                label="Fresh entry"
                value={strategy.freshEntryEligible ? "yes" : "no"}
              />
              <Row
                label="Unresolved submission"
                value={strategy.unresolvedSubmission ? "yes" : "no"}
              />
              <Row label="Recovery" value={strategy.recovery || "—"} />
              <Row
                label="Exchange orders"
                value={(() => {
                  const label = exchangeOrdersLabel(
                    strategy.executionMode,
                    strategy.activeOrders,
                  );
                  return (
                    <span
                      className={label.violation ? "text-red-400 font-semibold" : undefined}
                    >
                      {label.text}
                    </span>
                  );
                })()}
              />
              <Row label="Position Qty" value={strategy.positionQuantity} />
              <Row label="Live cap" value={strategy.maxPosition || "—"} />
              <Row label="Avg Price" value={strategy.positionAvgPrice} />
              <Row
                label="Unrealized PnL"
                value={<PnlText value={strategy.unrealizedPnl} />}
              />
              <Row label="uPnL %" value={strategy.unrealizedPnlPercent} />
              <Row
                label="Active Orders"
                value={`${strategy.activeOrders}/${strategy.maxActiveOrders}`}
              />
              <Row
                label="Global execution"
                value={globalTrading ? "ON" : "OFF (model still shown)"}
              />
            </div>
            {executionPausedNote(globalTrading, strategy.executionMode) && (
              <p className="text-xs text-amber-300 border border-amber-500/30 rounded-md p-2">
                {executionPausedNote(globalTrading, strategy.executionMode)}
              </p>
            )}

            {configQuery.isLoading && (
              <p className="text-sm text-muted-foreground">Loading operator config…</p>
            )}
            {configQuery.isError && (
              <p className="text-sm text-destructive">
                {String(configQuery.error)}
              </p>
            )}

            {configQuery.data && (
              <div className="grid gap-3">
                <p className="text-xs text-muted-foreground">
                  Cap applies immediately. Type, size, and lookbacks persist and
                  need Restart. PropHold stays available; Donchian is the slow
                  breakout. Keys are not editable here.
                </p>
                <Field label="Strategy type (restart)">
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                    value={strategyType}
                    onChange={(e) => setStrategyType(e.target.value)}
                  >
                    <option value="PropHold">PropHold (flat / flatten leftover)</option>
                    <option value="Donchian">Donchian (20-day / 10-day)</option>
                    <option value="BuyLowSellHigh">BuyLowSellHigh</option>
                  </select>
                </Field>
                <Field label="Max position (live cap)">
                  <Input
                    value={maxPosition}
                    onChange={(e) => setMaxPosition(e.target.value)}
                  />
                </Field>
                <Field label="Position size (restart)">
                  <Input
                    value={positionSize}
                    onChange={(e) => setPositionSize(e.target.value)}
                  />
                </Field>
                <Field label="Buy threshold % (restart)">
                  <Input
                    value={buyThreshold}
                    onChange={(e) => setBuyThreshold(e.target.value)}
                  />
                </Field>
                <Field label="Sell threshold % (restart)">
                  <Input
                    value={sellThreshold}
                    onChange={(e) => setSellThreshold(e.target.value)}
                  />
                </Field>
                <Field label="Stop loss % (restart)">
                  <Input
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                  />
                </Field>
                <Field label="Take profit % (restart)">
                  <Input
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                  />
                </Field>
                <Field label="Max active orders (restart)">
                  <Input
                    value={maxActiveOrders}
                    onChange={(e) => setMaxActiveOrders(e.target.value)}
                  />
                </Field>
                <Field label="Entry days (Donchian, restart)">
                  <Input
                    value={priceHistorySize}
                    onChange={(e) => setPriceHistorySize(e.target.value)}
                  />
                </Field>
                <Field label="Exit days (Donchian, restart)">
                  <Input
                    value={minPriceHistory}
                    onChange={(e) => setMinPriceHistory(e.target.value)}
                  />
                </Field>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => capMutation.mutate()}
                    disabled={capMutation.isPending || !maxPosition || !controlsLive}
                  >
                    {capMutation.isPending ? "Applying…" : "Apply cap"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending || !controlsLive}
                  >
                    {saveMutation.isPending ? "Saving…" : "Save"}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Stop trading and relaunch the runner? The supervisor script must be running.",
                        )
                      ) {
                        restartMutation.mutate();
                      }
                    }}
                    disabled={restartMutation.isPending || !controlsLive}
                  >
                    {restartMutation.isPending ? "Restarting…" : "Restart runner"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/50 py-1">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
