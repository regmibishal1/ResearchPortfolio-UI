// Imports one of the app's TypeScript data files (src/app/data/*.ts) from a
// build script, so scripts read the same data the site renders. The files
// must not import anything themselves.
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

export async function loadData(relPath) {
  const source = readFileSync(resolve(root, relPath), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  })
  return import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'))
}
