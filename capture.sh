#!/usr/bin/env bash
# Capture desktop and mobile evidence for the running preview.
#
# Exit 75 = temporary navigation/browser infrastructure failure.
# Exit 1  = capture script or rendering defect.
set -euo pipefail

PROJECT_DIR="$(/usr/bin/time -p realpath -m "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)")"
: "${CAPTURE_URL:?CAPTURE_URL must be set}"
: "${CAPTURE_DIR:?CAPTURE_DIR must be set}"
PLAYWRIGHT_ROOT="${PLAYWRIGHT_ROOT:-$HOME/.local/share/omgithub-playwright}"

if ! [[ "$CAPTURE_URL" =~ ^https?://[^[:space:]]+$ ]]; then
  echo "CAPTURE_URL must be an absolute http(s) URL (got '$CAPTURE_URL')." >&2
  exit 1
fi
if [[ ! -d "$PLAYWRIGHT_ROOT/node_modules/playwright" ]]; then
  echo "Playwright runtime not found at $PLAYWRIGHT_ROOT." >&2
  exit 75
fi
if [[ "$(uname -s)" == Linux && ! -f "$PLAYWRIGHT_ROOT/display" ]]; then
  echo "Playwright display file not found at $PLAYWRIGHT_ROOT/display." >&2
  exit 75
fi

echo "==> create capture directory"
/usr/bin/time -p mkdir -p "$CAPTURE_DIR"
CAPTURE_DIR="$(/usr/bin/time -p realpath -m "$CAPTURE_DIR")"
case "$CAPTURE_DIR" in
  "$PROJECT_DIR"|"$PROJECT_DIR"/*)
    echo "CAPTURE_DIR must be outside the source tree: $CAPTURE_DIR" >&2
    exit 1
    ;;
esac

export CAPTURE_URL CAPTURE_DIR PLAYWRIGHT_ROOT
echo "==> capture desktop and mobile views"
/usr/bin/time -p node - <<'NODE'
const { createRequire } = require('node:module');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const runtime = process.env.PLAYWRIGHT_ROOT;
const requireFromRuntime = createRequire(join(runtime, 'package.json'));
const { chromium } = requireFromRuntime('playwright');
const config = JSON.parse(readFileSync(join(runtime, process.platform === 'darwin' ? 'metal.json' : 'linux.json'), 'utf8'));
if (process.platform === 'linux') {
  process.env.DISPLAY ||= ':' + readFileSync(join(runtime, 'display'), 'utf8').trim();
}

const url = process.env.CAPTURE_URL;
const captureDir = process.env.CAPTURE_DIR;
const views = [
  ['desktop', { viewport: { width: 1440, height: 900 } }],
  ['mobile', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }],
];

const transient = (error) => {
  error.captureCode = 75;
  throw error;
};

(async () => {
  let browser;
  try {
    browser = await chromium.launch({ ...config.browser.launchOptions, timeout: 30000 }).catch(transient);

    for (const [name, options] of views) {
      const context = await browser.newContext(options).catch(transient);
      const page = await context.newPage().catch(transient);
      page.setDefaultTimeout(30000);

      const response = await page.goto(url, { waitUntil: 'load', timeout: 45000 }).catch(transient);
      if (!response) throw Object.assign(new Error(`No response loading ${url}`), { captureCode: 75 });
      if (!response.ok()) {
        const status = response.status();
        const code = status === 408 || status === 429 || status >= 500 ? 75 : 1;
        throw Object.assign(new Error(`HTTP ${status} loading ${url}`), { captureCode: code });
      }

      // Wait for the app shell, its boot flag and a real canvas surface.
      await page.waitForFunction(() => document.fonts && document.fonts.status === 'loaded', null, { timeout: 15000 })
        .catch((error) => { error.captureCode = 1; throw error; });
      await page.waitForFunction(
        () => document.body.classList.contains('ready') && window.game && window.game.renderer,
        null,
        { timeout: 20000 },
      ).catch((error) => { error.captureCode = 1; throw error; });

      const canvasReady = await page.evaluate(() => {
        const canvas = document.getElementById('game');
        return Boolean(canvas && canvas.width > 0 && canvas.height > 0);
      });
      if (!canvasReady) throw Object.assign(new Error('Game canvas did not render'), { captureCode: 1 });

      // Start gameplay through the game API rather than guessing at DOM controls.
      // If auto-start is unavailable, the menu itself is still valid evidence.
      const started = await page.evaluate(() => {
        try {
          if (window.game && window.game.state === 'menu' && typeof window.game.playNext === 'function') {
            window.game.playNext();
            return true;
          }
        } catch (error) {
          console.error('Auto-start failed:', error && error.message ? error.message : error);
        }
        return false;
      });

      if (started) {
        await page.waitForFunction(
          () => window.game && window.game.state === 'playing',
          null,
          { timeout: 10000 },
        ).catch(() => {});
        await page.waitForTimeout(400);
        // Pointer lock is not available in capture; hide the prompt, not the game.
        await page.evaluate(() => {
          const hint = document.getElementById('lock-hint');
          if (hint) hint.style.display = 'none';
        });
      }
      await page.waitForTimeout(250);

      const output = join(captureDir, `final-${name}.png`);
      await page.screenshot({ path: output, type: 'png', timeout: 30000 }).catch((error) => {
        error.captureCode = error.name === 'TimeoutError' ? 75 : 1;
        throw error;
      });
      console.log(`Captured ${name}: ${output}`);
      await context.close().catch(() => {});
    }
  } catch (error) {
    console.error(error && error.stack ? error.stack : error);
    process.exitCode = error.captureCode || 1;
  } finally {
    if (browser) {
      await browser.close().catch((error) => {
        console.error('Browser close failed:', error && error.message ? error.message : error);
        if (!process.exitCode) process.exitCode = 75;
      });
    }
  }
})();
NODE
