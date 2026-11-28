# Security

## Reporting a vulnerability

Use **GitHub private vulnerability reporting** for this repository:

https://github.com/Kolzodev712/trading-system-ui/security/advisories/new

Do not open public issues that include JWT secrets, operator tokens, or credentials.

Maintainers triage reports as capacity allows; there is no guaranteed response SLA.

## Deployment notes

Set `AUTH_MODE=secure`, a non-default `JWT_SECRET`, and explicit MongoDB credentials before any shared or non-local deployment. Laboratory mode (`AUTH_MODE=lab`) may seed `admin` / `admin` and accept the demo JWT secret — demonstration only.

The UI login authorizes the browser app only; Envoy operator tokens and runner auth are separate — see [docs/deployment.md](docs/deployment.md).
