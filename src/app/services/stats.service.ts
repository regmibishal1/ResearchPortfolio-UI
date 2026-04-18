import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../environments/environment'

export type Distribution = 'normal' | 'uniform' | 'exponential' | 'beta' | 'binomial' | 'poisson'

export interface SampleRequest {
  distribution: Distribution
  params: Record<string, number>
  n_samples?: number
  n_bins?: number
}

export interface HistogramBin {
  bin_start: number
  bin_end: number
  count: number
  frequency: number
}

export interface SampleResponse {
  histogram: HistogramBin[]
  stats: Record<string, number>
  distribution: string
  params: Record<string, number>
  n_samples: number
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  private readonly apiUrl = environment.modelApiUrl

  constructor(private http: HttpClient) {}

  sample(req: SampleRequest): Observable<SampleResponse> {
    return this.http.post<SampleResponse>(`${this.apiUrl}/stats/sample`, req)
  }
}
