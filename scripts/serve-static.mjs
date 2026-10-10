// Serves the built site the way Cloudflare Pages does, for the accessibility
// and Lighthouse checks in CI and for local runs of them:
//   /about -> about.html, / -> index.html
//   the 200 rewrites in src/_redirects (app-only routes -> 404.html)
//   anything else -> 404.html with a 404 status
//   gzip when the client accepts it, as the edge compresses responses
// Usage: node scripts/serve-static.mjs [dir] [port]
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import { gzipSync } from 'node:zlib'

const dir = resolve(process.argv[2] ?? 'dist/research-portfolio-ui/browser')
const port = Number(process.argv[3] ?? 4300)

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2',
  '.wasm': 'application/wasm',
}
const COMPRESSIBLE = new Set(['.html', '.js', '.mjs', '.css', '.json', '.xml', '.txt', '.svg'])

// "/login /404 200" lines from _redirects.
const rewrites = new Map()
try {
  for (const line of readFileSync(join(dir, '_redirects'), 'utf8').split('\n')) {
    const [from, to, code] = line.trim().split(/\s+/)
    if (code === '200') rewrites.set(from, to)
  }
} catch {
  // No _redirects in this build.
}

const isFile = async (p) => {
  try {
    return (await stat(p)).isFile()
  } catch {
    return false
  }
}

async function locate(pathname) {
  const target = rewrites.get(pathname) ?? pathname
  const candidates =
    target === '/'
      ? ['/index.html']
      : [target, `${target}.html`, `${target.replace(/\/$/, '')}.html`]
  for (const candidate of candidates) {
    const file = join(dir, candidate)
    if (file.startsWith(dir) && (await isFile(file))) return { file, status: 200 }
  }
  return { file: join(dir, '404.html'), status: 404 }
}

createServer(async (req, res) => {
  let pathname
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
  } catch {
    res.writeHead(400).end()
    return
  }
  const { file, status } = await locate(pathname)
  const ext = extname(file)
  let body = await readFile(file)
  const headers = { 'content-type': TYPES[ext] ?? 'application/octet-stream' }
  if (COMPRESSIBLE.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] ?? '')) {
    body = gzipSync(body)
    headers['content-encoding'] = 'gzip'
    headers.vary = 'Accept-Encoding'
  }
  res.writeHead(status, headers)
  res.end(req.method === 'HEAD' ? undefined : body)
}).listen(port, () => console.log(`serve-static: ${dir} on http://localhost:${port}`))
