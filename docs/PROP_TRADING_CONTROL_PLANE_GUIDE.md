# Prop trading browser control-plane guide

**Status:** Increment 9 ledger economics and Increment 9A Paper matrix browser checks are recorded below. The local 5R/5A gates and bounded 5B Spot/levels connectivity preflight remain accepted. Candidate #2 remains an operational baseline, not validated alpha. Bybit demo is not started.

**Primary plan:** [Prop Trading Productionization and Research Architecture Plan](https://github.com/Kolzodev712/trading_system/blob/master/docs/PROP_TRADING_RESEARCH_AND_PRODUCTION_PLAN.md), especially sections 27, 30, 46, 48–49 and Increments 5R, 5A, 5B, 8, 9, 9A and 10. The 5A correction and Paper+Shadow browser checks are reported in the main plan. Backend 5R is accepted locally for the limited 5B preflight at `f9d1299`.

## Purpose and ownership

This repository is the next-generation **browser** operator layer. The old Rust `cli`/TUI is a separate compatibility/debug client. The browser renders the actual runner's decisions and sends operator requests through the runner API; it never evaluates a strategy, calculates exchange exposure/readiness as an authority, reads `bot.json`, or calls K-paper/Bybit directly.

`trading_system`'s Candidate #2 composition app instantiates the model adapter and generic runner in **one process**. The runner owns strategy status, risk/execution/recovery state and the source `libs/trading_core/proto/trading_cli.proto`; its crate and `trading_engine` do not depend on model/research crates. This repo owns presentation, interaction state, confirmations and its auth UI/API. `k-paper` is a separate test venue behind the runner's exchange abstraction.

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

At `0476c58`, `MonitoringData` carries runner mode, venue/environment, execution mode and strategy snapshots, and the UI copies the source proto and generated client. The four future safety commands are still absent. Verify the complete status contract against the matching runner rather than inferring mode from a strategy count or reporting stale context as healthy.

## Backend-first contract workflow

For every new status or command, first implement authoritative behavior in `trading_system`, then extend its source proto additively. Copy that exact proto into this repo, run `npm run generate`, update typed wrappers/store/views and test the UI against the matching runner revision. Do not invent frontend-only `Ready`, `Recovered`, risk-allowed quantity or operator command success.

The contract must identify account/instrument, runner mode, venue/environment and `ExecutionMode` separately. It must expose strategy/model state, execution permission/risk reason, target, authoritative filled/working/reserved/effective exposure, pair readiness/recovery, data and private-stream health, last errors and snapshot freshness. Research disposition and operational role are distinct backend-provided metadata: Candidate #2 is **rejected as validated alpha** while used as a **baseline**. The UI may display that provenance; it is not a research application.

Treat a stream interruption or stale/incomplete snapshot as **unknown/degraded**. Do not keep the previous “healthy” display or permit a control action based on stale context. Display numeric strings without recomputing the runner's risk decisions in JavaScript.

## Increment 5A — Shadow observability

After 5R, build a Candidate #2 view that answers: what the model wants, what risk/execution permits, what the exchange actually holds, and what is unhealthy. Show the last completed candle, close/mean/spread, direction/transition, target and entry freshness; distinguish filled position, working remainder and unresolved reservation. In Shadow, show that evaluation continues and exchange-order calls are forbidden. Connect through the same runner gRPC contract whether the runner was started by its default binary or the Candidate #2 composition app.

Place a persistent, unmistakable venue/environment **and** mode label on every control screen. `BYBIT MAINNET + SHADOW`, `K-PAPER LOCAL + EXCHANGE` and `BYBIT DEMO + EXCHANGE` must not look interchangeable or collapse to the current global on/off boolean. Verify live updates and the disconnected/stale case with the actual runner.

**5A review correction of `66025f4` (2026-09-28):** At that revision, `useMonitoringStream` marked the stream connected before its first update and did not mark a normally ended stream disconnected; `useStatusFreshness` ignored snapshot age and treated main-screen data as live even without a stream. The required corrections covered the hard-coded “0 exchange orders (shadow)” label, Candidate #2's `BASELINE` role, Spot/levels venue/environment, and controls on stale or incomplete status. The follow-up review below records what changed and what remains. The primary plan's section 5A lists the full acceptance gate.

**5A follow-up review (2026-09-28, `0476c58` / backend `9a0dd97`):** The stream now starts on the main screen, waits for an actual update, marks clean end/failure, and checks stream silence and snapshot age. Venue, environment, execution mode and Candidate #2's `BASELINE` role are separate; the Spot/levels and DEX backend paths have explicit labels. Shadow shows the observed `active_orders` count and flags a nonzero count. The new store/component tests cover several stale and label cases.

One fail-open remains in `src/lib/operatorStatus.ts`: `computeStatusFreshness` returns `live` when `snapshotUnixMs` is missing, zero or invalid, because the age check only runs if conversion succeeds. `snapshotIsComplete` also accepts the nonempty execution mode `UNKNOWN`. Treat these payloads as unknown and leave all mutating controls disabled; add tests using actual generated `MonitoringData` defaults and invalid values. Confirm the fix through browser -> Envoy -> a matching runner, including main-screen first update, clean/silent disconnect, reconnect, and Shadow order count. The count comes from runner trading state; actual zero exchange mutations require runner guard evidence and an exchange-side order check. No UI generate/test/build transcript or real browser session has been recorded for these commits. Capture exact UI/backend SHAs, commands and observed results, then stop for acceptance review.

**5A verification update (2026-09-28):** UI `d8c7b271` rejects missing, zero or invalid `snapshotUnixMs` and `UNKNOWN` execution mode; tests include generated `MonitoringData()` defaults. The main plan records `npm run generate` exit 0, `npm test` 49 passed (with an `ECONNREFUSED 127.0.0.1:3000` message on one happy-dom fetch), `npm run build` exit 0, and a browser -> Envoy -> backend `e6fac236` Paper+Shadow session showing live/unknown/stale/reconnect behavior, separate `BASELINE` and rejected-alpha labels, and observed order count 0. These are reported local results; no raw transcript is attached in this repo. After the backend fixes its unguarded Shadow shutdown and restored-disable behavior, repeat the affected browser checks with matched SHAs. The placeholder credentials in the Bybit Shadow sample do not block the local Spot/levels 5B preflight; the backend runtime correctness gate does.

## Increment 5B — Paper smoke label

The backend 5R Shadow shutdown/restart corrections and matching browser status were reviewed for this limited preflight. The 5B browser at UI `66632ed` → Envoy `:8081` → default levels runner `:50051` showed a live BTC/USDT book, mapped balances, SMA/EMA, four Spot levels, empty order/trade lists, Trading OFF and **PAPER LOCAL + EXCHANGE** in header/card/footer from the same runner fields as `grpc_ctl`. This is a locally reported connectivity check; no order was posted, and it does not qualify Candidate #2 futures or recovery.

## Increment 6 — recovery status handoff

Begin with backend persistence, exchange lookup and K-paper fault hooks. If the runner extends the source proto or recovery status, copy the exact proto here, regenerate the client, render unresolved reservation/Unknown and blocked-entry reasons from backend state, and verify stale status disables controls. Run generate/test/build and a matching browser → Envoy → runner check. Do not synthesize a recovery result from empty open orders or a successful RPC ACK. If the backend contract does not change in this increment, record that decision and keep this UI pinned; no standalone UI feature is required to close Increment 6.

## Increment 8 — safety controls

Runner gRPC now owns `PauseEntries`, `CancelWorking`, `FlattenAndPause` and `Resume`. This repo copies the source proto, regenerates the Connect client, and presents those actions with venue/environment/scope confirmation. Flatten UI state stays `in_progress` while runner positions remain open; a successful RPC is not treated as flat. Mutating RPCs send `x-operator-token` / `x-operator-id` when `VITE_OPERATOR_TOKEN` is set; Envoy forwards those headers. UI login is still not a runner authorization boundary.

Do not claim daily-loss safety until Increment 9 PnL is correct. Candidate #2 remains an operational baseline, not validated alpha.

## Increment 9 — ledger economics (simulation)

Backend `MonitoringData` now carries `economic_source`, realized/unrealized/daily PnL, fees, funding and ledger equity from the runner execution ledger. This UI copies the source proto, regenerates the client, and shows those values in the header. Paper/local snapshots are labeled **SIMULATION**; live Bybit values are not. No Paper number changes Candidate #2's rejected-as-validated-alpha research disposition.

**Local Increment 9 record (2026-09-28):** proto synced from `trading_system`; `npm test` 54 passed including `EconomicPnl` simulation vs exchange labels; `npm run build` exit 0. Matching runner SHA is recorded in that repo's plan section 64.

## Increments 9A and 10 — Paper matrix, demo

Render backend-calculated ledger/PnL with an explicit **simulation** label for Paper. During the deterministic K-paper matrix, observe Unknown submission, reserved exposure, blocked entries, reconciliation and recovery from runner status. Invoke safety actions through this browser and compare their result with K-paper's independent account/order view. The core automated fault matrix belongs in the runner/K-paper integration harness, not UI click tests.

**Local Increment 9A record (2026-09-28):** proto unchanged from Increment 9. `npm test` 54 passed; no generate/build required. Browser `http://127.0.0.1:5173/` → Envoy `:8081` → Candidate #2 composition `:50051` with Paper linear live: **PAPER LOCAL + EXCHANGE**, header **SIMULATION**, strategy **REJECTED AS VALIDATED ALPHA**, Stream live. Pause entries confirmation showed `Positions: BTCUSDT qty=0.001`; grpc `entries_paused=true` while Paper still held 0.001. Flatten confirmation stated RPC success is not flat; after confirm grpc `flatten_latched=true` `pos=0` and Paper `/positions` `[]` with an independent sell trade. Resume confirmation: latch cleared, global toggle unchanged. **Cancel working** confirmation showed `PAPER LOCAL + EXCHANGE`, scope account, `Working orders: 1`, `Positions: none reported`; after Confirm, Paper `cancel_order`/`CancelAck` for `05dc0701-…` (`inc9a-ui-cancel`), independent `GET /open_orders` `[]`, grpc `orders=0` `entries_paused=true`. Matching runner/k-paper SHAs are in `trading_system` plan Increment 9A (revised report).

Use the same views and controls on Bybit demo with an unmistakable `BYBIT DEMO + EXCHANGE` label. An optional future Simulation Lab may request faults through a **runner-owned Paper/local-only API**; it must never talk directly to K-paper or expose fault buttons in a Bybit session. It is not a prerequisite for the first demo gate.

## Verification and report

Run `npm run generate` after proto changes, then `npm test` and `npm run build`. Test actual browser -> Envoy -> runner connectivity with matching revisions. Cover stale stream, independent venue/mode display, rejected-alpha/baseline labels, pending versus completed commands and deliberate flatten confirmation. Report UI, runner and (where relevant) K-paper revisions, exact checks and remaining contract gaps; stop at the increment boundary in the primary plan.
