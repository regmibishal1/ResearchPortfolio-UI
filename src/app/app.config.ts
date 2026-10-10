import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core'
import { provideRouter, withInMemoryScrolling, withPreloading } from '@angular/router'
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http'
import { provideClientHydration, withNoIncrementalHydration } from '@angular/platform-browser'
import { routes } from './app.routes'
import { authInterceptor } from './auth.interceptor'
import { prerenderInterceptor } from './prerender.interceptor'
import { SelectivePreloadingStrategy } from './preload-strategy'

export const appConfig: ApplicationConfig = {
  providers: [
    // No zone.js: views update from template events, signals and
    // markForCheck, and pending HTTP requests keep hydration waiting.
    provideZonelessChangeDetection(),
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
