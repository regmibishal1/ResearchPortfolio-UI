import { Component, ChangeDetectionStrategy, inject } from '@angular/core'
import { DatePipe } from '@angular/common'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { ActivatedRoute, RouterModule } from '@angular/router'
import { PageNotFoundComponent } from '../page-not-found/page-not-found.component'
import { SeoService, PERSON_ID, SITE_URL } from '../../services/seo.service'
import { BlogPost, POSTS, getPost, headingId, readingMinutes } from '../../data/blog'
import { PROJECTS, Project } from '../../data/projects'
import { ZoomableImageComponent } from '../../shared/zoomable-image/zoomable-image.component'
import { WorkCardComponent } from '../../shared/work-card/work-card.component'

/** Posts with at least this many sections get a table of contents. */
const TOC_MIN_SECTIONS = 4

@Component({
  selector: 'app-blog-post',
  imports: [
    PageNotFoundComponent,
    RouterModule,
    DatePipe,
    ZoomableImageComponent,
    WorkCardComponent,
  ],
  templateUrl: './blog-post.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './blog-post.component.scss',
})
export class BlogPostComponent {
  private seo = inject(SeoService)

  readonly headingId = headingId

  post?: BlogPost
  minutes = 0
  /** Section headings, for the table of contents. Empty when the post is short. */
  toc: { id: string; text: string }[] = []
  related: Project | null = null
  newer: BlogPost | null = null
  older: BlogPost | null = null
  replyHref = ''

  constructor() {
    // The component stays in place when the newer/older links change the
    // slug, so it follows the parameter rather than reading it once.
    inject(ActivatedRoute)
      .paramMap.pipe(takeUntilDestroyed())
      .subscribe((params) => this.show(params.get('slug') ?? ''))
  }

  private show(slug: string) {
    this.post = getPost(slug)
    // An unknown slug shows the 404 page in place rather than redirecting,
    // so a broken link is visible instead of silently landing on the list.
    if (!this.post) return
    const post = this.post
    const index = POSTS.indexOf(post)
    this.newer = POSTS[index - 1] ?? null
    this.older = POSTS[index + 1] ?? null
    this.minutes = readingMinutes(post)
    const headings = post.body.filter((b) => b.kind === 'h2' && b.text)
    this.toc =
      headings.length >= TOC_MIN_SECTIONS
        ? headings.map((b) => ({ id: headingId(b.text!), text: b.text! }))
        : []
    this.related = PROJECTS.find((p) => p.id === post.relatedProject) ?? null
    this.replyHref = `mailto:contact@bishalregmi.com?subject=${encodeURIComponent(`Re: ${post.title}`)}`

    const path = `/blog/${post.slug}`
    const figure = post.body.find((block) => block.kind === 'figure' && block.src)
    this.seo.setPage({
      title: `${post.title} | Bishal Regmi`,
      description: post.seoDescription ?? post.summary,
      socialDescription: post.summary,
      path,
      type: 'article',
      image: `/assets/og/blog-${post.slug}.jpg`,
      breadcrumbs: [
        { name: 'Blog', path: '/blog' },
        { name: post.title, path },
      ],
      schema: [
        {
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.summary,
          datePublished: post.date,
          ...(post.updated && { dateModified: post.updated }),
          url: SITE_URL + path,
          mainEntityOfPage: SITE_URL + path,
          keywords: post.tags.join(', '),
          author: { '@id': PERSON_ID },
          ...(figure && { image: `${SITE_URL}/${figure.src}` }),
        },
      ],
    })
  }
}
