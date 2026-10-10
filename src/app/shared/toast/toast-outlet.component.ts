import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { IconComponent } from '../icon/icon.component'
import { ToastService } from './toast.service'

/**
 * Renders the current toast. The live region is always in the page, so
 * screen readers announce a message as soon as it appears.
 */
@Component({
  selector: 'app-toast-outlet',
  imports: [IconComponent],
  template: `
    <div class="toast-region" role="status" aria-live="polite">
      @for (toast of toasts.toasts(); track toast.id) {
        <div class="toast">
          <span class="toast-message">{{ toast.message }}</span>
          <button
            type="button"
            class="toast-close"
            aria-label="Dismiss"
            (click)="toasts.dismiss(toast.id)"
          >
            <app-icon name="close" />
          </button>
        </div>
      }
    </div>
  `,
  styleUrl: './toast-outlet.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class ToastOutletComponent {
  readonly toasts = inject(ToastService)
}
