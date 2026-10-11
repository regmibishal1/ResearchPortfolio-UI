import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import { DatePipe, DecimalPipe, NgTemplateOutlet } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { HttpErrorResponse } from '@angular/common/http'
import { Observable } from 'rxjs'
import { SeoService } from '../../services/seo.service'
import {
  AllowedEmail,
  ApiHealth,
  ManageService,
  RegistrationAttempt,
  ResetLink,
  StocksRunRow,
  UserSummary,
  WorldCupDiff,
  WorldCupRunRow,
} from '../../services/manage.service'
import { ToastService } from '../../shared/toast/toast.service'

type TabId = 'accounts' | 'health' | 'runs' | 'diff'
type RunKind = 'worldcup' | 'stocks'

/** One block of data on the page: null until loaded, with any error beside it. */
class Section<T> {
  readonly data = signal<T | null>(null)
  readonly error = signal('')
  readonly loading = signal(false)

  load(source: Observable<T>): void {
    this.loading.set(true)
    this.error.set('')
    source.subscribe({
      next: (value) => {
        this.data.set(value)
        this.loading.set(false)
      },
      error: (err: unknown) => {
        this.error.set(describe(err))
        this.loading.set(false)
      },
    })
  }
}

function describe(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return 'Could not reach the server.'
    if (err.status === 403) return 'This needs an admin account.'
    if (err.status === 503) return 'The database is not available right now.'
    const message = err.error?.message ?? err.error?.detail
    if (typeof message === 'string') return message
    return `The server answered ${err.status}.`
  }
  return 'Something went wrong.'
}

/**
 * Admin dashboard: accounts, API health, data runs and snapshot diffs.
 * Signed-in admins only (adminGuard); both APIs check the role again.
 */
@Component({
  selector: 'app-admin',
  imports: [DatePipe, DecimalPipe, FormsModule, NgTemplateOutlet],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent {
  private manage = inject(ManageService)
  private toasts = inject(ToastService)

  readonly tabs: { id: TabId; label: string }[] = [
    { id: 'accounts', label: 'Accounts' },
    { id: 'health', label: 'API health' },
    { id: 'runs', label: 'Data runs' },
    { id: 'diff', label: 'Snapshot diff' },
  ]
  readonly activeTab = signal<TabId>('accounts')

  readonly users = new Section<UserSummary[]>()
  readonly allowed = new Section<AllowedEmail[]>()
  readonly attempts = new Section<RegistrationAttempt[]>()
  readonly health = new Section<ApiHealth>()
  readonly worldCupRuns = new Section<{ runs: WorldCupRunRow[] }>()
  readonly stocksRuns = new Section<{ runs: StocksRunRow[] }>()
  readonly diff = new Section<WorldCupDiff>()

  readonly resetLinks = signal<Record<string, ResetLink>>({})
  readonly newEmail = signal('')
  readonly diffBefore = signal<number | null>(null)
  readonly diffAfter = signal<number | null>(null)

  private loaded = new Set<TabId>()

  constructor() {
    inject(SeoService).setNoIndex('Admin | Bishal Regmi')
    this.open('accounts')
  }

  open(tab: TabId): void {
    this.activeTab.set(tab)
    if (this.loaded.has(tab)) return
    this.loaded.add(tab)
    this.refresh(tab)
  }

  refresh(tab: TabId): void {
    switch (tab) {
      case 'accounts':
        this.users.load(this.manage.users())
        this.allowed.load(this.manage.allowedEmails())
        this.attempts.load(this.manage.registrationAttempts())
        break
      case 'health':
        this.health.load(this.manage.health())
        break
      case 'runs':
        this.worldCupRuns.load(this.manage.worldCupRuns())
        this.stocksRuns.load(this.manage.stocksRuns())
        break
      case 'diff': {
        const loaded = this.worldCupRuns.data()
        if (loaded) this.pickDefaultDiff(loaded.runs)
        else this.loadRunsForDiff()
        break
      }
    }
  }

  // Arrow keys, Home and End move between tabs, as in a native tab list.
  onTabKeydown(event: KeyboardEvent, index: number): void {
    const last = this.tabs.length - 1
    const next: Record<string, number> = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }
    if (!(event.key in next)) return
    event.preventDefault()
    const tab = this.tabs[next[event.key]]
    this.open(tab.id)
    document.getElementById('admin-tab-' + tab.id)?.focus()
  }

  // Accounts

  createResetLink(username: string): void {
    this.manage.resetLink(username).subscribe({
      next: (link) => this.resetLinks.update((all) => ({ ...all, [username]: link })),
      error: (err: unknown) => this.toasts.show(describe(err), 6000),
    })
  }

  async copy(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text)
      this.toasts.show('Copied.')
    } catch {
      this.toasts.show('Copy failed; select the link instead.', 6000)
    }
  }

  addEmail(): void {
    const email = this.newEmail().trim()
    if (!email) return
    this.manage.allowEmail(email).subscribe({
      next: () => {
        this.newEmail.set('')
        this.toasts.show(`${email} can now register.`)
        this.allowed.load(this.manage.allowedEmails())
      },
      error: (err: unknown) => this.toasts.show(describe(err), 6000),
    })
  }

  removeEmail(email: string): void {
    this.manage.removeAllowedEmail(email).subscribe({
      next: () => this.allowed.load(this.manage.allowedEmails()),
      error: (err: unknown) => this.toasts.show(describe(err), 6000),
    })
  }

  unblock(ip: string): void {
    this.manage.unblock(ip).subscribe({
      next: () => this.attempts.load(this.manage.registrationAttempts()),
      error: (err: unknown) => this.toasts.show(describe(err), 6000),
    })
  }

  // Health

  /** Bar height for one hour, as a share of the busiest hour. */
  barHeight(hour: { ok: number; client_errors: number; server_errors: number }): number {
    const hours = this.health.data()?.hourly ?? []
    const most = Math.max(1, ...hours.map((h) => h.ok + h.client_errors + h.server_errors))
    return ((hour.ok + hour.client_errors + hour.server_errors) / most) * 100
  }

  hourlySummary(): string {
    const hours = this.health.data()?.hourly ?? []
    const total = hours.reduce((sum, h) => sum + h.ok + h.client_errors + h.server_errors, 0)
    const errors = hours.reduce((sum, h) => sum + h.server_errors, 0)
    return `Requests per hour over the last 24 hours: ${total} in all, ${errors} server errors.`
  }

  // Deleting runs

  readonly confirming = signal<{ kind: RunKind; id: number } | null>(null)
  readonly deleting = signal(false)

  isConfirming(kind: RunKind, id: number): boolean {
    const target = this.confirming()
    return target?.kind === kind && target.id === id
  }

  askDelete(kind: RunKind, id: number): void {
    this.confirming.set({ kind, id })
  }

  cancelDelete(): void {
    this.confirming.set(null)
  }

  deleteRun(kind: RunKind, run: { id: number; as_of_date: string; label?: string | null }): void {
    this.deleting.set(true)
    this.manage.deleteRun(kind, run.id).subscribe({
      next: () => {
        this.deleting.set(false)
        this.confirming.set(null)
        const name = run.as_of_date + (run.label ? ` (${run.label})` : '')
        this.toasts.show(`Deleted the ${name} snapshot.`)
        if (kind === 'worldcup') {
          // The diff may point at the run that just went away.
          if (this.diffBefore() === run.id || this.diffAfter() === run.id) {
            this.diffBefore.set(null)
            this.diffAfter.set(null)
            this.diff.data.set(null)
          }
          this.worldCupRuns.load(this.manage.worldCupRuns())
        } else {
          this.stocksRuns.load(this.manage.stocksRuns())
        }
      },
      error: (err: unknown) => {
        this.deleting.set(false)
        this.toasts.show(describe(err), 6000)
      },
    })
  }

  // Snapshot diff

  private loadRunsForDiff(): void {
    this.manage.worldCupRuns().subscribe({
      next: (value) => {
        this.worldCupRuns.data.set(value)
        this.pickDefaultDiff(value.runs)
      },
      error: (err: unknown) => this.diff.error.set(describe(err)),
    })
  }

  /** Starts on the latest snapshot against the one before it. */
  private pickDefaultDiff(runs: WorldCupRunRow[]): void {
    const [latest, previous] = runs
    if (!latest || !previous || this.diffAfter() !== null) return
    this.diffAfter.set(latest.id)
    this.diffBefore.set(previous.id)
    this.compare()
  }

  compare(): void {
    const before = this.diffBefore()
    const after = this.diffAfter()
    if (before === null || after === null) return
    this.diff.load(this.manage.worldCupDiff(before, after))
  }

  runLabel(run: WorldCupRunRow): string {
    return run.as_of_date + (run.label ? ` (${run.label})` : '')
  }
}
