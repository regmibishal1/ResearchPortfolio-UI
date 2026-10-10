import { Injectable, PLATFORM_ID, inject } from '@angular/core'
import { isPlatformBrowser } from '@angular/common'
import { BehaviorSubject, Observable, throwError } from 'rxjs'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Router } from '@angular/router'
import { MatSnackBar } from '@angular/material/snack-bar'
import { catchError, finalize, map, shareReplay, tap } from 'rxjs/operators'
import { environment } from '../../../environments/environment'

/** Seconds since the epoch at which a JWT expires, or null if it cannot be read. */
export function tokenExpiry(token: string): number | null {
  try {
    const part = token.split('.')[1]
    const payload = JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')))
    return typeof payload.exp === 'number' ? payload.exp : null
  } catch {
    return null
  }
}

/** True when the token is missing, unreadable, or expires within the next 30 seconds. */
export function isExpired(token: string | null, now = Date.now()): boolean {
  if (!token) return true
  const exp = tokenExpiry(token)
  return exp === null || exp * 1000 < now + 30_000
}

/**
 * Where to go after signing in: only a same-site path, so a crafted
 * ?next= link cannot send someone to another site.
 */
export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.includes('\\')) return '/'
  return next
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient)
  private router = inject(Router)
  private snackBar = inject(MatSnackBar)

  private isAuthenticated = new BehaviorSubject<boolean>(false)
  private authToken = new BehaviorSubject<string>('')
  private refreshToken = new BehaviorSubject<string>('')
  private apiURL: string = environment.apiBaseUrl + '/auth'
  /** One refresh at a time: parallel 401s all wait on the same request. */
  private refreshing: Observable<string> | null = null

  constructor() {
    this.checkInitialAuth()
  }

  // Tokens live in browser storage; prerendering always renders signed out.
  // A session counts as live while its refresh token is; an expired access
  // token is renewed on the first request that needs it.
  private checkInitialAuth() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return
    const storedToken = localStorage.getItem('access_token')
    const storedRefresh = localStorage.getItem('refresh_token')
    if (!storedToken || isExpired(storedRefresh)) {
      this.clearSession()
      return
    }
    this.authToken.next(storedToken)
    this.refreshToken.next(storedRefresh || '')
    this.isAuthenticated.next(true)
  }

  getAuthStatus(): Observable<boolean> {
    return this.isAuthenticated.asObservable()
  }

  getAuthToken(): Observable<string> {
    return this.authToken.asObservable()
  }

  getAuthTokenValue(): string {
    return this.authToken.value
  }

  hasRefreshToken(): boolean {
    return !!this.refreshToken.value
  }

  setSession(response: AuthResponse) {
    localStorage.setItem('access_token', response.access_token)
    localStorage.setItem('refresh_token', response.refresh_token)
    this.authToken.next(response.access_token)
    this.refreshToken.next(response.refresh_token)
    this.isAuthenticated.next(true)
  }

  private clearSession() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    this.authToken.next('')
    this.refreshToken.next('')
    this.isAuthenticated.next(false)
  }

  register(data: RegisterModel) {
    return this.http.post<AuthResponse>(`${this.apiURL}/register`, data).pipe(
      tap((response: AuthResponse) => this.setSession(response)),
      catchError(this.handleError)
    )
  }

  login(data: LoginModel) {
    return this.http.post<AuthResponse>(`${this.apiURL}/authenticate`, data).pipe(
      tap((response: AuthResponse) => this.setSession(response)),
      catchError(this.handleError)
    )
  }

  /**
   * Swaps the refresh token for a new pair and returns the new access token.
   * The server retires the old refresh token, so concurrent callers share one
   * request instead of each spending it.
   */
  refresh(): Observable<string> {
    if (!this.refreshing) {
      this.refreshing = this.http
        .post<AuthResponse>(`${this.apiURL}/refresh-token`, null, {
          headers: { Authorization: 'Bearer ' + this.refreshToken.value },
        })
        .pipe(
          tap((response) => this.setSession(response)),
          map((response) => response.access_token),
          finalize(() => (this.refreshing = null)),
          shareReplay(1)
        )
    }
    return this.refreshing
  }

  /**
   * The session could not be renewed: forget it locally, say so, and send
   * the visitor to sign in, coming back here afterwards.
   */
  endSession(returnTo: string) {
    this.clearSession()
    this.snackBar.open('Your session ended. Sign in again.', 'Close', {
      duration: 6000,
      politeness: 'polite',
    })
    this.router.navigate(['/login'], { queryParams: { next: safeNext(returnTo) } })
  }

  // The local session ends whether or not the server call gets through, so
  // signing out always works.
  logout() {
    return this.http.post(`${this.apiURL}/logout`, {}).pipe(
      finalize(() => this.clearSession()),
      catchError(this.handleError)
    )
  }

  resetPassword(token: string, newPassword: string) {
    return this.http.post<void>(`${this.apiURL}/reset-password`, { token, newPassword }).pipe(
      tap(() => this.clearSession()),
      catchError(this.handleError)
    )
  }

  // Turns an HTTP failure into one plain sentence for the form. The server's
  // own message is clearer than a generic one when it sends one.
  private handleError(error: HttpErrorResponse) {
    const serverMessage = typeof error.error?.message === 'string' ? error.error.message : ''
    let errorMessage: string
    if (error.status === 0 || error.error instanceof ErrorEvent) {
      errorMessage = 'Could not reach the sign-in service. Check your connection and try again.'
    } else if (error.status === 401) {
      errorMessage = 'That username and password do not match.'
    } else if ([400, 403, 429].includes(error.status) && serverMessage) {
      errorMessage = serverMessage
    } else {
      errorMessage = 'Something went wrong. Try again in a moment.'
    }
    console.warn(`Auth request failed with status ${error.status}`)
    return throwError(() => new Error(errorMessage))
  }
}

export class AuthResponse {
  access_token: string
  refresh_token: string

  constructor() {
    this.access_token = ''
    this.refresh_token = ''
  }
}

export class RegisterModel {
  firstname: string
  lastname: string
  email: string
  username: string
  password: string

  constructor() {
    this.firstname = ''
    this.lastname = ''
    this.email = ''
    this.username = ''
    this.password = ''
  }
}

export class LoginModel {
  username: string
  password: string

  constructor() {
    this.username = ''
    this.password = ''
  }
}
