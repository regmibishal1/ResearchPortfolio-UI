import { Injectable } from '@angular/core'
import { PreloadingStrategy, Route } from '@angular/router'
import { EMPTY, Observable, of, switchMap } from 'rxjs'

/**
 * Preloads only the routes marked `data: { preload: true }`: the small pages
 * a visitor is likely to open next. Heavy or rarely visited pages (the World
 * Cup dashboard with its charts, sign-in, the hidden ones) load on demand,
 * so no page pays for them up front. Preloading waits until the current page
 * has loaded and the browser is idle, so it never competes with that page's
 * own images and scripts.
 */
@Injectable({ providedIn: 'root' })
export class SelectivePreloadingStrategy implements PreloadingStrategy {
  /** Emits once the page has loaded and the browser is idle; replaced in tests. */
  whenIdle: () => Observable<unknown> = afterLoadAndIdle

  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    if (!route.data?.['preload']) return of(null)
    return this.whenIdle().pipe(switchMap(() => load()))
  }
}

function afterLoadAndIdle(): Observable<unknown> {
  // Prerendering never preloads.
  if (typeof window === 'undefined') return EMPTY
  return new Observable((subscriber) => {
    let handle: number | undefined
    const done = () => {
      subscriber.next(true)
      subscriber.complete()
    }
    const start = () => {
      handle = window.requestIdleCallback
        ? window.requestIdleCallback(done, { timeout: 3000 })
        : window.setTimeout(done, 200)
    }
    if (document.readyState === 'complete') start()
    else window.addEventListener('load', start, { once: true })
    return () => {
      window.removeEventListener('load', start)
      if (handle === undefined) return
      if (window.cancelIdleCallback) window.cancelIdleCallback(handle)
      else window.clearTimeout(handle)
    }
  })
}
