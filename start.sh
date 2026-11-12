#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"
PORT="${PORT:-3000}"
: "${OPENCODE_WEB_DIR:?OPENCODE_WEB_DIR must point to worker metadata storage}"

/usr/bin/time -p npm install --ignore-scripts --no-audit --no-fund --package-lock=false
/usr/bin/time -p npm run build
/usr/bin/time -p mkdir -p /home/runner/work/_temp/omgithub-web
/usr/bin/time -p node -e 'const fs=require("node:fs"); const path=require("node:path"); const project=process.cwd(); const directory=path.join(project,"dist"); fs.writeFileSync("/home/runner/work/_temp/omgithub-web/deployment-output.json", JSON.stringify({project,directory}, null, 2)+"\n")'
/usr/bin/time -p python3 -m http.server "$PORT" --bind 0.0.0.0 --directory "$PROJECT_DIR/dist"
