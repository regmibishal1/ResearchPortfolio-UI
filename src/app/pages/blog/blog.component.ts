import { Component, ChangeDetectionStrategy, inject } from '@angular/core'
import { DatePipe } from '@angular/common'
import { RouterModule } from '@angular/router'
import { SeoService } from '../../services/seo.service'
import { POSTS, BlogPost, readingMinutes } from '../../data/blog'
import { IconComponent } from '../../shared/icon/icon.component'

@Component({
  selector: 'app-blog',
  imports: [RouterModule, DatePipe, IconComponent],
  templateUrl: './blog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './blog.component.scss',
})
export class BlogComponent {
  posts: BlogPost[] = POSTS
  readonly minutes = readingMinutes

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
}
