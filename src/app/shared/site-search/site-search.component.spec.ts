import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks, tick } from '@angular/core/testing'
import { provideRouter, Router } from '@angular/router'

import { Pagefind, SiteSearchComponent } from './site-search.component'

const PAGES = [
  { url: '/project/mri-classification', title: 'Classification of MRI Images' },
  { url: '/assets/papers/alzheimer-mri-resnet.pdf', title: 'MRI report (PDF)' },
]

const fakePagefind: Pagefind = {
  search: async (query) => ({
    results: PAGES.filter((p) => p.title.toLowerCase().includes(query.toLowerCase())).map((p) => ({
      data: async () => ({
        url: p.url,
        meta: { title: p.title },
        excerpt: `<mark>${query}</mark>`,
      }),
    })),
  }),
}

describe('SiteSearchComponent', () => {
  let fixture: ComponentFixture<SiteSearchComponent>
  let component: SiteSearchComponent
  let el: HTMLElement

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteSearchComponent],
      providers: [provideRouter([])],
    }).compileComponents()
    fixture = TestBed.createComponent(SiteSearchComponent)
    component = fixture.componentInstance
    component.loadPagefind = async () => fakePagefind
    fixture.detectChanges()
    el = fixture.nativeElement
  })

  afterEach(() => component.close())

  const dialog = () => el.querySelector('dialog')!

  function type(query: string): void {
    const input = el.querySelector('input')!
    input.value = query
    input.dispatchEvent(new Event('input'))
    tick(150)
    flushMicrotasks()
    fixture.detectChanges()
  }

  it('opens from the toolbar button with focus in the field', () => {
    el.querySelector<HTMLButtonElement>('.search-btn')!.click()
    expect(dialog().open).toBeTrue()
    expect(document.activeElement).toBe(el.querySelector('input'))
  })

  it('opens on "/" but not while typing in a field or with a modifier held', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: '/', ctrlKey: true }))
    expect(dialog().open).toBeFalse()

    const field = document.createElement('input')
    document.body.appendChild(field)
    field.dispatchEvent(new KeyboardEvent('keydown', { key: '/', bubbles: true }))
    expect(dialog().open).toBeFalse()
    field.remove()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: '/' }))
    expect(dialog().open).toBeTrue()
  })

  it('lists matches with their excerpts and announces the count', fakeAsync(() => {
    component.open()
    type('mri')

    const results = [...el.querySelectorAll<HTMLAnchorElement>('.search-result')]
    expect(results.map((a) => a.getAttribute('href'))).toEqual(PAGES.map((p) => p.url))
    expect(results[0].querySelector('mark')!.textContent).toBe('mri')
    expect(el.querySelector('[role="status"]')!.textContent).toContain('2 results')
    // Reports open in a new tab; pages stay in the app.
    expect(results[1].target).toBe('_blank')
    expect(results[0].hasAttribute('target')).toBeFalse()
  }))

  it('says so when nothing matches', fakeAsync(() => {
    component.open()
    type('zzz')
    expect(el.querySelectorAll('.search-result').length).toBe(0)
    expect(el.querySelector('[role="status"]')!.textContent).toContain('No results for "zzz"')
  }))

  it('routes to a page result and closes the dialog', fakeAsync(() => {
    const navigate = spyOn(TestBed.inject(Router), 'navigateByUrl')
    component.open()
    type('classification')
    el.querySelector<HTMLAnchorElement>('.search-result')!.click()

    expect(navigate).toHaveBeenCalledWith('/project/mri-classification')
    expect(dialog().open).toBeFalse()
  }))

  it('closes on a click on the backdrop but not inside the panel', () => {
    component.open()
    el.querySelector<HTMLElement>('.search-panel')!.click()
    expect(dialog().open).toBeTrue()
    dialog().click()
    expect(dialog().open).toBeFalse()
  })

  it('explains when the index cannot load, as in a dev build', fakeAsync(() => {
    component.loadPagefind = () => Promise.reject(new Error('404'))
    component.open()
    type('mri')
    expect(el.querySelector('[role="status"]')!.textContent).toContain('not available')
  }))
})
