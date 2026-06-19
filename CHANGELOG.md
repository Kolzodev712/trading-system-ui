# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-06-19

### Added

- Initial web UI replacing the Rust TUI against `TradingCliService`
- Dashboard with global trading toggle and connection management
- Spot and Futures monitor layouts with live `StreamMonitoringData` (~1 Hz)
- Levels mode: list, create, edit, enable/disable, details dialogs
- Strategies mode: list, enable/disable, details when runner reports strategies
- Orderbook pair tabs, margin info (futures), aggregated and DEX panels
- gRPC-Web connectivity via Envoy proxy (`docker/docker-compose.yml`)
- Proto codegen with Buf → Connect RPC TypeScript client
- Unit tests for display transforms and app boot

### Technical

- React 19, Vite 5, Tailwind CSS, Zustand, TanStack Query
- `@connectrpc/connect-web` transport with Vite `/grpc` proxy
- `npm run start` for reliable local serving via `vite preview`

[0.1.0]: https://github.com/Darkeyes712/trading-system-ui/releases/tag/v0.1.0
