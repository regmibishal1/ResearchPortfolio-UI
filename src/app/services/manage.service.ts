import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { Observable } from 'rxjs'
import { environment } from '../../environments/environment'
import { components } from '../api/fastapi-schema'

type Schemas = components['schemas']

// FastAPI answers, typed straight from its OpenAPI schema.
export type ApiHealth = Schemas['HealthResponse']
export type WorldCupRunRow = Schemas['WorldCupRunRow']
export type WorldCupDiff = Schemas['WorldCupDiffResponse']
export type StocksRunRow = Schemas['StocksRunRow']

// AuthAPI answers (it has no published schema).
export interface UserSummary {
  username: string
  firstname: string
  lastname: string
  email: string
  role: string
  openSessions: number
}

export interface AllowedEmail {
  email: string
  addedAt: string
}

export interface RegistrationAttempt {
  ipAddress: string
  attemptCount: number
  firstAttempt: string
  lastAttempt: string
  blockedUntil: string | null
}

export interface ResetLink {
  url: string
  expiresAt: string
}

/**
 * The admin dashboard's calls. Both APIs check the ADMIN role on every
 * request; the auth interceptor adds the sign-in token.
 */
@Injectable({ providedIn: 'root' })
export class ManageService {
  private http = inject(HttpClient)
  private auth = `${environment.apiBaseUrl}/manage`
  private api = `${environment.modelApiUrl}/manage`

  users(): Observable<UserSummary[]> {
    return this.http.get<UserSummary[]>(`${this.auth}/users`)
  }

  allowedEmails(): Observable<AllowedEmail[]> {
    return this.http.get<AllowedEmail[]>(`${this.auth}/allowed-emails`)
  }

  allowEmail(email: string): Observable<AllowedEmail> {
    return this.http.post<AllowedEmail>(`${this.auth}/allowed-emails`, { email })
  }

  removeAllowedEmail(email: string): Observable<void> {
    return this.http.delete<void>(`${this.auth}/allowed-emails/${encodeURIComponent(email)}`)
  }

  registrationAttempts(): Observable<RegistrationAttempt[]> {
    return this.http.get<RegistrationAttempt[]>(`${this.auth}/registration-attempts`)
  }

  unblock(ip: string): Observable<void> {
    return this.http.delete<void>(`${this.auth}/registration-attempts/${encodeURIComponent(ip)}`)
  }

  resetLink(username: string): Observable<ResetLink> {
    return this.http.post<ResetLink>(
      `${this.auth}/users/${encodeURIComponent(username)}/reset-link`,
      null
    )
  }

  health(): Observable<ApiHealth> {
    return this.http.get<ApiHealth>(`${this.api}/health`)
  }

  worldCupRuns(): Observable<{ runs: WorldCupRunRow[] }> {
    return this.http.get<{ runs: WorldCupRunRow[] }>(`${this.api}/worldcup/runs`)
  }

  worldCupDiff(before: number, after: number): Observable<WorldCupDiff> {
    return this.http.get<WorldCupDiff>(`${this.api}/worldcup/diff`, {
      params: { before, after },
    })
  }

  /** Deletes a snapshot and everything in it. There is no undo. */
  deleteRun(kind: 'worldcup' | 'stocks', id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${kind}/runs/${id}`)
  }

  stocksRuns(): Observable<{ runs: StocksRunRow[] }> {
    return this.http.get<{ runs: StocksRunRow[] }>(`${this.api}/stocks/runs`)
  }
}
