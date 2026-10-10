import { Injectable, inject, DOCUMENT } from '@angular/core'

import { Meta, Title } from '@angular/platform-browser'
import type { Paper, Project } from '../data/projects'

export const SITE_URL = 'https://bishalregmi.com'
export const PERSON_ID = `${SITE_URL}/#person`
/** Site-wide link preview card, used by pages without one of their own. */
export const DEFAULT_PREVIEW = '/assets/og/home.jpg'

export interface Breadcrumb {
  name: string
  path: string
}

export interface PageMeta {
  title: string
  description: string
  /** Site-relative path of the page, used for the canonical link and og:url. */
  path: string
  type?: 'website' | 'article'
  /**
   * 1200x630 link preview card for the page, as a site-relative path. Cards
   * live in assets/og; the build swaps in the default for any that are missing.
   */
  image?: string
  /** schema.org entities describing the page, emitted together as one JSON-LD graph. */
  schema?: Record<string, unknown>[]
  /** Trail from the home page down to this page; Home is added automatically. */
  breadcrumbs?: Breadcrumb[]
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
    const image = SITE_URL + (page.image ?? DEFAULT_PREVIEW)
    this.meta.updateTag({ property: 'og:image', content: image })
    this.meta.updateTag({ property: 'og:image:alt', content: page.title })
    this.meta.updateTag({ name: 'twitter:image', content: image })
    this.meta.removeTag('name="robots"')
    this.setCanonical(url)

    const graph = [...(page.schema ?? [])]
    if (page.breadcrumbs?.length) {
      graph.push(breadcrumbList(page.breadcrumbs))
    }
    this.setJsonLd(graph.length ? { '@context': 'https://schema.org', '@graph': graph } : undefined)
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

function breadcrumbList(trail: Breadcrumb[]): Record<string, unknown> {
  const items = [{ name: 'Home', path: '/' }, ...trail]
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: SITE_URL + crumb.path,
    })),
  }
}

/** A project's written report as a schema.org ScholarlyArticle. */
export function paperSchema(project: Project & { paper: Paper }): Record<string, unknown> {
  return {
    '@type': 'ScholarlyArticle',
    headline: project.paper.title,
    datePublished: project.paper.date,
    url: `${SITE_URL}/${project.paper.url}`,
    encodingFormat: 'application/pdf',
    author: { '@id': PERSON_ID },
    sourceOrganization: {
      '@type': 'CollegeOrUniversity',
      name: 'University of Maryland, College Park',
    },
  }
}
