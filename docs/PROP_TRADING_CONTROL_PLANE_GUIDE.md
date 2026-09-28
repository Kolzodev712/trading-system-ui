# Prop trading browser control-plane guide

**Status:** Implementation handoff; future status fields and controls described here are not current UI features.

**Primary plan:** [Prop Trading Productionization and Research Architecture Plan](https://github.com/Kolzodev712/trading_system/blob/master/docs/PROP_TRADING_RESEARCH_AND_PRODUCTION_PLAN.md), especially sections 27, 30, 46, 48–49 and Increments 5A, 5B, 8, 9, 9A and 10.

## Purpose and ownership

This repository is the next-generation **browser** operator layer. The old Rust `cli`/TUI is a separate compatibility/debug client. The browser renders the actual runner's decisions and sends operator requests through the runner API; it never evaluates a strategy, calculates exchange exposure/readiness as an authority, reads `bot.json`, or calls K-paper/Bybit directly.

`trading_system` owns strategy/risk/execution/recovery state and the source `libs/trading_core/proto/trading_cli.proto`. This repo owns presentation, interaction state, confirmations and its auth UI/API. `k-paper` is a separate test venue behind the runner's exchange abstraction.

## Current path and starting points

`Browser -> gRPC-Web (Envoy) -> runner TradingCliService (:50051) -> engines`. The browser also uses its Express/MongoDB auth API for operator login. Read [architecture](architecture.md), [gRPC API](grpc-api.md) and [development setup](development.md).

| Area | Current source |
| --- | --- |
| Proto copy and generated Connect types | `proto/trading_cli.proto`, `src/gen/` |
| RPC wrappers and stream | `src/api/tradingCliService.ts`, `src/hooks/useMonitoringStream.ts` |
| UI snapshot/selection state | `src/store/tradingStore.ts` |
| Strategy and futures presentation | `src/components/panels/StrategiesPanel.tsx`, `src/components/strategies/StrategyDetailsDialog.tsx`, `src/screens/FuturesMonitor.tsx` |
| Global/strategy actions and environment chrome | `src/hooks/useMonitorActions.ts`, `src/components/layout/{AppHeader,MonitorToolbar,StatusBar}.tsx` |
| Auth service | `server/index.ts`, `server/seed.ts` |

Today `GetTradingStatus` returns a boolean, `MonitoringData` has general orders/positions/strategies, and the UI can toggle global trading and strategies. The proposed execution mode, per-pair readiness, reservations, recovery state and four safety commands are **not yet** part of the proto. The current UI also derives CEX mode from whether the strategies list is nonempty; use a server-reported mode for the new operator status.

## Backend-first contract workflow

For every new status or command, first implement authoritative behavior in `trading_system`, then extend its source proto additively. Copy that exact proto into this repo, run `npm run generate`, update typed wrappers/store/views and test the UI against the matching runner revision. Do not invent frontend-only `Ready`, `Recovered`, risk-allowed quantity or operator command success.

The contract must identify account/instrument, runner mode, venue/environment and `ExecutionMode` separately. It must expose strategy/model state, execution permission/risk reason, target, authoritative filled/working/reserved/effective exposure, pair readiness/recovery, data and private-stream health, last errors and snapshot freshness. Research disposition and operational role are distinct backend-provided metadata: Candidate #2 is **rejected as validated alpha** while used as a **baseline**. The UI may display that provenance; it is not a research application.

Treat a stream interruption or stale/incomplete snapshot as **unknown/degraded**. Do not keep the previous “healthy” display or permit a control action based on stale context. Display numeric strings without recomputing the runner's risk decisions in JavaScript.

## Increment 5A — Shadow observability

Build a Candidate #2 view that answers: what the model wants, what risk/execution permits, what the exchange actually holds, and what is unhealthy. Show the last completed candle, close/mean/spread, direction/transition, target and entry freshness; distinguish filled position, working remainder and unresolved reservation. In Shadow, show that evaluation continues and exchange-order calls are forbidden.

Place a persistent, unmistakable venue/environment **and** mode label on every control screen. `BYBIT MAINNET + SHADOW`, `K-PAPER LOCAL + EXCHANGE` and `BYBIT DEMO + EXCHANGE` must not look interchangeable or collapse to the current global on/off boolean. Verify live updates and the disconnected/stale case with the actual runner.

## Increment 5B — Paper smoke label

Connect this same browser to the existing Spot/levels K-paper runner. Verify that venue and mode come from backend status, not endpoint text or local UI configuration. This is a connectivity check and cannot qualify Candidate #2's futures execution.

## Increment 8 — safety controls

Add explicit `PauseEntries`, `CancelWorking`, `FlattenAndPause` and `Resume` actions only after runner gRPC commands exist. These differ from the existing global toggle and strategy-enabled state. Show server-confirmed accepted/in-progress/completed/failed status, including unresolved cancel/fill races and flatten verification. A successful RPC acknowledgement alone does not mean the account is flat.

For flatten/resume, show exact venue, account, instrument, current position, working orders and action consequences in a deliberate confirmation. Disable or reject actions when context is stale or ambiguous. The backend must enforce readiness, idempotence/duplicate-command handling, risk limits, operator authorization and the flatten latch; a disabled button or a browser confirmation is no security boundary. Existing `max_position` edits must remain within backend risk limits.

The Express/MongoDB login exists, but direct gRPC/Envoy calls are a separate path. Before capital-bearing controls, protect mutating RPCs at the runner/proxy boundary and bind the operator identity to the server-side audit record. [deployment.md](deployment.md) describes the current deployment pieces; do not regard the seeded local `admin/admin` credentials as production access control.

## Increments 9, 9A and 10 — ledger, Paper, demo

Render backend-calculated ledger/PnL with an explicit **simulation** label for Paper. During the deterministic K-paper matrix, observe Unknown submission, reserved exposure, blocked entries, reconciliation and recovery from runner status. Invoke safety actions through this browser and compare their result with K-paper's independent account/order view. The core automated fault matrix belongs in the runner/K-paper integration harness, not UI click tests.

Use the same views and controls on Bybit demo with an unmistakable `BYBIT DEMO + EXCHANGE` label. An optional future Simulation Lab may request faults through a **runner-owned Paper/local-only API**; it must never talk directly to K-paper or expose fault buttons in a Bybit session. It is not a prerequisite for the first demo gate.

## Verification and report

Run `npm run generate` after proto changes, then `npm test` and `npm run build`. Test actual browser -> Envoy -> runner connectivity with matching revisions. Cover stale stream, independent venue/mode display, rejected-alpha/baseline labels, pending versus completed commands and deliberate flatten confirmation. Report UI, runner and (where relevant) K-paper revisions, exact checks and remaining contract gaps; stop at the increment boundary in the primary plan.
