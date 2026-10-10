import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { RouterModule } from '@angular/router'

import { NavbarComponent } from './navbar.component'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http'

describe('NavbarComponent', () => {
  let component: NavbarComponent
  let fixture: ComponentFixture<NavbarComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent, RouterModule.forRoot([]), BrowserAnimationsModule],
      providers: [
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(NavbarComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('opens and closes the mobile menu, keeping aria-expanded in step', () => {
    const el: HTMLElement = fixture.nativeElement
    const button = el.querySelector<HTMLButtonElement>('.nav-menu-btn')!
    const panel = el.querySelector<HTMLElement>('#mobile-nav')!

    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(panel.hidden).toBeTrue()

    button.click()
    fixture.detectChanges()
    expect(button.getAttribute('aria-expanded')).toBe('true')
    expect(panel.hidden).toBeFalse()
  })

  it('closes the menu on Escape and returns focus to the menu button', () => {
    const el: HTMLElement = fixture.nativeElement
    const button = el.querySelector<HTMLButtonElement>('.nav-menu-btn')!
    button.click()
    fixture.detectChanges()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    fixture.detectChanges()

    expect(component.menuOpen).toBeFalse()
    expect(document.activeElement).toBe(button)
  })

  it('lists the work first and ends with a contact link to the About page', () => {
    const el: HTMLElement = fixture.nativeElement
    const desktop = [...el.querySelectorAll<HTMLAnchorElement>('.desktop-nav a')]
    expect(desktop.map((a) => a.textContent!.trim())).toEqual([
      'Projects',
      'Blog',
      'About',
      'R\u00e9sum\u00e9',
      'Contact',
    ])
    expect(desktop[4].getAttribute('href')).toBe('/about#contact')

    const mobile = [...el.querySelectorAll<HTMLAnchorElement>('#mobile-nav a')]
    expect(mobile.map((a) => a.textContent!.trim())).toEqual([
      'Projects',
      'Blog',
      'About',
      'R\u00e9sum\u00e9',
      'Contact',
    ])
  })

  it('offers sign out in the mobile menu when signed in', () => {
    component.isAuthenticated = true
    fixture.detectChanges()
    const el: HTMLElement = fixture.nativeElement
    const signOut = [...el.querySelectorAll<HTMLButtonElement>('#mobile-nav button')].find(
      (b) => b.textContent!.trim() === 'Sign out'
    )
    expect(signOut).toBeDefined()
  })

  it('keeps the brand link inside the banner landmark', () => {
    const el: HTMLElement = fixture.nativeElement
    expect(el.querySelector('[role="banner"] .brand-link')).not.toBeNull()
  })

  it('moves focus to the main region from the skip link', () => {
    const el: HTMLElement = fixture.nativeElement
    el.querySelector<HTMLAnchorElement>('.skip-link')!.click()

    expect(document.activeElement).toBe(el.querySelector('main'))
  })
})
