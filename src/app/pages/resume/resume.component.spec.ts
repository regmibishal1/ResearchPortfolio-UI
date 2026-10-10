import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'

import { ResumeComponent } from './resume.component'
import { RESUME_PDF } from '../../data/resume'

describe('ResumeComponent', () => {
  let fixture: ComponentFixture<ResumeComponent>
  let component: ResumeComponent
  let el: HTMLElement

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumeComponent],
      providers: [provideRouter([])],
    }).compileComponents()
    fixture = TestBed.createComponent(ResumeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
    el = fixture.nativeElement
  })

  it('links the generated PDF as a download', () => {
    const pdf = el.querySelector<HTMLAnchorElement>('.resume-actions a[download]')!
    expect(pdf.getAttribute('href')).toBe(`/${RESUME_PDF}`)
  })

  it('lists exactly the public contact details', () => {
    const items = [...el.querySelectorAll('.contact-line li')].map((li) => li.textContent!.trim())
    expect(items).toEqual([
      'Ellicott City, MD',
      'contact@bishalregmi.com',
      'LinkedIn (opens in a new tab)',
      'GitHub (opens in a new tab)',
    ])
  })

  it('only offers skills that appear somewhere in the work', () => {
    expect(component.filterSkills.length).toBeGreaterThan(0)
    for (const skill of component.filterSkills) {
      component.toggle(skill)
      expect(component.status).toContain('highlighted in')
    }
  })

  it('marks the matching work while a skill is picked and clears on a second press', () => {
    const chip = [...el.querySelectorAll<HTMLButtonElement>('.filter-chips button')].find(
      (b) => b.textContent!.trim() === 'gRPC'
    )!
    chip.click()
    fixture.detectChanges()

    expect(chip.getAttribute('aria-pressed')).toBe('true')
    expect(el.querySelector('.resume-body')!.classList).toContain('filtering')
    const matches = el.querySelectorAll('.entry-points li.match')
    expect(matches.length).toBeGreaterThan(0)
    expect(matches[0].textContent).toContain('gRPC')

    chip.click()
    fixture.detectChanges()
    expect(chip.getAttribute('aria-pressed')).toBe('false')
    expect(el.querySelectorAll('.match').length).toBe(0)
  })

  it('matches whole words, and a versioned skill by its bare name', () => {
    component.selected = 'Java'
    expect(component.bulletMatches('Wrote the JavaScript client')).toBeFalse()
    expect(component.bulletMatches('Built it in Java and Spring Boot')).toBeTrue()

    component.selected = '.NET 8'
    expect(component.bulletMatches('Refactored 7 .NET microservices')).toBeTrue()
  })
})
