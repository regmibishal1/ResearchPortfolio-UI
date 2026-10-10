import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'

import { AboutComponent } from './about.component'

describe('AboutComponent', () => {
  let fixture: ComponentFixture<AboutComponent>
  let el: HTMLElement

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutComponent],
      providers: [provideRouter([])],
    }).compileComponents()
    fixture = TestBed.createComponent(AboutComponent)
    fixture.detectChanges()
    el = fixture.nativeElement
  })

  it('puts experience and education before skills, and ends with contact', () => {
    const sections = [...el.querySelectorAll('h2')].map((h) => h.textContent!.trim())
    expect(sections).toEqual([
      'Bishal Regmi',
      'Experience',
      'Education',
      'Papers and reports',
      'Skills and technologies',
      'Certifications',
      "Let's connect",
    ])
  })

  it('gives the stats as label and value pairs', () => {
    const first = el.querySelector('.stats .stat')!
    expect(first.querySelector('dt')!.textContent!.trim()).toBe('Experience')
    expect(first.querySelector('dd')!.textContent).toContain('years')
  })

  it('opens profile links in a new tab but not the email link', () => {
    const links = [...el.querySelectorAll<HTMLAnchorElement>('.contact-links a')]
    const email = links.find((a) => a.href.startsWith('mailto:'))!
    expect(email.hasAttribute('target')).toBeFalse()
    expect(links.filter((a) => a.target === '_blank').length).toBe(2)
  })

  it('lists each report with its size and a link to its case study', () => {
    const papers = [...el.querySelectorAll('.paper')]
    expect(papers.length).toBeGreaterThan(0)
    for (const paper of papers) {
      expect(paper.querySelector('.paper-title a')!.getAttribute('href')).toMatch(/\.pdf$/)
      expect(paper.querySelector('.paper-meta')!.textContent).toMatch(/PDF, [\d.]+ (KB|MB)/)
      expect(paper.querySelector('.paper-case')!.getAttribute('href')).toMatch(/^\/project\//)
    }
  })
})
