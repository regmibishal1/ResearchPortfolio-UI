import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, map, shareReplay, throwError } from 'rxjs'
import { switchMap } from 'rxjs/operators'

export interface RunMeta {
  id: number
  tournament_key: string
  as_of_date: string
  label: string | null
  n_simulations: number
  n_played_matches_locked: number
  run_timestamp_utc: string
}

export interface TeamRow {
  team: string
  winner_pct: number
  final_pct: number
  sf_pct: number
  qf_pct: number
  r16_pct: number
  r32_pct: number
  elo: number
}

export interface LatestResponse {
  run: RunMeta
  leaderboard: TeamRow[]
}

export interface TopFactor {
  feature: string
  label: string
  value: number
  impact: number
  favors: string | null
}

export interface MatchDetail {
  teams: string[]
  predicted_score: number[]
  predicted_winner?: string | null
  played: boolean
  actual_score: number[] | null
  went_to_penalties: boolean
  winner: string | null
  top_factors: TopFactor[] | null
}

export interface BracketResponse {
  run_id: number
  as_of_date: string
  tournament_key: string
  group_winners: Record<string, string[]>
  best_thirds: string[]
  r32: string[][]
  r16: string[][]
  qf: string[][]
  sf: string[][]
  final_pair: string[]
  champion: string
  match_details: Record<string, MatchDetail[]> | null
}

export interface HistoryPoint {
  as_of_date: string
  label: string | null
  n_played_matches_locked: number
  value: number
}

export interface TeamSeries {
  team: string
  points: HistoryPoint[]
}

export interface HistoryResponse {
  tournament_key: string
  stage: string
  series: TeamSeries[]
}

export interface PlayedMatch {
  match_date: string
  home_team: string
  away_team: string
  home_score: number
  away_score: number
  group_name: string | null
}

export interface PlayedMatchesResponse {
  run: RunMeta
  matches: PlayedMatch[]
}

export interface MetricSummary {
  n: number
  accuracy: number | null
  brier: number | null
  log_loss: number | null
}

export interface CalibrationBin {
  lo: number
  hi: number
  n: number
  predicted: number
  observed: number
}

export interface GradedMatch {
  date: string
  home: string
  away: string
  score: number[]
  stage: string
  probs: number[]
  predicted: string
  actual: string
  correct: boolean
}

export interface ReportCard {
  as_of_date: string
  n_matches: number
  model: MetricSummary
  baseline: MetricSummary
  by_stage: Record<string, MetricSummary>
  calibration: CalibrationBin[]
  matches: GradedMatch[]
}

export interface ReportCardResponse {
  run_id: number
  as_of_date: string
  report_card: ReportCard | null
}

export interface ScenarioEntry {
  team: string
  winner_pct: number
}

export interface ScenarioMatch {
  round: string
  teams: string[]
  p_win: number[]
  n_sims: number
  if_wins: Record<string, ScenarioEntry[]>
}

export interface Scenarios {
  as_of_date: string
  matches: ScenarioMatch[]
}

export interface ScenariosResponse {
  run_id: number
  as_of_date: string
  scenarios: Scenarios | null
}

export interface RetroUpset {
  date: string
  home: string
  away: string
  score: number[]
  stage: string
  outcome: string
  model_gave_pct: number
}

export interface RetroSwing {
  team: string
  date: string
  from_pct: number
  to_pct: number
  delta: number
}

export interface Retrospective {
  as_of_date: string
  complete: boolean
  podium?: { champion: string; runner_up: string; third_place: string | null }
  verdict?: {
    pre_tournament_favorite: string | null
    pre_tournament_favorite_pct: number | null
    champion_pre_tournament_pct: number
    champion_first_favorite_on: string | null
    champion_days_as_favorite: number
    snapshot_days: number
    champion_final_eve_pct: number
    called_champion_pre_tournament: boolean
  }
  metrics?: {
    n_matches: number
    model: MetricSummary
    baseline: MetricSummary
    by_stage: Record<string, MetricSummary>
  }
  biggest_upsets?: RetroUpset[]
  biggest_swings?: RetroSwing[]
  confident_calls?: { n: number; correct: number; hit_rate: number | null }
}

export interface RetrospectiveResponse {
  run_id: number
  as_of_date: string
  retrospective: Retrospective | null
}

export type HistoryStage = 'winner' | 'final' | 'sf' | 'qf' | 'r16' | 'r32'

/** Shape of assets/data/world-cup/latest.json: everything the page loads on open. */
interface LatestBundle {
  latest: LatestResponse
  bracket: BracketResponse
  played: PlayedMatchesResponse
  reportCard: ReportCardResponse | null
  scenarios: ScenariosResponse | null
  retrospective: RetrospectiveResponse | null
}

/** Shape of assets/data/world-cup/snapshots/<date>.json. */
interface SnapshotBundle {
  bracket: BracketResponse | null
  reportCard: ReportCardResponse | null
  scenarios: ScenariosResponse | null
  retrospective: RetrospectiveResponse | null
}

const DATA_URL = '/assets/data/world-cup'

// The tournament is over, so the dashboard reads a frozen export of the API
// (scripts/export-worldcup.mjs) served with the site instead of calling the
// API. Each file is fetched once and shared by every call that needs it.
@Injectable({ providedIn: 'root' })
export class WorldCupService {
  private http = inject(HttpClient)

  private readonly bundle$ = this.load<LatestBundle>('latest.json')
  private readonly history$ = this.load<Record<HistoryStage, HistoryResponse>>('history.json')
  private readonly snapshots = new Map<string, Observable<SnapshotBundle>>()

  getLatest(opts: { limit?: number } = {}): Observable<LatestResponse> {
    return this.bundle$.pipe(
      map(({ latest }) => {
        const leaderboard = [...latest.leaderboard].sort(byFinish)
        return { ...latest, leaderboard: leaderboard.slice(0, opts.limit ?? leaderboard.length) }
      })
    )
  }

  getBracket(opts: { as_of_date?: string } = {}): Observable<BracketResponse> {
    return this.pick(opts.as_of_date, 'bracket')
  }

  getHistory(opts: { stage?: HistoryStage } = {}): Observable<HistoryResponse> {
    return this.history$.pipe(map((history) => history[opts.stage ?? 'winner']))
  }

  getPlayedMatches(): Observable<PlayedMatchesResponse> {
    return this.bundle$.pipe(map((b) => b.played))
  }

  getReportCard(opts: { as_of_date?: string } = {}): Observable<ReportCardResponse> {
    return this.pick(opts.as_of_date, 'reportCard')
  }

  getScenarios(opts: { as_of_date?: string } = {}): Observable<ScenariosResponse> {
    return this.pick(opts.as_of_date, 'scenarios')
  }

  getRetrospective(opts: { as_of_date?: string } = {}): Observable<RetrospectiveResponse> {
    return this.pick(opts.as_of_date, 'retrospective')
  }

  // One field from the latest bundle, or from a dated snapshot. A field the
  // API did not have for that date errors, as the API's 404 used to.
  private pick<K extends keyof SnapshotBundle>(
    date: string | undefined,
    field: K
  ): Observable<NonNullable<SnapshotBundle[K]>> {
    const source$: Observable<SnapshotBundle> = date ? this.snapshot(date) : this.bundle$
    return source$.pipe(
      switchMap((b) => {
        const value = b[field]
        return value
          ? [value as NonNullable<SnapshotBundle[K]>]
          : throwError(() => new Error(`No ${field} for ${date ?? 'the latest run'}`))
      })
    )
  }

  private snapshot(date: string): Observable<SnapshotBundle> {
    let snap = this.snapshots.get(date)
    if (!snap) {
      snap = this.load<SnapshotBundle>(`snapshots/${date}.json`)
      this.snapshots.set(date, snap)
    }
    return snap
  }

  // shareReplay resets on error, so a failed load is retried on the next call.
  private load<T>(file: string): Observable<T> {
    return this.http.get<T>(`${DATA_URL}/${file}`).pipe(shareReplay(1))
  }
}

// Furthest stage reached first: after the final every team but the champion
// sits at 0% to win, so ties fall through to the final, semifinal and so on,
// then Elo. The API returned those ties in no particular order.
function byFinish(a: TeamRow, b: TeamRow): number {
  return (
    b.winner_pct - a.winner_pct ||
    b.final_pct - a.final_pct ||
    b.sf_pct - a.sf_pct ||
    b.qf_pct - a.qf_pct ||
    b.r16_pct - a.r16_pct ||
    b.r32_pct - a.r32_pct ||
    b.elo - a.elo
  )
}
