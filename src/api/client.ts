import { createClient, type Client } from "@connectrpc/connect";
import { createGrpcWebTransport } from "@connectrpc/connect-web";
import { TradingCliService } from "@/gen/trading_cli_connect";
import { loadEndpoint } from "@/lib/endpoint";

const RPC_TIMEOUT_MS = 5_000;
const TOGGLE_TIMEOUT_MS = 2_000;
const DEX_TOGGLE_TIMEOUT_MS = 10_000;
const DEX_CANCEL_TIMEOUT_MS = 30_000;

let client: Client<typeof TradingCliService> | null = null;
let currentBaseUrl = "";

export function getTradingClient(): Client<typeof TradingCliService> {
  const baseUrl = loadEndpoint();
  if (!client || baseUrl !== currentBaseUrl) {
    currentBaseUrl = baseUrl;
    const transport = createGrpcWebTransport({ baseUrl });
    client = createClient(TradingCliService, transport);
  }
  return client;
}

export function resetTradingClient(): void {
  client = null;
  currentBaseUrl = "";
}

export const rpcOptions = {
  default: { timeoutMs: RPC_TIMEOUT_MS },
  toggle: { timeoutMs: TOGGLE_TIMEOUT_MS },
  dexToggle: { timeoutMs: DEX_TOGGLE_TIMEOUT_MS },
  dexCancel: { timeoutMs: DEX_CANCEL_TIMEOUT_MS },
} as const;
