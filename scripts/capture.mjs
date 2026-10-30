import { createRequire } from 'node:module';
import { readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const runtime = join(homedir(), '.local/share/omgithub-playwright');
const require = createRequire(join(runtime, 'package.json'));
const { chromium } = require('playwright');

const CAPTURE_URL = process.env.CAPTURE_URL;
const CAPTURE_DIR = process.env.CAPTURE_DIR;

if (!CAPTURE_URL || !CAPTURE_DIR) {
  console.error('CAPTURE_URL and CAPTURE_DIR are required.');
  process.exit(1);
}
try {
  new URL(CAPTURE_URL);
} catch {
  console.error(`Invalid CAPTURE_URL: ${CAPTURE_URL}`);
  process.exit(1);
}

class TransientError extends Error {}

const VIEWS = [
  { name: 'desktop', viewport: { width: 1440, height: 900 }, mobile: false },
  { name: 'mobile', viewport: { width: 390, height: 844 }, mobile: true },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const elapsed = (start) => `${Date.now() - start} ms`;

function launchOptions() {
  const fallback = { headless: true, args: ['--use-gl=swiftshader', '--enable-webgl'] };
  try {
    const file = join(runtime, process.platform === 'darwin' ? 'metal.json' : 'linux.json');
    return JSON.parse(readFileSync(file, 'utf8')).browser?.launchOptions || fallback;
  } catch {
    return fallback;
  }
}

async function captureView(browser, view) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const context = await browser.newContext({
      viewport: view.viewport,
      hasTouch: view.mobile,
      isMobile: view.mobile,
      deviceScaleFactor: 1,
    }).catch((error) => {
      throw new TransientError(`Could not create browser context: ${error.message}`);
    });
    const page = await context.newPage().catch((error) => {
      throw new TransientError(`Could not create browser page: ${error.message}`);
    });
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') pageErrors.push(message.text());
    });

    try {
      const navigateStart = Date.now();
      let response;
      try {
        response = await page.goto(CAPTURE_URL, { waitUntil: 'load', timeout: 45000 });
      } catch (error) {
        throw new TransientError(`Navigation failed: ${error.message}`);
      }
      console.log(`[timing] ${view.name} navigate: ${elapsed(navigateStart)}`);

      const status = response?.status() ?? 0;
      if (status >= 400) {
        if (status === 401 || status === 403 || status === 404 || status === 408 || status === 425 || status === 429 || status >= 500) {
          throw new TransientError(`Preview returned HTTP ${status}`);
        }
        throw new Error(`Preview returned HTTP ${status}`);
      }

      const renderStart = Date.now();
      try {
        await page.locator('#start-screen').waitFor({ state: 'visible', timeout: 20000 });
        await page.locator('#game').waitFor({ state: 'visible', timeout: 10000 });
      } catch (error) {
        throw new Error(`Application shell did not render: ${error.message}`);
      }
      await page.evaluate(() => document.fonts?.ready).catch(() => {});
      await page.waitForTimeout(1200);
      console.log(`[timing] ${view.name} rendered: ${elapsed(renderStart)}`);

      if (process.env.CAPTURE_AUTO_START !== 'false') {
        const play = page.locator('#btn-play');
        const playCount = await play.count();
        if (playCount === 1) {
          try {
            await play.click({ timeout: 6000 });
            await page.locator('#hud').waitFor({ state: 'visible', timeout: 10000 });
            await page.waitForTimeout(1800);
            console.log(`[timing] ${view.name} auto-start: ready`);
          } catch (error) {
            console.warn(`[capture] ${view.name} auto-start skipped: ${error.message}`);
          }
        }
      }

      const canvas = await page.locator('#game').boundingBox();
      if (!canvas || canvas.width < 100 || canvas.height < 100) {
        throw new Error('Game canvas did not render at a usable size.');
      }

      const file = join(CAPTURE_DIR, `final-${view.name}.png`);
      const shotStart = Date.now();
      try {
        await page.screenshot({ path: file, timeout: 30000 });
      } catch (error) {
        throw new TransientError(`Screenshot failed: ${error.message}`);
      }
      console.log(`[timing] ${view.name} screenshot: ${elapsed(shotStart)}`);

      const bytes = readFileSync(file);
      if (bytes.length < 1000 || bytes.subarray(1, 4).toString() !== 'PNG') {
        throw new Error(`Screenshot is empty or not a PNG: ${file}`);
      }
      if (pageErrors.length) console.warn(`[capture] ${view.name} page errors: ${pageErrors.join(' | ')}`);
      console.log(`Captured ${view.name}: ${file} (${statSync(file).size} bytes)`);
      return;
    } catch (error) {
      lastError = error;
      const transient = error instanceof TransientError;
      console.warn(`[capture] ${view.name} attempt ${attempt}/3 failed (${transient ? 'temporary' : 'defect'}): ${error.message}`);
      if (!transient || attempt === 3) throw error;
      await sleep(2500);
    } finally {
      await context.close().catch(() => {});
    }
  }
  throw lastError;
}

let browser;
let exitCode = 0;
try {
  const launchStart = Date.now();
  browser = await chromium.launch(launchOptions()).catch((error) => {
    throw new TransientError(`Browser launch failed: ${error.message}`);
  });
  console.log(`[timing] browser launch: ${elapsed(launchStart)}`);

  for (const view of VIEWS) await captureView(browser, view);
  console.log('Capture complete: final-desktop.png and final-mobile.png');
} catch (error) {
  console.error(`Capture failed: ${error.message}`);
  exitCode = error instanceof TransientError ? 75 : 1;
} finally {
  if (browser) await browser.close().catch((error) => console.error(`Browser close failed: ${error.message}`));
}

if (exitCode) process.exit(exitCode);
