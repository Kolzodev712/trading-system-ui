import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AppHeader } from "@/components/layout/AppHeader";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { StatusBar } from "@/components/layout/StatusBar";
import { DeleteLevelStub } from "@/components/levels/DeleteLevelStub";
import { CreateLevelDialog } from "@/components/levels/CreateLevelDialog";
import { EditLevelDialog } from "@/components/levels/EditLevelDialog";
import { LevelDetailsDialog } from "@/components/levels/LevelDetailsDialog";
import { StrategyDetailsDialog } from "@/components/strategies/StrategyDetailsDialog";
import { useAuth } from "@/hooks/useAuth";
import { useLevelsPoll } from "@/hooks/useLevelsPoll";
import { useMonitoringStream } from "@/hooks/useMonitoringStream";
import { FuturesMonitor } from "@/screens/FuturesMonitor";
import { MainMenu } from "@/screens/MainMenu";
import { SpotMonitor } from "@/screens/SpotMonitor";
import { WelcomeScreen } from "@/screens/WelcomeScreen";
import { useIsAuthenticated } from "@/store/authStore";
import { useTradingStore } from "@/store/tradingStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1 },
  },
});

function TradingApp() {
  const { hydrated } = useAuth();
  const authenticated = useIsAuthenticated();
  const connected = useTradingStore((s) => s.connected);
  const screen = useTradingStore((s) => s.screen);
  const streamActive = connected && screen !== "main";

  useMonitoringStream(streamActive);
  useLevelsPoll(streamActive, true);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!authenticated || !connected) {
    return (
      <>
        <WelcomeScreen />
        <Toaster theme="dark" position="top-right" richColors />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <AppHeader />

      <ErrorBoundary>
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {screen === "main" && <MainMenu />}
          {screen === "spot" && <SpotMonitor />}
          {screen === "futures" && <FuturesMonitor />}
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
