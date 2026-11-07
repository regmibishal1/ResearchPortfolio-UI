import { Provider } from '@angular/core'
import { REFRESH_LOCK, RefreshLock } from '../pages/auth/auth.service'

/**
 * Refreshes without the cross-tab lock, so a test sees the request as soon
 * as it is made instead of after the browser grants the lock.
 */
export const unlockedRefresh: Provider = {
  provide: REFRESH_LOCK,
  useValue: ((work) => work()) as RefreshLock,
}
