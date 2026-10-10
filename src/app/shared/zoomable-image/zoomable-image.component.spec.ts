import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ZoomableImageComponent } from './zoomable-image.component'

describe('ZoomableImageComponent', () => {
  let component: ZoomableImageComponent
  let fixture: ComponentFixture<ZoomableImageComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZoomableImageComponent],
    }).compileComponents()
    fixture = TestBed.createComponent(ZoomableImageComponent)
    component = fixture.componentInstance
    fixture.componentRef.setInput('src', 'assets/blog/bwi-trends.webp')
    fixture.componentRef.setInput('alt', 'chart')
    fixture.detectChanges()
  })

  afterEach(() => {
    document.body.style.overflow = ''
  })

  it('creates', () => {
    expect(component).toBeTruthy()
  })

  it('opens and closes the lightbox, locking body scroll while open', () => {
    expect(component.isOpen).toBe(false)
    component.open()
    expect(component.isOpen).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')
    component.close()
    expect(component.isOpen).toBe(false)
    expect(document.body.style.overflow).toBe('')
  })

  it('toggles zoom and resets it on close', () => {
    component.open()
    component.toggleZoom()
    expect(component.zoomed).toBe(true)
    component.close()
    expect(component.zoomed).toBe(false)
  })

  it('opens from a real button and shows a labelled modal dialog', () => {
    const el: HTMLElement = fixture.nativeElement
    el.querySelector<HTMLButtonElement>('button.zoomable-trigger')!.click()
    fixture.detectChanges()

    const dialog = el.querySelector('[role="dialog"]')!
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(dialog.getAttribute('aria-label')).toBe('chart')
  })

  it('returns focus to the image button on close', () => {
    const el: HTMLElement = fixture.nativeElement
    const trigger = el.querySelector<HTMLButtonElement>('button.zoomable-trigger')!
    trigger.click()
    fixture.detectChanges()
    component.close()
    fixture.detectChanges()
    expect(document.activeElement).toBe(trigger)
  })

  it('pans the zoomed image with the arrow keys', () => {
    component.open()
    component.toggleZoom()
    fixture.detectChanges()
    const panSpy = spyOn(component, 'pan')
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
    component.onKeydown(event)
    expect(panSpy).toHaveBeenCalledWith(1, 0)
  })

  it('closes on Escape only when open', () => {
    component.onEscape()
    expect(component.isOpen).toBe(false)
    component.open()
    component.onEscape()
    expect(component.isOpen).toBe(false)
  })
})
