import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks, tick } from '@angular/core/testing'

import { CopyEmailComponent } from './copy-email.component'

describe('CopyEmailComponent', () => {
  let fixture: ComponentFixture<CopyEmailComponent>
  let el: HTMLElement

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CopyEmailComponent] }).compileComponents()
    fixture = TestBed.createComponent(CopyEmailComponent)
    fixture.detectChanges()
    el = fixture.nativeElement
  })

  it('copies the contact address and announces it, then resets', fakeAsync(() => {
    const write = spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve())
    el.querySelector('button')!.click()
    flushMicrotasks()
    fixture.detectChanges()

    expect(write).toHaveBeenCalledWith('contact@bishalregmi.com')
    expect(el.querySelector('button')!.textContent!.trim()).toBe('Copied')
    expect(el.querySelector('[aria-live]')!.textContent).toContain('copied')

    tick(4000)
    fixture.detectChanges()
    expect(el.querySelector('button')!.textContent!.trim()).toBe('Copy email')
    expect(el.querySelector('[aria-live]')!.textContent!.trim()).toBe('')
  }))

  it('reads the address out when the clipboard is blocked', fakeAsync(() => {
    spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.reject(new Error('denied')))
    el.querySelector('button')!.click()
    flushMicrotasks()
    fixture.detectChanges()

    expect(el.querySelector('button')!.textContent!.trim()).toBe('Copy email')
    expect(el.querySelector('[aria-live]')!.textContent).toContain('contact@bishalregmi.com')
    tick(4000)
  }))
})
