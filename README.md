# Trading System UI

Browser dashboard for the [trading_system](https://github.com/Kolzodev712/trading_system) runner. A thin **gRPC-Web client** that replaces the Rust TUI (`trading-cli`) with a modern web interface — same API, no duplicate backend.

```
Browser (:5173)  →  Envoy gRPC-Web (:8081)  →  Trading runner gRPC (:50051)
```

## Features

- **Live monitoring** — orders, balances, trades, positions, orderbooks, indicators (~1 Hz stream)
- **Spot & Futures layouts** — auto-switch based on `instrument_type`
- **Levels mode** — list, create, edit, enable/disable, details
- **Strategies mode** — when the runner reports active strategies
- **Global trading toggle** — enable/disable with order cancellation feedback
- **Aggregated & DEX panels** — data available in proto but not shown in the TUI

## Quick start

**Prerequisites:** Node.js 18+, Docker (for gRPC-Web proxy), trading runner on `:50051`.

```bash
# 1. gRPC-Web proxy (Envoy)
docker-compose -f docker/docker-compose.yml up -d

# 2. UI
npm install
npm run start
```

Open **http://127.0.0.1:5173** → Connect (default endpoint `/grpc`).

See [docs/development.md](docs/development.md) for full setup and troubleshooting.

## Documentation

| Doc | Description |
|-----|-------------|
| [Development](docs/development.md) | Local setup, scripts, troubleshooting |
| [Architecture](docs/architecture.md) | Data flow, state model, screens |
| [Deployment](docs/deployment.md) | Production build and hosting |
| [gRPC API](docs/grpc-api.md) | RPC contract and proto sync |
| [Publishing](docs/publishing.md) | First-time GitHub push checklist |
| [Changelog](CHANGELOG.md) | Release history |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run start` | Build + serve on `:5173` (recommended) |
| `npm run dev` | Vite dev server with hot reload |
| `npm run build` | Production build to `dist/` |
| `npm run generate` | Regenerate TypeScript from `proto/` |
| `npm test` | Unit tests |
| `npm run proxy:up` | Start Envoy gRPC-Web proxy |

## Environment

Copy [`.env.example`](.env.example) to `.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_GRPC_WEB_URL` | `/grpc` | Browser gRPC-Web base URL |
| `GRPC_WEB_PROXY` | `http://127.0.0.1:8081` | Vite proxy target |

## Proto contract

The API is defined in [`proto/trading_cli.proto`](proto/trading_cli.proto), copied from the backend `trading_system` repo. Regenerate clients after proto changes:

```bash
npm run generate
```

## License

MIT — see [LICENSE](LICENSE).
