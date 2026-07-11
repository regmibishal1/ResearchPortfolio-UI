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
    component.src = 'assets/blog/bwi-trends.webp'
    component.alt = 'chart'
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

  it('closes on Escape only when open', () => {
    component.onEscape()
    expect(component.isOpen).toBe(false)
    component.open()
    component.onEscape()
    expect(component.isOpen).toBe(false)
  })
})
