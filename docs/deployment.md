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

## Security notes

- The runner gRPC port (`50051`) should **not** be exposed to the public internet without TLS and auth
- Restrict Envoy and the runner to a private network or VPN where possible
- This UI has a MongoDB-backed Express login API and seeds `admin/admin` for local development. Change those credentials and the JWT secret before any non-local deployment.
- Browser login alone does **not** authorize direct gRPC/Envoy calls. Protect mutating runner RPCs at the runner/proxy boundary before capital-bearing operation; see the [prop-trading control-plane guide](PROP_TRADING_CONTROL_PLANE_GUIDE.md).

## Health checks

| Check | Command |
|-------|---------|
| Runner gRPC | `grpcurl -plaintext <host>:50051 trading_cli.TradingCliService/GetTradingStatus` |
| Envoy | `curl -s -o /dev/null -w "%{http_code}" http://<host>:8081/` |
| Static UI | `curl -s -o /dev/null -w "%{http_code}" http://<host>/` |
