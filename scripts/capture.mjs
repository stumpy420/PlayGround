import { createRequire } from 'node:module'
import { mkdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

const url = process.env.CAPTURE_URL
const output = process.env.CAPTURE_DIR

if (!url || !output) {
  console.error('Set CAPTURE_URL and CAPTURE_DIR.')
  process.exit(1)
}

const captureDir = resolve(output)
try {
  mkdirSync(captureDir, { recursive: true })
} catch (error) {
  console.error(`Cannot create CAPTURE_DIR ${captureDir}: ${error.message}`)
  process.exit(1)
}

const started = Date.now()
const elapsed = () => ((Date.now() - started) / 1000).toFixed(2)
const step = (message) => console.log(`[capture +${elapsed()}s] ${message}`)

function transient(error) {
  if (!error.exitCode) error.exitCode = 75
  return error
}

function defect(message) {
  return Object.assign(new Error(message), { exitCode: 1 })
}

const runtime = process.env.PLAYWRIGHT_RUNTIME || join(process.env.HOME, '.local/share/omgithub-playwright')
const require = createRequire(join(runtime, 'package.json'))

let chromium
try {
  ;({ chromium } = require('playwright'))
} catch (error) {
  console.error(`Cannot load Playwright from ${runtime}: ${error.message}`)
  process.exit(75)
}

const platformConfig = process.platform === 'darwin' ? 'metal.json' : 'linux.json'
let config
try {
  config = JSON.parse(readFileSync(join(runtime, platformConfig), 'utf8'))
} catch (error) {
  console.error(`Cannot read browser config ${platformConfig}: ${error.message}`)
  process.exit(75)
}

if (process.platform === 'linux' && !process.env.DISPLAY) {
  try {
    process.env.DISPLAY = ':' + readFileSync(join(runtime, 'display'), 'utf8').trim()
  } catch {
    // The browser launch below will report a useful failure if no display exists.
  }
}

const origin = new URL(url).origin
const viewports = [
  ['desktop', 1440, 900],
  ['mobile', 390, 844],
]

for (const [name] of viewports) {
  rmSync(join(captureDir, `final-${name}.png`), { force: true })
}

let browser
let exitCode = 0
const renderingDefects = []

try {
  step(`launch chromium for ${url}`)
  browser = await chromium.launch({ ...config.browser.launchOptions, timeout: 30000 }).catch((error) => {
    throw transient(error)
  })

  for (const [name, width, height] of viewports) {
    step(`open ${name} viewport ${width}x${height}`)
    const page = await browser.newPage({ viewport: { width, height } }).catch((error) => {
      throw transient(error)
    })
    page.setDefaultTimeout(30000)

    const renderErrors = []
    page.on('pageerror', (error) => {
      console.error(`[capture] page error (${name}): ${error.message}`)
      renderErrors.push(`page error: ${error.message}`)
    })
    page.on('response', (response) => {
      let responseOrigin
      try {
        responseOrigin = new URL(response.url()).origin
      } catch {
        return
      }
      const pathname = new URL(response.url()).pathname
      if (responseOrigin === origin && response.status() >= 400 && !pathname.endsWith('/favicon.ico')) {
        renderErrors.push(`HTTP ${response.status()}: ${response.url()}`)
      }
    })

    let response
    try {
      response = await page.goto(url, { waitUntil: 'load', timeout: 45000 })
    } catch (error) {
      throw transient(error)
    }
    if (!response) throw transient(new Error(`No navigation response from ${url}`))
    if (!response.ok()) {
      const status = response.status()
      const code = !status || [408, 429, 500, 502, 503, 504].includes(status) ? 75 : 1
      throw Object.assign(new Error(`HTTP ${status} loading ${url}`), { exitCode: code })
    }

    step(`wait for rendered content (${name})`)
    const ready = process.env.CAPTURE_READY_SELECTOR || '#start-screen'
    if (ready) {
      await page.locator(ready).first().waitFor({ state: 'visible', timeout: 30000 }).catch(() => {
        throw defect(`Ready selector ${ready} did not become visible`)
      })
    }
    await page.locator('canvas').first().waitFor({ state: 'attached', timeout: 30000 }).catch(() => {
      throw defect('The game canvas did not render')
    })
    await page.waitForFunction(() => document.fonts.status === 'loaded', null, { timeout: 15000 }).catch(() => {
      console.warn(`[capture] fonts were still loading in ${name}; continuing`)
    })
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))).catch(() => {})

    if (process.env.CAPTURE_AUTO_START !== 'false') {
      const result = await page.evaluate(() => {
        const start = document.querySelector('#start-btn')
          || [...document.querySelectorAll('button')].find((button) => /^(?:start|play)(?:\s+(?:game|now))?$/i.test((button.textContent || '').trim()))
        if (!start) return 'missing'
        if (document.querySelector('#start-screen')?.classList.contains('hidden')) return 'already-started'
        start.click()
        return 'clicked'
      }).catch((error) => {
        console.warn(`[capture] auto-start failed: ${error.message}`)
        return 'failed'
      })
      step(`auto-start ${result} (${name})`)
      if (result === 'clicked' || result === 'already-started') {
        await page.locator('#start-screen').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
          console.warn(`[capture] start screen did not hide in ${name}; capturing current view`)
        })
        await page.waitForTimeout(1200)
      }
    }

    const screenshot = join(captureDir, `final-${name}.png`)
    step(`capture ${screenshot}`)
    await page.screenshot({ path: screenshot, timeout: 30000 }).catch((error) => {
      if (error.name === 'TimeoutError' || !browser.isConnected()) throw transient(error)
      throw error
    })

    const info = statSync(screenshot)
    const header = readFileSync(screenshot).subarray(0, 24)
    const isPng = header.subarray(0, 8).toString('hex') === '89504e470d0a1a0a'
    const shotWidth = isPng ? header.readUInt32BE(16) : 0
    const shotHeight = isPng ? header.readUInt32BE(20) : 0
    if (!isPng || shotWidth !== width || shotHeight !== height) {
      throw defect(`Screenshot ${screenshot} is not a ${width}x${height} PNG`)
    }
    if (info.size < 10000) {
      throw defect(`Screenshot ${screenshot} looks blank (${info.size} bytes)`)
    }
    step(`saved ${screenshot} (${info.size} bytes)`)

    if (renderErrors.length) {
      renderingDefects.push(...renderErrors.map((error) => `${name}: ${error}`))
    }

    await page.close().catch((error) => {
      console.warn(`[capture] could not close ${name} page: ${error.message}`)
    })
  }

  if (renderingDefects.length) {
    throw defect(`Rendering defects: ${[...new Set(renderingDefects)].join('; ')}`)
  }
} catch (error) {
  console.error(`[capture] ${error.stack || error.message || error}`)
  exitCode = error.exitCode || 1
} finally {
  if (browser) {
    step('close browser')
    await browser.close().catch((error) => {
      console.error(`[capture] browser close failed: ${error.message}`)
      if (!exitCode) exitCode = 75
    })
  }
  process.exitCode = exitCode
}
