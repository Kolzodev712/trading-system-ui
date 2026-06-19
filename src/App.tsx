import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ConnectionBanner } from "@/components/layout/ConnectionBanner";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { StatusBar } from "@/components/layout/StatusBar";
import { DeleteLevelStub } from "@/components/levels/DeleteLevelStub";
import { CreateLevelDialog } from "@/components/levels/CreateLevelDialog";
import { EditLevelDialog } from "@/components/levels/EditLevelDialog";
import { LevelDetailsDialog } from "@/components/levels/LevelDetailsDialog";
import { StrategyDetailsDialog } from "@/components/strategies/StrategyDetailsDialog";
import { useLevelsPoll } from "@/hooks/useLevelsPoll";
import { useMonitoringStream } from "@/hooks/useMonitoringStream";
import { FuturesMonitor } from "@/screens/FuturesMonitor";
import { MainMenu } from "@/screens/MainMenu";
import { SpotMonitor } from "@/screens/SpotMonitor";
import { useTradingStore } from "@/store/tradingStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1 },
  },
});

function TradingApp() {
  const connected = useTradingStore((s) => s.connected);
  const screen = useTradingStore((s) => s.screen);
  const streamActive = connected && screen !== "main";

  useMonitoringStream(streamActive);
  useLevelsPoll(streamActive, true);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border px-4 py-3">
        <h1 className="text-lg font-semibold tracking-tight">Trading System UI</h1>
      </header>

      {!connected && <ConnectionBanner />}

      <ErrorBoundary>
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {connected && screen === "main" && <MainMenu />}
          {connected && screen === "spot" && <SpotMonitor />}
          {connected && screen === "futures" && <FuturesMonitor />}
        </main>
      </ErrorBoundary>

      <StatusBar />

      <LevelDetailsDialog />
      <StrategyDetailsDialog />
      <CreateLevelDialog />
      <EditLevelDialog />
      <DeleteLevelStub />
      <Toaster theme="dark" position="top-right" richColors />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TradingApp />
    </QueryClientProvider>
  );
}
