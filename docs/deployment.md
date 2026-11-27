# Deployment

## Production build

```bash
npm ci
npm run build
```

Output: static files in `dist/` (HTML, JS, CSS).

## Hosting the static UI

Serve `dist/` with any static file host (nginx, Caddy, S3 + CloudFront, etc.).

Example nginx snippet:

```nginx
server {
    listen 80;
    root /var/www/trading-system-ui/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

The static bundle alone does not provide login. The current Express auth API (`server/index.ts`) and MongoDB must also be reachable through an appropriately protected `/api` route. The example above only serves static files; it is not a complete production deployment configuration.

## gRPC-Web proxy (required)

Browsers cannot call native gRPC. Run Envoy (or equivalent) alongside the UI:

```bash
docker-compose -f docker/docker-compose.yml up -d
```

The included [`docker/envoy.yaml`](../docker/envoy.yaml) listens on `:8081` and forwards to `127.0.0.1:50051`.

For production:

1. Point Envoy upstream to the runner's gRPC address (hostname/IP + port)
2. Expose Envoy on HTTPS (terminate TLS at Envoy or a reverse proxy)
3. Set CORS `allow_origin` in `envoy.yaml` to your UI origin instead of `*`

## Environment variables

Build-time (Vite):

| Variable | Production example | Description |
|----------|-------------------|-------------|
| `VITE_GRPC_WEB_URL` | `https://api.example.com/grpc` | Full gRPC-Web URL the browser calls |

If the UI and proxy share a domain, you can proxy `/grpc` through nginx to Envoy and keep `VITE_GRPC_WEB_URL=/grpc`.

## Authentication layers

Three separate mechanisms protect different paths. Do not confuse them.

| Layer | Purpose | Configuration |
|-------|---------|----------------|
| **Browser login** | JWT session for the static UI and `/api` routes | `AUTH_MODE`, `JWT_SECRET`, MongoDB `credentials` collection |
| **Envoy operator token** | Injects `x-operator-token` on gRPC-Web requests from the browser proxy | `TRADING_OPERATOR_TOKEN_FILE` → `docker/envoy.yaml` Lua filter |
| **Runner auth** | Authorizes mutating trading RPCs on the runner | Trading system runner / operator token policy (not this UI repo) |

### `AUTH_MODE` (Express login API)

| Mode | Behavior |
|------|----------|
| `lab` | May auto-seed `admin` / `admin` when the credentials collection is empty; allows the demonstration `JWT_SECRET` default. **Local demos only.** |
| `secure` | Does **not** seed users; requires a strong, non-default `JWT_SECRET` or the auth server refuses to start. |

When `AUTH_MODE` is **unset**: the server uses `lab` only if `NODE_ENV` is not `production`; otherwise it behaves as `secure`.

**Non-lab deployments are unsupported** without secure configuration: set `AUTH_MODE=secure`, provide a unique `JWT_SECRET`, provision credentials in MongoDB (no default administrator), configure Envoy operator tokens and runner auth, and tighten CORS/TLS. Shipping with `AUTH_MODE=lab` or the demo JWT secret is not a supported production posture.

Legacy env vars `LAB_MODE` and `AUTH_ALLOW_DEV_DEFAULTS` still force laboratory behavior when `AUTH_MODE` is unset.

## Security notes

- The runner gRPC port (`50051`) should **not** be exposed to the public internet without TLS and auth
- Restrict Envoy and the runner to a private network or VPN where possible
- Docker Compose publishes Mongo on **loopback only** (`127.0.0.1`). Envoy uses `network_mode: host` so it can reach the runner on `127.0.0.1:50051`; gRPC-Web and Envoy admin listen on `127.0.0.1` in `docker/envoy.yaml`
- Browser login (JWT) alone does **not** authorize mutating runner RPCs. Protect capital-bearing operation at the runner/proxy boundary; see the [prop-trading control-plane guide](PROP_TRADING_CONTROL_PLANE_GUIDE.md).

## Health checks

| Check | Command |
|-------|---------|
| Runner gRPC | `grpcurl -plaintext <host>:50051 trading_cli.TradingCliService/GetTradingStatus` |
| Envoy | `curl -s -o /dev/null -w "%{http_code}" http://<host>:8081/` |
| Static UI | `curl -s -o /dev/null -w "%{http_code}" http://<host>/` |
