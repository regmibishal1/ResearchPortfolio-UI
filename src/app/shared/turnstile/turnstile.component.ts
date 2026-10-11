import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  afterNextRender,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core'
import { isPlatformBrowser } from '@angular/common'

interface TurnstileApi {
  render(
    element: HTMLElement,
    options: {
      sitekey: string
      action?: string
      theme?: 'light' | 'dark' | 'auto'
      callback: (token: string) => void
      'expired-callback': () => void
      'error-callback': () => void
    }
  ): string
  reset(widgetId: string): void
  remove(widgetId: string): void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
let loading: Promise<TurnstileApi> | null = null

/** Loads Cloudflare's Turnstile script once, the first time a form needs it. */
function loadTurnstile(): Promise<TurnstileApi> {
  loading ??= new Promise<TurnstileApi>((resolve, reject) => {
    if (window.turnstile) return resolve(window.turnstile)
    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.async = true
    script.onload = () =>
      window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile missing'))
    script.onerror = () => {
      loading = null
      reject(new Error('Turnstile did not load'))
    }
    document.head.appendChild(script)
  })
  return loading
}

/**
 * Cloudflare Turnstile, the bot check on the sign-in and forgot-password
 * forms. Emits the token to send with the form, or '' when it expires or
 * fails. Rendered only in the browser and only when a site key is set.
 */
@Component({
  selector: 'app-turnstile',
  template: '<div #box class="turnstile"></div>',
  styles: ':host { display: block; min-height: 65px; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TurnstileComponent implements OnDestroy {
  readonly siteKey = input.required<string>()
  /** Cloudflare's name for the form, shown in its analytics. */
  readonly action = input<string>()
  readonly token = output<string>()

  private readonly box = viewChild.required<ElementRef<HTMLElement>>('box')
  private api?: TurnstileApi
  private widgetId?: string
  private destroyed = false

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return
    afterNextRender(() => {
      loadTurnstile()
        .then((api) => {
          if (this.destroyed) return
          this.api = api
          this.widgetId = api.render(this.box().nativeElement, {
            sitekey: this.siteKey(),
            action: this.action(),
            theme: 'dark',
            callback: (token) => this.token.emit(token),
            'expired-callback': () => this.token.emit(''),
            'error-callback': () => this.token.emit(''),
          })
        })
        .catch(() => this.token.emit(''))
    })
  }

  /** Tokens work once; call after each submit so the next one gets a fresh check. */
  reset(): void {
    if (this.api && this.widgetId) this.api.reset(this.widgetId)
    this.token.emit('')
  }

  ngOnDestroy(): void {
    this.destroyed = true
    if (this.api && this.widgetId) this.api.remove(this.widgetId)
  }
}
