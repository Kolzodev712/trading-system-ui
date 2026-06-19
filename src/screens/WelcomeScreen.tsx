import { useEffect, useState } from "react";
import {
  Activity,
  ChevronRight,
  Lock,
  Radio,
  Shield,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useConnection } from "@/hooks/useConnection";
import { checkAuthHealth } from "@/api/auth";
import { useIsAuthenticated } from "@/store/authStore";
import { cn } from "@/lib/utils";

export function WelcomeScreen() {
  const authenticated = useIsAuthenticated();
  const { login, loggingIn } = useAuth();
  const {
    endpoint,
    connected,
    connecting,
    connectionError,
    setEndpoint,
    connect,
  } = useConnection();

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [authApiUp, setAuthApiUp] = useState<boolean | null>(null);

  useEffect(() => {
    void checkAuthHealth().then(setAuthApiUp);
  }, []);

  if (connected) return null;

  const step = authenticated ? 2 : 1;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Brand panel */}
      <div className="relative lg:w-[42%] overflow-hidden bg-gradient-to-br from-[#0c1222] via-[#0a1628] to-[#061018] p-10 flex flex-col justify-between">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 -left-20 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute bottom-10 right-0 h-48 w-48 rounded-full bg-teal-400/10 blur-3xl" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 text-cyan-400 mb-8">
            <Activity className="h-7 w-7" />
            <span className="text-sm font-semibold tracking-widest uppercase">
              Kolzo Trading
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight max-w-md">
            Real-time control for your trading runner
          </h1>
          <p className="mt-4 text-slate-400 max-w-sm text-sm leading-relaxed">
            Monitor orders, levels, and strategies with live streaming data
            from your gRPC backend — the web-native replacement for the Rust TUI.
          </p>
        </div>
        <ul className="relative mt-10 space-y-3 text-sm text-slate-500">
          <li className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-cyan-500/80" />
            MongoDB-backed operator credentials
          </li>
          <li className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-cyan-500/80" />
            Live ~1 Hz monitoring stream
          </li>
        </ul>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="flex items-center gap-3">
            <StepBadge n={1} active={step === 1} done={step > 1} label="Sign in" />
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <StepBadge n={2} active={step === 2} done={false} label="Connect" />
          </div>

          {step === 1 ? (
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                login({ username, password });
              }}
            >
              <div>
                <h2 className="text-xl font-semibold">Operator sign in</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Default credentials: <code className="text-cyan-400">admin</code> /{" "}
                  <code className="text-cyan-400">admin</code>
                </p>
              </div>
              {authApiUp === false && (
                <p className="text-sm text-amber-400 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2">
                  Auth API is offline. Run{" "}
                  <code className="text-xs">npm run server</code> (or{" "}
                  <code className="text-xs">npm run dev:all</code>) and ensure Mongo is up via{" "}
                  <code className="text-xs">docker-compose up</code>.
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    className="pl-9"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loggingIn}>
                {loggingIn ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          ) : (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold">Connect to runner</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Link to your trading system via the gRPC-Web proxy.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card/50 p-4 space-y-1 text-sm">
                <p className="text-muted-foreground">Expected stack</p>
                <p className="font-mono text-xs text-cyan-400/90">
                  UI → Envoy :8081 → Runner gRPC :50051
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endpoint">gRPC-Web endpoint</Label>
                <Input
                  id="endpoint"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="/grpc"
                />
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-cyan-400"
                  onClick={() => setShowAdvanced((v) => !v)}
                >
                  {showAdvanced ? "Hide" : "Show"} advanced options
                </button>
                {showAdvanced && (
                  <p className="text-xs text-muted-foreground">
                    Use a full URL only if not proxying through Vite (e.g.{" "}
                    <code>http://127.0.0.1:8081</code>).
                  </p>
                )}
              </div>

              {connectionError && (
                <p className="text-sm text-red-400 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2">
                  {connectionError}
                </p>
              )}

              <Button
                className="w-full"
                size="lg"
                disabled={connecting}
                onClick={() => void connect()}
              >
                {connecting ? "Connecting…" : "Connect to runner"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StepBadge({
  n,
  active,
  done,
  label,
}: {
  n: number;
  active: boolean;
  done: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold border",
          done && "bg-cyan-500/20 border-cyan-500 text-cyan-400",
          active && !done && "bg-cyan-500 border-cyan-400 text-primary-foreground",
          !active && !done && "border-border text-muted-foreground",
        )}
      >
        {done ? "✓" : n}
      </div>
      <span
        className={cn(
          "text-sm",
          active ? "text-foreground font-medium" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
    </div>
  );
}
