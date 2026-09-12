# gRPC API

**Service:** `trading_cli.TradingCliService`  
**Proto:** [`proto/trading_cli.proto`](../proto/trading_cli.proto)

## RPC methods

| RPC | Type | UI usage |
|-----|------|----------|
| `GetTradingStatus` | unary | On connect |
| `SetTradingEnabled` | unary | Dashboard global toggle |
| `GetMonitoringData` | unary | Manual refresh |
| `StreamMonitoringData` | server stream | Live monitor (~1 Hz snapshots) |
| `GetLevels` | unary | Level list (poll 5s on Spot + after mutations) |
| `GetLevel` | unary | Level details dialog |
| `CreateLevel` | unary | New level form |
| `UpdateLevel` | unary | Edit level form |
| `ToggleLevel` | unary | Enable/disable selected level |
| `ToggleStrategy` | unary | Enable/disable selected strategy |
| `GetStrategyConfig` | unary | Strategy details operator form |
| `UpdateStrategyCap` | unary | Live `max_position` (no restart) |
| `UpdateStrategyConfig` | unary | Persist operator knobs; `needs_restart` if non-cap fields change |
| `RequestRestart` | unary | Write snapshot + `restart.requested`; supervisor relaunches |
| `DeleteLevel` | unary | **Unimplemented** on server |

## Streaming

`StreamMonitoringData` emits `MonitoringDataUpdate` every ~1 second:

- `data` — full `MonitoringData` snapshot (not a delta)
- `timestamp` — Unix seconds

On stream error the UI reconnects with exponential backoff.

## Key message fields

### MonitoringData

| Field | Notes |
|-------|-------|
| `orders`, `balances`, `trades`, `positions` | Exchange + engine state |
| `indicators` | Up to 100 from server; UI shows 10 by default |
| `strategies` | Present in strategies mode |
| `orderbooks` | Top 10 levels per side per pair |
| `instrument_type` | `"Spot"` or `"Futures"` — drives layout |
| `exchange` | Footer display |
| `aggregated`, `dex` | Shown in web UI (not in TUI) |

### Level IDs

- **List (`GetLevels`):** expanded id `{configId}_{pair}` (e.g. `my_level_BTCUSDT`)
- **Create:** bare config id in `LevelConfig.id`
- **Toggle / update / details:** use expanded `Level.id` from the list

### Price / quantity format

Server returns config strings like `Fixed(100.5)` or `BestBid(0.01)`.

Create and update only accept `Fixed(...)`:

```
Fixed(0.1)
```

## Codegen

```bash
npm run generate   # buf generate → src/gen/
```

Buf config: [`buf.yaml`](../buf.yaml), [`buf.gen.yaml`](../buf.gen.yaml).

Plugins: `buf.build/bufbuild/es` + `buf.build/connectrpc/es` (v1.x, compatible with Connect Web 1.6).

## Smoke test

```bash
# Native gRPC (from host with runner)
grpcurl -plaintext localhost:50051 list
grpcurl -plaintext localhost:50051 trading_cli.TradingCliService/GetTradingStatus
grpcurl -plaintext localhost:50051 trading_cli.TradingCliService/GetMonitoringData
```

## Syncing from backend

```bash
cp /path/to/trading_system/libs/trading_core/proto/trading_cli.proto proto/
npm run generate
```

Commit both the proto and regenerated `src/gen/` files together.
