import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core'

import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar } from '@angular/material/snack-bar'
import { finalize } from 'rxjs/operators'
import { UserService, UserProfile, ChangePasswordRequest } from '../../services/user.service'
import { AuthService } from '../auth/auth.service'
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
  private snackBar = inject(MatSnackBar)
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

  ngOnInit(): void {
    this.userService
      .getProfile()
      .pipe(finalize(() => (this.loadingProfile = false)))
      .subscribe({
        next: (profile) => (this.profile = profile),
        error: () => {
          // Token invalid or expired, so clear the session and send to login
          this.authService.logout().subscribe({ complete: () => this.router.navigate(['/login']) })
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
      this.snackBar.open('New passwords do not match.', 'Close', { duration: 4000 })
      return
    }
    if (this.passwordForm.newPassword.length < 8) {
      this.snackBar.open('Password must be at least 8 characters.', 'Close', { duration: 4000 })
      return
    }

    this.changingPassword = true
    this.userService
      .changePassword(this.passwordForm)
      .pipe(finalize(() => (this.changingPassword = false)))
      .subscribe({
        next: () => {
          this.snackBar.open('Password updated successfully!', 'Close', { duration: 4000 })
          this.passwordForm = { currentPassword: '', newPassword: '', confirmationPassword: '' }
        },
        error: (err) => {
          const msg = err?.error?.message ?? 'Failed to update password.'
          this.snackBar.open(msg, 'Close', { duration: 5000 })
        },
      })
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      complete: () => this.router.navigate(['/login']),
    })
  }
}
