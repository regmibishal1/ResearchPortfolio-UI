import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'
import { Title, Meta } from '@angular/platform-browser'

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.scss',
})
export class PageNotFoundComponent {
  constructor(title: Title, meta: Meta) {
    title.setTitle('404 — Page Not Found | Bishal Regmi')
    meta.updateTag({ name: 'robots', content: 'noindex' })
  }
}
