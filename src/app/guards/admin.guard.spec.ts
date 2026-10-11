import { TestBed } from '@angular/core/testing'
import { provideHttpClient, withXhr } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router'
import { Observable, firstValueFrom, isObservable } from 'rxjs'

import { adminGuard } from './admin.guard'
import { AuthService } from '../pages/auth/auth.service'
import { environment } from '../../environments/environment'
import { fakeJwt } from '../testing/fake-jwt'

describe('adminGuard', () => {
  const state = { url: '/admin' } as RouterStateSnapshot

  beforeEach(() => {
    localStorage.clear()
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(withXhr()), provideHttpClientTesting()],
    })
  })

  afterEach(() => localStorage.clear())

  async function run(): Promise<boolean | UrlTree> {
    const result = TestBed.runInInjectionContext(() =>
      adminGuard({} as ActivatedRouteSnapshot, state)
    ) as boolean | UrlTree | Observable<boolean | UrlTree>
    return isObservable(result) ? firstValueFrom(result) : result
  }

  const path = (result: boolean | UrlTree) =>
    result instanceof UrlTree ? TestBed.inject(Router).serializeUrl(result) : result

  it('sends someone signed out to sign in, then back', async () => {
    expect(path(await run())).toBe('/login?next=%2Fadmin')
  })

  it('lets an admin in', async () => {
    TestBed.inject(AuthService).setSession({ access_token: fakeJwt({ role: 'ADMIN' }) })
    expect(await run()).toBeTrue()
  })

  it('sends a signed-in user without the role to their profile', async () => {
    TestBed.inject(AuthService).setSession({ access_token: fakeJwt({ role: 'USER' }) })
    expect(path(await run())).toBe('/profile')
  })

  it('waits for the session to be renewed after a page load', async () => {
    localStorage.setItem('signed_in', '1')
    TestBed.inject(AuthService)
    await Promise.resolve()
    const decision = run()
    TestBed.inject(HttpTestingController)
      .match(`${environment.apiBaseUrl}/auth/refresh-token`)
      .forEach((req) => req.flush({ access_token: fakeJwt({ role: 'ADMIN' }) }))
    expect(await decision).toBeTrue()
  })
})
