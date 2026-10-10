import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing'

import { MriExplorerComponent } from './mri-explorer.component'

describe('MriExplorerComponent', () => {
  let fixture: ComponentFixture<MriExplorerComponent>
  let el: HTMLElement

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [MriExplorerComponent] })
    fixture = TestBed.createComponent(MriExplorerComponent)
    fixture.detectChanges()
    el = fixture.nativeElement
  })

  const tabs = () => Array.from(el.querySelectorAll<HTMLButtonElement>('[role="tab"]'))

  it('exposes the figure switcher as a tab list with one tab in the tab order', () => {
    expect(el.querySelector('[role="tablist"]')).not.toBeNull()
    expect(tabs().filter((t) => t.tabIndex === 0).length).toBe(1)
    expect(tabs()[0].getAttribute('aria-selected')).toBe('true')
  })

  it('moves between tabs with the arrow keys', fakeAsync(() => {
    tabs()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    fixture.detectChanges()
    tick()

    expect(tabs()[1].getAttribute('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(tabs()[1])
  }))
})
