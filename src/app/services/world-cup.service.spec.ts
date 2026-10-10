import { TestBed } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TeamRow, WorldCupService } from './world-cup.service'

function row(team: string, pct: Partial<TeamRow>): TeamRow {
  return {
    team,
    winner_pct: 0,
    final_pct: 0,
    sf_pct: 0,
    qf_pct: 0,
    r16_pct: 0,
    r32_pct: 0,
    elo: 1500,
    ...pct,
  }
}

// After the final every team but the champion is at 0% to win; the export
// keeps the API's arbitrary order for those ties.
const bundle = {
  latest: {
    run: { as_of_date: '2026-07-19' },
    leaderboard: [
      row('Spain', { winner_pct: 100, final_pct: 100, sf_pct: 100 }),
      row('Australia', { elo: 1700 }),
      row('France', { sf_pct: 100 }),
      row('Argentina', { final_pct: 100, sf_pct: 100 }),
      row('Austria', { elo: 1800 }),
    ],
  },
  bracket: { as_of_date: '2026-07-19' },
  played: { matches: [] },
  reportCard: { report_card: {} },
  scenarios: null,
  retrospective: { retrospective: {} },
}

describe('WorldCupService', () => {
  let wc: WorldCupService
  let http: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    })
    wc = TestBed.inject(WorldCupService)
    http = TestBed.inject(HttpTestingController)
  })

  afterEach(() => http.verify())

  it('serves the latest run from one shared file, ordered by how far teams got', () => {
    let top: string[] = []
    let matches: unknown
    wc.getLatest({ limit: 3 }).subscribe((r) => (top = r.leaderboard.map((t) => t.team)))
    wc.getPlayedMatches().subscribe((r) => (matches = r))

    http.expectOne('/assets/data/world-cup/latest.json').flush(bundle)

    expect(top).toEqual(['Spain', 'Argentina', 'France'])
    expect(matches).toEqual({ matches: [] })
  })

  it('reads a dated view from the snapshot for that day, fetched once', () => {
    let first: unknown
    let second: unknown
    wc.getBracket({ as_of_date: '2026-07-01' }).subscribe((b) => (first = b))
    http.expectOne('/assets/data/world-cup/snapshots/2026-07-01.json').flush({
      bracket: { as_of_date: '2026-07-01' },
      reportCard: null,
      scenarios: null,
      retrospective: null,
    })
    wc.getBracket({ as_of_date: '2026-07-01' }).subscribe((b) => (second = b))

    expect(first).toEqual({ as_of_date: '2026-07-01' })
    expect(second).toEqual(first)
  })

  it('errors for a view the export does not have, as the API 404 did', () => {
    let failed = false
    wc.getScenarios().subscribe({ error: () => (failed = true) })
    http.expectOne('/assets/data/world-cup/latest.json').flush(bundle)
    expect(failed).toBeTrue()
  })

  it('picks one stage out of the combined history file', () => {
    let series: unknown
    wc.getHistory({ stage: 'qf' }).subscribe((h) => (series = h))
    http.expectOne('/assets/data/world-cup/history.json').flush({ qf: { stage: 'qf', series: [] } })
    expect(series).toEqual({ stage: 'qf', series: [] })
  })
})
