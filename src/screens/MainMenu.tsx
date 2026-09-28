import { LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { OperatorControls } from "@/components/layout/OperatorControls";
import { VenueModeBanner } from "@/components/layout/VenueModeBanner";
import { useMonitorActions } from "@/hooks/useMonitorActions";
import { useControlsEnabled, useMode, useTradingStore } from "@/store/tradingStore";

export function MainMenu() {
  const tradingEnabled = useTradingStore((s) => s.tradingEnabled);
  const enterMonitor = useTradingStore((s) => s.enterMonitor);
  const mode = useMode();
  const modeLabel =
    mode === "dex"
      ? "DEX"
      : mode === "strategies"
        ? "Strategies"
        : "Levels";
  const { toggleGlobal, togglingGlobal } = useMonitorActions();
  const controlsEnabled = useControlsEnabled();

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Trading System</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="space-y-1">
              <Label htmlFor="global-trading" className="text-base">
                Global Trading
              </Label>
              <p className="text-xs text-muted-foreground">
                Legacy toggle: disabling cancels working orders. Not PauseEntries or FlattenAndPause.
              </p>
            </div>
            <Switch
              id="global-trading"
              checked={tradingEnabled}
              disabled={togglingGlobal || !controlsEnabled}
              onCheckedChange={(enabled) => toggleGlobal(enabled)}
            />
          </div>

          <OperatorControls />

          <Button size="lg" className="w-full" onClick={enterMonitor}>
            <LayoutDashboard className="h-5 w-5" />
            Open Trading Monitor
          </Button>

          <div className="text-sm text-muted-foreground border-t border-border pt-4 flex justify-between gap-3 items-center">
            <VenueModeBanner />
            <span>Runner: {modeLabel}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
