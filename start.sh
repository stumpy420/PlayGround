#!/usr/bin/env bash
# Build (when needed) and serve the static app in the foreground.
#
# The controller reads deployment-output.json to discover the directory it
# should publish. Everything project-owned stays inside PROJECT_DIR; worker
# metadata is written under OPENCODE_WEB_DIR.
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_DIR="${OPENCODE_WEB_DIR:-/home/runner/work/_temp/omgithub-web}"
PORT="${PORT:-3000}"
SERVE_DIR="$PROJECT_DIR"

if ! [[ "$PORT" =~ ^[0-9]+$ ]] || (( PORT < 1 || PORT > 65535 )); then
  echo "PORT must be an integer between 1 and 65535 (got '$PORT')." >&2
  exit 1
fi

echo "==> ensure metadata directory"
/usr/bin/time -p mkdir -p "$WEB_DIR"

# Static projects need no dependency install or build. Package projects get the
# standard install/build flow and publish their conventional output directory.
if [[ -f "$PROJECT_DIR/package.json" ]]; then
  echo "==> install dependencies"
  if [[ -f "$PROJECT_DIR/package-lock.json" ]]; then
    /usr/bin/time -p npm ci --no-audit --no-fund
  else
    /usr/bin/time -p npm install --no-audit --no-fund
  fi
  if /usr/bin/time -p node -e 'const p = require(process.argv[1]); process.exit(p.scripts && p.scripts.build ? 0 : 1)' "$PROJECT_DIR/package.json"; then
    echo "==> build static output"
    /usr/bin/time -p npm run build
  fi
  if [[ -d "$PROJECT_DIR/dist" ]]; then
    SERVE_DIR="$PROJECT_DIR/dist"
  elif [[ -d "$PROJECT_DIR/build" ]]; then
    SERVE_DIR="$PROJECT_DIR/build"
  fi
fi

SERVE_DIR="$(realpath -m "$SERVE_DIR")"
case "$SERVE_DIR" in
  "$PROJECT_DIR"|"$PROJECT_DIR"/*) ;;
  *)
    echo "Refusing to publish outside PROJECT_DIR: $SERVE_DIR" >&2
    exit 1
    ;;
esac
if [[ ! -f "$SERVE_DIR/index.html" ]]; then
  echo "No index.html in publish directory: $SERVE_DIR" >&2
  exit 1
fi

# Publish readiness metadata atomically so the controller never reads a partial file.
echo "==> write deployment metadata"
/usr/bin/time -p node -e '
  const fs = require("node:fs");
  const [project, directory, output] = process.argv.slice(1);
  fs.writeFileSync(output, JSON.stringify({ project, directory }) + "\n");
' "$PROJECT_DIR" "$SERVE_DIR" "$WEB_DIR/deployment-output.json.tmp"
/usr/bin/time -p mv "$WEB_DIR/deployment-output.json.tmp" "$WEB_DIR/deployment-output.json"

echo "Serving $SERVE_DIR on http://0.0.0.0:$PORT"

# Foreground static server with correct MIME types and path traversal protection.
echo "==> serve in foreground"
exec /usr/bin/time -p node - "$PORT" "$SERVE_DIR" <<'NODE'
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const port = Number(process.argv[2]);
const root = path.resolve(process.argv[3]);
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
  '.glb': 'model/gltf-binary',
  '.txt': 'text/plain; charset=utf-8',
};

const server = http.createServer((req, res) => {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' });
      res.end('Method Not Allowed');
      return;
    }
    const url = new URL(req.url, 'http://localhost');
    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      res.writeHead(400);
      res.end('Bad Request');
      return;
    }
    let file = path.resolve(root, '.' + pathname);
    if (file !== root && !file.startsWith(root + path.sep)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    let stat;
    try {
      stat = fs.statSync(file);
    } catch {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    if (stat.isDirectory()) {
      file = path.join(file, 'index.html');
      try {
        stat = fs.statSync(file);
      } catch {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }
    }
    if (!stat.isFile()) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Content-Length': stat.size,
      'Cache-Control': 'no-cache',
    });
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    const stream = fs.createReadStream(file);
    stream.on('error', () => {
      if (!res.headersSent) res.writeHead(500);
      res.end();
    });
    stream.pipe(res);
  } catch {
    if (!res.headersSent) res.writeHead(500);
    res.end('Internal Server Error');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Static server listening on http://0.0.0.0:${port} (root: ${root})`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
NODE
