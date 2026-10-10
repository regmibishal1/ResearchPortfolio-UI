import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  inject,
} from '@angular/core'
import { isPlatformBrowser } from '@angular/common'
import { Router } from '@angular/router'
import { IconComponent } from '../icon/icon.component'

export interface SearchResult {
  url: string
  title: string
  /** Pagefind's excerpt, with the matched words wrapped in <mark>. */
  excerpt: string
}

interface PagefindResult {
  data(): Promise<{ url: string; meta: { title?: string }; excerpt: string }>
}

export interface Pagefind {
  search(query: string): Promise<{ results: PagefindResult[] }>
}

/** Where the build writes the search index (scripts/build-search.mjs). */
const PAGEFIND_URL = '/pagefind/pagefind.js'
const MAX_RESULTS = 8

/**
 * Site search: a toolbar button (or the "/" key) opens a dialog that queries
 * the Pagefind index built from the prerendered pages. The index and its
 * script load on first use, so they cost nothing until someone searches.
 */
@Component({
  selector: 'app-site-search',
  imports: [IconComponent],
  templateUrl: './site-search.component.html',
  styleUrl: './site-search.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class SiteSearchComponent implements OnInit, OnDestroy {
  @ViewChild('dialog', { static: true }) dialog!: ElementRef<HTMLDialogElement>
  @ViewChild('input', { static: true }) input!: ElementRef<HTMLInputElement>

  private cdr = inject(ChangeDetectorRef)
  private router = inject(Router)
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID))
  private pagefind?: Promise<Pagefind>
  private timer?: ReturnType<typeof setTimeout>
  /** Ignores answers to queries that have since been replaced. */
  private latest = 0

  query = ''
  results: SearchResult[] = []
  status = ''

  /** Loads Pagefind's own script from the built site; replaced in tests. */
  loadPagefind: () => Promise<Pagefind> = () => import(/* @vite-ignore */ PAGEFIND_URL)

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return
    const target = event.target
    const typing =
      target instanceof Element &&
      target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')
    if (typing) return
    event.preventDefault()
    this.open()
  }

  open(): void {
    const dialog = this.dialog.nativeElement
    if (!this.isBrowser || dialog.open) return
    dialog.showModal()
    this.input.nativeElement.focus()
    this.input.nativeElement.select()
  }

  close(): void {
    if (this.dialog.nativeElement.open) this.dialog.nativeElement.close()
  }

  // A click on the backdrop lands on the dialog element itself and closes
  // it. Keyboard users get the same from Escape, which the dialog handles.
  ngOnInit(): void {
    const dialog = this.dialog.nativeElement
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) this.close()
    })
  }

  onInput(value: string): void {
    this.query = value
    clearTimeout(this.timer)
    this.timer = setTimeout(() => this.search(value.trim()), 150)
  }

  isFile(url: string): boolean {
    return url.startsWith('/assets/')
  }

  /** Site pages go through the router; files such as the paper PDFs load normally. */
  follow(event: MouseEvent, url: string): void {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey) return
    if (!url.startsWith('/') || this.isFile(url)) return
    event.preventDefault()
    this.close()
    this.router.navigateByUrl(url)
  }

  async search(query: string): Promise<void> {
    const id = ++this.latest
    if (!query) {
      this.results = []
      this.status = ''
      this.cdr.markForCheck()
      return
    }
    try {
      this.pagefind ??= this.loadPagefind()
      const pagefind = await this.pagefind
      const found = await pagefind.search(query)
      const data = await Promise.all(found.results.slice(0, MAX_RESULTS).map((r) => r.data()))
      if (id !== this.latest) return
      this.results = data.map((d) => ({
        url: d.url,
        title: d.meta.title ?? d.url,
        excerpt: d.excerpt,
      }))
      const n = found.results.length
      this.status = n === 0 ? `No results for "${query}"` : `${n} result${n === 1 ? '' : 's'}`
    } catch {
      // There is no index outside production builds, or the script was blocked.
      this.pagefind = undefined
      this.results = []
      this.status = 'Search is not available right now.'
    }
    this.cdr.markForCheck()
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer)
  }
}
