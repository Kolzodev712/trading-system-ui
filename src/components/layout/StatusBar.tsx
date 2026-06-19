import { useTradingStore, useMode } from "@/store/tradingStore";

export function StatusBar() {
  const connected = useTradingStore((s) => s.connected);
  const streamConnected = useTradingStore((s) => s.streamConnected);
  const endpoint = useTradingStore((s) => s.endpoint);
  const exchange = useTradingStore((s) => s.monitoringData?.exchange ?? "—");
  const mode = useMode();
  const screen = useTradingStore((s) => s.screen);

  return (
    <footer className="border-t border-border px-4 py-2 text-xs text-muted-foreground flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <span
          className={
            connected
              ? "text-green-400"
              : "text-red-400"
          }
        >
          {connected ? "● Connected" : "○ Disconnected"}
        </span>
        {screen !== "main" && (
          <span className={streamConnected ? "text-green-400" : "text-yellow-400"}>
            Stream: {streamConnected ? "live" : "reconnecting…"}
          </span>
        )}
        <span>Endpoint: {endpoint}</span>
      </div>
      <div className="flex items-center gap-3">
        <span>Exchange: {exchange}</span>
        <span>Mode: {mode === "strategies" ? "Strategies" : "Levels"}</span>
      </div>
    </footer>
  );
}
