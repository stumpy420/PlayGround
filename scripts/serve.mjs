import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, resolve, sep } from 'node:path'

const root = resolve(process.argv[2] || 'dist')
const port = Number(process.env.PORT || 3000)

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`Invalid PORT: ${process.env.PORT}`)
  process.exit(1)
}

const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.glb': 'model/gltf-binary',
  '.html': 'text/html; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
}

function send(res, status, body) {
  res.writeHead(status, {
    'Cache-Control': 'no-store',
    'Content-Type': 'text/plain; charset=utf-8',
  })
  res.end(body)
}

const server = createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD')
    send(res, 405, 'Method not allowed')
    return
  }

  try {
    const url = new URL(req.url || '/', 'http://localhost')
    let pathname
    try {
      pathname = decodeURIComponent(url.pathname)
    } catch {
      send(res, 400, 'Bad request')
      return
    }

    let file = resolve(root, '.' + pathname)
    if (file !== root && !file.startsWith(root + sep)) {
      send(res, 404, 'Not found')
      return
    }

    let info = await stat(file).catch(() => null)
    if (info?.isDirectory()) {
      file = resolve(file, 'index.html')
      info = await stat(file).catch(() => null)
    }
    if (!info?.isFile()) {
      send(res, 404, 'Not found')
      return
    }

    res.writeHead(200, {
      'Cache-Control': 'no-store',
      'Content-Length': info.size,
      'Content-Type': MIME[extname(file).toLowerCase()] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
    })
    if (req.method === 'HEAD') {
      res.end()
      return
    }
    createReadStream(file).pipe(res)
  } catch (error) {
    console.error(error)
    send(res, 500, 'Internal server error')
  }
})

server.listen(port, '0.0.0.0', () => {
  console.log(`Serving ${root} on http://0.0.0.0:${port}`)
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)))
}
