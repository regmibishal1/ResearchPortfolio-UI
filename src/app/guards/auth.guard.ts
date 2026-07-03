import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { AuthService } from '../pages/auth/auth.service'
import { map, take } from 'rxjs/operators'

/**
 * Prevents navigation to authenticated routes unless a valid session token
 * exists in AuthService. Redirects unauthenticated users to /login.
 *
 * Note: This is a client-side convenience guard only. Actual enforcement
 * happens at the API layer; every /user request requires a valid Bearer
 * token and the server returns the requesting user's data only.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService)
  const router = inject(Router)

  return authService.getAuthStatus().pipe(
    take(1),
    map((isAuth) => (isAuth ? true : router.createUrlTree(['/login'])))
  )
}
