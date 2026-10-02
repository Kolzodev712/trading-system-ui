# Trading System Web UI — Feature Reference

Operator and developer guide for the browser dashboard. For local setup see [development.md](./development.md); for high-level design see [architecture.md](./architecture.md).

## What it is

Thin **gRPC-Web client** for `TradingCliService` on the trading runner (`:50051`). No direct access to `bot.json`, exchanges, or trading logic.

```
Browser (:5173)  →  Auth API (:3001) + MongoDB
                 →  Vite /grpc proxy  →  Envoy (:8081)  →  Runner gRPC (:50051)
```

| Layer | Technology |
|-------|------------|
| UI | React 19, Tailwind, Radix UI, Lucide |
| State | Zustand + TanStack Query |
| RPC | Connect RPC (`@connectrpc/connect-web`) |
| Auth | Express + MongoDB `credentials` collection |
| Proxy | Envoy v1.31 (`docker/envoy.yaml`) |

## Screens

| `screen` | Component | When |
|----------|-----------|------|
| `main` | `MainMenu` | After connect |
| `spot` | `SpotMonitor` | CEX spot, no `dex` |
| `futures` | `FuturesMonitor` | CEX futures, no `dex` |
| `dex` | `DexMonitor` (lazy-loaded) | `monitoringData.dex` present |

Screen selection on **Open Trading Monitor**:

```typescript
function deriveMonitorScreen(data: MonitoringData): Screen {
  if (data.dex) return "dex";
  if (data.instrumentType === "Futures") return "futures";
  return "spot";
}
```

## DEX monitor

Full-screen layout when the runner starts with `--mode dex` / `just run-dex`.

### Panels

| Panel | Data |
|-------|------|
| Venue | `dex.venue`, `exchange` |
| DEX Indicators | `dex.dex_indicators` (pool-filtered) |
| Open Orders | `dex.open_orders` (pool-filtered) |
| Orderbook | `orderbooks[]` — tab drives pool filter |
| Venue Balances | `dex.balances` + `asset_labels` |
| Pending Transactions | `dex.pending_transactions` |
| Quotes | `dex.quotes` (pool-filtered, selectable) |
| Strategies | `dex.dex_strategies` when present |
| Recent Trades | `trades[]` |

### Pool filter

Orderbook tab label (e.g. `SUI/DBUSDC`) filters quotes, strategies, indicators, and open orders via `matchesPool()` in `src/lib/dexPool.ts`.

### Toolbar & shortcuts

| Action | RPC | Shortcut |
|--------|-----|----------|
| Refresh | `GetMonitoringData` | `R` |
| Toggle quote | `ToggleDexQuote` | `T` |
| Toggle strategy | `ToggleDexStrategy` | `S` |
| Cancel pool | `CancelDexPoolOrders` | `C` (confirm dialog) |
| Prev / next pool | — | `←` / `→` |
| Back to dashboard | — | `Esc` |

Double-click a quote or strategy row for details dialog.

### Stream health

DEX header shows stream reconnect state and indicator freshness (`src/lib/dexHealth.ts`). Empty indicators show “Waiting for first indicator tick (~1s)”.

## CEX monitors

The **Recent Account Executions (24h)** panel on Spot/Futures displays the runner's private venue executions for the configured account and pair. It includes account fills from before this runner started; it does not show public market trades or filter to one strategy/run. Rows are newest first, show order/execution IDs, and show the execution time in `Europe/Sofia` (EEST in summer, EET in winter).

- **Spot / Futures** — levels or strategies mode from `strategies.length`
- **Levels poll** — `GetLevels` every 5s on spot **and** futures monitors (not DEX)
- **Aggregated panel** — web-only extra on spot sidebar

## Auth

1. Sign in (`admin` / `admin` default, MongoDB-backed)
2. Connect to runner (`/grpc` default)

Run `npm run dev:all` for UI + auth API together.

## Proto sync

```bash
cp ../trading_system/libs/trading_core/proto/trading_cli.proto proto/
npm run generate
```

## Verification

```bash
npm test
npm run build
```

Manual DEX checklist:

1. `just run-dex` runner → connect → DEX monitor auto-opens
2. Indicators populate within ~1s
3. Quote toggle / cancel pool (with confirm + tx signatures)
4. Pool arrows and keyboard shortcuts work

## Related docs

| Doc | Location |
|-----|----------|
| TUI reference | `trading_system/docs/features/tui-grpc-reference.md` |
| Proto source | `trading_system/libs/trading_core/proto/trading_cli.proto` |
| DEX TUI source | `trading_system/cli/src/screens/dex_monitor/` |
