import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { Title } from '@angular/platform-browser'
import { AuthComponent } from './auth.component'
import { AuthService } from './auth.service'

describe('AuthComponent', () => {
  let component: AuthComponent
  let fixture: ComponentFixture<AuthComponent>
  let el: HTMLElement

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthComponent, HttpClientTestingModule],
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
})
