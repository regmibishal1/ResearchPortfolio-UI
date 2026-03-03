import { Injectable } from '@angular/core'
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

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred.'
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `Unhandled error: ${error.error.message}`
      console.error(errorMessage)
    } else {
      if (error.status === 401) {
        // Unauthorized
        errorMessage = 'Invalid username or password.'
      } else if (error.status === 403) {
        // Forbidden
        errorMessage = 'Access denied.'
      } else {
        // The backend returned an unsuccessful response code.
        // The response body may contain clues as to what went wrong.
        errorMessage = `Error Status ${error.status} - ${error.error.message}`
        console.error(errorMessage)
      }
    }
    // Return an observable with a user-facing error message
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
