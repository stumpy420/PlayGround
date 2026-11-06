#!/usr/bin/env bash
# Build the static slice inside the project and serve it in the foreground.
set -euo pipefail

PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

PORT="${PORT:-3000}"
WEB_DIR="${OPENCODE_WEB_DIR:-/home/runner/work/_temp/omgithub-web}"
DIST_DIR="$PROJECT_DIR/dist"
DEPLOYMENT_FILE="$WEB_DIR/deployment-output.json"

timed() {
  local label="$1"
  shift
  printf '\n[start] %s\n' "$label"
  /usr/bin/time -p "$@"
}

timed "validate port" bash -c '[[ "${1:-}" =~ ^[1-9][0-9]{0,4}$ ]] && (( $1 <= 65535 ))' _ "$PORT"

if [[ -f package.json ]]; then
  if [[ -f package-lock.json ]]; then
    timed "install dependencies" npm ci --no-audit --no-fund
  else
    timed "install dependencies" npm install --no-audit --no-fund
  fi
  if node -e 'const p = require("./package.json"); process.exit(p.scripts && p.scripts.build ? 0 : 1)'; then
    timed "build project" npm run build
  fi
fi

timed "remove old static output" rm -rf "$DIST_DIR"
timed "create static output" mkdir -p "$DIST_DIR"

for entry in index.html js styles.css assets vendor; do
  if [[ -e "$entry" ]]; then
    timed "copy $entry" cp -R "$entry" "$DIST_DIR/"
  fi
done

timed "verify static entrypoint" test -f "$DIST_DIR/index.html"
timed "create metadata directory" mkdir -p "$WEB_DIR"
timed "write deployment metadata" node -e '
  const fs = require("node:fs");
  const path = require("node:path");
  const [project, directory, output] = process.argv.slice(1);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify({ project, directory }) + "\n");
' "$PROJECT_DIR" "$DIST_DIR" "$DEPLOYMENT_FILE"

timed "serve $DIST_DIR on :$PORT" node "$PROJECT_DIR/scripts/serve.mjs" "$DIST_DIR"
