const ENDPOINT_KEY = "trading.grpc.endpoint";

export function getDefaultEndpoint(): string {
  return import.meta.env.VITE_GRPC_WEB_URL ?? "/grpc";
}

export function loadEndpoint(): string {
  return localStorage.getItem(ENDPOINT_KEY) ?? getDefaultEndpoint();
}

export function saveEndpoint(endpoint: string): void {
  localStorage.setItem(ENDPOINT_KEY, endpoint);
}
