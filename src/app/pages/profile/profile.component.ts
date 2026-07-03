import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar } from '@angular/material/snack-bar'
import { finalize } from 'rxjs/operators'
import { UserService, UserProfile, ChangePasswordRequest } from '../../services/user.service'
import { AuthService } from '../auth/auth.service'

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
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

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

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
