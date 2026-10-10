import { Injectable, signal } from '@angular/core'

export interface Toast {
  id: number
  message: string
}

/**
 * Short status messages ("Signed out.", "Your session ended."), shown by the
 * toast outlet in the app shell and read out by its live region. Replaces
 * Material's snack bar, which pulled its overlay machinery into every page.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1
  private timers = new Map<number, ReturnType<typeof setTimeout>>()
  readonly toasts = signal<Toast[]>([])

  show(message: string, durationMs = 5000): void {
    const id = this.nextId++
    // One message at a time, like the snack bar: a new one replaces the last.
    this.toasts().forEach((t) => this.dismiss(t.id))
    this.toasts.set([{ id, message }])
    this.timers.set(
      id,
      setTimeout(() => this.dismiss(id), durationMs)
    )
  }

  dismiss(id: number): void {
    clearTimeout(this.timers.get(id))
    this.timers.delete(id)
    this.toasts.update((list) => list.filter((t) => t.id !== id))
  }
}
