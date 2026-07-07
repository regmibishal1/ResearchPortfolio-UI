import { ApplicationConfig } from '@angular/core'
import {
  provideRouter,
  withInMemoryScrolling,
  withPreloading,
  PreloadAllModules,
} from '@angular/router'
import { provideHttpClient, withInterceptors } from '@angular/common/http'
import { provideAnimations } from '@angular/platform-browser/animations'
import { routes } from './app.routes'
import { authInterceptor } from './auth.interceptor'

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
      // Keep the small initial bundle, but fetch the remaining route chunks
      // in the background after the first page is interactive so in-app
      // navigations (e.g. clicking through to the World Cup page) are instant.
      withPreloading(PreloadAllModules)
    ),
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
}
