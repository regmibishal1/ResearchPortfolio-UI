import { TestBed, fakeAsync, tick } from '@angular/core/testing'

import { ToastOutletComponent } from './toast-outlet.component'
import { ToastService } from './toast.service'

describe('ToastService and outlet', () => {
  let service: ToastService

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ToastOutletComponent] })
    service = TestBed.inject(ToastService)
  })

  it('shows one message at a time and hides it after its duration', fakeAsync(() => {
    service.show('First', 1000)
    service.show('Second', 1000)
    expect(service.toasts().map((t) => t.message)).toEqual(['Second'])

    tick(1000)
    expect(service.toasts()).toEqual([])
  }))

  it('renders inside a live region and can be dismissed', fakeAsync(() => {
    const fixture = TestBed.createComponent(ToastOutletComponent)
    const el: HTMLElement = fixture.nativeElement
    fixture.detectChanges()
    const region = el.querySelector('.toast-region')!
    expect(region.getAttribute('role')).toBe('status')
    expect(region.getAttribute('aria-live')).toBe('polite')

    service.show('Signed out.')
    fixture.detectChanges()
    expect(region.textContent).toContain('Signed out.')

    el.querySelector<HTMLButtonElement>('.toast-close')!.click()
    fixture.detectChanges()
    expect(region.textContent!.trim()).toBe('')
    tick(5000)
  }))
})
