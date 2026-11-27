# Security

Report vulnerabilities privately to the repository owner.

Set `AUTH_MODE=secure`, a non-default `JWT_SECRET`, and explicit MongoDB credentials before any shared or non-local deployment. Laboratory mode (`AUTH_MODE=lab`) may seed `admin` / `admin` and accept the demo JWT secret — demonstration only.

The UI login authorizes the browser app only; Envoy operator tokens and runner auth are separate — see [docs/deployment.md](docs/deployment.md).
