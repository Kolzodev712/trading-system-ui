# Documentation

| Document | Description |
|----------|-------------|
| [Development](development.md) | Local setup, scripts, troubleshooting |
| [Architecture](architecture.md) | Data flow, state, screens |
| [Deployment](deployment.md) | Production build and hosting |
| [gRPC API](grpc-api.md) | RPC contract and proto sync |
| [Prop trading control plane](PROP_TRADING_CONTROL_PLANE_GUIDE.md) | Candidate #2 operator-layer implementation handoff |
| [Publishing](publishing.md) | First-time GitHub push checklist |

## Related projects

- **trading_system** — Rust runner, engines, and embedded gRPC server (`:50051`)
- **k-paper** — Local exchange simulator behind the trading-system Paper adapters
- **trading-cli** — Terminal UI this project replaces (behavioral reference)
