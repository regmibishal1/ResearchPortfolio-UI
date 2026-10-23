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

  // What the lightbox image reports once it has loaded and been fit to the screen.
  const scaledDown = {
    naturalWidth: 1675,
    naturalHeight: 900,
    clientWidth: 1200,
    clientHeight: 645,
  }
  const fullSize = { naturalWidth: 523, naturalHeight: 264, clientWidth: 523, clientHeight: 264 }

  it('creates', () => {
    expect(component).toBeTruthy()
  })

  it('is never shown wider than the image itself', () => {
    fixture.componentRef.setInput('src', 'assets/projects/spacex-landing-importance.webp')
    fixture.detectChanges()
    const img = (fixture.nativeElement as HTMLElement).querySelector<HTMLImageElement>(
      '.zoomable-thumb'
    )!
    expect(img.style.maxWidth).toBe('523px')
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
    component.checkZoom(scaledDown)
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
    component.checkZoom(scaledDown)
    component.toggleZoom()
    fixture.detectChanges()
    const panSpy = spyOn(component, 'pan')
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
    component.onKeydown(event)
    expect(panSpy).toHaveBeenCalledWith(1, 0)
  })

  it('stays a plain image when it already shows at full size', () => {
    const el: HTMLElement = fixture.nativeElement
    fixture.componentRef.setInput('src', 'assets/projects/spacex-landing-importance.webp')
    el.style.width = '700px'
    component.measure()
    fixture.detectChanges()
    expect(el.querySelector('button.zoomable-trigger')).toBeNull()
    expect(el.querySelector('img.zoomable-thumb.full-size')).not.toBeNull()

    el.style.width = '300px'
    component.measure()
    fixture.detectChanges()
    expect(el.querySelector('button.zoomable-trigger')).not.toBeNull()
  })

  it('offers Zoom only when the lightbox had to shrink the image', () => {
    const el: HTMLElement = fixture.nativeElement
    const zoomButton = () =>
      [...el.querySelectorAll<HTMLButtonElement>('.lightbox-btn')].find((b) =>
        b.textContent!.includes('Zoom')
      )
    el.querySelector<HTMLButtonElement>('button.zoomable-trigger')!.click()
    fixture.detectChanges()
    expect(el.querySelector('.lightbox')).not.toBeNull()
    component.checkZoom(fullSize)
    fixture.detectChanges()
    expect(zoomButton()).toBeUndefined()
    component.toggleZoom()
    expect(component.zoomed).toBeFalse()
    expect(el.querySelector('.lightbox-hint')!.textContent).not.toContain('Zoom')

    component.checkZoom(scaledDown)
    fixture.detectChanges()
    expect(zoomButton()).toBeDefined()
  })

  it('closes on Escape only when open', () => {
    component.onEscape()
    expect(component.isOpen).toBe(false)
    component.open()
    component.onEscape()
    expect(component.isOpen).toBe(false)
  })
})
