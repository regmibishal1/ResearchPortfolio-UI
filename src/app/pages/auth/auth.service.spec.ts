import { TestBed } from '@angular/core/testing'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http'
import { provideRouter } from '@angular/router'
import { firstValueFrom } from 'rxjs'
import { AuthService, safeNext } from './auth.service'
import { authInterceptor } from '../../auth.interceptor'
import { environment } from '../../../environments/environment'

describe('AuthService', () => {
  const refreshUrl = `${environment.apiBaseUrl}/auth/refresh-token`

  function create(): AuthService {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(withXhr()), provideHttpClientTesting()],
    })
    return TestBed.inject(AuthService)
  }

  const signedIn = (service: AuthService) => {
    let value = false
    service.getAuthStatus().subscribe((v) => (value = v))
    return value
  }

  afterEach(() => localStorage.clear())

  it('only follows next= to a path on this site', () => {
    expect(safeNext('/profile')).toBe('/profile')
    expect(safeNext('/project/showupmd?tab=1')).toBe('/project/showupmd?tab=1')
    expect(safeNext('//evil.example')).toBe('/')
    expect(safeNext('https://evil.example')).toBe('/')
    expect(safeNext('/\\evil.example')).toBe('/')
    expect(safeNext(null)).toBe('/')
  })

  it('keeps no token in browser storage, only a flag that a session exists', () => {
    const service = create()
    service.setSession({ access_token: 'access' })
    expect(service.getAuthTokenValue()).toBe('access')
    expect(Object.values({ ...localStorage })).not.toContain('access')
    expect(localStorage.getItem('signed_in')).toBe('1')
  })

  describe('start-up', () => {
    it('stays signed out, without a request, when this browser had no session', () => {
      const service = create()
      expect(signedIn(service)).toBeFalse()
      TestBed.inject(HttpTestingController).expectNone(refreshUrl)
    })

    it('renews the session from the refresh cookie when this browser was signed in', async () => {
      localStorage.setItem('signed_in', '1')
      const service = create()
      expect(signedIn(service)).toBeTrue()
      await Promise.resolve()
      TestBed.inject(HttpTestingController).expectOne(refreshUrl).flush({ access_token: 'fresh' })
      expect(service.getAuthTokenValue()).toBe('fresh')
    })

    it('signs out quietly when the cookie no longer works', async () => {
      localStorage.setItem('signed_in', '1')
      const service = create()
      await Promise.resolve()
      TestBed.inject(HttpTestingController)
        .expectOne(refreshUrl)
        .flush(null, { status: 401, statusText: 'Unauthorized' })
      expect(signedIn(service)).toBeFalse()
      expect(localStorage.getItem('signed_in')).toBeNull()
    })

    it('renews through the real interceptor, which itself needs this service', async () => {
      localStorage.setItem('signed_in', '1')
      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          provideHttpClient(withXhr(), withInterceptors([authInterceptor])),
          provideHttpClientTesting(),
        ],
      })
      const service = TestBed.inject(AuthService)
      await Promise.resolve()
      const req = TestBed.inject(HttpTestingController).expectOne(refreshUrl)
      expect(req.request.withCredentials).toBeTrue()
      req.flush({ access_token: 'fresh' })
      expect(service.getAuthTokenValue()).toBe('fresh')
      expect(localStorage.getItem('signed_in')).toBe('1')
    })

    it('drops tokens left in storage by the old sign-in', () => {
      localStorage.setItem('access_token', 'old')
      localStorage.setItem('refresh_token', 'old')
      create()
      expect(localStorage.getItem('access_token')).toBeNull()
      expect(localStorage.getItem('refresh_token')).toBeNull()
    })
  })

  it('signs out locally even when the server cannot be reached', async () => {
    const service = create()
    service.setSession({ access_token: 'access' })
    const result = firstValueFrom(service.logout()).catch(() => 'failed')
    TestBed.inject(HttpTestingController)
      .expectOne(`${environment.apiBaseUrl}/auth/logout`)
      .flush(null, { status: 0, statusText: 'Network error' })

    expect(await result).toBe('failed')
    expect(service.getAuthTokenValue()).toBe('')
    expect(localStorage.getItem('signed_in')).toBeNull()
  })

  it('asks for a reset email with just the address', () => {
    const service = create()
    service.forgotPassword('me@example.test').subscribe()
    const req = TestBed.inject(HttpTestingController).expectOne(
      `${environment.apiBaseUrl}/auth/forgot-password`
    )
    expect(req.request.body).toEqual({ email: 'me@example.test' })
    req.flush(null, { status: 204, statusText: 'No Content' })
  })

  it('sends the reset token and new password, and forgets any local session', () => {
    const service = create()
    service.setSession({ access_token: 'a' })
    service.resetPassword('link-token', 'new-password-1').subscribe()
    const req = TestBed.inject(HttpTestingController).expectOne(
      `${environment.apiBaseUrl}/auth/reset-password`
    )
    expect(req.request.body).toEqual({ token: 'link-token', newPassword: 'new-password-1' })
    req.flush(null, { status: 204, statusText: 'No Content' })
    expect(service.hasSession()).toBeFalse()
  })
})
