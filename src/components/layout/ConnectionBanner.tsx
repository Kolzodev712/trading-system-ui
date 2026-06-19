import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConnection } from "@/hooks/useConnection";

export function ConnectionBanner() {
  const {
    endpoint,
    connected,
    connecting,
    connectionError,
    setEndpoint,
    connect,
  } = useConnection();

  if (connected) return null;

  return (
    <div className="border-b border-border bg-card px-4 py-6">
      <div className="max-w-md mx-auto space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Connect to Trading Runner</h2>
          <p className="text-sm text-muted-foreground mt-1">
            gRPC-Web endpoint (via proxy). Default: /grpc → localhost:8081
          </p>
        </div>
        <Input
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          placeholder="/grpc or http://localhost:8081"
        />
        {connectionError && (
          <p className="text-sm text-red-400">{connectionError}</p>
        )}
        <Button onClick={() => void connect()} disabled={connecting} className="w-full">
          {connecting ? "Connecting…" : "Connect"}
        </Button>
      </div>
    </div>
  );
}

export function DisconnectButton() {
  const { disconnect } = useConnection();
  return (
    <Button variant="outline" className="w-full" onClick={disconnect}>
      <LogOut className="h-4 w-4" />
      Disconnect
    </Button>
  );
}
