import { Component, inject, ChangeDetectionStrategy, PLATFORM_ID, DOCUMENT } from '@angular/core'
import { ViewportScroller, isPlatformBrowser } from '@angular/common'
import { NavigationStart, Router, RouterOutlet } from '@angular/router'
import { filter, take } from 'rxjs/operators'
import { NavbarComponent } from './shared/navbar/navbar.component'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Research Portfolio'

  constructor() {
    // Keep in-page anchors (e.g. /about#contact) clear of the fixed toolbar.
    inject(ViewportScroller).setOffset([0, 80])

    // Entrance animations play on the first page only; once the visitor
    // moves to another page, mark the document so later pages skip them.
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      const root = inject(DOCUMENT).documentElement
      inject(Router)
        .events.pipe(
          filter((e): e is NavigationStart => e instanceof NavigationStart && e.id > 1),
          take(1)
        )
        .subscribe(() => root.classList.add('entered'))
    }
  }
}
