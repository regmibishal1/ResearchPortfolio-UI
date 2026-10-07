import { HttpInterceptorFn } from '@angular/common/http'
import { PLATFORM_ID, inject } from '@angular/core'
import { isPlatformServer } from '@angular/common'
import { EMPTY } from 'rxjs'

// Pages are prerendered to static HTML at build time. Live data is only
// fetched in the browser, so the build never calls the backends and the
// HTML never carries a stale snapshot; data panels render in their loading
// state and fill in once the page hydrates.
export const prerenderInterceptor: HttpInterceptorFn = (req, next) => {
  if (isPlatformServer(inject(PLATFORM_ID))) {
    return EMPTY
  }
  return next(req)
}
