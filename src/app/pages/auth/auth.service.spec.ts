import { TestBed } from '@angular/core/testing'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { provideHttpClient, withXhr } from '@angular/common/http'
import { provideRouter } from '@angular/router'
import { firstValueFrom } from 'rxjs'
import { AuthService, isExpired, safeNext, tokenExpiry } from './auth.service'
import { environment } from '../../../environments/environment'

function fakeJwt(claims: Record<string, unknown>): string {
  const encode = (o: unknown) =>
    btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
  return `${encode({ alg: 'HS256' })}.${encode(claims)}.sig`
}

const nowSeconds = () => Math.floor(Date.now() / 1000)

describe('AuthService', () => {
  function create(): AuthService {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(withXhr()), provideHttpClientTesting()],
    })
    return TestBed.inject(AuthService)
  }

  afterEach(() => localStorage.clear())

  describe('token helpers', () => {
    it('reads the expiry from the token payload', () => {
      expect(tokenExpiry(fakeJwt({ exp: 1234 }))).toBe(1234)
      expect(tokenExpiry('not-a-jwt')).toBeNull()
    })

    it('treats a token as expired 30 seconds early, and an unreadable one as expired', () => {
      expect(isExpired(fakeJwt({ exp: nowSeconds() + 3600 }))).toBeFalse()
      expect(isExpired(fakeJwt({ exp: nowSeconds() + 10 }))).toBeTrue()
      expect(isExpired(null)).toBeTrue()
      expect(isExpired('garbage')).toBeTrue()
    })

    it('only follows next= to a path on this site', () => {
      expect(safeNext('/profile')).toBe('/profile')
      expect(safeNext('/project/showupmd?tab=1')).toBe('/project/showupmd?tab=1')
      expect(safeNext('//evil.example')).toBe('/')
      expect(safeNext('https://evil.example')).toBe('/')
      expect(safeNext('/\\evil.example')).toBe('/')
      expect(safeNext(null)).toBe('/')
    })
  })

  describe('start-up', () => {
    it('stays signed in while the refresh token lives, even if the access token has expired', () => {
      localStorage.setItem('access_token', fakeJwt({ exp: nowSeconds() - 60 }))
      localStorage.setItem('refresh_token', fakeJwt({ exp: nowSeconds() + 3600 }))
      const service = create()
      let signedIn = false
      service.getAuthStatus().subscribe((v) => (signedIn = v))
      expect(signedIn).toBeTrue()
    })

    it('signs out and clears storage once the refresh token has expired', () => {
      localStorage.setItem('access_token', fakeJwt({ exp: nowSeconds() - 60 }))
      localStorage.setItem('refresh_token', fakeJwt({ exp: nowSeconds() - 60 }))
      const service = create()
      let signedIn = true
      service.getAuthStatus().subscribe((v) => (signedIn = v))
      expect(signedIn).toBeFalse()
      expect(localStorage.getItem('access_token')).toBeNull()
    })
  })

  it('signs out locally even when the server cannot be reached', async () => {
    const service = create()
    service.setSession({
      access_token: fakeJwt({ exp: nowSeconds() + 900 }),
      refresh_token: fakeJwt({ exp: nowSeconds() + 3600 }),
    })
    const result = firstValueFrom(service.logout()).catch(() => 'failed')
    TestBed.inject(HttpTestingController)
      .expectOne(`${environment.apiBaseUrl}/auth/logout`)
      .flush(null, { status: 0, statusText: 'Network error' })

    expect(await result).toBe('failed')
    expect(service.getAuthTokenValue()).toBe('')
    expect(localStorage.getItem('refresh_token')).toBeNull()
  })

  it('sends the reset token and new password, and forgets any local session', () => {
    const service = create()
    service.setSession({ access_token: 'a', refresh_token: 'r' })
    service.resetPassword('link-token', 'new-password-1').subscribe()
    const req = TestBed.inject(HttpTestingController).expectOne(
      `${environment.apiBaseUrl}/auth/reset-password`
    )
    expect(req.request.body).toEqual({ token: 'link-token', newPassword: 'new-password-1' })
    req.flush(null, { status: 204, statusText: 'No Content' })
    expect(service.hasRefreshToken()).toBeFalse()
  })
})
