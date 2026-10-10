import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http'
import { BehaviorSubject } from 'rxjs'

import { ProjectDetailComponent } from './project-detail.component'
import { PROJECTS } from '../../data/projects'

describe('ProjectDetailComponent', () => {
  let fixture: ComponentFixture<ProjectDetailComponent>
  const params = new BehaviorSubject(convertToParamMap({}))

  function render(id: string): HTMLElement {
    params.next(convertToParamMap({ id }))
    fixture.detectChanges()
    return fixture.nativeElement as HTMLElement
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProjectDetailComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: params.asObservable() } },
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    })
    fixture = TestBed.createComponent(ProjectDetailComponent)
  })

  const headings = (el: HTMLElement) =>
    [...el.querySelectorAll('h2')].map((h) => h.textContent!.trim())

  it('renders a known project', () => {
    const el = render('showupmd')
    expect(el.querySelector('.detail-page')).not.toBeNull()
    expect(el.querySelector('app-page-not-found')).toBeNull()
  })

  it('shows the not-found page for an unknown project instead of redirecting', () => {
    const el = render('no-such-project')
    expect(el.querySelector('.detail-page')).toBeNull()
    expect(el.querySelector('app-page-not-found')).not.toBeNull()
  })

  it('leads with the breadcrumb, title, summary and results in that order', () => {
    const el = render('mri-classification')
    const crumbs = [...el.querySelectorAll('.breadcrumb li')].map((li) => li.textContent!.trim())
    expect(crumbs).toEqual(['Projects', 'Classification of MRI Images'])
    expect(el.querySelector('h1')!.textContent!.trim()).toBe('Classification of MRI Images')
    expect(headings(el).slice(0, 3)).toEqual(['Summary', 'Results', 'Explore the results'])
  })

  it('puts the balanced accuracy and the caveat next to the headline accuracy', () => {
    const el = render('mri-classification')
    const tiles = [...el.querySelectorAll('.result-tile')].map((t) => t.textContent!)
    expect(tiles.some((t) => t.includes('99.06%') && t.includes('Test accuracy'))).toBeTrue()
    expect(tiles.some((t) => t.includes('97.22%') && t.includes('Balanced accuracy'))).toBeTrue()
    expect(el.querySelector('.results-note')!.textContent).toContain('not a clinical result')
  })

  it('skips the results section when a project has no measured results', () => {
    const el = render('showupmd')
    expect(headings(el)).not.toContain('Results')
  })

  it('shows a model card after what was built, only for projects that have one', () => {
    const el = render('mri-classification')
    const all = headings(el)
    expect(all.indexOf('Model card')).toBe(all.indexOf('What I built') + 1)
    const terms = [...el.querySelectorAll('.model-card dt')].map((dt) => dt.textContent!.trim())
    expect(terms).toEqual(['Data', 'Model', 'Metric', 'Result', 'Known limits', 'Last run'])

    expect(headings(render('showupmd'))).not.toContain('Model card')
  })

  it('says how big the report download is', () => {
    const el = render('mri-classification')
    const report = [...el.querySelectorAll('.actions a')].find((a) =>
      a.textContent!.includes('report')
    )!
    expect(report.textContent!.trim()).toBe('Read the report (PDF, 7.5 MB)')
  })

  it('orders the actions live site, report, then code', () => {
    const el = render('world-cup-prediction')
    const actions = [...el.querySelectorAll('.actions a')].map((a) => a.textContent!.trim())
    expect(actions[0]).toBe('Open the dashboard')
    expect(actions.slice(1).every((a) => a.startsWith('Code'))).toBeTrue()
  })

  it('links the neighboring projects and follows the id when it changes', () => {
    const second = PROJECTS[1]
    let el = render(second.id)
    const pager = [...el.querySelectorAll<HTMLAnchorElement>('.pager a')]
    expect(pager.map((a) => a.getAttribute('href'))).toEqual([
      `/project/${PROJECTS[0].id}`,
      `/project/${PROJECTS[2].id}`,
    ])

    el = render(PROJECTS[0].id)
    expect(el.querySelector('h1')!.textContent!.trim()).toBe(PROJECTS[0].title)
    expect(el.querySelectorAll('.pager a').length).toBe(1)
  })
})
