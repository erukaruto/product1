#!/usr/bin/env bash
# Builds both products, starts their preview servers, runs the Playwright checks and stops the servers.
#   bash bundle-kit-lingua/scripts/run-verify.sh
# Needs: Node 20.19+ and Playwright with Chromium (npm i -D playwright && npx playwright install chromium).
set -euo pipefail

KIT="$(cd "$(dirname "$0")/.." && pwd)"
ROOT="$(cd "$KIT/.." && pwd)"
SITE_PORT=4173
APP_PORT=4174

(cd "$KIT" && [ -d node_modules/axe-core ] || npm install --no-audit --no-fund)

echo "Building LinguaDrop..."
(cd "$ROOT/linguadrop" && [ -d node_modules ] || npm install --no-audit --no-fund)
(cd "$ROOT/linguadrop" && npm run typecheck && VITE_APP_URL="http://localhost:$APP_PORT" npm run build >/dev/null)
echo "Building LinguaDash..."
(cd "$ROOT/linguadash" && [ -d node_modules ] || npm install --no-audit --no-fund)
(cd "$ROOT/linguadash" && VITE_SITE_URL="http://localhost:$SITE_PORT" npm run build >/dev/null)

(cd "$ROOT/linguadrop" && npx vite preview --port $SITE_PORT --strictPort > "$KIT/.preview-site.log" 2>&1) &
SITE_PID=$!
(cd "$ROOT/linguadash" && npx vite preview --port $APP_PORT --strictPort > "$KIT/.preview-app.log" 2>&1) &
APP_PID=$!
# npx starts vite in a grandchild process, so also stop every "vite preview" on our two ports.
cleanup() {
  kill $SITE_PID $APP_PID 2>/dev/null || true
  ps -eo pid=,args= | while read -r pid args; do
    case "$args" in
      node*"vite preview --port $SITE_PORT"*|node*"vite preview --port $APP_PORT"*) kill "$pid" 2>/dev/null || true ;;
    esac
  done
}
trap cleanup EXIT

for port in $SITE_PORT $APP_PORT; do
  for _ in $(seq 1 40); do
    curl -s -o /dev/null "http://localhost:$port/" && break
    sleep 0.25
  done
done

node "$KIT/scripts/verify.cjs" "$@"
