// Runs ng build with the build date compiled in as BUILD_DATE, which the
// footer shows as "Last updated". Extra arguments are passed through.
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'

const ng = createRequire(import.meta.url).resolve('@angular/cli/bin/ng.js')
const date = new Date().toISOString().slice(0, 10)
const { status } = spawnSync(
  process.execPath,
  [ng, 'build', '--define', `BUILD_DATE='${date}'`, ...process.argv.slice(2)],
  { stdio: 'inherit' }
)
process.exit(status ?? 1)
