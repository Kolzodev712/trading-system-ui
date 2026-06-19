import { useCallback } from "react";
import { toast } from "sonner";
import {
  connectAndFetchInitial,
  resetTradingClient,
} from "@/api/tradingCliService";
import { useTradingStore } from "@/store/tradingStore";

export function useConnection() {
  const endpoint = useTradingStore((s) => s.endpoint);
  const connected = useTradingStore((s) => s.connected);
  const connecting = useTradingStore((s) => s.connecting);
  const connectionError = useTradingStore((s) => s.connectionError);
  const setEndpoint = useTradingStore((s) => s.setEndpoint);
  const setConnecting = useTradingStore((s) => s.setConnecting);
  const setConnected = useTradingStore((s) => s.setConnected);
  const setConnectionError = useTradingStore((s) => s.setConnectionError);
  const setTradingEnabled = useTradingStore((s) => s.setTradingEnabled);
  const setMonitoringData = useTradingStore((s) => s.setMonitoringData);
  const reset = useTradingStore((s) => s.reset);

  const connect = useCallback(async () => {
    setConnecting(true);
    setConnectionError(null);
    resetTradingClient();
    try {
      const { tradingEnabled, monitoringData } = await connectAndFetchInitial();
      setTradingEnabled(tradingEnabled);
      setMonitoringData(monitoringData ?? null);
      setConnected(true);
      toast.success("Connected to trading runner");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setConnectionError(message);
      setConnected(false);
      reset();
      toast.error(`Connection failed: ${message}`);
    } finally {
      setConnecting(false);
    }
  }, [
    reset,
    setConnected,
    setConnecting,
    setConnectionError,
    setMonitoringData,
    setTradingEnabled,
  ]);

  const disconnect = useCallback(() => {
    resetTradingClient();
    reset();
    toast.info("Disconnected");
  }, [reset]);

  return {
    endpoint,
    connected,
    connecting,
    connectionError,
    setEndpoint,
    connect,
    disconnect,
  };
}
