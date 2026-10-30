#!/usr/bin/env bash
set -euo pipefail

# Build and serve the static app in the foreground.
# All source and build output stay inside the project directory. The web
# directory is used only for controller metadata.
PROJECT_DIR="${PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)}"
PROJECT_DIR="$(cd "$PROJECT_DIR" && pwd -P)"
OPENCODE_WEB_DIR="${OPENCODE_WEB_DIR:-/home/runner/work/_temp/omgithub-web}"
PORT="${PORT:-3000}"
BUILD_DIR="$PROJECT_DIR/dist"
DEPLOYMENT_OUTPUT="$OPENCODE_WEB_DIR/deployment-output.json"

if [[ ! "$PORT" =~ ^[0-9]+$ ]] || (( PORT < 1 || PORT > 65535 )); then
  echo "Invalid PORT: $PORT" >&2
  exit 1
fi

cd "$PROJECT_DIR"

timed() { /usr/bin/time -p "$@"; }

# Install only when dependencies are absent or the lockfile changed.
if [[ -f package-lock.json ]]; then
  deps_hash="$(sha256sum package.json package-lock.json | sha256sum | awk '{print $1}')"
  deps_stamp="$PROJECT_DIR/node_modules/.cache/project-deps"
  if [[ ! -d node_modules/vite || ! -f "$deps_stamp" || "$(cat "$deps_stamp")" != "$deps_hash" ]]; then
    timed npm ci --no-audit --no-fund
    timed mkdir -p "$PROJECT_DIR/node_modules/.cache"
    printf '%s' "$deps_hash" > "$deps_stamp"
  fi
elif [[ ! -d node_modules/vite ]]; then
  timed npm install --no-audit --no-fund
fi

timed npm run build
timed test -f "$BUILD_DIR/index.html"

# Publish the absolute static directory before the server starts accepting
# traffic so the controller never sees a stale or relative deployment target.
timed mkdir -p "$OPENCODE_WEB_DIR"
timed sh -c 'printf "{\"project\":\"%s\",\"directory\":\"%s\"}\n" "$1" "$2" > "$3"' sh \
  "$PROJECT_DIR" "$BUILD_DIR" "$DEPLOYMENT_OUTPUT"
timed cat "$DEPLOYMENT_OUTPUT"

echo "Serving $BUILD_DIR on 0.0.0.0:$PORT"
exec /usr/bin/time -p node "$PROJECT_DIR/scripts/serve.mjs" "$BUILD_DIR" "$PORT"
