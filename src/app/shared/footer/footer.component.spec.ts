import { ComponentFixture, TestBed } from '@angular/core/testing'

import { FooterComponent } from './footer.component'

describe('FooterComponent', () => {
  let fixture: ComponentFixture<FooterComponent>
  let el: HTMLElement

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FooterComponent] }).compileComponents()
    fixture = TestBed.createComponent(FooterComponent)
    fixture.detectChanges()
    el = fixture.nativeElement
  })

  it('opens the profile links in a new tab but not the email link', () => {
    const links = [...el.querySelectorAll<HTMLAnchorElement>('.footer-social-link')]
    const byName = (name: string) => links.find((a) => a.textContent!.includes(name))!

    expect(byName('GitHub').target).toBe('_blank')
    expect(byName('LinkedIn').rel).toContain('noopener')
    expect(byName('Email').href).toBe('mailto:contact@bishalregmi.com')
    expect(byName('Email').hasAttribute('target')).toBeFalse()
    expect(byName('RSS').getAttribute('href')).toBe('/feed.xml')
  })

  it('draws an icon for each link', () => {
    expect(el.querySelectorAll('.footer-social-link svg').length).toBe(4)
  })

  it('shows the last updated date only when the build provides one', () => {
    expect(el.textContent).not.toContain('Last updated')

    fixture.componentRef.instance.buildDate = '2026-10-10'
    fixture.componentRef.changeDetectorRef.markForCheck()
    fixture.detectChanges()
    expect(el.textContent).toContain('Last updated Oct 10, 2026')
  })
})
