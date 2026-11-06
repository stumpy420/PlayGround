#!/usr/bin/env bash
# Capture desktop and mobile screenshots of a running preview.
set -euo pipefail

PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
: "${CAPTURE_URL:?Set CAPTURE_URL to the preview URL}"
: "${CAPTURE_DIR:?Set CAPTURE_DIR to an output directory outside the source tree}"

timed() {
  local label="$1"
  shift
  printf '\n[capture] %s\n' "$label"
  /usr/bin/time -p "$@"
}

timed "create capture directory $CAPTURE_DIR" mkdir -p "$CAPTURE_DIR"
timed "capture $CAPTURE_URL" node "$PROJECT_DIR/scripts/capture.mjs"
