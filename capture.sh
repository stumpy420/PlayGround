#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CAPTURE_URL="${CAPTURE_URL:?CAPTURE_URL is required}"
CAPTURE_DIR="${CAPTURE_DIR:?CAPTURE_DIR is required}"
SESSION="capture-$$"
/usr/bin/time -p mkdir -p "$CAPTURE_DIR"

if ! /usr/bin/time -p playwright-cli -s="$SESSION" open "$CAPTURE_URL"; then
  echo "Browser could not navigate to $CAPTURE_URL" >&2
  exit 75
fi
cleanup() {
  /usr/bin/time -p playwright-cli -s="$SESSION" close >/dev/null 2>&1 || true
}
trap cleanup EXIT

/usr/bin/time -p playwright-cli -s="$SESSION" eval '(async () => { const deadline=Date.now()+15000; while (Date.now()<deadline) { const canvas=document.querySelector("canvas"); const content=document.body?.innerText?.trim(); const rendered=canvas ? canvas.width>0 && canvas.height>0 : Boolean(document.body?.children.length); if (rendered && (canvas || content)) return true; await new Promise(resolve=>setTimeout(resolve,200)); } throw new Error("No rendered app content appeared before timeout"); })()'
/usr/bin/time -p playwright-cli -s="$SESSION" resize 1280 800
/usr/bin/time -p playwright-cli -s="$SESSION" screenshot --filename="$CAPTURE_DIR/final-desktop.png"
/usr/bin/time -p playwright-cli -s="$SESSION" resize 390 844
/usr/bin/time -p playwright-cli -s="$SESSION" eval '(async () => { await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))); return {width:innerWidth,height:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth}; })()'
/usr/bin/time -p playwright-cli -s="$SESSION" screenshot --filename="$CAPTURE_DIR/final-mobile.png"
