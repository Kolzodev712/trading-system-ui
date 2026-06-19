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
- This UI has no built-in authentication; add network-level or proxy-level auth for production

## Health checks

| Check | Command |
|-------|---------|
| Runner gRPC | `grpcurl -plaintext <host>:50051 trading_cli.TradingCliService/GetTradingStatus` |
| Envoy | `curl -s -o /dev/null -w "%{http_code}" http://<host>:8081/` |
| Static UI | `curl -s -o /dev/null -w "%{http_code}" http://<host>/` |
