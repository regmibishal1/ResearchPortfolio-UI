import { Injectable, PLATFORM_ID, inject } from '@angular/core'
import { isPlatformBrowser } from '@angular/common'
import { BehaviorSubject, Observable, throwError } from 'rxjs'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Router } from '@angular/router'
import { ToastService } from '../../shared/toast/toast.service'
import { catchError, finalize, map, shareReplay, tap } from 'rxjs/operators'
import { environment } from '../../../environments/environment'

/**
 * Where to go after signing in: only a same-site path, so a crafted
 * ?next= link cannot send someone to another site.
 */
export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.includes('\\')) return '/'
  return next
}

/** A non-secret flag: this browser had a session, so try the refresh cookie on load. */
const SESSION_HINT = 'signed_in'

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient)
  private router = inject(Router)
  private toasts = inject(ToastService)

  private isAuthenticated = new BehaviorSubject<boolean>(false)
  /** The access token lives only in memory; the refresh token is an HttpOnly cookie. */
  private authToken = new BehaviorSubject<string>('')
  private apiURL: string = environment.apiBaseUrl + '/auth'
  /** One refresh at a time: parallel 401s all wait on the same request. */
  private refreshing: Observable<string> | null = null

  constructor() {
    this.checkInitialAuth()
  }

  // Prerendering always renders signed out. In the browser, a page load has
  // no access token yet; if this browser was signed in, the refresh cookie
  // (which scripts cannot read) gets a new one, and if that fails the
  // session is over.
  private checkInitialAuth() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return
    // Tokens were kept in localStorage before they moved to a cookie.
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    if (!localStorage.getItem(SESSION_HINT)) return
    this.isAuthenticated.next(true)
    this.refresh().subscribe({ error: () => this.clearSession() })
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

  /** True while this browser has a session the refresh cookie may renew. */
  hasSession(): boolean {
    return this.isAuthenticated.value
  }

  setSession(response: AuthResponse) {
    // Only a flag, never a token: it tells the next page load to try the cookie.
    localStorage.setItem(SESSION_HINT, '1')
    this.authToken.next(response.access_token)
    this.isAuthenticated.next(true)
  }

  private clearSession() {
    localStorage.removeItem(SESSION_HINT)
    this.authToken.next('')
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
   * Swaps the refresh cookie for a new access token (and a new cookie). The
   * server retires the old refresh token, so concurrent callers share one
   * request instead of each spending it.
   */
  refresh(): Observable<string> {
    if (!this.refreshing) {
      this.refreshing = this.http.post<AuthResponse>(`${this.apiURL}/refresh-token`, null).pipe(
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
    this.toasts.show('Your session ended. Sign in again.', 6000)
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

  /** Asks for a reset link by email; the answer is the same whether or not the address has an account. */
  forgotPassword(email: string) {
    return this.http
      .post<void>(`${this.apiURL}/forgot-password`, { email })
      .pipe(catchError(this.handleError))
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

/** The refresh token is not in the body; it arrives as an HttpOnly cookie. */
export class AuthResponse {
  access_token: string

  constructor() {
    this.access_token = ''
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
