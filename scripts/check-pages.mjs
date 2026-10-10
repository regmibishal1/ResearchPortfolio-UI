// Checks every prerendered page in the build output:
//   - page weight: at most 150 KB raw and 25 KB gzipped, so a heavy
//     component cannot creep back onto a page unnoticed;
//   - meta description: present and at most 160 characters, since search
//     results cut longer ones off.
// Run after `yarn build`.
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { gzipSync } from 'node:zlib'
import { root } from './lib/load-data.mjs'

const MAX_RAW = 150 * 1024
const MAX_GZIP = 25 * 1024
const MAX_DESCRIPTION = 160

const browser = resolve(root, 'dist/research-portfolio-ui/browser')
const routes = readFileSync(resolve(root, 'prerender-routes.txt'), 'utf8')
  .split('\n')
  .map((r) => r.trim())
  .filter(Boolean)

const decode = (s) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')

const problems = []
let heaviest = { route: '', raw: 0, gzip: 0 }
for (const route of routes) {
  const file = join(browser, route === '/' ? 'index.html' : `${route}.html`)
  const html = readFileSync(file)
  const raw = html.length
  const gzip = gzipSync(html).length
  if (raw > heaviest.raw) heaviest = { route, raw, gzip }
  if (raw > MAX_RAW) problems.push(`${route}: ${(raw / 1024).toFixed(1)} KB raw (limit 150 KB)`)
  if (gzip > MAX_GZIP)
    problems.push(`${route}: ${(gzip / 1024).toFixed(1)} KB gzipped (limit 25 KB)`)

  const match = html.toString().match(/<meta name="description" content="([^"]*)"/)
  const description = match ? decode(match[1]) : ''
  if (!description) problems.push(`${route}: no meta description`)
  else if (description.length > MAX_DESCRIPTION) {
    problems.push(`${route}: description is ${description.length} characters (limit 160)`)
  }
}

if (problems.length) {
  console.error(`check-pages: ${problems.length} problems\n${problems.join('\n')}`)
  process.exit(1)
}
console.log(
  `check-pages: ${routes.length} pages within limits; heaviest ${heaviest.route} at ` +
    `${(heaviest.raw / 1024).toFixed(1)} KB raw, ${(heaviest.gzip / 1024).toFixed(1)} KB gzipped`
)
