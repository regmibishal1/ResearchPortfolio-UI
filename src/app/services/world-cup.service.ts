import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../environments/environment'

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

export type HistoryStage = 'winner' | 'final' | 'sf' | 'qf' | 'r16' | 'r32'

@Injectable({ providedIn: 'root' })
export class WorldCupService {
  private readonly apiUrl = `${environment.modelApiUrl}/worldcup`

  constructor(private http: HttpClient) {}

  getLatest(
    opts: { tournament?: string; limit?: number; as_of_date?: string } = {}
  ): Observable<LatestResponse> {
    let params = new HttpParams()
    if (opts.tournament) params = params.set('tournament', opts.tournament)
    if (opts.limit !== undefined) params = params.set('limit', String(opts.limit))
    if (opts.as_of_date) params = params.set('as_of_date', opts.as_of_date)
    return this.http.get<LatestResponse>(`${this.apiUrl}/latest`, { params })
  }

  getBracket(opts: { tournament?: string; as_of_date?: string } = {}): Observable<BracketResponse> {
    let params = new HttpParams().set('tournament', opts.tournament ?? '2026')
    if (opts.as_of_date) params = params.set('as_of_date', opts.as_of_date)
    return this.http.get<BracketResponse>(`${this.apiUrl}/bracket`, { params })
  }

  getHistory(
    opts: { tournament?: string; stage?: HistoryStage; teams?: string[] } = {}
  ): Observable<HistoryResponse> {
    let params = new HttpParams()
    if (opts.tournament) params = params.set('tournament', opts.tournament)
    if (opts.stage) params = params.set('stage', opts.stage)
    if (opts.teams?.length) params = params.set('teams', opts.teams.join(','))
    return this.http.get<HistoryResponse>(`${this.apiUrl}/history`, { params })
  }

  getPlayedMatches(tournament = '2026'): Observable<PlayedMatchesResponse> {
    return this.http.get<PlayedMatchesResponse>(`${this.apiUrl}/played-matches`, {
      params: new HttpParams().set('tournament', tournament),
    })
  }
}
