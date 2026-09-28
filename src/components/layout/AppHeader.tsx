import { Activity, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EconomicPnl } from "@/components/layout/EconomicPnl";
import { VenueModeBanner } from "@/components/layout/VenueModeBanner";
import { useAuth } from "@/hooks/useAuth";
import { useConnection } from "@/hooks/useConnection";
import { useTradingStore } from "@/store/tradingStore";
import { useAuthStore } from "@/store/authStore";

export function AppHeader() {
  const user = useAuthStore((s) => s.user);
  const connected = useTradingStore((s) => s.connected);
  const tradingEnabled = useTradingStore((s) => s.tradingEnabled);
  const data = useTradingStore((s) => s.monitoringData);
  const { logout } = useAuth();
  const { disconnect } = useConnection();

  const handleSignOut = () => {
    disconnect();
    logout();
  };

  return (
    <header className="border-b border-border px-4 py-2.5 flex items-center justify-between gap-4 bg-card/30 backdrop-blur-sm">
      <div className="flex items-center gap-3 min-w-0">
        <Activity className="h-5 w-5 text-cyan-400 shrink-0" />
        <div className="min-w-0">
          <h1 className="text-sm font-semibold tracking-tight truncate">
            Trading Console
          </h1>
          <VenueModeBanner className="mt-1 max-w-full truncate" />
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <EconomicPnl />
        {connected && (
          <span
            className={
              tradingEnabled
                ? "hidden sm:inline text-xs px-2 py-1 rounded-full bg-green-500/15 text-green-400 border border-green-500/30"
                : "hidden sm:inline text-xs px-2 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30"
            }
          >
            Trading {tradingEnabled ? "ON" : "OFF"}
          </span>
        )}
        {connected && data?.entriesPaused && (
          <span className="hidden sm:inline text-xs px-2 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Entries paused
          </span>
        )}
        {connected && data?.flattenLatched && (
          <span className="hidden sm:inline text-xs px-2 py-1 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">
            Flatten latch
          </span>
        )}
        {user && (
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground px-2 py-1 rounded-md border border-border">
            <User className="h-3.5 w-3.5" />
            {user.username}
          </span>
        )}
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>
    </header>
  );
}
