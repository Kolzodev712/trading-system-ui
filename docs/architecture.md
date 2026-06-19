# Architecture

## Overview

This UI is a **thin gRPC client**. It does not read `bot.json`, talk to exchanges, MongoDB, or Redis. All data and commands go through `TradingCliService` on the trading runner.

```
┌─────────────────────────────────────────────────────────────┐
│  trading-system-ui (browser)                                 │
│  React · Zustand · TanStack Query · Connect RPC (gRPC-Web)  │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP (gRPC-Web)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  Envoy proxy (:8081)                                         │
│  grpc_web filter → native gRPC                               │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP/2 gRPC
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  Trading runner (:50051)                                     │
│  TradingCliServiceImpl                                       │
└────────────────────────────┬────────────────────────────────┘
                             │
         exchange │ market_data │ indicator │ trading engines
```

## Repository layout

```
trading-system-ui/
├── proto/              # trading_cli.proto (sync from backend)
├── src/gen/            # Buf-generated types + Connect client
├── src/api/            # RPC wrappers, display transforms
├── src/hooks/          # Stream, levels poll, monitor actions
├── src/store/          # Zustand UI state
├── src/screens/        # MainMenu, SpotMonitor, FuturesMonitor
├── src/components/     # Panels, dialogs, layout
├── docker/             # Envoy gRPC-Web compose + envoy.yaml
└── scripts/            # free-port helper
```

## State model

| State | Source | Update strategy |
|-------|--------|-----------------|
| `tradingEnabled` | `GetTradingStatus` | On connect, after global toggle |
| `monitoringData` | `StreamMonitoringData` | Replace full snapshot ~1 Hz |
| `levels` | `GetLevels` | On monitor enter, 5s poll (Spot), after mutations |
| `screen` | `instrument_type` in stream | `main` / `spot` / `futures` |
| `mode` | derived | `strategies` if `strategies.length > 0`, else `levels` |

## Screens

```mermaid
stateDiagram-v2
    [*] --> Dashboard
    Dashboard --> SpotMonitor: Open Monitor + Spot
    Dashboard --> FuturesMonitor: Open Monitor + Futures
    SpotMonitor --> FuturesMonitor: instrument_type changes
    FuturesMonitor --> SpotMonitor: instrument_type changes
    SpotMonitor --> Dashboard: Back
    FuturesMonitor --> Dashboard: Back
```

### Spot layout

- Left: Orders, Balances, Levels or Strategies
- Center: Orderbook (pair tabs)
- Right: Indicators, Aggregated, DEX (when present)
- Bottom: Recent trades

### Futures layout

- Levels mode: Positions, Levels, Orders | Orderbook | Margin, Indicators
- Strategies mode: Strategies, Orders | Orderbook | Margin, Indicators

## Display rules

Replicated from the Rust TUI (`cli/src/screens/shared/panels.rs`):

- Level enabled: green ✓ if enabled + global on; yellow ⏸ if enabled + global off; red ✗ if disabled
- PnL coloring: red if negative prefix, green otherwise
- Trades: newest first (reversed before display)
- Create/update: wrap price/qty as `Fixed(value)` for the server

## Known limitations

- `DeleteLevel` RPC returns `UNIMPLEMENTED` on the server
- Runner gRPC port is hardcoded at `50051`
- Browser requires gRPC-Web proxy (cannot use native gRPC directly)
