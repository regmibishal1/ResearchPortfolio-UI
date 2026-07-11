import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'
import { Title, Meta } from '@angular/platform-browser'
import { POSTS, BlogPost } from '../../data/blog'

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss',
})
export class BlogComponent {
  posts: BlogPost[] = POSTS

  constructor(title: Title, meta: Meta) {
    title.setTitle('Blog | Bishal Regmi')
    meta.updateTag({
      name: 'description',
      content:
        'Writing by Bishal Regmi: reopening old data projects, redoing them honestly, and what the data actually says.',
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
