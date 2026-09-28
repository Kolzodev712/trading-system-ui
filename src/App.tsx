import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AppHeader } from "@/components/layout/AppHeader";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { StatusBar } from "@/components/layout/StatusBar";
import { DexQuoteDetailsDialog } from "@/components/dex/DexQuoteDetailsDialog";
import { DexStrategyDetailsDialog } from "@/components/dex/DexStrategyDetailsDialog";
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

const DexMonitor = lazy(() =>
  import("@/screens/DexMonitor").then((m) => ({ default: m.DexMonitor })),
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1 },
  },
});

function MonitorFallback() {
  return (
    <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
      Loading monitor…
    </div>
  );
}

function TradingApp() {
  const { hydrated } = useAuth();
  const authenticated = useIsAuthenticated();
  const connected = useTradingStore((s) => s.connected);
  const screen = useTradingStore((s) => s.screen);
  useMonitoringStream(connected);
  useLevelsPoll(connected && screen !== "main", true);

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
          {screen === "dex" && (
            <Suspense fallback={<MonitorFallback />}>
              <DexMonitor />
            </Suspense>
          )}
        </main>
      </ErrorBoundary>

      <StatusBar />

      <LevelDetailsDialog />
      <StrategyDetailsDialog />
      <DexQuoteDetailsDialog />
      <DexStrategyDetailsDialog />
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
