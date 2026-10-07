import { Injectable, inject } from '@angular/core'
import { DOCUMENT } from '@angular/common'
import { Meta, Title } from '@angular/platform-browser'

export const SITE_URL = 'https://bishalregmi.com'

export interface PageMeta {
  title: string
  description: string
  /** Site-relative path of the page, used for the canonical link and og:url. */
  path: string
  type?: 'website' | 'article'
  /** Optional schema.org structured data for the page. */
  jsonLd?: Record<string, unknown>
}

/**
 * Keeps the document head in step with the current page: title, description,
 * canonical link, Open Graph and Twitter tags, and page-level JSON-LD. Pages
 * are prerendered, so whatever is set here is what crawlers and link
 * previews read without running any script.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title)
  private meta = inject(Meta)
  private document = inject(DOCUMENT)

  setPage(page: PageMeta): void {
    const url = SITE_URL + page.path
    this.title.setTitle(page.title)
    this.meta.updateTag({ name: 'description', content: page.description })
    this.meta.updateTag({ property: 'og:title', content: page.title })
    this.meta.updateTag({ property: 'og:description', content: page.description })
    this.meta.updateTag({ property: 'og:url', content: url })
    this.meta.updateTag({ property: 'og:type', content: page.type ?? 'website' })
    this.meta.updateTag({ name: 'twitter:title', content: page.title })
    this.meta.updateTag({ name: 'twitter:description', content: page.description })
    this.meta.removeTag('name="robots"')
    this.setCanonical(url)
    this.setJsonLd(page.jsonLd)
  }

  /** For pages that should stay out of search results, such as the 404 page. */
  setNoIndex(title: string): void {
    this.title.setTitle(title)
    this.meta.updateTag({ name: 'robots', content: 'noindex' })
    this.setCanonical(null)
    this.setJsonLd(undefined)
  }

  private setCanonical(url: string | null): void {
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!url) {
      link?.remove()
      return
    }
    if (!link) {
      link = this.document.createElement('link')
      link.setAttribute('rel', 'canonical')
      this.document.head.appendChild(link)
    }
    link.setAttribute('href', url)
  }

  private setJsonLd(data: Record<string, unknown> | undefined): void {
    let script = this.document.getElementById('page-jsonld')
    if (!data) {
      script?.remove()
      return
    }
    if (!script) {
      script = this.document.createElement('script')
      script.id = 'page-jsonld'
      script.setAttribute('type', 'application/ld+json')
      this.document.head.appendChild(script)
    }
    // Escape '<' so text in the data can never close the script element.
    script.textContent = JSON.stringify(data).replace(/</g, '\\u003c')
  }
}
