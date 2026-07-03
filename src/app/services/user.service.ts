import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../environments/environment'

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
  private readonly apiUrl = `${environment.apiBaseUrl}/user`

  constructor(private http: HttpClient) {}

  /** Returns only the authenticated user's own profile. */
  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.apiUrl)
  }

  /** Changes the authenticated user's own password. Requires the current password. */
  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.patch<void>(this.apiUrl, request)
  }
}
