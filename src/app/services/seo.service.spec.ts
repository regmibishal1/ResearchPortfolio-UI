import { TestBed } from '@angular/core/testing'
import { DOCUMENT } from '@angular/common'
import { SeoService } from './seo.service'

describe('SeoService', () => {
  let seo: SeoService
  let doc: Document

  const jsonLd = () => {
    const script = doc.getElementById('page-jsonld')
    return script ? JSON.parse(script.textContent ?? '') : null
  }
  const canonical = () =>
    doc.head.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null

  beforeEach(() => {
    TestBed.configureTestingModule({})
    seo = TestBed.inject(SeoService)
    doc = TestBed.inject(DOCUMENT)
  })

  afterEach(() => seo.setNoIndex('reset'))

  it('sets the canonical link and og:url from the page path', () => {
    seo.setPage({ title: 'About | Bishal Regmi', description: 'About me', path: '/about' })

    expect(canonical()).toBe('https://bishalregmi.com/about')
    expect(doc.head.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(
      'https://bishalregmi.com/about'
    )
  })

  it('emits page schema and a breadcrumb trail starting at Home as one graph', () => {
    seo.setPage({
      title: 'Post',
      description: 'A post',
      path: '/blog/a-post',
      schema: [{ '@type': 'BlogPosting', headline: 'Post' }],
      breadcrumbs: [
        { name: 'Blog', path: '/blog' },
        { name: 'Post', path: '/blog/a-post' },
      ],
    })

    const data = jsonLd()
    expect(data['@context']).toBe('https://schema.org')
    expect(data['@graph'][0]['@type']).toBe('BlogPosting')
    const crumbs = data['@graph'][1].itemListElement
    expect(crumbs.map((c: { name: string }) => c.name)).toEqual(['Home', 'Blog', 'Post'])
    expect(crumbs[0].item).toBe('https://bishalregmi.com/')
    expect(crumbs[2].position).toBe(3)
  })

  it('drops structured data and the canonical link on noindex pages', () => {
    seo.setPage({
      title: 'About',
      description: 'About me',
      path: '/about',
      breadcrumbs: [{ name: 'About', path: '/about' }],
    })
    seo.setNoIndex('404: Page Not Found | Bishal Regmi')

    expect(jsonLd()).toBeNull()
    expect(canonical()).toBeNull()
    expect(doc.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex')
  })
})
