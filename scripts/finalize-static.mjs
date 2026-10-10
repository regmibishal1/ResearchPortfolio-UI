// Post-build step that shapes the prerendered output for Cloudflare Pages.
//
// 1. Moves each prerendered route from <route>/index.html to <route>.html.
//    Pages serves /about straight from about.html, while about/index.html
//    would make it redirect /about to /about/, away from the canonical URL.
// 2. Points any page whose link preview card is missing at the default card.
// 3. Writes 404.html, a client-only copy of the app shell. Pages serves it
//    with a 404 status for any path that was not prerendered; the app still
//    boots and routes normally there (login, profile, unknown URLs).
import {
  existsSync,
  readFileSync,
  renameSync,
  rmdirSync,
  rmSync,
  readdirSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist/research-portfolio-ui')
const browser = join(dist, 'browser')

// Angular 17-18 write a list of routes; 19 and later write an object keyed by route.
const manifest = JSON.parse(readFileSync(join(dist, 'prerendered-routes.json'), 'utf8'))
const routes = Array.isArray(manifest.routes) ? manifest.routes : Object.keys(manifest.routes)

// Deepest routes first so a parent folder is empty by the time it is checked.
const nested = routes.filter((r) => r !== '/').sort((a, b) => b.length - a.length)
for (const route of nested) {
  const folder = join(browser, route)
  renameSync(join(folder, 'index.html'), `${folder}.html`)
  if (readdirSync(folder).length === 0) rmdirSync(folder)
}

// A page whose preview card has not been rendered yet (a new project or
// post) falls back to the site-wide card instead of a broken image link.
const SITE = 'https://bishalregmi.com'
const DEFAULT_PREVIEW = `${SITE}/assets/og/home.jpg`
const previewTag = /(<meta (?:property="og:image"|name="twitter:image") content=")([^"]+)(")/g
for (const route of routes) {
  const file = route === '/' ? join(browser, 'index.html') : join(browser, `${route}.html`)
  const page = readFileSync(file, 'utf8')
  let missing = ''
  const fixed = page.replace(previewTag, (tag, open, url, close) => {
    if (!url.startsWith(SITE) || existsSync(join(browser, url.slice(SITE.length)))) return tag
    missing = url.slice(SITE.length)
    return open + DEFAULT_PREVIEW + close
  })
  if (missing) {
    console.warn(`finalize-static: ${route} has no ${missing}, using the default card`)
    writeFileSync(file, fixed)
  }
}

const home = readFileSync(join(browser, 'index.html'), 'utf8')
const shell = home
  .replace(/<app-root[^>]*>[\s\S]*<\/app-root>/, '<app-root></app-root>')
  .replace(/<script id="ng-state"[\s\S]*?<\/script>/, '')
  .replace(/<script id="page-jsonld"[\s\S]*?<\/script>/, '')
  .replace(/<link rel="canonical"[^>]*>/, '')
  .replace(
    /<title>[^<]*<\/title>/,
    '<title>Bishal Regmi</title><meta name="robots" content="noindex">'
  )

if (shell.includes('ngh=') || !shell.includes('<app-root></app-root>')) {
  throw new Error('404.html still carries prerendered markup')
}
writeFileSync(join(browser, '404.html'), shell)

// Angular 19+ also emits its own client-only shell; 404.html already covers
// that role, so drop the extra page rather than publish it at /index.csr.
rmSync(join(browser, 'index.csr.html'), { force: true })

console.log(`finalize-static: ${nested.length} routes flattened, 404.html written`)
