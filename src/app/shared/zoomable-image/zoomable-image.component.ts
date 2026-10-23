import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  ChangeDetectionStrategy,
  afterNextRender,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core'

import { NgTemplateOutlet } from '@angular/common'
import { A11yModule } from '@angular/cdk/a11y'
import { IconComponent } from '../icon/icon.component'
import { IMAGE_SIZES } from '../../data/image-sizes'

const PAN_STEP = 120

/**
 * An image that opens in a full-screen lightbox. In the lightbox the image is
 * fit to the screen; the Zoom button (or a click on the image) shows it at full
 * resolution, and it can then be panned by dragging, swiping, the arrow keys or
 * the pan buttons. The lightbox is a modal dialog: focus stays inside while it
 * is open and returns to the image when it closes. Escape, the close button or
 * a click on the backdrop closes it.
 *
 * Enlarging is only offered when there is more to see: an image already shown
 * at its full size stays a plain image, and Zoom only appears when the
 * lightbox itself had to scale the image down to fit the screen.
 */
@Component({
  selector: 'app-zoomable-image',
  imports: [IconComponent, A11yModule, NgTemplateOutlet],
  templateUrl: './zoomable-image.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './zoomable-image.component.scss',
})
export class ZoomableImageComponent {
  readonly src = input.required<string>()
  readonly alt = input('')
  readonly caption = input<string>()

  /**
   * The image's pixel size, from the generated size map, so the page holds
   * its space before the lazy image loads, and a small image is never shown
   * wider than it is. Null for an image not in the map.
   */
  get size(): [number, number] | null {
    return IMAGE_SIZES[this.src().replace(/^\//, '')] ?? null
  }

  readonly stage = viewChild<ElementRef<HTMLElement>>('stage')
  readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger')

  /** False while the image has room to show at its full size on the page. */
  readonly enlargeable = signal(true)
  /** True when the lightbox shows the image smaller than it is. */
  readonly canZoom = signal(false)

  private host = inject<ElementRef<HTMLElement>>(ElementRef)

  constructor() {
    const destroyRef = inject(DestroyRef)
    afterNextRender(() => {
      const observer = new ResizeObserver(() => this.measure())
      observer.observe(this.host.nativeElement)
      destroyRef.onDestroy(() => observer.disconnect())
    })
  }

  /** Compares the room the image has on the page with its own width. */
  measure(): void {
    const width = this.size?.[0]
    if (width) this.enlargeable.set(this.host.nativeElement.clientWidth < width)
  }

  /** Runs once the lightbox image has loaded and been fit to the screen. */
  checkZoom(
    img: Pick<HTMLImageElement, 'naturalWidth' | 'naturalHeight' | 'clientWidth' | 'clientHeight'>
  ): void {
    this.canZoom.set(
      img.naturalWidth > img.clientWidth + 1 || img.naturalHeight > img.clientHeight + 1
    )
  }

  isOpen = false
  zoomed = false

  private dragging = false
  private moved = false
  private startX = 0
  private startY = 0
  private startLeft = 0
  private startTop = 0

  open(): void {
    this.isOpen = true
    this.zoomed = false
    this.canZoom.set(false)
    document.body.style.overflow = 'hidden'
  }

  close(): void {
    if (!this.isOpen) return
    this.isOpen = false
    this.zoomed = false
    this.dragging = false
    document.body.style.overflow = ''
    this.trigger()?.nativeElement.focus()
  }

  onBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('lightbox')) {
      this.close()
    }
  }

  toggleZoom(): void {
    if (!this.canZoom() && !this.zoomed) return
    this.zoomed = !this.zoomed
    if (!this.zoomed) {
      this.stage()?.nativeElement.scrollTo({ left: 0, top: 0 })
    }
  }

  onImageClick(): void {
    // A drag ends in a click; ignore that click so panning does not also zoom.
    if (this.moved) {
      this.moved = false
      return
    }
    this.toggleZoom()
  }

  pan(dx: number, dy: number): void {
    this.stage()?.nativeElement.scrollBy({ left: dx * PAN_STEP, top: dy * PAN_STEP })
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.zoomed) return
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    }
    const move = moves[event.key]
    if (!move) return
    event.preventDefault()
    this.pan(move[0], move[1])
  }

  onDown(event: MouseEvent): void {
    const stage = this.stage()?.nativeElement
    if (!this.zoomed || !stage) return
    this.dragging = true
    this.moved = false
    this.startX = event.clientX
    this.startY = event.clientY
    this.startLeft = stage.scrollLeft
    this.startTop = stage.scrollTop
    event.preventDefault()
  }

  @HostListener('document:mousemove', ['$event'])
  onMove(event: MouseEvent): void {
    const stage = this.stage()?.nativeElement
    if (!this.dragging || !stage) return
    const dx = event.clientX - this.startX
    const dy = event.clientY - this.startY
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) this.moved = true
    stage.scrollLeft = this.startLeft - dx
    stage.scrollTop = this.startTop - dy
  }

  @HostListener('document:mouseup')
  onUp(): void {
    this.dragging = false
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) this.close()
  }
}
