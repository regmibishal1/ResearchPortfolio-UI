import { ComponentFixture, TestBed } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { RouterModule } from '@angular/router'

import { NavbarComponent } from './navbar.component'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

describe('NavbarComponent', () => {
  let component: NavbarComponent
  let fixture: ComponentFixture<NavbarComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NavbarComponent,
        RouterModule.forRoot([]),
        HttpClientTestingModule,
        BrowserAnimationsModule,
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

  it('moves focus to the main region from the skip link', () => {
    const el: HTMLElement = fixture.nativeElement
    el.querySelector<HTMLAnchorElement>('.skip-link')!.click()

    expect(document.activeElement).toBe(el.querySelector('main'))
  })
})
