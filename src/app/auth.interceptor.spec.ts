import { TestBed } from '@angular/core/testing'
import { HttpClient, provideHttpClient, withInterceptors, withXhr } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { provideRouter } from '@angular/router'

import { authInterceptor } from './auth.interceptor'
import { AuthService } from './pages/auth/auth.service'
import { environment } from '../environments/environment'

/** An unsigned JWT-shaped token; the UI only ever reads its payload. */
function fakeJwt(claims: Record<string, unknown>): string {
  const encode = (o: unknown) =>
    btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
  return `${encode({ alg: 'HS256' })}.${encode(claims)}.sig`
}

const inAnHour = () => Math.floor(Date.now() / 1000) + 3600

describe('authInterceptor', () => {
  let http: HttpClient
  let httpMock: HttpTestingController
  let auth: AuthService
  const userUrl = `${environment.apiBaseUrl}/user`
  const refreshUrl = `${environment.apiBaseUrl}/auth/refresh-token`
  const access = fakeJwt({ typ: 'access', exp: inAnHour(), n: 1 })
  const newAccess = fakeJwt({ typ: 'access', exp: inAnHour(), n: 2 })

  beforeEach(() => {
    localStorage.clear()
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withXhr(), withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    })
    http = TestBed.inject(HttpClient)
    httpMock = TestBed.inject(HttpTestingController)
    auth = TestBed.inject(AuthService)
    auth.setSession({ access_token: access })
  })

  afterEach(() => {
    httpMock.verify()
    localStorage.clear()
  })

  it('sends the sign-in token to the AuthAPI only', () => {
    http.get(userUrl).subscribe()
    http.get(`${environment.modelApiUrl}/health`).subscribe()
    http.get('https://example.test/feed').subscribe()

    expect(httpMock.expectOne(userUrl).request.headers.get('Authorization')).toBe(
      'Bearer ' + access
    )
    const model = httpMock.expectOne(`${environment.modelApiUrl}/health`).request
    expect(model.headers.has('Authorization')).toBeFalse()
    const other = httpMock.expectOne('https://example.test/feed').request
    expect(other.headers.has('Authorization')).toBeFalse()
    expect(other.headers.has('X-API-Key')).toBeFalse()
  })

  it('sends credentials (the refresh cookie) to the AuthAPI and nowhere else', () => {
    http.get(userUrl).subscribe()
    http.get(`${environment.modelApiUrl}/health`).subscribe()
    expect(httpMock.expectOne(userUrl).request.withCredentials).toBeTrue()
    expect(
      httpMock.expectOne(`${environment.modelApiUrl}/health`).request.withCredentials
    ).toBeFalse()
  })

  it('renews an expired access token once and replays the request', () => {
    let body: unknown
    http.get(userUrl).subscribe((b) => (body = b))
    httpMock.expectOne(userUrl).flush(null, { status: 401, statusText: 'Unauthorized' })

    const renew = httpMock.expectOne(refreshUrl)
    expect(renew.request.withCredentials).toBeTrue()
    renew.flush({ access_token: newAccess })

    const retry = httpMock.expectOne(userUrl)
    expect(retry.request.headers.get('Authorization')).toBe('Bearer ' + newAccess)
    retry.flush({ username: 'me' })
    expect(body).toEqual({ username: 'me' })
    expect(auth.getAuthTokenValue()).toBe(newAccess)
  })

  it('shares one renewal between requests that fail together', () => {
    http.get(userUrl).subscribe()
    http.get(`${userUrl}/other`).subscribe()
    httpMock.expectOne(userUrl).flush(null, { status: 401, statusText: 'Unauthorized' })
    httpMock.expectOne(`${userUrl}/other`).flush(null, { status: 401, statusText: 'Unauthorized' })

    httpMock.expectOne(refreshUrl).flush({ access_token: newAccess })
    httpMock.expectOne(userUrl).flush({})
    httpMock.expectOne(`${userUrl}/other`).flush({})
  })

  it('ends the session when it cannot be renewed', () => {
    const ended = spyOn(auth, 'endSession')
    let failed = false
    http.get(userUrl).subscribe({ error: () => (failed = true) })
    httpMock.expectOne(userUrl).flush(null, { status: 401, statusText: 'Unauthorized' })
    httpMock.expectOne(refreshUrl).flush(null, { status: 401, statusText: 'Unauthorized' })

    expect(ended).toHaveBeenCalled()
    expect(failed).toBeTrue()
  })

  it('leaves a failed sign-in alone instead of trying to renew', () => {
    http.post(`${environment.apiBaseUrl}/auth/authenticate`, {}).subscribe({ error: () => {} })
    httpMock
      .expectOne(`${environment.apiBaseUrl}/auth/authenticate`)
      .flush(null, { status: 401, statusText: 'Unauthorized' })
    httpMock.expectNone(refreshUrl)
  })
})
