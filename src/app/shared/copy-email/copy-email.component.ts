import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  inject,
  input,
} from '@angular/core'
import { CONTACT } from '../../data/resume'

/**
 * Copies the contact address, for visitors whose browser has no mail app
 * behind mailto: links. The result is announced to screen readers.
 */
@Component({
  selector: 'app-copy-email',
  templateUrl: './copy-email.component.html',
  styleUrl: './copy-email.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CopyEmailComponent implements OnDestroy {
  readonly email = input(CONTACT.email)

  private cdr = inject(ChangeDetectorRef)
  copied = false
  message = ''
  private timer?: ReturnType<typeof setTimeout>

  async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.email())
      this.copied = true
      this.message = 'Email address copied'
    } catch {
      this.copied = false
      this.message = `Copy failed; the address is ${this.email()}`
    }
    this.cdr.markForCheck()
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.copied = false
      this.message = ''
      this.cdr.markForCheck()
    }, 4000)
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer)
  }
}
