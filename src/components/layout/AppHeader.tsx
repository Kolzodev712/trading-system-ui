import { Activity, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useConnection } from "@/hooks/useConnection";
import { useTradingStore } from "@/store/tradingStore";
import { useAuthStore } from "@/store/authStore";

export function AppHeader() {
  const user = useAuthStore((s) => s.user);
  const connected = useTradingStore((s) => s.connected);
  const tradingEnabled = useTradingStore((s) => s.tradingEnabled);
  const exchange = useTradingStore((s) => s.monitoringData?.exchange);
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
          {exchange && (
            <p className="text-xs text-muted-foreground truncate">{exchange}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
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
