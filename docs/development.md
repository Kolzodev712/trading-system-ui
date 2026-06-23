# Development

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 18+ (20 recommended) | Build and run UI |
| npm | 9+ | Package manager |
| Docker + docker-compose | v1 (`docker-compose`) | MongoDB + Envoy gRPC-Web proxy |
| Trading runner | — | gRPC on `:50051` |

## First-time setup

```bash
git clone <repo-url>
cd trading-system-ui
npm install
cp .env.example .env
```

Start the backend (in `trading_system`):

```bash
# Runner must listen on [::]:50051
cargo run --release --package runner
```

Start Mongo + gRPC-Web proxy:

```bash
docker-compose -f docker/docker-compose.yml up -d
# or: npm run proxy:up
```

Run the UI and auth API:

```bash
npm run dev:all
# or in two terminals: npm run dev && npm run server
```

Open **http://127.0.0.1:5173** → sign in with `admin` / `admin` → **Connect to runner**.

## Scripts

| Command | When to use |
|---------|-------------|
| `npm run start` | **Default** — build + `vite preview` on `:5173` |
| `npm run dev` | Hot reload during UI development |
| `npm run build` | Production artifact in `dist/` |
| `npm run generate` | After editing `proto/trading_cli.proto` |
| `npm test` | Unit tests |
| `npm run dev:all` | UI + auth API during development |
| `npm run server` | Auth API only (`:3001`, seeds `admin` in Mongo) |
| `npm run proxy:up` / `proxy:down` | Envoy gRPC-Web proxy only (`:8081`) |
| `npm run mongo:up` | Docker Mongo for auth (optional; skip if you already have Mongo on `:27017`) |
| `npm run stack:up` / `stack:down` | Envoy + Mongo together |

## Proto sync

When the backend proto changes:

```bash
cp ../trading_system/libs/trading_core/proto/trading_cli.proto proto/
npm run generate
npm test && npm run build
```

Generated output: `src/gen/trading_cli_pb.ts`, `src/gen/trading_cli_connect.ts`.

## Troubleshooting

### Blank / black screen

1. Use `npm run start` instead of `npm run dev`
2. Free port 5173: `node scripts/free-port.mjs 5173`
3. Hard-refresh the browser (Ctrl+Shift+R)
4. Check browser DevTools → Console for errors

### Connection failed

1. Confirm runner is up: `grpcurl -plaintext localhost:50051 trading_cli.TradingCliService/GetTradingStatus`
2. Confirm Envoy is up: `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8081/`
3. Default UI endpoint is `/grpc` (proxied to Envoy by Vite)

### `docker compose` vs `docker-compose`

This project uses **docker-compose v1** (hyphen). If you have Compose v2:

```bash
docker compose -f docker/docker-compose.yml up -d
```

### Dev server hangs on port 5173

Vite dev can hang on some Node 18 setups. Prefer `npm run start` for daily use.

## Testing

```bash
npm test
```

Covers display transforms (`src/api/transforms.test.ts`) and app boot render (`src/App.test.tsx`).

## Code conventions

- Zustand selectors must use stable empty-array fallbacks (`src/lib/empty.ts`) — never `?? []` inline in selectors
- Monetary values from proto are strings; parse only when summing (e.g. margin panel)
- Level list IDs are expanded (`{id}_{pair}`); create form uses bare config id
