// Freezes the finished 2026 World Cup data into static files the site serves
// itself, so the dashboard no longer depends on the API being up.
//
// Usage (needs the API base URL and its API key; nothing secret is written):
//   WORLDCUP_API_URL=http://<api-host> FASTAPI_API_KEY=<key> node scripts/export-worldcup.mjs
//
// Writes to src/assets/data/world-cup/:
//   latest.json             what the page loads on open (latest run, bracket,
//                           played matches, report card, scenarios, wrap-up)
//   history.json            odds history for every stage, keyed by stage
//   snapshots/<date>.json   bracket, report card, scenarios and wrap-up as of
//                           each daily snapshot, loaded when that date is picked
// A response the API does not have (404) is stored as null.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const base = process.env.WORLDCUP_API_URL
const key = process.env.FASTAPI_API_KEY
if (!base || !key) {
  console.error('Set WORLDCUP_API_URL and FASTAPI_API_KEY.')
  process.exit(1)
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'src/assets/data/world-cup')
const TOURNAMENT = '2026'
const STAGES = ['winner', 'final', 'sf', 'qf', 'r16', 'r32']

async function get(path, params = {}) {
  const url = new URL(`${base.replace(/\/$/, '')}/worldcup/${path}`)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url, { headers: { 'X-API-Key': key } })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`${res.status} for ${url.pathname}${url.search}`)
  return res.json()
}

function write(rel, data) {
  const file = join(out, rel)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify(data) + '\n')
}

const t = { tournament: TOURNAMENT }
write('latest.json', {
  latest: await get('latest', { limit: '48' }),
  bracket: await get('bracket', t),
  played: await get('played-matches', t),
  reportCard: await get('report-card', t),
  scenarios: await get('scenarios', t),
  retrospective: await get('retrospective', t),
})

const history = {}
for (const stage of STAGES) history[stage] = await get('history', { stage })
write('history.json', history)

const dates = [
  ...new Set(history.winner.series.flatMap((s) => s.points.map((p) => p.as_of_date))),
].sort()
for (const date of dates) {
  const d = { ...t, as_of_date: date }
  write(`snapshots/${date}.json`, {
    bracket: await get('bracket', d),
    reportCard: await get('report-card', d),
    scenarios: await get('scenarios', d),
    retrospective: await get('retrospective', d),
  })
}

console.log(`export-worldcup: latest, ${STAGES.length} stage histories, ${dates.length} snapshots`)
