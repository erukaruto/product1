#!/usr/bin/env bash
# Builds both products and serves them for screenshots: LinguaDrop on :4173, LinguaDash on :4174.
# Stop with Ctrl+C.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
(cd "$ROOT/linguadrop" && VITE_APP_URL=http://localhost:4174 npm run build >/dev/null)
(cd "$ROOT/linguadash" && VITE_SITE_URL=http://localhost:4173 npm run build >/dev/null)
(cd "$ROOT/linguadrop" && npx vite preview --port 4173 --strictPort) &
(cd "$ROOT/linguadash" && npx vite preview --port 4174 --strictPort) &
trap 'kill $(jobs -p) 2>/dev/null || true' EXIT
wait
