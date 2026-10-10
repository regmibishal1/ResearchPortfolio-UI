import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  inject,
} from '@angular/core'
import { CommonModule, isPlatformBrowser } from '@angular/common'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatSnackBar } from '@angular/material/snack-bar'
import { NavigationEnd, Router, RouterModule } from '@angular/router'
import { AuthService } from '../../pages/auth/auth.service'
import { FooterComponent } from '../footer/footer.component'
import { Subscription, filter } from 'rxjs'

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    FooterComponent,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit, OnDestroy {
  isAuthenticated = false
  menuOpen = false

  @ViewChild('main', { static: true }) main!: ElementRef<HTMLElement>
  @ViewChild('menuButton', { read: ElementRef }) menuButton?: ElementRef<HTMLElement>

  private subscriptions = new Subscription()
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID))
  private router = inject(Router)
  private lastPath: string | null = null

  constructor(
    private authService: AuthService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.authService.getAuthStatus().subscribe((isAuth) => {
        this.isAuthenticated = isAuth
      })
    )
    this.subscriptions.add(
      this.router.events
        .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
        .subscribe((e) => this.onNavigationEnd(e.urlAfterRedirects))
    )
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen
  }

  closeMenu(returnFocus = false) {
    if (!this.menuOpen) return
    this.menuOpen = false
    if (returnFocus) this.menuButton?.nativeElement.focus()
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeMenu(true)
  }

  // A plain href="#main" would resolve against <base href="/"> and navigate
  // home, so the skip link moves focus itself.
  skipToMain(event: Event) {
    event.preventDefault()
    this.main.nativeElement.focus()
  }

  // After moving to another page, put focus on its heading so keyboard and
  // screen reader users start from the new content instead of the old link.
  private onNavigationEnd(url: string) {
    this.closeMenu()
    const [path, fragment] = url.split('#')
    const cleanPath = path.split('?')[0]
    const isFirst = this.lastPath === null
    const changed = cleanPath !== this.lastPath
    this.lastPath = cleanPath
    if (!this.isBrowser || isFirst || !changed || fragment) return
    setTimeout(() => {
      const main = this.main.nativeElement
      const heading = main.querySelector<HTMLElement>('h1')
      const target = heading ?? main
      if (heading && !heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: true })
    })
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: () => {
        this.openSnackBar('Signed out.')
      },
      error: (error: Error) => {
        this.openSnackBar(error.message)
      },
    })
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe()
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, 'Close', {
      duration: 5000,
    })
  }
}
