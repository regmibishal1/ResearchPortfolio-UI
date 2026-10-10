import { Component, inject } from '@angular/core'
import { CommonModule, ViewportScroller } from '@angular/common'
import { RouterOutlet } from '@angular/router'
import { NavbarComponent } from './shared/navbar/navbar.component'

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Research Portfolio'

  constructor() {
    // Keep in-page anchors (e.g. /about#contact) clear of the fixed toolbar.
    inject(ViewportScroller).setOffset([0, 80])
  }
}
