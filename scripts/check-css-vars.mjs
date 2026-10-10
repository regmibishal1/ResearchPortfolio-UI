// Fails when a stylesheet, template or component uses var(--x) for a custom
// property that is defined nowhere. An undefined property fails silently in
// the browser (the declaration is just dropped), so a typo or a removed token
// would otherwise go unnoticed.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { root } from './lib/load-data.mjs'

const SOURCES = ['src']
const EXTENSIONS = /\.(scss|css|html|ts)$/
// Properties set by libraries at runtime rather than in this repo's sources.
const EXTERNAL = [/^--mat-/, /^--mdc-/, /^--pagefind-/]

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return name === 'assets' ? [] : walk(path)
    return EXTENSIONS.test(name) ? [path] : []
  })

const files = SOURCES.flatMap((dir) => walk(join(root, dir))).map((path) => ({
  path,
  text: readFileSync(path, 'utf8'),
}))

// Definitions: "--name:" in styles, and [style.--name] or setProperty('--name') in code.
const defined = new Set()
for (const { text } of files) {
  for (const m of text.matchAll(/(--[\w-]+)\s*:/g)) defined.add(m[1])
  for (const m of text.matchAll(/style\.(--[\w-]+)/g)) defined.add(m[1])
  for (const m of text.matchAll(/setProperty\(\s*['"](--[\w-]+)['"]/g)) defined.add(m[1])
}

const problems = []
for (const { path, text } of files) {
  for (const m of text.matchAll(/var\(\s*(--[\w-]+)/g)) {
    const name = m[1]
    if (defined.has(name) || EXTERNAL.some((re) => re.test(name))) continue
    const line = text.slice(0, m.index).split('\n').length
    problems.push(`${relative(root, path).split(sep).join('/')}:${line}  ${name} is not defined`)
  }
}

if (problems.length) {
  console.error(
    `check-css-vars: ${problems.length} undefined custom properties\n${problems.join('\n')}`
  )
  process.exit(1)
}
console.log(`check-css-vars: every var() is defined (${defined.size} custom properties)`)
