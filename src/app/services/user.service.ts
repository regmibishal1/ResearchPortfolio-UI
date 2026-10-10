import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../environments/environment'
import { AuthResponse } from '../pages/auth/auth.service'

/**
 * Returned by GET /api/v1/user.
 * The server derives the identity from the Bearer token, so callers cannot
 * request another user's profile. Only these fields are exposed; the
 * password hash is never included.
 */
export interface UserProfile {
  id: number
  firstname: string
  lastname: string
  email: string
  username: string
  role: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmationPassword: string
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient)

  private readonly apiUrl = `${environment.apiBaseUrl}/user`

  /** Returns only the authenticated user's own profile. */
  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.apiUrl)
  }

  /**
   * Changes the authenticated user's own password. Requires the current
   * password. Every session ends; the response is a new pair for this device.
   */
  changePassword(request: ChangePasswordRequest): Observable<AuthResponse> {
    return this.http.patch<AuthResponse>(this.apiUrl, request)
  }
}
