import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router'
import { BehaviorSubject } from 'rxjs'

import { BlogPostComponent } from './blog-post.component'
import { POSTS, readingMinutes } from '../../data/blog'

describe('BlogPostComponent', () => {
  let fixture: ComponentFixture<BlogPostComponent>
  const params = new BehaviorSubject(convertToParamMap({}))

  function render(slug: string): HTMLElement {
    params.next(convertToParamMap({ slug }))
    fixture.detectChanges()
    return fixture.nativeElement as HTMLElement
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BlogPostComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: params.asObservable() } },
      ],
    })
    fixture = TestBed.createComponent(BlogPostComponent)
  })

  it('shows the byline with the reading time', () => {
    const post = POSTS[0]
    const el = render(post.slug)
    const byline = el.querySelector('.byline-text')!.textContent!
    expect(byline).toContain('By Bishal Regmi')
    expect(byline).toContain(`${readingMinutes(post)} min read`)
  })

  it('lists the sections in a table of contents that links to their headings', () => {
    const el = render(POSTS[0].slug)
    const links = [...el.querySelectorAll<HTMLAnchorElement>('.toc-rail a')]
    expect(links.length).toBeGreaterThanOrEqual(4)
    const id = links[0].getAttribute('href')!.split('#')[1]
    expect(el.querySelector(`h2[id="${id}"]`)).not.toBeNull()
  })

  it('ends with a reply link, the related project and the neighboring post', () => {
    const el = render(POSTS[0].slug)
    const reply = el.querySelector<HTMLAnchorElement>('.reply a')!
    expect(reply.getAttribute('href')).toMatch(/^mailto:contact@bishalregmi\.com\?subject=Re%3A%20/)
    expect(el.querySelector('.post-footer app-work-card')).not.toBeNull()
    expect(el.querySelector('.pager-older .pager-title')!.textContent!.trim()).toBe(POSTS[1].title)
  })

  it('follows the slug when it changes and shows the 404 page for an unknown one', () => {
    let el = render(POSTS[1].slug)
    expect(el.querySelector('h1')!.textContent!.trim()).toBe(POSTS[1].title)
    el = render('no-such-post')
    expect(el.querySelector('app-page-not-found')).not.toBeNull()
  })
})
