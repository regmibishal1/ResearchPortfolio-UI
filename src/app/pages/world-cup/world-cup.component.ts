import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  ChangeDetectionStrategy,
  NgZone,
  inject,
} from '@angular/core'
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { MatTabsModule } from '@angular/material/tabs'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { SeoService } from '../../services/seo.service'
import { BRACKET_ROUNDS, BracketRound, WcBracketComponent } from './wc-bracket/wc-bracket.component'
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

// Six colors that stay apart under the common color-vision deficiencies
// (adapted from Okabe-Ito, lightened for the dark background). Each line is
// also labelled with its team at its end, so color is never the only key.
const PALETTE = ['#f0c040', '#56b4e9', '#ff7a45', '#2ec4a0', '#e58fc7', '#e4e4ec']

// Draws each team's name at the end of its line.
const lineEndLabels = {
  id: 'lineEndLabels',
  afterDatasetsDraw(chart: Chart) {
    const { ctx } = chart
    ctx.save()
    ctx.font = '600 12px Inter, sans-serif'
    ctx.textBaseline = 'middle'
    chart.data.datasets.forEach((ds, i) => {
      const values = ds.data as (number | null)[]
      let end = values.length - 1
      while (end >= 0 && values[end] === null) end--
      const last = chart.getDatasetMeta(i).data[end]
      if (!last) return
      ctx.fillStyle = String(ds.borderColor)
      ctx.fillText(String(ds.label), last.x + 8, last.y)
    })
    ctx.restore()
  },
}

/** Matches in the 2026 tournament: 72 in the groups, 32 in the knockouts. */
const TOTAL_MATCHES = 104

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

/** A chart's data as rows and columns, shown under the chart on request. */
export interface ChartTable {
  caption: string
  columns: string[]
  rows: { label: string; values: (number | null)[] }[]
}

@Component({
  selector: 'app-world-cup',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    DatePipe,
    DecimalPipe,
    WcBracketComponent,
  ],
  templateUrl: './world-cup.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './world-cup.component.scss',
})
export class WorldCupComponent implements OnInit, OnDestroy {
  private wc = inject(WorldCupService)
  private router = inject(Router)
  private zone = inject(NgZone)
  private route = inject(ActivatedRoute)

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

  groupStageRounds: RoundGroup[] = []
  knockoutRounds: RoundGroup[] = []

  /** Which round the bracket shows on narrower screens (?round=). */
  bracketRound: BracketRound = 'final'

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

  /** The standings show this many teams until "Show all" is pressed. */
  readonly standingsPreview = 8
  showAllTeams = false

  /**
   * The open tab, by slug, so it can live in the URL (?tab=bracket). The
   * first tab is Wrap-up once the tournament is complete and Standings for
   * earlier snapshots; a slug whose tab is not shown falls back to it.
   */
  tabSlug = 'wrap-up'
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

  // Text versions of the two charts, for screen readers and "View as table".
  historySummary = ''
  historyTable: ChartTable | null = null
  calibSummary = ''
  calibTable: ChartTable | null = null

  constructor() {
    const seo = inject(SeoService)

    seo.setPage({
      title: 'World Cup 2026 Predictions and Final Results | Bishal Regmi',
      path: '/world-cup',
      image: '/assets/og/world-cup.jpg',
      description:
        'Calibrated XGBoost + Monte Carlo forecasts for the 2026 FIFA World Cup, rerun daily ' +
        "through the tournament: final results, the model's report card, and every daily snapshot.",
      breadcrumbs: [
        { name: 'Projects', path: '/project' },
        { name: 'World Cup 2026 Prediction Engine', path: '/project/world-cup-prediction' },
        { name: 'Final results', path: '/world-cup' },
      ],
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
        this.enrichedMatches = this.enrichPlayedMatches(played, bracket)

        if (this.availableDates.length > 0) {
          this.selectedDate = this.availableDates[0]
        }
        const query = this.route.snapshot.queryParamMap
        const date = query.get('date')
        if (date && this.availableDates.includes(date)) this.selectedDate = date
        this.tabSlug = query.get('tab') ?? this.tabSlug
        const round = query.get('round') as BracketRound | null
        if (round && BRACKET_ROUNDS.some((r) => r.key === round)) this.bracketRound = round
        this.rebuildDisplayedLeaderboard()
        this.rebuildLockedMatchesForDate()

        this.loading = false
        if (!this.isLatestDate) this.onDateChange()
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

  onDateChange(): void {
    this.rebuildDisplayedLeaderboard()
    this.rebuildLockedMatchesForDate()
    if (this.isLatestDate) {
      if (this.latestBracket) {
        this.bracket = this.latestBracket
      }
      this.applyAnalytics(this.latestReportCard, this.latestScenarios, this.latestRetro)
    } else {
      this.fetchHistoricalBracket()
      this.fetchHistoricalAnalytics()
    }
    this.writeUrl()
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
    const split = this.splitRoundGroups(this.lockedMatchesForDate)
    this.groupStageRounds = split.group
    this.knockoutRounds = split.knockout
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
      const day = new Date(`${d}T00:00:00`).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
      return { value: d, label: `${day}, ${locked} of ${TOTAL_MATCHES} played` }
    })
  }

  // Bracket helpers

  // trackBy

  trackByTeam = (_: number, row: { team: string }) => row.team
  trackByRound = (_: number, rg: RoundGroup) => rg.round
  trackByDateGroup = (_: number, dg: DateGroup) => dg.date
  trackByMatch = (_: number, m: EnrichedMatch) => `${m.match_date}-${m.home_team}-${m.away_team}`

  // What-if scenarios
  //
  // Views are precomputed: template-bound methods returning fresh arrays
  // put ngFor into an endless rebuild-recheck cycle that pins the page.

  pickSide(i: number, team: string): void {
    this.scenarioPick.set(i, team)
    this.buildScenarioViews()
  }

  /** The tabs shown for the selected snapshot, in order. */
  get tabs(): { slug: string; label: string }[] {
    const complete = !!this.retro?.complete
    const tabs = [
      complete ? { slug: 'wrap-up', label: 'Wrap-up' } : { slug: 'standings', label: 'Standings' },
      { slug: 'bracket', label: 'Bracket' },
      { slug: 'odds', label: 'Odds over time' },
    ]
    if (this.analyticsUnlocked) tabs.push({ slug: 'grades', label: 'Model grades' })
    if (!complete && this.analyticsUnlocked && this.scenarioViews.length > 0) {
      tabs.push({ slug: 'what-if', label: 'What-if' })
    }
    return tabs
  }

  get selectedTabIndex(): number {
    return Math.max(
      0,
      this.tabs.findIndex((t) => t.slug === this.tabSlug)
    )
  }

  get visibleStandings(): TeamRow[] {
    return this.showAllTeams
      ? this.displayedLeaderboard
      : this.displayedLeaderboard.slice(0, this.standingsPreview)
  }

  onTabIndexChange(index: number): void {
    const slug = this.tabs[index]?.slug
    if (!slug || slug === this.tabSlug) return
    this.tabSlug = slug
    this.writeUrl()
    // Charts initialize at zero size while their tab body is hidden, so
    // re-render after the tab switch animation settles.
    setTimeout(() => {
      if (slug === 'odds') this.renderHistoryChart()
      else if (slug === 'grades') this.renderCalibrationChart()
    }, 250)
  }

  /** Standings columns in order; the change column shows for earlier snapshots only. */
  readonly standingsColumns: { key: WcSortKey; label: string }[] = [
    { key: 'team', label: 'Team' },
    { key: 'winner_pct', label: 'Winner' },
    { key: 'delta', label: 'Change' },
    { key: 'final_pct', label: 'Final' },
    { key: 'sf_pct', label: 'Semi' },
    { key: 'qf_pct', label: 'QF' },
    { key: 'r16_pct', label: 'R16' },
    { key: 'r32_pct', label: 'R32' },
    { key: 'elo', label: 'Elo' },
  ]

  /** A percentage to one decimal, with "<0.1%" for odds too small to show. */
  pct(value: number | null | undefined): string {
    if (value === null || value === undefined) return '-'
    if (value > 0 && value < 0.05) return '<0.1%'
    return `${value.toFixed(1)}%`
  }

  /** Which side won a played match, counting a penalty shootout. */
  winnerOf(m: EnrichedMatch): 'home' | 'away' | null {
    if (m.went_to_penalties) {
      if (m.penalty_winner === m.home_team) return 'home'
      if (m.penalty_winner === m.away_team) return 'away'
      return null
    }
    if (m.home_score === m.away_score) return null
    return m.home_score > m.away_score ? 'home' : 'away'
  }

  /** The model's favorite before kickoff, shown with the champion. */
  get favoritePick(): { team: string; pct: number } | null {
    const v = this.retro?.verdict
    return v?.pre_tournament_favorite && v.pre_tournament_favorite_pct != null
      ? { team: v.pre_tournament_favorite, pct: v.pre_tournament_favorite_pct }
      : null
  }

  onRoundChange(round: BracketRound): void {
    this.bracketRound = round
    this.writeUrl()
  }

  // Only what differs from the default view goes in the URL.
  private writeUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        tab: this.selectedTabIndex === 0 ? null : this.tabs[this.selectedTabIndex].slug,
        date: this.isLatestDate ? null : this.selectedDate,
        round: this.bracketRound === 'final' ? null : this.bracketRound,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    })
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

    const lastOf = (points: { as_of_date: string; value: number }[]) =>
      [...points].sort((x, y) => x.as_of_date.localeCompare(y.as_of_date)).at(-1)?.value ?? 0
    const series = [...history.series]
      .sort((x, y) => lastOf(y.points) - lastOf(x.points))
      .slice(0, PALETTE.length)
    const datasets = series.map((s, i) => {
      const map = new Map(s.points.map((p) => [p.as_of_date, p.value]))
      return {
        label: s.team,
        data: labels.map((d) => map.get(d) ?? null),
        borderColor: PALETTE[i],
        backgroundColor: PALETTE[i],
        borderWidth: 2,
        pointRadius: 2,
        tension: 0.2,
        spanGaps: true,
      }
    })

    const stageLabel = STAGE_LABELS[this.selectedHistoryStage]
    const lastValues = datasets.map((d) => d.data[d.data.length - 1] ?? 0)
    const leader = datasets[lastValues.indexOf(Math.max(...lastValues))]
    this.historySummary =
      `Line chart of ${stageLabel} probability for ${datasets.length} teams across ` +
      `${labels.length} snapshots, ${labels[0]} to ${labels[labels.length - 1]}. ` +
      (leader ? `${leader.label} ends highest at ${Math.max(...lastValues).toFixed(1)}%.` : '')
    this.historyTable = {
      caption: `${stageLabel} probability (%) by snapshot date`,
      columns: datasets.map((d) => d.label),
      rows: labels.map((date, i) => ({ label: date, values: datasets.map((d) => d.data[i]) })),
    }

    // Outside Angular, so the chart's animation frames do not keep the
    // app from settling (hydration finishes only once it is stable).
    this.zone.runOutsideAngular(() => {
      this.chart?.destroy()
      this.chart = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        plugins: [lineEndLabels],
        options: {
          responsive: true,
          maintainAspectRatio: false,
          // Room on the right for the team names at the line ends.
          layout: { padding: { right: 96 } },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (c) => ` ${c.dataset.label}: ${this.pct(c.raw as number)}`,
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

    this.calibSummary =
      `Line chart comparing how often the favorite actually won with the model's predicted ` +
      `probability, across ${bins.length} probability bins. Points on the dashed line mean ` +
      `the predictions were well calibrated.`
    this.calibTable = {
      caption: 'Predicted and observed favorite win rate (%) by probability bin',
      columns: ['Predicted', 'Observed', 'Matches'],
      rows: bins.map((b, i) => ({
        label: labels[i],
        values: [b.predicted * 100, b.observed * 100, b.n],
      })),
    }

    // Outside Angular, so the chart's animation frames do not keep the
    // app from settling (hydration finishes only once it is stable).
    this.zone.runOutsideAngular(() => {
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
              borderColor: '#a0a0b8',
              backgroundColor: '#a0a0b8',
              borderWidth: 2,
              borderDash: [4, 4],
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
              title: { display: true, text: 'Predicted probability', color: '#a0a0b8' },
            },
            y: {
              min: 0,
              max: 100,
              ticks: { color: '#a0a0b8', callback: (v) => `${v}%` },
              grid: { color: 'rgba(255,255,255,0.05)' },
              title: { display: true, text: 'Observed frequency', color: '#a0a0b8' },
            },
          },
        },
      })
    })
  }
}
