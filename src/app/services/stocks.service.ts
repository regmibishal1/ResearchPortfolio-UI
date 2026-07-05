import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../environments/environment'

export interface RunMeta {
  id: number
  as_of_date: string
  label: string | null
  universe_size: number
  n_events: number
  start_date: string
  end_date: string
  run_timestamp_utc: string
  metrics: Record<string, number>
}

export interface SectorRow {
  sector: string
  sector_name: string
  n_names: number
  mean_sue: number | null
  mean_predicted_vol: number | null
  mean_exret_63: number | null
}

export interface LatestResponse {
  run: RunMeta
  sectors: SectorRow[]
}

export interface CompanyRow {
  ticker: string
  sector: string
  company_name: string | null
  filed: string | null
  sue: number | null
  rev_sue: number | null
  ni_sue: number | null
  lag_days: number | null
  pre_vol: number | null
  predicted_vol: number | null
  exret_63: number | null
  sue_quintile: number | null
}

export interface CompaniesResponse {
  run: RunMeta
  companies: CompanyRow[]
}

export interface CompanyHistoryPoint {
  as_of_date: string
  label: string | null
  sue: number | null
  predicted_vol: number | null
  exret_63: number | null
}

export interface CompanyDetailResponse {
  run: RunMeta
  latest: CompanyRow
  history: CompanyHistoryPoint[]
}

export interface TrackRecordPoint {
  period_label: string
  ic: number | null
  long_short_ret: number | null
  n: number | null
}

export interface TrackRecordResponse {
  run: RunMeta
  points: TrackRecordPoint[]
}

export interface MetricPoint {
  as_of_date: string
  label: string | null
  value: number | null
}

export interface HistoryResponse {
  metric: string
  points: MetricPoint[]
}

@Injectable({ providedIn: 'root' })
export class StocksService {
  private readonly apiUrl = `${environment.modelApiUrl}/stocks`

  constructor(private http: HttpClient) {}

  getLatest(opts: { as_of_date?: string } = {}): Observable<LatestResponse> {
    let params = new HttpParams()
    if (opts.as_of_date) params = params.set('as_of_date', opts.as_of_date)
    return this.http.get<LatestResponse>(`${this.apiUrl}/latest`, { params })
  }

  getCompanies(
    opts: { sector?: string; limit?: number; as_of_date?: string } = {}
  ): Observable<CompaniesResponse> {
    let params = new HttpParams()
    if (opts.sector) params = params.set('sector', opts.sector)
    if (opts.limit !== undefined) params = params.set('limit', String(opts.limit))
    if (opts.as_of_date) params = params.set('as_of_date', opts.as_of_date)
    return this.http.get<CompaniesResponse>(`${this.apiUrl}/companies`, { params })
  }

  getCompany(ticker: string): Observable<CompanyDetailResponse> {
    return this.http.get<CompanyDetailResponse>(`${this.apiUrl}/company/${ticker}`)
  }

  getTrackRecord(opts: { as_of_date?: string } = {}): Observable<TrackRecordResponse> {
    let params = new HttpParams()
    if (opts.as_of_date) params = params.set('as_of_date', opts.as_of_date)
    return this.http.get<TrackRecordResponse>(`${this.apiUrl}/track-record`, { params })
  }

  getHistory(opts: { metric?: string } = {}): Observable<HistoryResponse> {
    let params = new HttpParams()
    if (opts.metric) params = params.set('metric', opts.metric)
    return this.http.get<HistoryResponse>(`${this.apiUrl}/history`, { params })
  }
}
