# Contributing

Browser operator console for the [trading_system](https://github.com/Kolzodev712/trading_system) runner (gRPC-Web). Compatible backend protocol: `trading_system` `libs/trading_proto/proto/trading_cli.proto`.

## Ground rules

- Prefer small PRs with unit tests for UI logic.
- Do not commit `.env`, production JWT secrets, or operator tokens.
- Outside laboratory mode, auth must fail closed (`AUTH_MODE=secure`).
- Sync proto from the backend before regenerating bindings: `scripts/check-proto-sync.sh` / `npm run generate`.
- AI-assisted patches only if you reviewed and can explain them.

## Getting started

1. Node.js 18+ (see `package.json` engines).
2. Fork and branch from `main`.
3. Pick a labeled issue or open a proposal first.

```bash
npm ci
npm test
npm run lint
npm run build
# After proto copy from trading_system:
npm run generate
sh scripts/check-proto-sync.sh
```

Paper e2e (optional): `npm run test:paper-e2e` with a running lab or local stack.

Integrated lab: https://github.com/Kolzodev712/trading-system-showcase/tree/main/lab

## Pull requests

Include related issue, summary, verification commands, and protocol compatibility notes when proto/gen changes.

## Reporting problems

- Issues: GitHub Issues. Open contributions: https://github.com/Kolzodev712/trading-system-ui/labels/good%20first%20issue
- Security: [SECURITY.md](SECURITY.md) — GitHub private vulnerability reporting.
- Conduct: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## License

MIT — see `LICENSE`.
