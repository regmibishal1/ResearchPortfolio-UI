import { TestBed } from '@angular/core/testing'
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router'
import { WorldCupComponent } from './world-cup.component'
import { SeoService } from '../../services/seo.service'
import { TeamRow, WorldCupService } from '../../services/world-cup.service'

// The constructor only sets page metadata, so the component can be built
// directly (inside an injection context, with stub services) to exercise the
// pure leaderboard-sorting logic without standing up the full data-loading view.
function makeComponent(): WorldCupComponent {
  TestBed.configureTestingModule({
    providers: [
      { provide: SeoService, useValue: { setPage: () => {} } },
      { provide: WorldCupService, useValue: {} },
      provideRouter([]),
      { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } },
    ],
  })
  return TestBed.runInInjectionContext(() => new WorldCupComponent())
}

function team(name: string, winner: number, elo: number): TeamRow {
  return {
    team: name,
    winner_pct: winner,
    final_pct: winner * 2,
    sf_pct: winner * 3,
    qf_pct: winner * 3.5,
    r16_pct: winner * 4,
    r32_pct: 100,
    elo,
  }
}

describe('WorldCupComponent leaderboard sorting', () => {
  const rows: TeamRow[] = [
    team('Brazil', 25, 2100),
    team('Argentina', 5, 2200),
    team('Canada', 20, 1900),
  ]

  function seed(cmp: WorldCupComponent): void {
    ;(cmp as unknown as { baseLeaderboard: TeamRow[] }).baseLeaderboard = [...rows]
    ;(cmp as unknown as { applyLeaderboardSort: () => void }).applyLeaderboardSort()
  }

  it('defaults to championship probability, highest first', () => {
    const cmp = makeComponent()
    seed(cmp)
    expect(cmp.displayedLeaderboard.map((r) => r.team)).toEqual(['Brazil', 'Canada', 'Argentina'])
  })

  it('sorts the team column alphabetically and reverses on second click', () => {
    const cmp = makeComponent()
    seed(cmp)

    cmp.sortBy('team')
    expect(cmp.sortAsc).toBeTrue()
    expect(cmp.displayedLeaderboard.map((r) => r.team)).toEqual(['Argentina', 'Brazil', 'Canada'])

    cmp.sortBy('team')
    expect(cmp.sortAsc).toBeFalse()
    expect(cmp.displayedLeaderboard.map((r) => r.team)).toEqual(['Canada', 'Brazil', 'Argentina'])
  })

  it('sorts a numeric column descending by default', () => {
    const cmp = makeComponent()
    seed(cmp)

    cmp.sortBy('elo')
    expect(cmp.displayedLeaderboard.map((r) => r.team)).toEqual(['Argentina', 'Brazil', 'Canada'])
    expect(cmp.sortIcon('elo')).toBe('arrow_downward')
    expect(cmp.ariaSort('elo')).toBe('descending')
    expect(cmp.sortIcon('winner_pct')).toBe('unfold_more')
  })

  it('sorts by the snapshot delta when that column is active', () => {
    const cmp = makeComponent()
    cmp.deltaMap = new Map([
      ['Brazil', -3],
      ['Argentina', 5],
      ['Canada', 0],
    ])
    seed(cmp)

    cmp.sortBy('delta')
    expect(cmp.displayedLeaderboard.map((r) => r.team)).toEqual(['Argentina', 'Canada', 'Brazil'])

    cmp.sortBy('delta')
    expect(cmp.displayedLeaderboard.map((r) => r.team)).toEqual(['Brazil', 'Canada', 'Argentina'])
  })
})

describe('WorldCupComponent accuracy', () => {
  it('works from the count of correct calls, not the rounded rate', () => {
    const cmp = makeComponent()
    const pct = cmp.accuracyPct({ n: 104, accuracy: 0.6635, brier: null, log_loss: null })
    expect(pct.toFixed(1)).toBe('66.3')
    expect(cmp.accuracyPct({ n: 0, accuracy: null, brier: null, log_loss: null })).toBe(0)
  })
})

describe('WorldCupComponent tabs', () => {
  type Internals = {
    retro: { complete: boolean } | null
    latest: { run: { n_played_matches_locked: number } } | null
    scenarioViews: unknown[]
  }

  function setup(complete: boolean, scenarios: number): WorldCupComponent {
    const cmp = makeComponent()
    const state = cmp as unknown as Internals
    state.retro = { complete }
    state.latest = { run: { n_played_matches_locked: complete ? 104 : 80 } }
    state.scenarioViews = new Array(scenarios).fill({})
    return cmp
  }

  it('shows four tabs once the tournament is complete, starting with the wrap-up', () => {
    const cmp = setup(true, 2)
    expect(cmp.tabs.map((t) => t.slug)).toEqual(['wrap-up', 'bracket', 'odds', 'grades'])
  })

  it('swaps in standings and the what-if view for snapshots before the final', () => {
    const cmp = setup(false, 2)
    expect(cmp.tabs.map((t) => t.slug)).toEqual([
      'standings',
      'bracket',
      'odds',
      'grades',
      'what-if',
    ])
  })

  it('opens the tab named in the URL and falls back to the first for any other', () => {
    const cmp = setup(true, 0)
    cmp.tabSlug = 'odds'
    expect(cmp.selectedTabIndex).toBe(2)
    cmp.tabSlug = 'what-if'
    expect(cmp.selectedTabIndex).toBe(0)
    cmp.tabSlug = 'nonsense'
    expect(cmp.selectedTabIndex).toBe(0)
  })

  it('previews the top eight teams until all are asked for', () => {
    const cmp = setup(true, 0)
    cmp.displayedLeaderboard = Array.from({ length: 48 }, (_, i) => team(`T${i}`, 48 - i, 1500))
    expect(cmp.visibleStandings.length).toBe(8)
    cmp.showAllTeams = true
    expect(cmp.visibleStandings.length).toBe(48)
  })
})
