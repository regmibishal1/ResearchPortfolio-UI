import { HttpInterceptorFn } from '@angular/common/http'
import { inject } from '@angular/core'
import { AuthService } from './pages/auth/auth.service'
import { environment } from '../environments/environment'

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService)
  let headers = req.headers

  // ── JWT Bearer — attached for authenticated user requests (AuthAPI routes) ──
  const token = authService.getAuthTokenValue()
  if (token) {
    headers = headers.set('Authorization', 'Bearer ' + token)
  }

  // ── API key — attached to every request going to either backend service ──
  // Sent to both the AuthAPI (Spring Boot) and the FastAPI model server.
  // The key is embedded in the Angular build at Cloudflare Pages build time;
  // it is not user-specific and not truly secret — it acts as a lightweight
  // gate against anonymous bot abuse. Real protection is CORS + CF rate limiting.
  const isBackendRequest =
    req.url.startsWith(environment.apiBaseUrl) || req.url.startsWith(environment.modelApiUrl)
  if (isBackendRequest && environment.apiKey) {
    headers = headers.set('X-API-Key', environment.apiKey)
  }

  // Only clone the request if we actually modified headers
  if (headers === req.headers) {
    return next(req)
  }
  return next(req.clone({ headers }))
}
