import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'

import { BlogComponent } from './blog.component'
import { POSTS, readingMinutes } from '../../data/blog'

describe('BlogComponent', () => {
  it('lists each post with its date, reading time and one link to it', () => {
    TestBed.configureTestingModule({ imports: [BlogComponent], providers: [provideRouter([])] })
    const fixture = TestBed.createComponent(BlogComponent)
    fixture.detectChanges()
    const cards = [...(fixture.nativeElement as HTMLElement).querySelectorAll('.post-card')]

    expect(cards.length).toBe(POSTS.length)
    cards.forEach((card, i) => {
      expect(card.querySelectorAll('a').length).toBe(1)
      expect(card.querySelector('a')!.getAttribute('href')).toBe(`/blog/${POSTS[i].slug}`)
      expect(card.querySelector('.post-meta')!.textContent).toContain(
        `${readingMinutes(POSTS[i])} min read`
      )
    })
  })

  it('links the RSS feed', () => {
    TestBed.configureTestingModule({ imports: [BlogComponent], providers: [provideRouter([])] })
    const fixture = TestBed.createComponent(BlogComponent)
    fixture.detectChanges()
    const feed = (fixture.nativeElement as HTMLElement).querySelector('.feed-link')!
    expect(feed.getAttribute('href')).toBe('/feed.xml')
  })
})
