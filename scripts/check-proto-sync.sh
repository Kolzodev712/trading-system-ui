#!/bin/sh
# Compare UI proto to authoritative trading_system proto; optional regenerate.
set -eu

UI_ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
BACKEND_PROTO="${BACKEND_PROTO:-$UI_ROOT/../trading_system/libs/trading_proto/proto/trading_cli.proto}"
UI_PROTO="$UI_ROOT/proto/trading_cli.proto"

if [ ! -f "$BACKEND_PROTO" ]; then
  echo "authoritative proto not found: $BACKEND_PROTO" >&2
  echo "set BACKEND_PROTO to trading_system/.../trading_cli.proto" >&2
  exit 1
fi

backend_rev=$(git -C "$(dirname "$BACKEND_PROTO")/../../../.." rev-parse --short HEAD 2>/dev/null || echo unknown)
echo "backend revision: $backend_rev"
echo "backend proto:    $BACKEND_PROTO"
echo "ui proto:         $UI_PROTO"

if ! diff -u "$UI_PROTO" "$BACKEND_PROTO"; then
  echo "FAIL: proto drift" >&2
  exit 1
fi
echo "ok proto definitions match"

if [ "${1:-}" = "--generate" ]; then
  cd "$UI_ROOT"
  npm run generate
  if ! git -C "$UI_ROOT" diff --quiet -- src/gen; then
    echo "generated bindings updated (working tree dirty under src/gen)"
  else
    echo "ok generated bindings unchanged"
  fi
fi
