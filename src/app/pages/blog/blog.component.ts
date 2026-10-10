import { Component, ChangeDetectionStrategy, inject } from '@angular/core'

import { RouterModule } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'
import { SeoService } from '../../services/seo.service'
import { POSTS, BlogPost } from '../../data/blog'

@Component({
  selector: 'app-blog',
  imports: [RouterModule, MatIconModule],
  templateUrl: './blog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './blog.component.scss',
})
export class BlogComponent {
  posts: BlogPost[] = POSTS

  constructor() {
    const seo = inject(SeoService)

    seo.setPage({
      title: 'Blog | Bishal Regmi',
      path: '/blog',
      image: '/assets/og/blog.jpg',
      description:
        'Writing by Bishal Regmi: reopening old data projects, redoing them honestly, and what the data actually says.',
      breadcrumbs: [{ name: 'Blog', path: '/blog' }],
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
