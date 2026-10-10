import { Injectable, PLATFORM_ID, inject } from '@angular/core'
import { isPlatformBrowser } from '@angular/common'
import { BehaviorSubject, Observable } from 'rxjs'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { catchError, tap } from 'rxjs/operators'
import { throwError } from 'rxjs'
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticated = new BehaviorSubject<boolean>(false)
  private authToken = new BehaviorSubject<string>('')
  private refreshToken = new BehaviorSubject<string>('')
  private apiURL: string = environment.apiBaseUrl + '/auth'

  constructor(private http: HttpClient) {
    this.checkInitialAuth()
  }

  private checkInitialAuth() {
    // Tokens live in browser storage; prerendering always renders signed out.
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return
    const storedToken = localStorage.getItem('access_token')
    const storedRefresh = localStorage.getItem('refresh_token')
    if (storedToken) {
      this.authToken.next(storedToken)
      this.refreshToken.next(storedRefresh || '')
      this.isAuthenticated.next(true)
    }
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

  private setSession(response: AuthResponse) {
    localStorage.setItem('access_token', response.access_token)
    localStorage.setItem('refresh_token', response.refresh_token)
    this.authToken.next(response.access_token)
    this.refreshToken.next(response.refresh_token)
    this.isAuthenticated.next(true)
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

  logout() {
    return this.http.post(`${this.apiURL}/logout`, {}).pipe(
      tap(() => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        this.authToken.next('')
        this.refreshToken.next('')
        this.isAuthenticated.next(false)
      }),
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
