import { POSTS, getPost } from './blog'

describe('blog data', () => {
  it('has at least one post', () => {
    expect(POSTS.length).toBeGreaterThan(0)
  })

  it('has unique slugs', () => {
    const slugs = POSTS.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
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
})
