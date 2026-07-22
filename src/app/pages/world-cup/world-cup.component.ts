import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common'
import { RouterModule } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { MatIconModule } from '@angular/material/icon'
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { Title, Meta } from '@angular/platform-browser'
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  CategoryScale,
  Legend,
  Tooltip,
} from 'chart.js'
import { forkJoin, of } from 'rxjs'
import { catchError } from 'rxjs/operators'
import {
  BracketResponse,
  HistoryResponse,
  HistoryStage,
  LatestResponse,
  MatchDetail,
  PlayedMatch,
  PlayedMatchesResponse,
  ReportCard,
  ReportCardResponse,
  Retrospective,
  RetrospectiveResponse,
  Scenarios,
  ScenariosResponse,
  TeamRow,
  WorldCupService,
} from '../../services/world-cup.service'

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  TimeScale,
  Legend,
  Tooltip
)

const PALETTE = [
  '#f0c040',
  '#4ade80',
  '#f9e2af',
  '#fab387',
  '#f87171',
  '#cba6f7',
  '#94e2d5',
  '#f5c2e7',
  '#74c7ec',
  '#eba0ac',
]

const STAGE_LABELS: Record<HistoryStage, string> = {
  winner: 'Championship',
  final: 'Final',
  sf: 'Semi-finals',
  qf: 'Quarter-finals',
  r16: 'Round of 16',
  r32: 'Round of 32',
}

const KO_ROUND_LABELS: Record<string, string> = {
  R32: 'Round of 32',
  R16: 'Round of 16',
  QF: 'Quarter-final',
  SF: 'Semi-final',
  Final: 'Final',
}

const KO_ORDER = ['Round of 32', 'Round of 16', 'Quarter-final', 'Semi-final', 'Final']

interface EnrichedMatch extends PlayedMatch {
  round_label: string
  is_knockout: boolean
  went_to_penalties: boolean
  penalty_winner: string | null
}

interface DateGroup {
  date: string
  matches: EnrichedMatch[]
}

interface RoundGroup {
  round: string
  is_knockout: boolean
  match_count: number
  dateGroups: DateGroup[]
}

/** Leaderboard columns that can be sorted. 'delta' reads from the delta map,
 *  which only exists on historical snapshots. */
type WcSortKey =
  | 'team'
  | 'winner_pct'
  | 'delta'
  | 'final_pct'
  | 'sf_pct'
  | 'qf_pct'
  | 'r16_pct'
  | 'r32_pct'
  | 'elo'

/** Only the team name reads better ascending; probabilities lead with the top. */
const WC_TEXT_COLUMNS: ReadonlySet<WcSortKey> = new Set<WcSortKey>(['team'])

@Component({
  selector: 'app-world-cup',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    DatePipe,
    DecimalPipe,
  ],
  templateUrl: './world-cup.component.html',
  styleUrl: './world-cup.component.scss',
})
export class WorldCupComponent implements OnInit, OnDestroy {
  @ViewChild('historyCanvas') historyCanvas?: ElementRef<HTMLCanvasElement>
  @ViewChild('calibCanvas') calibCanvas?: ElementRef<HTMLCanvasElement>

  loading = true
  error: string | null = null
  bracketLoading = false

  latest: LatestResponse | null = null
  bracket: BracketResponse | null = null
  playedMatches: PlayedMatchesResponse | null = null

  private latestBracket: BracketResponse | null = null
  private stageHistories: Partial<Record<HistoryStage, HistoryResponse>> = {}

  groupKeys: string[] = []
  groupStageRounds: RoundGroup[] = []
  knockoutRounds: RoundGroup[] = []

  bracketHalves: {
    left: {
      r32: string[][]
      r16: string[][]
      qf: string[][]
      sf: string[][]
      r32Details: MatchDetail[]
      r16Details: MatchDetail[]
      qfDetails: MatchDetail[]
      sfDetails: MatchDetail[]
    }
    right: {
      r32: string[][]
      r16: string[][]
      qf: string[][]
      sf: string[][]
      r32Details: MatchDetail[]
      r16Details: MatchDetail[]
      qfDetails: MatchDetail[]
      sfDetails: MatchDetail[]
    }
  } | null = null

  finalDetail: MatchDetail | null = null
  bronzeDetail: MatchDetail | null = null

  advancers: { r32: Set<string>; r16: Set<string>; qf: Set<string>; sf: Set<string> } = {
    r32: new Set(),
    r16: new Set(),
    qf: new Set(),
    sf: new Set(),
  }

  openFactors = new Set<string>()

  reportCard: ReportCard | null = null
  scenarios: Scenarios | null = null
  retro: Retrospective | null = null
  private latestReportCard: ReportCard | null = null
  private latestScenarios: Scenarios | null = null
  private latestRetro: Retrospective | null = null
  // Per-scenario selected side, keyed by scenario index. Defaults to the
  // first team of each pairing.
  scenarioPick = new Map<number, string>()
  scenarioViews: Array<{
    round: string
    teams: string[]
    pWin: number[]
    pick: string
    rows: Array<{ team: string; winner_pct: number; delta: number }>
  }> = []
  showReceipts = false

  private historyIndex = new Map<string, Map<string, Partial<Record<HistoryStage, number>>>>()
  private dateLockMap = new Map<string, number>()

  availableDates: string[] = []
  dateOptions: Array<{ value: string; label: string }> = []
  selectedDate = ''
  selectedHistoryStage: HistoryStage = 'winner'

  displayedLeaderboard: TeamRow[] = []
  private baseLeaderboard: TeamRow[] = []
  deltaMap = new Map<string, number>()

  sortKey: WcSortKey = 'winner_pct'
  sortAsc = false

  lockedMatchesForDate: EnrichedMatch[] = []
  showLockedMatches = false
  private enrichedMatches: EnrichedMatch[] = []

  readonly stageOptions: Array<{ value: HistoryStage; label: string }> = [
    { value: 'winner', label: 'Championship' },
    { value: 'final', label: 'Final' },
    { value: 'sf', label: 'Semi-finals' },
    { value: 'qf', label: 'Quarter-finals' },
    { value: 'r16', label: 'Round of 16' },
    { value: 'r32', label: 'Round of 32' },
  ]

  readonly STAGE_LABELS = STAGE_LABELS

  private chart: Chart | null = null
  private calibChart: Chart | null = null

  constructor(
    private wc: WorldCupService,
    title: Title,
    meta: Meta
  ) {
    title.setTitle('World Cup 2026 Live Predictions | Bishal Regmi')
    meta.updateTag({
      name: 'description',
      content:
        'Live calibrated XGBoost + Monte Carlo predictions for the FIFA World Cup 2026. ' +
        'Updated daily with locked-in match results.',
    })
  }

  ngOnInit(): void {
    const nil = of(null as HistoryResponse | null)
    const h = (stage: HistoryStage) => this.wc.getHistory({ stage }).pipe(catchError(() => nil))

    forkJoin({
      latest: this.wc.getLatest({ limit: 48 }),
      bracket: this.wc.getBracket(),
      played: this.wc.getPlayedMatches(),
      report: this.wc.getReportCard().pipe(catchError(() => of(null as ReportCardResponse | null))),
      whatIf: this.wc.getScenarios().pipe(catchError(() => of(null as ScenariosResponse | null))),
      wrapUp: this.wc
        .getRetrospective()
        .pipe(catchError(() => of(null as RetrospectiveResponse | null))),
      hWinner: h('winner'),
      hFinal: h('final'),
      hSF: h('sf'),
      hQF: h('qf'),
      hR16: h('r16'),
      hR32: h('r32'),
    }).subscribe({
      next: ({
        latest,
        bracket,
        played,
        report,
        whatIf,
        wrapUp,
        hWinner,
        hFinal,
        hSF,
        hQF,
        hR16,
        hR32,
      }) => {
        this.latest = latest
        this.latestBracket = bracket
        this.bracket = bracket
        this.playedMatches = played
        this.latestReportCard = report?.report_card ?? null
        this.latestScenarios = whatIf?.scenarios ?? null
        this.latestRetro = wrapUp?.retrospective ?? null
        this.reportCard = this.latestReportCard
        this.scenarios = this.latestScenarios
        this.retro = this.latestRetro
        this.buildScenarioViews()

        const histories: Partial<Record<HistoryStage, HistoryResponse>> = {}
        if (hWinner) histories.winner = hWinner
        if (hFinal) histories.final = hFinal
        if (hSF) histories.sf = hSF
        if (hQF) histories.qf = hQF
        if (hR16) histories.r16 = hR16
        if (hR32) histories.r32 = hR32
        this.stageHistories = histories

        this.buildHistoryIndex(histories)

        this.groupKeys = Object.keys(bracket.group_winners).sort()
        this.enrichedMatches = this.enrichPlayedMatches(played, bracket)
        const split = this.splitRoundGroups(this.enrichedMatches)
        this.groupStageRounds = split.group
        this.knockoutRounds = split.knockout

        this.bracketHalves = this.computeBracketHalves(bracket)
        this.advancers = this.computeAdvancers(bracket)
        this.finalDetail = bracket.match_details?.['Final']?.[0] ?? null
        this.bronzeDetail = bracket.match_details?.['Bronze']?.[0] ?? null

        if (this.availableDates.length > 0) {
          this.selectedDate = this.availableDates[0]
        }
        this.rebuildDisplayedLeaderboard()
        this.rebuildLockedMatchesForDate()

        this.loading = false
        setTimeout(() => {
          this.renderHistoryChart()
          this.renderCalibrationChart()
        })
      },
      error: (err) => {
        this.loading = false
        this.error =
          err?.error?.detail ??
          err?.message ??
          'Could not load predictions. The backend may still be warming up.'
      },
    })
  }

  ngOnDestroy(): void {
    this.chart?.destroy()
    this.calibChart?.destroy()
  }

  // Snapshot date selection

  get isLatestDate(): boolean {
    return !this.availableDates.length || this.selectedDate === this.availableDates[0]
  }

  get lockedCountForDate(): number {
    return this.dateLockMap.get(this.selectedDate) ?? 0
  }

  // Performance grading and what-if conditionals only make sense once the
  // knockout field is set, i.e. all 72 group matches are locked in the
  // selected snapshot.
  get analyticsUnlocked(): boolean {
    const locked = this.isLatestDate
      ? this.latest?.run.n_played_matches_locked ?? this.lockedCountForDate
      : this.lockedCountForDate
    return locked >= 72
  }

  // The tournament is over: the latest run's retrospective is complete.
  // Drives the final-state hero copy regardless of the selected snapshot.
  get finished(): boolean {
    return !!this.latestRetro?.complete
  }

  onDateChange(): void {
    this.rebuildDisplayedLeaderboard()
    this.rebuildLockedMatchesForDate()
    if (this.isLatestDate) {
      if (this.latestBracket) {
        this.bracket = this.latestBracket
        this.bracketHalves = this.computeBracketHalves(this.latestBracket)
        this.advancers = this.computeAdvancers(this.latestBracket)
        this.finalDetail = this.latestBracket.match_details?.['Final']?.[0] ?? null
        this.bronzeDetail = this.latestBracket.match_details?.['Bronze']?.[0] ?? null
        this.groupKeys = Object.keys(this.latestBracket.group_winners).sort()
      }
      this.applyAnalytics(this.latestReportCard, this.latestScenarios, this.latestRetro)
    } else {
      this.fetchHistoricalBracket()
      this.fetchHistoricalAnalytics()
    }
  }

  resetToLatest(): void {
    if (this.availableDates.length > 0) {
      this.selectedDate = this.availableDates[0]
      this.onDateChange()
    }
  }

  private fetchHistoricalBracket(): void {
    this.bracketLoading = true
    this.wc.getBracket({ as_of_date: this.selectedDate }).subscribe({
      next: (b) => {
        this.bracket = b
        this.bracketHalves = this.computeBracketHalves(b)
        this.advancers = this.computeAdvancers(b)
        this.finalDetail = b.match_details?.['Final']?.[0] ?? null
        this.bronzeDetail = b.match_details?.['Bronze']?.[0] ?? null
        this.groupKeys = Object.keys(b.group_winners).sort()
        this.bracketLoading = false
      },
      error: () => {
        this.bracketLoading = false
      },
    })
  }

  private fetchHistoricalAnalytics(): void {
    const date = this.selectedDate
    forkJoin({
      report: this.wc
        .getReportCard({ as_of_date: date })
        .pipe(catchError(() => of(null as ReportCardResponse | null))),
      whatIf: this.wc
        .getScenarios({ as_of_date: date })
        .pipe(catchError(() => of(null as ScenariosResponse | null))),
      wrapUp: this.wc
        .getRetrospective({ as_of_date: date })
        .pipe(catchError(() => of(null as RetrospectiveResponse | null))),
    }).subscribe(({ report, whatIf, wrapUp }) => {
      // A slow response for a date the user has already navigated away
      // from must not clobber the current view.
      if (this.selectedDate !== date) return
      this.applyAnalytics(
        report?.report_card ?? null,
        whatIf?.scenarios ?? null,
        wrapUp?.retrospective ?? null
      )
    })
  }

  private applyAnalytics(
    reportCard: ReportCard | null,
    scenarios: Scenarios | null,
    retro: Retrospective | null
  ): void {
    this.reportCard = reportCard
    this.scenarios = scenarios
    this.retro = retro
    this.scenarioPick.clear()
    this.buildScenarioViews()
    setTimeout(() => this.renderCalibrationChart())
  }

  private rebuildDisplayedLeaderboard(): void {
    if (!this.latest) return

    if (this.isLatestDate || !this.historyIndex.has(this.selectedDate)) {
      this.baseLeaderboard = [...this.latest.leaderboard]
      this.deltaMap.clear()
      // The delta column is gone on the latest snapshot; fall back if it was active.
      if (this.sortKey === 'delta') this.sortKey = 'winner_pct'
      this.applyLeaderboardSort()
      return
    }

    const dateData = this.historyIndex.get(this.selectedDate)!
    const rows: TeamRow[] = this.latest.leaderboard.map((base) => {
      const sv = dateData.get(base.team) ?? {}
      return {
        team: base.team,
        winner_pct: sv.winner ?? 0,
        final_pct: sv.final ?? 0,
        sf_pct: sv.sf ?? 0,
        qf_pct: sv.qf ?? 0,
        r16_pct: sv.r16 ?? 0,
        r32_pct: sv.r32 ?? 0,
        elo: base.elo,
      }
    })
    this.baseLeaderboard = rows

    this.deltaMap.clear()
    const curIdx = this.availableDates.indexOf(this.selectedDate)
    const prevDate = this.availableDates[curIdx + 1]
    if (prevDate) {
      const prevData = this.historyIndex.get(prevDate)
      for (const row of rows) {
        const prev = prevData?.get(row.team)?.winner ?? 0
        const delta = row.winner_pct - prev
        if (Math.abs(delta) > 0.005) this.deltaMap.set(row.team, delta)
      }
    }

    this.applyLeaderboardSort()
  }

  /** Click a column header to sort by it; click the active column to reverse. */
  sortBy(key: WcSortKey): void {
    if (this.sortKey === key) {
      this.sortAsc = !this.sortAsc
    } else {
      this.sortKey = key
      this.sortAsc = WC_TEXT_COLUMNS.has(key)
    }
    this.applyLeaderboardSort()
  }

  sortIcon(key: WcSortKey): string {
    if (this.sortKey !== key) return 'unfold_more'
    return this.sortAsc ? 'arrow_upward' : 'arrow_downward'
  }

  ariaSort(key: WcSortKey): 'ascending' | 'descending' | 'none' {
    if (this.sortKey !== key) return 'none'
    return this.sortAsc ? 'ascending' : 'descending'
  }

  private applyLeaderboardSort(): void {
    this.displayedLeaderboard = [...this.baseLeaderboard].sort((a, b) => this.compareTeams(a, b))
  }

  private teamValue(row: TeamRow, key: WcSortKey): number | string {
    if (key === 'delta') return this.deltaMap.get(row.team) ?? 0
    if (key === 'team') return row.team
    return row[key]
  }

  private compareTeams(a: TeamRow, b: TeamRow): number {
    const dir = this.sortAsc ? 1 : -1
    const av = this.teamValue(a, this.sortKey)
    const bv = this.teamValue(b, this.sortKey)
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
    return String(av).localeCompare(String(bv)) * dir
  }

  private rebuildLockedMatchesForDate(): void {
    this.lockedMatchesForDate = this.selectedDate
      ? this.enrichedMatches.filter((m) => m.match_date <= this.selectedDate)
      : this.enrichedMatches
  }

  onHistoryStageChange(): void {
    setTimeout(() => this.renderHistoryChart())
  }

  // Played match enrichment

  private buildKnockoutLookup(
    bracket: BracketResponse
  ): Map<string, { round: string; went_to_penalties: boolean; winner: string | null }> {
    const lookup = new Map<
      string,
      { round: string; went_to_penalties: boolean; winner: string | null }
    >()
    for (const [key, label] of Object.entries(KO_ROUND_LABELS)) {
      for (const d of bracket.match_details?.[key] ?? []) {
        const pairKey = [...d.teams].sort().join('|')
        lookup.set(pairKey, {
          round: label,
          went_to_penalties: d.went_to_penalties,
          winner: d.winner,
        })
      }
    }
    return lookup
  }

  private enrichPlayedMatches(
    played: PlayedMatchesResponse,
    bracket: BracketResponse
  ): EnrichedMatch[] {
    const koLookup = this.buildKnockoutLookup(bracket)
    const koStart = '2026-06-28'
    return played.matches.map((m) => {
      if (m.match_date >= koStart) {
        const key = [m.home_team, m.away_team].sort().join('|')
        const ko = koLookup.get(key)
        if (ko) {
          return {
            ...m,
            round_label: ko.round,
            is_knockout: true,
            went_to_penalties: ko.went_to_penalties,
            penalty_winner: ko.winner,
          }
        }
      }
      return {
        ...m,
        round_label: m.group_name ? `Group ${m.group_name}` : 'Group Stage',
        is_knockout: false,
        went_to_penalties: false,
        penalty_winner: null,
      }
    })
  }

  private splitRoundGroups(enriched: EnrichedMatch[]): {
    group: RoundGroup[]
    knockout: RoundGroup[]
  } {
    const byRound = new Map<string, EnrichedMatch[]>()
    for (const m of enriched) {
      const list = byRound.get(m.round_label) ?? []
      list.push(m)
      byRound.set(m.round_label, list)
    }

    const toGroup = (round: string, matches: EnrichedMatch[]): RoundGroup => ({
      round,
      is_knockout: KO_ORDER.includes(round),
      match_count: matches.length,
      dateGroups: this.groupByDate(matches),
    })

    const groupRounds = [...byRound.entries()]
      .filter(([r]) => !KO_ORDER.includes(r))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([r, m]) => toGroup(r, m))

    const knockoutRounds = KO_ORDER.filter((r) => byRound.has(r)).map((r) =>
      toGroup(r, byRound.get(r)!)
    )

    return { group: groupRounds, knockout: knockoutRounds }
  }

  private groupByDate(matches: EnrichedMatch[]): DateGroup[] {
    const byDate = new Map<string, EnrichedMatch[]>()
    for (const m of matches) {
      const list = byDate.get(m.match_date) ?? []
      list.push(m)
      byDate.set(m.match_date, list)
    }
    return [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, matches]) => ({ date, matches }))
  }

  // History index

  private buildHistoryIndex(histories: Partial<Record<HistoryStage, HistoryResponse>>): void {
    const dateSet = new Set<string>()

    for (const [stage, resp] of Object.entries(histories) as [HistoryStage, HistoryResponse][]) {
      if (!resp) continue
      for (const series of resp.series) {
        for (const pt of series.points) {
          dateSet.add(pt.as_of_date)
          // Points arrive ordered oldest run first, so the last write per
          // date reflects the most recent run, matching the stage values
          // below which also keep the last point.
          this.dateLockMap.set(pt.as_of_date, pt.n_played_matches_locked)
          let dateMap = this.historyIndex.get(pt.as_of_date)
          if (!dateMap) {
            dateMap = new Map()
            this.historyIndex.set(pt.as_of_date, dateMap)
          }
          let teamData = dateMap.get(series.team)
          if (!teamData) {
            teamData = {}
            dateMap.set(series.team, teamData)
          }
          teamData[stage] = pt.value
        }
      }
    }

    this.availableDates = [...dateSet].sort().reverse()
    this.dateOptions = this.availableDates.map((d) => {
      const locked = this.dateLockMap.get(d) ?? 0
      return { value: d, label: `${d}  ·  ${locked} match${locked !== 1 ? 'es' : ''} locked` }
    })
  }

  // Bracket helpers

  private computeBracketHalves(b: BracketResponse) {
    const md = b.match_details ?? {}
    const r32d = md['R32'] ?? []
    const r16d = md['R16'] ?? []
    const qfd = md['QF'] ?? []
    const sfd = md['SF'] ?? []
    return {
      left: {
        r32: b.r32.slice(0, 8),
        r16: b.r16.slice(0, 4),
        qf: b.qf.slice(0, 2),
        sf: b.sf.slice(0, 1),
        r32Details: r32d.slice(0, 8),
        r16Details: r16d.slice(0, 4),
        qfDetails: qfd.slice(0, 2),
        sfDetails: sfd.slice(0, 1),
      },
      right: {
        r32: b.r32.slice(8),
        r16: b.r16.slice(4),
        qf: b.qf.slice(2),
        sf: b.sf.slice(1),
        r32Details: r32d.slice(8),
        r16Details: r16d.slice(4),
        qfDetails: qfd.slice(2),
        sfDetails: sfd.slice(1),
      },
    }
  }

  private computeAdvancers(b: BracketResponse) {
    const flat = (pairs: string[][]) => new Set(pairs.flat())
    return {
      r32: flat(b.r16),
      r16: flat(b.qf),
      qf: flat(b.sf),
      sf: new Set(b.final_pair),
    }
  }

  // trackBy

  trackByTeam = (_: number, row: { team: string }) => row.team
  trackByRound = (_: number, rg: RoundGroup) => rg.round
  trackByDateGroup = (_: number, dg: DateGroup) => dg.date
  trackByMatch = (_: number, m: EnrichedMatch) => `${m.match_date}-${m.home_team}-${m.away_team}`
  trackByPair = (i: number, pair: string[]) => `${i}-${pair[0]}-${pair[1]}`
  trackByGroup = (_: number, g: string) => g

  factorKey(round: string, teams: string[]): string {
    return `${round}::${teams.join('|')}`
  }

  isFactorOpen(round: string, teams: string[]): boolean {
    return this.openFactors.has(this.factorKey(round, teams))
  }

  toggleFactors(round: string, teams: string[]): void {
    const key = this.factorKey(round, teams)
    if (this.openFactors.has(key)) this.openFactors.delete(key)
    else this.openFactors.add(key)
  }

  formatFactorValue(feature: string, value: number): string {
    if (feature === 'is_neutral') return value >= 0.5 ? 'neutral site' : 'host advantage'
    const sign = value > 0 ? '+' : ''
    if (feature === 'form_diff') return `${sign}${(value * 100).toFixed(0)}%`
    if (feature === 'goals_form_diff') return `${sign}${value.toFixed(2)}`
    if (Math.abs(value) >= 10) return `${sign}${value.toFixed(0)}`
    return `${sign}${value.toFixed(1)}`
  }

  // What-if scenarios
  //
  // Views are precomputed: template-bound methods returning fresh arrays
  // put ngFor into an endless rebuild-recheck cycle that pins the page.

  pickSide(i: number, team: string): void {
    this.scenarioPick.set(i, team)
    this.buildScenarioViews()
  }

  onTabChange(event: MatTabChangeEvent): void {
    // Charts initialize at zero size while their tab body is hidden, so
    // re-render after the tab switch animation settles.
    setTimeout(() => {
      if (event.tab.textLabel === 'History') this.renderHistoryChart()
      else if (event.tab.textLabel === 'Performance') this.renderCalibrationChart()
    }, 250)
  }

  private buildScenarioViews(): void {
    const base = new Map((this.latest?.leaderboard ?? []).map((r) => [r.team, r.winner_pct]))
    this.scenarioViews = (this.scenarios?.matches ?? []).map((m, i) => {
      const pick = this.scenarioPick.get(i) ?? m.teams[0]
      return {
        round: m.round,
        teams: m.teams,
        pWin: m.p_win,
        pick,
        rows: (m.if_wins[pick] ?? []).map((e) => ({
          team: e.team,
          winner_pct: e.winner_pct,
          delta: e.winner_pct - (base.get(e.team) ?? 0),
        })),
      }
    })
  }

  // Chart

  private renderHistoryChart(): void {
    const history = this.stageHistories[this.selectedHistoryStage]
    if (!history || !this.historyCanvas) return

    const ctx = this.historyCanvas.nativeElement.getContext('2d')
    if (!ctx) return

    const dateSet = new Set<string>()
    for (const s of history.series) for (const p of s.points) dateSet.add(p.as_of_date)
    const labels = [...dateSet].sort()

    const datasets = history.series.map((s, i) => {
      const map = new Map(s.points.map((p) => [p.as_of_date, p.value]))
      return {
        label: s.team,
        data: labels.map((d) => map.get(d) ?? null),
        borderColor: PALETTE[i % PALETTE.length],
        backgroundColor: PALETTE[i % PALETTE.length],
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.2,
        spanGaps: true,
      }
    })

    this.chart?.destroy()
    this.chart = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#f0f0f5', boxWidth: 12, font: { size: 11 } },
          },
          tooltip: {
            callbacks: {
              label: (c) => ` ${c.dataset.label}: ${(c.raw as number)?.toFixed(2) ?? '-'}%`,
            },
          },
        },
        scales: {
          x: {
            ticks: { color: '#a0a0b8', maxRotation: 0 },
            grid: { color: 'rgba(255,255,255,0.05)' },
          },
          y: {
            ticks: { color: '#a0a0b8', callback: (v) => `${v}%` },
            grid: { color: 'rgba(255,255,255,0.05)' },
            title: {
              display: true,
              text: `${STAGE_LABELS[this.selectedHistoryStage]} %`,
              color: '#a0a0b8',
            },
          },
        },
      },
    })
  }

  private renderCalibrationChart(): void {
    const bins = this.reportCard?.calibration
    if (!bins?.length || !this.calibCanvas) {
      this.calibChart?.destroy()
      this.calibChart = null
      return
    }

    const ctx = this.calibCanvas.nativeElement.getContext('2d')
    if (!ctx) return

    const labels = bins.map((b) => `${Math.round(b.lo * 100)}-${Math.round(b.hi * 100)}%`)

    this.calibChart?.destroy()
    this.calibChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Favorite win rate (observed)',
            data: bins.map((b) => b.observed * 100),
            borderColor: '#4ade80',
            backgroundColor: '#4ade80',
            borderWidth: 2,
            pointRadius: 4,
            tension: 0.15,
          },
          {
            label: 'Predicted (perfect calibration)',
            data: bins.map((b) => b.predicted * 100),
            borderColor: 'rgba(166, 173, 200, 0.6)',
            backgroundColor: 'rgba(166, 173, 200, 0.6)',
            borderWidth: 2,
            borderDash: [6, 4],
            pointRadius: 3,
            tension: 0.15,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#f0f0f5', boxWidth: 12, font: { size: 11 } },
          },
          tooltip: {
            callbacks: {
              label: (c) => {
                const bin = bins[c.dataIndex]
                return ` ${c.dataset.label}: ${(c.raw as number).toFixed(1)}% (${bin.n} matches)`
              },
            },
          },
        },
        scales: {
          x: {
            ticks: { color: '#a0a0b8' },
            grid: { color: 'rgba(255,255,255,0.05)' },
            title: { display: true, text: 'Model confidence in favorite', color: '#a0a0b8' },
          },
          y: {
            min: 0,
            max: 100,
            ticks: { color: '#a0a0b8', callback: (v) => `${v}%` },
            grid: { color: 'rgba(255,255,255,0.05)' },
            title: { display: true, text: 'How often the favorite won', color: '#a0a0b8' },
          },
        },
      },
    })
  }
}
