import { Component, ElementRef, ViewChild } from '@angular/core'

import { Router } from '@angular/router'
import { AuthService, RegisterModel, LoginModel } from './auth.service'
import { FormsModule, NgForm } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatIconModule } from '@angular/material/icon'
import { finalize } from 'rxjs/operators'
import { SeoService } from '../../services/seo.service'
import { environment } from '../../../environments/environment'

type Mode = 'login' | 'register'

@Component({
  selector: 'app-auth',
  imports: [FormsModule, MatProgressBarModule, MatIconModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent {
  /** Accounts are by invitation; sign-up only appears when this is switched on. */
  readonly registrationOpen = environment.features.registration

  mode: Mode = 'login'
  registerObj: RegisterModel = new RegisterModel()
  loginObj: LoginModel = new LoginModel()
  isLoading = false
  showPassword = false
  submitted = false
  formError = ''

  @ViewChild('errorSummary') errorSummary?: ElementRef<HTMLElement>

  constructor(
    private router: Router,
    private authService: AuthService,
    private _snackBar: MatSnackBar,
    private seo: SeoService
  ) {
    // /login and /register share this component; pick the initial form
    // from the route so deep links to /register land on the right view.
    const wantsRegister = this.router.url.startsWith('/register')
    this.setMode(this.registrationOpen && wantsRegister ? 'register' : 'login')
  }

  setMode(mode: Mode) {
    this.mode = mode
    this.submitted = false
    this.formError = ''
    this.showPassword = false
    this.seo.setNoIndex(
      mode === 'login' ? 'Sign in | Bishal Regmi' : 'Create your account | Bishal Regmi'
    )
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
          this.router.navigate(['/'])
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
