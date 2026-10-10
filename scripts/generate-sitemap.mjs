// Builds src/sitemap.xml and prerender-routes.txt from the project and blog
// data so neither can drift from what the site actually publishes. Runs
// before every build; hidden projects are excluded because PROJECTS already
// filters them. Every sitemap URL is prerendered to static HTML.
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { loadData, root } from './lib/load-data.mjs'

const SITE = 'https://bishalregmi.com'

const { PROJECTS } = await loadData('src/app/data/projects.ts')
const { POSTS } = await loadData('src/app/data/blog.ts')

const latestPost = POSTS.map((p) => p.date)
  .sort()
  .at(-1)

const urls = [
  { path: '/' },
  { path: '/about' },
  { path: '/resume' },
  { path: '/project' },
  ...PROJECTS.map((p) => ({ path: `/project/${p.id}` })),
  { path: '/world-cup' },
  { path: '/blog', lastmod: latestPost },
  ...POSTS.map((p) => ({ path: `/blog/${p.slug}`, lastmod: p.date })),
]

const body = urls
  .map(({ path, lastmod }) => {
    const lines = [`    <loc>${SITE}${path}</loc>`]
    if (lastmod) lines.push(`    <lastmod>${lastmod}</lastmod>`)
    return `  <url>\n${lines.join('\n')}\n  </url>`
  })
  .join('\n')

const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  body +
  '\n</urlset>\n'

writeFileSync(resolve(root, 'src/sitemap.xml'), xml)
writeFileSync(resolve(root, 'prerender-routes.txt'), urls.map((u) => u.path).join('\n') + '\n')
console.log(`sitemap.xml and prerender-routes.txt: ${urls.length} routes`)
