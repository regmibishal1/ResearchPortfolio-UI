import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing'

import { CLASS_TOTALS, MriExplorerComponent } from './mri-explorer.component'

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

  const stat = (label: string) =>
    [...el.querySelectorAll('.summary-stat')]
      .find((s) => s.querySelector('dt')!.textContent!.trim() === label)!
      .querySelector('dd')!
      .textContent!.trim()

  it('shows balanced accuracy beside accuracy for the selected model', () => {
    expect(stat('Test accuracy')).toBe('99.06%')
    expect(stat('Balanced accuracy')).toBe('97.22%')

    const chip = [...el.querySelectorAll<HTMLButtonElement>('.model-picker button')].find(
      (b) => b.textContent!.trim() === 'ResNet-34'
    )!
    chip.click()
    fixture.detectChanges()
    expect(chip.getAttribute('aria-pressed')).toBe('true')
    expect(stat('Balanced accuracy')).toBe('97.00%')
  })

  it('shows the four saliency maps as images that open larger', () => {
    const maps = el.querySelectorAll('.saliency-grid app-zoomable-image')
    expect(maps.length).toBe(4)
    expect(maps[0].querySelector('img')!.getAttribute('src')).toMatch(/rn50-saliency-.*\.webp$/)
    expect(maps[0].querySelector('button')!.getAttribute('aria-label')).toContain('Enlarge image')
  })

  it('moves between tabs with the arrow keys', fakeAsync(() => {
    tabs()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    fixture.detectChanges()
    tick()

    expect(tabs()[1].getAttribute('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(tabs()[1])
  }))
  it('keeps the per-class counts consistent with the published accuracy figures', () => {
    const cmp = fixture.componentInstance
    for (const m of cmp.models) {
      const right = m.correct.reduce((a, b) => a + b, 0)
      expect(((right / 1280) * 100).toFixed(2))
        .withContext(m.label)
        .toBe(m.accuracy.toFixed(2))
      const recall = m.correct.map((c, i) => c / CLASS_TOTALS[i])
      const balanced = (recall.reduce((a, b) => a + b, 0) / recall.length) * 100
      expect(balanced.toFixed(2)).withContext(m.label).toBe(m.balancedAccuracy.toFixed(2))
    }
  })

  it('describes each figure in its alt text, with the real counts', () => {
    const cmp = fixture.componentInstance
    expect(cmp.confusionAlt).toContain('Non-Demented 632 of 634')
    expect(cmp.confusionAlt).toContain('Moderate 14 of 15')
    expect(cmp.saliencyAlt(cmp.saliencyClasses[3])).toContain('grainier')
    expect(cmp.trainingAlt).toContain('99%')
  })
})
