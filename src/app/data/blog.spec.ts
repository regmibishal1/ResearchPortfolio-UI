import { POSTS, getPost, headingId, readingMinutes } from './blog'
import { IMAGE_SIZES } from './image-sizes'
import { PROJECTS } from './projects'

describe('blog data', () => {
  it('has at least one post', () => {
    expect(POSTS.length).toBeGreaterThan(0)
  })

  it('has unique slugs', () => {
    const slugs = POSTS.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('dates every post as a real ISO day, which the RSS feed relies on', () => {
    for (const post of POSTS) {
      expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(Number.isNaN(Date.parse(`${post.date}T12:00:00Z`))).toBeFalse()
    }
  })

  it('is sorted newest first by date', () => {
    const dates = POSTS.map((p) => p.date)
    const descending = [...dates].sort((a, b) => b.localeCompare(a))
    expect(dates).toEqual(descending)
  })

  it('resolves a post by slug and returns undefined for unknown slugs', () => {
    const first = POSTS[0]
    expect(getPost(first.slug)).toBe(first)
    expect(getPost('does-not-exist')).toBeUndefined()
  })

  it('gives every block a known kind and its required content', () => {
    for (const post of POSTS) {
      expect(post.body.length).toBeGreaterThan(0)
      for (const block of post.body) {
        expect(['h2', 'p', 'figure']).toContain(block.kind)
        if (block.kind === 'figure') {
          expect(block.src).toBeTruthy()
        } else {
          expect(block.text).toBeTruthy()
        }
      }
    }
  })

  it('estimates reading time at 230 words a minute', () => {
    const words = (n: number) => Array(n).fill('word').join(' ')
    const post = { ...POSTS[0], body: [{ kind: 'p' as const, text: words(690) }] }
    expect(readingMinutes(post)).toBe(3)
    expect(readingMinutes({ ...post, body: [{ kind: 'p' as const, text: 'short' }] })).toBe(1)
  })

  it('makes heading anchors from the heading text', () => {
    expect(headingId('The harder question: how much?')).toBe('the-harder-question-how-much')
  })

  it('points each related project at a real project', () => {
    for (const post of POSTS.filter((p) => p.relatedProject)) {
      expect(PROJECTS.some((p) => p.id === post.relatedProject))
        .withContext(post.slug)
        .toBeTrue()
    }
  })

  it('knows the size of every figure, so the page holds its space while it loads', () => {
    for (const post of POSTS) {
      for (const block of post.body.filter((b) => b.kind === 'figure')) {
        expect(IMAGE_SIZES[block.src!]).withContext(`${post.slug}: ${block.src}`).toBeDefined()
      }
    }
  })

  it('keeps search descriptions to 155 characters', () => {
    for (const post of POSTS) {
      const description = post.seoDescription ?? post.summary
      expect(description.length).withContext(post.slug).toBeLessThanOrEqual(155)
    }
  })
})
