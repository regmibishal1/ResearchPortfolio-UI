import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { Title } from '@angular/platform-browser'
import { AuthComponent } from './auth.component'
import { AuthResponse, AuthService } from './auth.service'
import { ActivatedRoute, Router, provideRouter } from '@angular/router'
import { of } from 'rxjs'
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http'

describe('AuthComponent', () => {
  let component: AuthComponent
  let fixture: ComponentFixture<AuthComponent>
  let el: HTMLElement

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(AuthComponent)
    component = fixture.componentInstance
    el = fixture.nativeElement
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('titles the page and keeps it out of search', () => {
    expect(TestBed.inject(Title).getTitle()).toBe('Sign in | Bishal Regmi')
    expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
      'noindex'
    )
  })

  it('labels every field and offers autocomplete hints', () => {
    const username = el.querySelector<HTMLInputElement>('#login-username')!
    const password = el.querySelector<HTMLInputElement>('#login-password')!
    expect(el.querySelector('label[for="login-username"]')?.textContent?.trim()).toBe('Username')
    expect(el.querySelector('label[for="login-password"]')?.textContent?.trim()).toBe('Password')
    expect(username.getAttribute('autocomplete')).toBe('username')
    expect(password.getAttribute('autocomplete')).toBe('current-password')
  })

  it('does not offer sign-up while accounts are invitation only', () => {
    expect(component.registrationOpen).toBeFalse()
    expect(el.querySelector('.link-button')).toBeNull()
  })

  it('explains missing fields on submit instead of sending the request', fakeAsync(() => {
    const login = spyOn(TestBed.inject(AuthService), 'login')
    el.querySelector<HTMLButtonElement>('.auth-submit')!.click()
    fixture.detectChanges()
    tick()

    expect(login).not.toHaveBeenCalled()
    expect(el.querySelector('.error-summary')?.getAttribute('role')).toBe('alert')
    expect(el.querySelector('#login-username-error')?.textContent?.trim()).toBe(
      'Enter your username.'
    )
    expect(el.querySelector('#login-username')?.getAttribute('aria-describedby')).toBe(
      'login-username-error'
    )
  }))

  it('goes back to the page that asked for sign-in, but never off the site', fakeAsync(() => {
    const router = TestBed.inject(Router)
    const go = spyOn(router, 'navigateByUrl').and.resolveTo(true)
    spyOn(TestBed.inject(AuthService), 'login').and.returnValue(of(new AuthResponse()))
    const route = (component as unknown as { route: ActivatedRoute }).route
    spyOn(route.snapshot.queryParamMap, 'get').and.returnValue('//evil.example')

    component.loginObj = { username: 'me', password: 'pw' }
    fixture.detectChanges()
    tick()
    el.querySelector<HTMLButtonElement>('.auth-submit')!.click()
    tick()
    expect(go).toHaveBeenCalledWith('/')
  }))
})

describe('AuthComponent forgot password', () => {
  let fixture: ComponentFixture<AuthComponent>
  let component: AuthComponent
  let el: HTMLElement

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents()
    fixture = TestBed.createComponent(AuthComponent)
    component = fixture.componentInstance
    el = fixture.nativeElement
    fixture.detectChanges()
  })

  it('stays hidden until mail is set up', () => {
    expect(component.resetByEmail).toBeFalse()
    expect(el.textContent).not.toContain('Forgot your password?')
  })

  it('sends the address and answers the same way for any address', fakeAsync(() => {
    component.resetByEmail = true
    fixture.detectChanges()
    const link = [...el.querySelectorAll<HTMLButtonElement>('.link-button')].find((b) =>
      b.textContent!.includes('Forgot your password?')
    )!
    link.click()
    fixture.detectChanges()
    expect(component.mode).toBe('forgot')
    expect(el.querySelector('#forgot-email')?.getAttribute('autocomplete')).toBe('email')

    const forgot = spyOn(TestBed.inject(AuthService), 'forgotPassword').and.returnValue(
      of(undefined)
    )
    component.forgotEmail = 'me@example.test'
    fixture.detectChanges()
    tick()
    el.querySelector<HTMLButtonElement>('.auth-submit')!.click()
    fixture.detectChanges()
    tick()
    expect(forgot).toHaveBeenCalledWith('me@example.test')
    expect(el.querySelector('[role="status"]')?.textContent).toContain(
      'If that address has an account'
    )
  }))
})

describe('AuthComponent on a reset link', () => {
  let fixture: ComponentFixture<AuthComponent>
  let component: AuthComponent
  let el: HTMLElement

  async function open(hash: string) {
    await TestBed.configureTestingModule({
      imports: [AuthComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents()
    spyOnProperty(TestBed.inject(Router), 'url').and.returnValue('/reset')
    history.replaceState(history.state, '', location.pathname + location.search + hash)
    fixture = TestBed.createComponent(AuthComponent)
    component = fixture.componentInstance
    el = fixture.nativeElement
    fixture.detectChanges()
  }

  afterEach(() => history.replaceState(history.state, '', location.pathname + location.search))

  it('takes the token from the link and removes it from the address bar', async () => {
    await open('#token=abc123')
    expect(component.mode).toBe('reset')
    expect(component.resetToken).toBe('abc123')
    expect(location.hash).toBe('')
    expect(TestBed.inject(Title).getTitle()).toBe('Choose a new password | Bishal Regmi')
    expect(el.querySelector('#reset-password')?.getAttribute('autocomplete')).toBe('new-password')
  })

  it('says the link is incomplete when it has no token', async () => {
    await open('')
    expect(el.querySelector('form')).toBeNull()
    expect(el.textContent).toContain('This reset link is incomplete')
  })

  it('checks the two passwords match before sending anything', fakeAsync(async () => {
    await open('#token=abc123')
    const reset = spyOn(TestBed.inject(AuthService), 'resetPassword')
    component.newPassword = 'first-password'
    component.confirmPassword = 'second-password'
    fixture.detectChanges()
    tick()
    el.querySelector<HTMLButtonElement>('.auth-submit')!.click()
    fixture.detectChanges()
    tick()
    expect(reset).not.toHaveBeenCalled()
    expect(el.querySelector('.error-summary')?.textContent).toContain('do not match')
  }))

  it('sets the new password with the token and confirms', fakeAsync(async () => {
    await open('#token=abc123')
    const reset = spyOn(TestBed.inject(AuthService), 'resetPassword').and.returnValue(of(undefined))
    component.newPassword = 'a-new-password'
    component.confirmPassword = 'a-new-password'
    fixture.detectChanges()
    tick()
    el.querySelector<HTMLButtonElement>('.auth-submit')!.click()
    fixture.detectChanges()
    tick()
    expect(reset).toHaveBeenCalledWith('abc123', 'a-new-password')
    expect(el.querySelector('[role="status"]')?.textContent).toContain('Password changed')
  }))
})
