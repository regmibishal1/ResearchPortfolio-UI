import {
  Component,
  ElementRef,
  PLATFORM_ID,
  ViewChild,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core'
import { isPlatformBrowser } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router'
import { AuthService, RegisterModel, LoginModel, safeNext } from './auth.service'
import { FormsModule, NgForm } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { finalize } from 'rxjs/operators'
import { SeoService } from '../../services/seo.service'
import { environment } from '../../../environments/environment'
import { IconComponent } from '../../shared/icon/icon.component'

type Mode = 'login' | 'register' | 'reset'

const MIN_PASSWORD_LENGTH = 8

@Component({
  selector: 'app-auth',
  imports: [IconComponent, FormsModule, MatProgressBarModule],
  templateUrl: './auth.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './auth.component.scss',
})
export class AuthComponent {
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private authService = inject(AuthService)
  private _snackBar = inject(MatSnackBar)
  private seo = inject(SeoService)

  /** Accounts are by invitation; sign-up only appears when this is switched on. */
  readonly registrationOpen = environment.features.registration

  mode: Mode = 'login'
  registerObj: RegisterModel = new RegisterModel()
  loginObj: LoginModel = new LoginModel()
  isLoading = false
  showPassword = false
  submitted = false
  formError = ''

  /** From a reset link's fragment; empty when the link was cut short. */
  resetToken = ''
  newPassword = ''
  confirmPassword = ''
  resetDone = false
  readonly minPasswordLength = MIN_PASSWORD_LENGTH

  @ViewChild('errorSummary') errorSummary?: ElementRef<HTMLElement>

  constructor() {
    // /login, /register and /reset share this component; pick the initial
    // form from the route so deep links land on the right view.
    const url = this.router.url
    if (url.startsWith('/reset')) {
      this.readResetToken()
      this.setMode('reset')
    } else {
      const wantsRegister = url.startsWith('/register')
      this.setMode(this.registrationOpen && wantsRegister ? 'register' : 'login')
    }
  }

  // The token travels in the fragment so it never reaches a server log.
  // Take it, then strip it from the address bar and history.
  private readResetToken() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return
    const match = /(?:^#|&)token=([^&]+)/.exec(location.hash)
    this.resetToken = match ? decodeURIComponent(match[1]) : ''
    if (location.hash) history.replaceState(history.state, '', location.pathname + location.search)
  }

  setMode(mode: Mode) {
    this.mode = mode
    this.submitted = false
    this.formError = ''
    this.showPassword = false
    const titles: Record<Mode, string> = {
      login: 'Sign in | Bishal Regmi',
      register: 'Create your account | Bishal Regmi',
      reset: 'Choose a new password | Bishal Regmi',
    }
    this.seo.setNoIndex(titles[mode])
  }

  onLogin(form: NgForm) {
    if (!this.validate(form)) return
    this.isLoading = true
    this.authService
      .login(this.loginObj)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this._snackBar.open('Signed in.', 'Close', { duration: 5000 })
          this.router.navigateByUrl(safeNext(this.route.snapshot.queryParamMap.get('next')))
        },
        error: (error: Error) => this.showError(error.message),
      })
  }

  onRegister(form: NgForm) {
    if (!this.validate(form)) return
    this.isLoading = true
    this.authService
      .register(this.registerObj)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this._snackBar.open('Account created. You are signed in.', 'Close', { duration: 5000 })
          this.router.navigate(['/'])
        },
        error: (error: Error) => this.showError(error.message),
      })
  }

  onReset(form: NgForm) {
    if (!this.validate(form)) return
    if (this.newPassword !== this.confirmPassword) {
      this.showError('The two passwords do not match.')
      return
    }
    this.isLoading = true
    this.authService
      .resetPassword(this.resetToken, this.newPassword)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.resetDone = true
          this.newPassword = ''
          this.confirmPassword = ''
        },
        error: (error: Error) => this.showError(error.message),
      })
  }

  // Fields are checked on submit rather than by disabling the button, so the
  // form always explains what is missing.
  private validate(form: NgForm): boolean {
    this.submitted = true
    this.formError = ''
    if (this.isLoading) return false
    if (form.invalid) {
      this.focusSummary()
      return false
    }
    return true
  }

  private showError(message: string) {
    this.formError = message
    this.focusSummary()
  }

  private focusSummary() {
    setTimeout(() => this.errorSummary?.nativeElement.focus())
  }
}
