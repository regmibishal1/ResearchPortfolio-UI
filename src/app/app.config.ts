import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core'
import { provideRouter, withInMemoryScrolling, withPreloading } from '@angular/router'
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http'
import { provideClientHydration, withNoIncrementalHydration } from '@angular/platform-browser'
import { routes } from './app.routes'
import { authInterceptor } from './auth.interceptor'
import { prerenderInterceptor } from './prerender.interceptor'
import { SelectivePreloadingStrategy } from './preload-strategy'

export const appConfig: ApplicationConfig = {
  providers: [
    // Angular 21 defaults to zoneless change detection; the app still relies
    // on zone.js (e.g. charts run outside the zone so pages can settle).
    provideZoneChangeDetection(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
      // Keep the initial bundle small, and fetch only the small, likely-next
      // pages in the background (see SelectivePreloadingStrategy).
      withPreloading(SelectivePreloadingStrategy)
    ),
    provideHttpClient(withXhr(), withInterceptors([prerenderInterceptor, authInterceptor])),
    provideClientHydration(withNoIncrementalHydration()),
  ],
}
