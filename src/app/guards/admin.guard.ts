import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { catchError, map, of } from 'rxjs'
import { AuthService } from '../pages/auth/auth.service'

/**
 * Lets only signed-in admins open the dashboard. Just after a page load the
 * access token (and with it the role) is still being renewed from the
 * cookie, so the guard waits for that first.
 *
 * Like authGuard this is a convenience: the AuthAPI and the FastAPI check
 * the role on every admin request.
 */
export const adminGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService)
  const router = inject(Router)
  const signIn = router.createUrlTree(['/login'], { queryParams: { next: state.url } })

  if (!authService.hasSession()) return signIn

  const role$ = authService.getAuthTokenValue()
    ? of(authService.role())
    : authService.refresh().pipe(
        map(() => authService.role()),
        catchError(() => of(null))
      )

  return role$.pipe(
    map((role) => {
      if (role === 'ADMIN') return true
      return role === null ? signIn : router.createUrlTree(['/profile'])
    })
  )
}
