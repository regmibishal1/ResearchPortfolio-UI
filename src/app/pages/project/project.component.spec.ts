import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'

import { ProjectComponent } from './project.component'

describe('ProjectComponent', () => {
  let component: ProjectComponent
  let fixture: ComponentFixture<ProjectComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectComponent],
      providers: [provideRouter([])],
    }).compileComponents()

    fixture = TestBed.createComponent(ProjectComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('gives each card exactly one link to its case study, with no nested button role', () => {
    const el: HTMLElement = fixture.nativeElement
    const cards = el.querySelectorAll('.project-card')
    expect(cards.length).toBeGreaterThan(0)
    cards.forEach((card) => {
      expect(card.getAttribute('role')).toBeNull()
      expect(card.querySelectorAll('.card-title-link').length).toBe(1)
    })
  })

  it('reports the active filter with aria-pressed', () => {
    const el: HTMLElement = fixture.nativeElement
    const pressed = Array.from(el.querySelectorAll('.filter-btn[aria-pressed="true"]'))
    expect(pressed.map((b) => b.textContent?.trim())).toEqual(['All'])
  })
})
