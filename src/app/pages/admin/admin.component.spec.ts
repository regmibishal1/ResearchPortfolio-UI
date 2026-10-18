import { ComponentFixture, TestBed } from '@angular/core/testing'
import { HttpErrorResponse } from '@angular/common/http'
import { of, throwError } from 'rxjs'

import { AdminComponent } from './admin.component'
import { ApiHealth, ManageService } from '../../services/manage.service'

const health: ApiHealth = {
  counting_since: 1_791_600_000,
  last_hour: { ok: 40, redirects: 0, client_errors: 3, server_errors: 1 },
  last_day: { ok: 900, redirects: 2, client_errors: 30, server_errors: 1 },
  hourly: Array.from({ length: 24 }, (_, i) => ({
    hour_start: 1_791_600_000 + i * 3600,
    ok: i,
    client_errors: 0,
    server_errors: i === 23 ? 1 : 0,
  })),
  busiest_routes: [{ route: '/worldcup/latest', requests: 500, server_errors: 0 }],
  recent_errors: [
    {
      at: 1_791_680_000,
      method: 'GET',
      route: '/stocks/latest',
      status: 503,
      ms: 4.2,
      request_id: 'abc123',
    },
  ],
}

describe('AdminComponent', () => {
  let fixture: ComponentFixture<AdminComponent>
  let el: HTMLElement
  let manage: jasmine.SpyObj<ManageService>

  beforeEach(() => {
    manage = jasmine.createSpyObj<ManageService>('ManageService', [
      'users',
      'allowedEmails',
      'registrationAttempts',
      'resetLink',
      'health',
      'worldCupRuns',
      'stocksRuns',
      'worldCupDiff',
      'allowEmail',
      'removeAllowedEmail',
      'unblock',
      'deleteRun',
    ])
    manage.users.and.returnValue(
      of([
        {
          username: 'bishal',
          firstname: 'Bishal',
          lastname: 'Regmi',
          email: 'me@example.test',
          role: 'ADMIN',
          openSessions: 2,
        },
      ])
    )
    manage.allowedEmails.and.returnValue(of([]))
    manage.registrationAttempts.and.returnValue(of([]))
    manage.health.and.returnValue(of(health))
    manage.resetLink.and.returnValue(
      of({ url: 'https://example.test/reset#token=x', expiresAt: '2026-10-11T19:00:00Z' })
    )

    TestBed.configureTestingModule({
      imports: [AdminComponent],
      providers: [{ provide: ManageService, useValue: manage }],
    })
    fixture = TestBed.createComponent(AdminComponent)
    fixture.detectChanges()
    el = fixture.nativeElement
  })

  const tab = (name: string) =>
    [...el.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find(
      (t) => t.textContent!.trim() === name
    )!

  it('opens on accounts and lists every user with their open sessions', () => {
    expect(tab('Accounts').getAttribute('aria-selected')).toBe('true')
    const row = el.querySelector('tbody tr')!
    expect(row.textContent).toContain('bishal')
    expect(row.textContent).toContain('ADMIN')
    expect(manage.health).not.toHaveBeenCalled()
  })

  it('shows a reset link once one is created', async () => {
    const button = [...el.querySelectorAll<HTMLButtonElement>('tbody button')].find((b) =>
      b.textContent!.includes('Create link')
    )!
    button.click()
    await fixture.whenStable()
    fixture.detectChanges()
    const field = el.querySelector<HTMLInputElement>('.link-field')!
    expect(field.value).toBe('https://example.test/reset#token=x')
    expect(manage.resetLink).toHaveBeenCalledWith('bishal')
  })

  it('loads API health only when its tab opens, with server errors listed', async () => {
    tab('API health').click()
    await fixture.whenStable()
    fixture.detectChanges()
    expect(manage.health).toHaveBeenCalledTimes(1)
    expect(el.querySelector('.bars')!.getAttribute('aria-label')).toContain('1 server errors')
    expect(el.textContent).toContain('/stocks/latest')
    expect(el.textContent).toContain('abc123')
  })

  it('compares the latest snapshot with the one before, even after the runs tab loaded them', async () => {
    const run = (id: number, date: string) => ({
      id,
      as_of_date: date,
      label: null,
      n_simulations: 2000000,
      n_played_matches_locked: 0,
      run_timestamp_utc: date + 'T12:00:00Z',
      teams: 48,
    })
    manage.worldCupRuns.and.returnValue(of({ runs: [run(2, '2026-07-19'), run(1, '2026-07-18')] }))
    manage.stocksRuns.and.returnValue(of({ runs: [] }))
    manage.worldCupDiff.and.returnValue(
      of({ before: run(1, '2026-07-18'), after: run(2, '2026-07-19'), teams: [] })
    )
    tab('Data runs').click()
    await fixture.whenStable()
    fixture.detectChanges()
    tab('Snapshot diff').click()
    await fixture.whenStable()
    fixture.detectChanges()
    expect(manage.worldCupDiff).toHaveBeenCalledWith(1, 2)
  })

  it('deletes a run only after it is confirmed, then reloads the list', async () => {
    const run = {
      id: 5,
      as_of_date: '2026-07-04',
      label: null,
      n_simulations: 2000000,
      n_played_matches_locked: 80,
      run_timestamp_utc: '2026-07-04T12:00:00Z',
      teams: 48,
    }
    manage.worldCupRuns.and.returnValue(of({ runs: [run] }))
    manage.stocksRuns.and.returnValue(of({ runs: [] }))
    manage.deleteRun.and.returnValue(of(undefined))
    tab('Data runs').click()
    await fixture.whenStable()
    fixture.detectChanges()

    const deleteButton = () =>
      [...el.querySelectorAll<HTMLButtonElement>('[aria-label="World Cup snapshots"] button')].find(
        (b) => b.textContent!.trim().startsWith('Delete')
      )!
    deleteButton().click()
    fixture.detectChanges()
    expect(manage.deleteRun).not.toHaveBeenCalled()
    expect(el.querySelector('.confirm-text')!.textContent).toContain('Delete permanently?')

    el.querySelector<HTMLButtonElement>('.confirm .btn-secondary')!.click()
    fixture.detectChanges()
    expect(el.querySelector('.confirm')).toBeNull()

    deleteButton().click()
    fixture.detectChanges()
    el.querySelector<HTMLButtonElement>('.confirm .btn-danger')!.click()
    fixture.detectChanges()
    expect(manage.deleteRun).toHaveBeenCalledOnceWith('worldcup', 5)
    expect(manage.worldCupRuns).toHaveBeenCalledTimes(2)
  })

  it('says plainly when the server refuses', async () => {
    manage.health.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 403, statusText: 'Forbidden' }))
    )
    tab('API health').click()
    await fixture.whenStable()
    fixture.detectChanges()
    expect(el.querySelector('[role="alert"]')!.textContent).toContain(
      'This needs an admin account.'
    )
  })
})
