#!/usr/bin/env bash
set -euo pipefail

# Capture desktop and mobile renders of an already-running app.
# Output is intentionally kept outside the project source tree.
PROJECT_DIR="${PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)}"
PROJECT_DIR="$(cd "$PROJECT_DIR" && pwd -P)"
: "${CAPTURE_URL:?CAPTURE_URL is required}"
: "${CAPTURE_DIR:?CAPTURE_DIR is required}"

if [[ "$(uname -s)" == Linux && -z "${DISPLAY:-}" ]]; then
  display_file="$HOME/.local/share/omgithub-playwright/display"
  if [[ -f "$display_file" ]]; then
    export DISPLAY=":$(tr -d '[:space:]' < "$display_file")"
  fi
fi

/usr/bin/time -p mkdir -p "$CAPTURE_DIR"
CAPTURE_DIR="$(cd "$CAPTURE_DIR" && pwd -P)"
case "$CAPTURE_DIR" in
  "$PROJECT_DIR"|"$PROJECT_DIR"/*)
    echo "CAPTURE_DIR must be outside the project source tree: $CAPTURE_DIR" >&2
    exit 1
    ;;
esac
export CAPTURE_URL CAPTURE_DIR

/usr/bin/time -p node "$PROJECT_DIR/scripts/capture.mjs"
