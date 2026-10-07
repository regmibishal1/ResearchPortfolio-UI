import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'
import { SeoService, SITE_URL } from '../../services/seo.service'
import { getPost, BlogPost } from '../../data/blog'
import { ZoomableImageComponent } from '../../shared/zoomable-image/zoomable-image.component'

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, ZoomableImageComponent],
  templateUrl: './blog-post.component.html',
  styleUrl: './blog-post.component.scss',
})
export class BlogPostComponent implements OnInit {
  post?: BlogPost

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private seo: SeoService
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') ?? ''
    this.post = getPost(slug)
    if (!this.post) {
      this.router.navigate(['/blog'])
      return
    }
    const path = `/blog/${this.post.slug}`
    this.seo.setPage({
      title: `${this.post.title} | Bishal Regmi`,
      description: this.post.summary,
      path,
      type: 'article',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: this.post.title,
        description: this.post.summary,
        datePublished: this.post.date,
        url: SITE_URL + path,
        mainEntityOfPage: SITE_URL + path,
        keywords: this.post.tags.join(', '),
        author: { '@id': `${SITE_URL}/#person` },
      },
    })
  }

  formatDate(iso: string): string {
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
}
