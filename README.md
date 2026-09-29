# Trading System UI

Browser dashboard for the [trading_system](https://github.com/Kolzodev712/trading_system) runner. A thin **gRPC-Web client** — same runner API, no duplicate backend.

This UI is not exchange authority. Candidate #2 is an operational baseline, not validated alpha. The system is **not** production complete and **not** mainnet ready.

Increment status and next gates: [trading_system progression](https://github.com/Kolzodev712/trading_system/blob/master/docs/PROGRESSION.md). This repo's increment notes: [docs/PROP_TRADING_CONTROL_PLANE_GUIDE.md](docs/PROP_TRADING_CONTROL_PLANE_GUIDE.md).

```
Browser (:5173)  →  Auth API (:3001) + MongoDB (:27017)
                 →  Envoy gRPC-Web (:8081)  →  Trading runner gRPC (:50051)
```

## Features

- **Operator auth** — MongoDB-backed credentials (default `admin` / `admin`), JWT session
- **Live monitoring** — orders, balances, trades, positions, orderbooks, indicators (~1 Hz stream)
- **Spot & Futures layouts** — auto-switch based on `instrument_type`
- **Levels mode** — list, create, edit, enable/disable, details
- **Strategies mode** — when the runner reports active strategies
- **DEX monitor** — full-screen DeepBook/on-chain layout with quote/strategy controls
- **Global trading toggle** — enable/disable with order cancellation feedback
- **Aggregated panel** — CEX spot sidebar (web-only extra)

## Quick start

**Prerequisites:** Node.js 18+, Docker (Mongo + gRPC-Web proxy), trading runner on `:50051`.

```bash
# 1. gRPC-Web proxy (required for Connect)
npm run proxy:up

# 2. UI + auth API (Mongo optional — see below)
npm install
cp .env.example .env
npm run dev:all
```

**Mongo:** If you already have Mongo on `:27017`, auth uses it as-is. Otherwise run `npm run mongo:up`, or `npm run stack:up` for Envoy + Mongo. If port 27017 is taken, set `MONGO_HOST_PORT=27018` in `.env` and update `MONGODB_URI`.

Open **http://127.0.0.1:5173** → Sign in (`admin` / `admin`) → Connect runner (default `/grpc`).

See [docs/development.md](docs/development.md) for full setup and troubleshooting.

## Documentation

| Doc | Description |
|-----|-------------|
| [Development](docs/development.md) | Local setup, scripts, troubleshooting |
| [Architecture](docs/architecture.md) | Data flow, state model, screens |
| [Feature reference](docs/feature-reference.md) | Screens, DEX monitor, shortcuts, parity |
| [Deployment](docs/deployment.md) | Production build and hosting |
| [gRPC API](docs/grpc-api.md) | RPC contract and proto sync |
| [Prop trading control plane](docs/PROP_TRADING_CONTROL_PLANE_GUIDE.md) | Increment record for this UI (Paper/Demo labels, safety controls) |
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
| `npm run server` | Auth API (Express + MongoDB) on `:3001` |
| `npm run dev:all` | UI dev server + auth API together |

## Environment

Copy [`.env.example`](.env.example) to `.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_GRPC_WEB_URL` | `/grpc` | Browser gRPC-Web base URL |
| `GRPC_WEB_PROXY` | `http://127.0.0.1:8081` | Vite proxy target |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/trading_ui` | Auth credentials DB |
| `JWT_SECRET` | (dev default) | JWT signing secret — change in production |
| `AUTH_PORT` | `3001` | Auth API listen port |

## Proto contract

The API is defined in [`proto/trading_cli.proto`](proto/trading_cli.proto), copied from the backend `trading_system` repo. Regenerate clients after proto changes:

```bash
npm run generate
```

## License

MIT — see [LICENSE](LICENSE).
