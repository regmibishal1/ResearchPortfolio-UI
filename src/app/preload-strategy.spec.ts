import { Route } from '@angular/router'
import { of } from 'rxjs'

import { routes } from './app.routes'
import { SelectivePreloadingStrategy } from './preload-strategy'

describe('SelectivePreloadingStrategy', () => {
  const strategy = new SelectivePreloadingStrategy()

  it('preloads only routes marked for it', () => {
    const load = jasmine.createSpy('load').and.returnValue(of('chunk'))
    strategy.preload({ path: 'a', data: { preload: true } }, load).subscribe()
    strategy.preload({ path: 'b' }, load).subscribe()
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('leaves the heavy and private pages to load on demand', () => {
    const flagged = (path: string) =>
      routes.find((r: Route) => r.path === path)?.data?.['preload'] === true
    expect(['about', 'resume', 'project', 'project/:id', 'blog', 'blog/:slug'].every(flagged))
      .withContext('small public pages')
      .toBeTrue()
    expect(['world-cup', 'stocks', 'login', 'register', 'reset', 'profile'].some(flagged))
      .withContext('heavy or private pages')
      .toBeFalse()
  })
})
