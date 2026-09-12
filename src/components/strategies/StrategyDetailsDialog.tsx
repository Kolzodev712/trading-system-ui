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
import { useSelectedStrategy, useTradingStore } from "@/store/tradingStore";

export function StrategyDetailsDialog() {
  const overlay = useTradingStore((s) => s.overlay);
  const closeOverlay = useTradingStore((s) => s.closeOverlay);
  const strategy = useSelectedStrategy();
  const globalTrading = useTradingStore((s) => s.tradingEnabled);
  const open = overlay === "strategyDetails";

  const configQuery = useQuery({
    queryKey: ["strategy-config", strategy?.strategyName, strategy?.symbol],
    queryFn: () => {
      if (!strategy) throw new Error("No strategy selected");
      return getStrategyConfig(strategy.strategyName, strategy.symbol);
    },
    enabled: open && !!strategy,
  });

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
    setMaxPosition(c.maxPosition);
    setPositionSize(c.positionSize);
    setBuyThreshold(c.buyThresholdPercent);
    setSellThreshold(c.sellThresholdPercent);
    setStopLoss(c.stopLossPercent);
    setTakeProfit(c.takeProfitPercent);
    setMaxActiveOrders(String(c.maxActiveOrders || ""));
    setPriceHistorySize(String(c.priceHistorySize || ""));
    setMinPriceHistory(String(c.minPriceHistory || ""));
  }, [configQuery.data]);

  const capMutation = useMutation({
    mutationFn: () => {
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
      if (!strategy) throw new Error("No strategy selected");
      return updateStrategyConfig(
        new OperatorStrategyConfig({
          strategyType: strategy.strategyName,
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
    mutationFn: () => requestRestart("cancel_working"),
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
              <Row label="Name" value={strategy.strategyName} />
              <Row label="Symbol" value={strategy.symbol} />
              <Row label="Enabled" value={strategy.enabled ? "Yes" : "No"} />
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
              <Row label="Last Signal" value={strategy.lastSignal} />
              <Row
                label="Status"
                value={globalTrading ? "Global trading ON" : "Global trading OFF"}
              />
            </div>

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
                  Cap applies immediately. Other fields persist and need a runner
                  restart. Keys and venue settings are not editable here.
                </p>
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
                <Field label="Price history size (restart)">
                  <Input
                    value={priceHistorySize}
                    onChange={(e) => setPriceHistorySize(e.target.value)}
                  />
                </Field>
                <Field label="Min price history (restart)">
                  <Input
                    value={minPriceHistory}
                    onChange={(e) => setMinPriceHistory(e.target.value)}
                  />
                </Field>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => capMutation.mutate()}
                    disabled={capMutation.isPending || !maxPosition}
                  >
                    {capMutation.isPending ? "Applying…" : "Apply cap"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending}
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
                    disabled={restartMutation.isPending}
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
