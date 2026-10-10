import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core'
import {
  provideRouter,
  withInMemoryScrolling,
  withPreloading,
  PreloadAllModules,
} from '@angular/router'
import { provideHttpClient, withInterceptors } from '@angular/common/http'
import { provideClientHydration } from '@angular/platform-browser'
import { provideAnimations } from '@angular/platform-browser/animations'
import { routes } from './app.routes'
import { authInterceptor } from './auth.interceptor'
import { prerenderInterceptor } from './prerender.interceptor'

export const appConfig: ApplicationConfig = {
  providers: [
    // Angular 21 defaults to zoneless change detection; the app still relies
    // on zone.js (e.g. charts run outside the zone so pages can settle).
    provideZoneChangeDetection(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
      // Keep the small initial bundle, but fetch the remaining route chunks
      // in the background after the first page is interactive so in-app
      // navigations (e.g. clicking through to the World Cup page) are instant.
      withPreloading(PreloadAllModules)
    ),
    provideAnimations(),
    provideHttpClient(withInterceptors([prerenderInterceptor, authInterceptor])),
    provideClientHydration(),
  ],
}
