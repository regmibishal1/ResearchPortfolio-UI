import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core'

import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { ToastService } from '../../shared/toast/toast.service'
import { finalize } from 'rxjs/operators'
import { UserService, UserProfile, ChangePasswordRequest } from '../../services/user.service'
import { AuthService } from '../auth/auth.service'
import { SeoService } from '../../services/seo.service'
import { IconComponent } from '../../shared/icon/icon.component'

@Component({
  selector: 'app-profile',
  imports: [IconComponent, FormsModule, MatProgressSpinnerModule],
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private userService = inject(UserService)
  private authService = inject(AuthService)
  private toasts = inject(ToastService)
  private router = inject(Router)

  profile: UserProfile | null = null
  loadingProfile = true

  passwordForm: ChangePasswordRequest = {
    currentPassword: '',
    newPassword: '',
    confirmationPassword: '',
  }
  changingPassword = false
  showCurrentPassword = false
  showNewPassword = false
  showConfirmPassword = false

  constructor() {
    // Signed-in only; without its own title the tab kept the sign-in page's.
    inject(SeoService).setNoIndex('Profile | Bishal Regmi')
  }

  ngOnInit(): void {
    this.userService
      .getProfile()
      .pipe(finalize(() => (this.loadingProfile = false)))
      .subscribe({
        next: (profile) => (this.profile = profile),
        // An expired session is renewed, or ended, by the interceptor; this
        // only sees the requests that failed for another reason.
        error: () => {
          this.toasts.show('Could not load your profile. Try again in a moment.', 6000)
        },
      })
  }

  get initials(): string {
    if (!this.profile) return '?'
    return `${this.profile.firstname[0]}${this.profile.lastname[0]}`.toUpperCase()
  }

  get fullName(): string {
    if (!this.profile) return ''
    return `${this.profile.firstname} ${this.profile.lastname}`
  }

  onChangePassword(): void {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmationPassword) {
      this.toasts.show('New passwords do not match.', 4000)
      return
    }
    if (this.passwordForm.newPassword.length < 8) {
      this.toasts.show('Password must be at least 8 characters.', 4000)
      return
    }

    this.changingPassword = true
    this.userService
      .changePassword(this.passwordForm)
      .pipe(finalize(() => (this.changingPassword = false)))
      .subscribe({
        next: (session) => {
          // Older API versions answer with an empty body and keep the session.
          if (session?.access_token) this.authService.setSession(session)
          this.toasts.show('Password changed. Other devices are signed out.', 6000)
          this.passwordForm = { currentPassword: '', newPassword: '', confirmationPassword: '' }
        },
        error: (err) => {
          const msg = err?.error?.message ?? 'Failed to update password.'
          this.toasts.show(msg, 5000)
        },
      })
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      complete: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    })
  }
}
