import { Meta, Title } from '@angular/platform-browser'

import { WorldCupComponent } from './world-cup.component'
import { TeamRow, WorldCupService } from '../../services/world-cup.service'

// The constructor only sets title and meta, so the component can be built
// directly to exercise the pure leaderboard-sorting logic without standing up
// the full data-loading view.
function makeComponent(): WorldCupComponent {
  const title = { setTitle: () => {} } as unknown as Title
  const meta = { updateTag: () => {} } as unknown as Meta
  return new WorldCupComponent({} as unknown as WorldCupService, title, meta)
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
    (cmp as unknown as { baseLeaderboard: TeamRow[] }).baseLeaderboard = [...rows]
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
