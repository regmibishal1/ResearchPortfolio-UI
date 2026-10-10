import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideHttpClient, withXhr } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { provideRouter } from '@angular/router'

import { DashboardComponent } from './dashboard.component'
import { POSTS } from '../../data/blog'

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>
  let httpMock: HttpTestingController
  let el: HTMLElement

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [provideRouter([]), provideHttpClient(withXhr()), provideHttpClientTesting()],
    }).compileComponents()

    httpMock = TestBed.inject(HttpTestingController)
    fixture = TestBed.createComponent(DashboardComponent)
    fixture.detectChanges()
    el = fixture.nativeElement
  })

  // Home is static: nothing on it waits on the API.
  afterEach(() => httpMock.verify())

  it('leads with the name as the only H1', () => {
    const h1s = el.querySelectorAll('h1')
    expect(h1s.length).toBe(1)
    expect(h1s[0].textContent!.trim()).toBe('Bishal Regmi')
  })

  it('spotlights the flagged project with its case study and live site', () => {
    const spotlight = el.querySelector('.spotlight')!
    expect(spotlight.querySelector('h2')!.textContent!.trim()).toContain('ShowUpMD')
    const links = [...spotlight.querySelectorAll<HTMLAnchorElement>('.spotlight-actions a')]
    expect(links.map((a) => a.textContent!.trim())).toEqual([
      'Read the case study',
      'Open live site',
    ])
    expect(links[0].getAttribute('href')).toBe('/project/showupmd')
    expect(links[1].getAttribute('href')).toBe('https://showupmd.org')
  })

  it('shows four selected projects other than the spotlight', () => {
    const titles = [...el.querySelectorAll('app-work-card h3')].map((h) => h.textContent!.trim())
    expect(titles.length).toBe(4)
    expect(titles.some((t) => t.includes('ShowUpMD'))).toBeFalse()
    expect(titles.some((t) => t.includes('World Cup'))).toBeTrue()
  })

  it('marks the finished World Cup project with its final results badge', () => {
    const card = [...el.querySelectorAll('app-work-card')].find((c) =>
      c.textContent!.includes('World Cup')
    )!
    expect(card.querySelector('.status-badge')!.textContent!.trim()).toBe('Final results')
  })

  it('links the newest post', () => {
    const link = el.querySelector<HTMLAnchorElement>('.post-title a')!
    expect(link.textContent!.trim()).toBe(POSTS[0].title)
    expect(link.getAttribute('href')).toBe(`/blog/${POSTS[0].slug}`)
  })
})
