import { Component, ChangeDetectionStrategy, inject } from '@angular/core'

import { RouterModule } from '@angular/router'
import { SeoService } from '../../services/seo.service'

@Component({
  selector: 'app-page-not-found',
  imports: [RouterModule],
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
