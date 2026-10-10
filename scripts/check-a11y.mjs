// Runs axe-core (full default rule set) on every prerendered page, plus the
// app-only pages, at a desktop and a narrow phone width, against the built
// site served the way Cloudflare Pages serves it. Fails on any violation.
// Run after `yarn build`; needs Playwright's Chromium (npx playwright install chromium).
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium } from 'playwright'
import { AxeBuilder } from '@axe-core/playwright'
import { root } from './lib/load-data.mjs'

const PORT = 4310
const BASE = `http://localhost:${PORT}`
const WIDTHS = [1280, 320]
const APP_ONLY = ['/login', '/reset']

const routes = [
  ...readFileSync(resolve(root, 'prerender-routes.txt'), 'utf8')
    .split('\n')
    .map((r) => r.trim())
    .filter(Boolean),
  ...APP_ONLY,
]

const server = spawn(
  process.execPath,
  [resolve(root, 'scripts/serve-static.mjs'), 'dist/research-portfolio-ui/browser', String(PORT)],
  { cwd: root, stdio: 'ignore' }
)
const stop = () => server.kill()

async function waitForServer() {
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch(BASE)).ok) return
    } catch {
      // Not up yet.
    }
    await new Promise((r) => setTimeout(r, 100))
  }
  throw new Error('check-a11y: the static server did not start')
}

let failures = 0
try {
  await waitForServer()
  const browser = await chromium.launch()
  for (const width of WIDTHS) {
    const context = await browser.newContext({ viewport: { width, height: 900 } })
    const page = await context.newPage()
    for (const route of routes) {
      await page.goto(BASE + route, { waitUntil: 'networkidle' })
      const { violations } = await new AxeBuilder({ page }).analyze()
      if (violations.length) {
        failures += violations.length
        for (const v of violations) {
          console.error(
            `${route} @${width}: ${v.id} (${v.impact}) x${v.nodes.length}: ${v.nodes[0].target.join(' ')}`
          )
        }
      }
    }
    await context.close()
  }
  await browser.close()
} finally {
  stop()
}

if (failures) {
  console.error(`check-a11y: ${failures} violations`)
  process.exit(1)
}
console.log(`check-a11y: ${routes.length} pages clean at ${WIDTHS.join(' and ')} px`)
