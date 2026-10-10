import { Component, ChangeDetectionStrategy, inject } from '@angular/core'

import { RouterModule } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'
import { SeoService } from '../../services/seo.service'

@Component({
  selector: 'app-page-not-found',
  imports: [RouterModule, MatIconModule],
  templateUrl: './page-not-found.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './page-not-found.component.scss',
})
export class PageNotFoundComponent {
  constructor() {
    const seo = inject(SeoService)

    seo.setNoIndex('404: Page Not Found | Bishal Regmi')
  }
}
