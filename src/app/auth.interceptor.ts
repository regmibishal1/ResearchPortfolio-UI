import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http'
import { inject } from '@angular/core'
import { Router } from '@angular/router'
import { catchError, switchMap, throwError } from 'rxjs'
import { AuthService } from './pages/auth/auth.service'
import { environment } from '../environments/environment'

// Requests that manage the session themselves: a 401 from these is an
// answer (wrong password, dead refresh token), not a cue to refresh.
const SESSION_PATHS = [
  '/auth/authenticate',
  '/auth/register',
  '/auth/refresh-token',
  '/auth/logout',
]

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService)
  const router = inject(Router)
  const toAuthApi = req.url.startsWith(environment.apiBaseUrl)

  // JWT Bearer: only ever sent to the AuthAPI, never to another host. A
  // request that already names its own token (the refresh call) keeps it.
  const withToken = (request: HttpRequest<unknown>, token: string) =>
    toAuthApi && token && !req.headers.has('Authorization')
      ? request.clone({ setHeaders: { Authorization: 'Bearer ' + token } })
      : request

  // API key: attached to every request going to either backend service.
  // The key is embedded in the Angular build at Cloudflare Pages build time;
  // it is not user-specific and not truly secret, so it acts as a lightweight
  // gate against anonymous bot abuse. Real protection is CORS + CF rate limiting.
  const isBackendRequest = toAuthApi || req.url.startsWith(environment.modelApiUrl)
  const base =
    isBackendRequest && environment.apiKey
      ? req.clone({ setHeaders: { 'X-API-Key': environment.apiKey } })
      : req

  const managesSession = SESSION_PATHS.some((path) => req.url.includes(path))

  return next(withToken(base, authService.getAuthTokenValue())).pipe(
    catchError((error: unknown) => {
      const expired =
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        toAuthApi &&
        !managesSession &&
        authService.hasRefreshToken()
      if (!expired) return throwError(() => error)

      // The access token ran out: renew it once and replay the request. If
      // the session cannot be renewed, it is over.
      return authService.refresh().pipe(
        catchError((refreshError: unknown) => {
          authService.endSession(router.url)
          return throwError(() => refreshError)
        }),
        switchMap((token) => next(withToken(base, token)))
      )
    })
  )
}
