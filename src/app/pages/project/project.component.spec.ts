import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router'
import { BehaviorSubject } from 'rxjs'

import { ProjectComponent } from './project.component'
import { PROJECTS } from '../../data/projects'

describe('ProjectComponent', () => {
  let component: ProjectComponent
  let fixture: ComponentFixture<ProjectComponent>
  let el: HTMLElement
  const query = new BehaviorSubject(convertToParamMap({}))

  beforeEach(async () => {
    query.next(convertToParamMap({}))
    await TestBed.configureTestingModule({
      imports: [ProjectComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { queryParamMap: query.asObservable() } },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(ProjectComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
    el = fixture.nativeElement
  })

  const archiveTitles = () =>
    [...el.querySelectorAll('.archive-table tbody .col-title a')].map((a) => a.textContent!.trim())

  it('splits every project between the featured cards and the archive table', () => {
    const cards = el.querySelectorAll('app-work-card').length
    expect(cards).toBe(PROJECTS.filter((p) => p.featured).length)
    expect(cards + archiveTitles().length).toBe(PROJECTS.length)
  })

  it('counts the projects and the years they span', () => {
    expect(el.querySelector('.page-count')!.textContent!.trim()).toMatch(
      new RegExp(`^${PROJECTS.length} projects, \\d{4}-\\d{4}$`)
    )
  })

  it('offers each type with its count and marks the active one', () => {
    const buttons = [...el.querySelectorAll<HTMLButtonElement>('.filter-group button')]
    expect(buttons.map((b) => b.textContent!.replace(/\s+/g, ' ').trim())).toEqual([
      `All ${PROJECTS.length} projects`,
      `Product ${PROJECTS.filter((p) => p.type === 'product').length} projects`,
      `Research ${PROJECTS.filter((p) => p.type === 'research').length} projects`,
      `Coursework ${PROJECTS.filter((p) => p.type === 'coursework').length} projects`,
    ])
    expect(buttons.filter((b) => b.getAttribute('aria-pressed') === 'true').length).toBe(1)
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true')
  })

  it('filters both sections by the type in the URL', () => {
    query.next(convertToParamMap({ type: 'coursework' }))
    fixture.detectChanges()
    const coursework = PROJECTS.filter((p) => p.type === 'coursework')
    expect(el.querySelectorAll('app-work-card').length).toBe(
      coursework.filter((p) => p.featured).length
    )
    expect(archiveTitles().length).toBe(coursework.filter((p) => !p.featured).length)
  })

  it('ignores an unknown type in the URL', () => {
    query.next(convertToParamMap({ type: 'nonsense' }))
    fixture.detectChanges()
    expect(component.filter).toBe('all')
  })

  it('sorts the archive by title from its header button and reports it', () => {
    const titleHeader = el.querySelectorAll<HTMLElement>('.archive-table th')[1]
    expect(titleHeader.getAttribute('aria-sort')).toBe('none')

    titleHeader.querySelector('button')!.click()
    fixture.detectChanges()
    const titles = archiveTitles()
    expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b)))
    expect(titleHeader.getAttribute('aria-sort')).toBe('ascending')

    titleHeader.querySelector('button')!.click()
    fixture.detectChanges()
    expect(archiveTitles()).toEqual([...titles].reverse())
    expect(titleHeader.getAttribute('aria-sort')).toBe('descending')
  })

  it('lists the archive newest first by default', () => {
    const years = [...el.querySelectorAll('.archive-table tbody .col-year')].map((td) =>
      Number(td.textContent)
    )
    expect(years).toEqual([...years].sort((a, b) => b - a))
  })
})
