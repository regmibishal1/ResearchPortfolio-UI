import { Injectable } from '@angular/core'
import { PreloadingStrategy, Route } from '@angular/router'
import { Observable, of } from 'rxjs'

/**
 * Preloads only the routes marked `data: { preload: true }`: the small pages
 * a visitor is likely to open next. Heavy or rarely visited pages (the World
 * Cup dashboard with its charts, sign-in, the hidden ones) load on demand,
 * so no page pays for them up front.
 */
@Injectable({ providedIn: 'root' })
export class SelectivePreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    return route.data?.['preload'] ? load() : of(null)
  }
}
