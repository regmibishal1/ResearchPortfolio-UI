// Builds the Pagefind search index into the built site. Runs after
// finalize-static, so it reads the final <route>.html files and gives each
// page its canonical extensionless URL itself instead of letting Pagefind
// derive one from the file name. Only the page's <main> is indexed, so the
// nav and footer do not match every query. The paper PDFs are added as
// records of their own so a search can find a report directly.
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import * as pagefind from 'pagefind'
import { loadData, root } from './lib/load-data.mjs'

const browser = resolve(root, 'dist/research-portfolio-ui/browser')

// List pages repeat text from the pages they link to, so only the pages
// that hold the content itself are indexed.
const SKIP = new Set(['/', '/project', '/blog', '/world-cup'])
const routes = readFileSync(resolve(root, 'prerender-routes.txt'), 'utf8')
  .split('\n')
  .map((r) => r.trim())
  .filter((r) => r && !SKIP.has(r))

const { PAPERS } = await loadData('src/app/data/projects.ts')

const { index, errors } = await pagefind.createIndex({
  rootSelector: 'main',
  forceLanguage: 'en',
})
if (!index) throw new Error(`pagefind: ${errors.join(', ')}`)

for (const route of routes) {
  const content = readFileSync(join(browser, `${route}.html`), 'utf8')
  const added = await index.addHTMLFile({ url: route, content })
  if (added.errors.length) throw new Error(`pagefind ${route}: ${added.errors.join(', ')}`)
}

for (const project of PAPERS) {
  const added = await index.addCustomRecord({
    url: `/${project.paper.url}`,
    content: `${project.paper.title}. ${project.coursework ?? ''}. ${project.shortDescription}`,
    language: 'en',
    meta: { title: `${project.paper.title} (PDF)` },
  })
  if (added.errors.length) throw new Error(`pagefind paper: ${added.errors.join(', ')}`)
}

const written = await index.writeFiles({ outputPath: join(browser, 'pagefind') })
if (written.errors.length) throw new Error(`pagefind: ${written.errors.join(', ')}`)
await pagefind.close()
console.log(`build-search: ${routes.length} pages and ${PAPERS.length} papers indexed`)
