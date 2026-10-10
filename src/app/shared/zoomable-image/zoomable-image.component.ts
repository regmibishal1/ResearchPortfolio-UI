import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { A11yModule } from '@angular/cdk/a11y'
import { MatIconModule } from '@angular/material/icon'

const PAN_STEP = 120

/**
 * An image that opens in a full-screen lightbox. In the lightbox the image is
 * fit to the screen; the Zoom button (or a click on the image) shows it at full
 * resolution, and it can then be panned by dragging, swiping, the arrow keys or
 * the pan buttons. The lightbox is a modal dialog: focus stays inside while it
 * is open and returns to the image when it closes. Escape, the close button or
 * a click on the backdrop closes it.
 */
@Component({
  selector: 'app-zoomable-image',
  imports: [CommonModule, MatIconModule, A11yModule],
  templateUrl: './zoomable-image.component.html',
  styleUrl: './zoomable-image.component.scss',
})
export class ZoomableImageComponent {
  @Input({ required: true }) src!: string
  @Input() alt = ''
  @Input() caption?: string

  @ViewChild('stage') stage?: ElementRef<HTMLElement>
  @ViewChild('trigger') trigger?: ElementRef<HTMLButtonElement>

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
    document.body.style.overflow = 'hidden'
  }

  close(): void {
    if (!this.isOpen) return
    this.isOpen = false
    this.zoomed = false
    this.dragging = false
    document.body.style.overflow = ''
    this.trigger?.nativeElement.focus()
  }

  onBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('lightbox')) {
      this.close()
    }
  }

  toggleZoom(): void {
    this.zoomed = !this.zoomed
    if (!this.zoomed) {
      this.stage?.nativeElement.scrollTo({ left: 0, top: 0 })
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
    this.stage?.nativeElement.scrollBy({ left: dx * PAN_STEP, top: dy * PAN_STEP })
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
    if (!this.zoomed || !this.stage) return
    this.dragging = true
    this.moved = false
    this.startX = event.clientX
    this.startY = event.clientY
    this.startLeft = this.stage.nativeElement.scrollLeft
    this.startTop = this.stage.nativeElement.scrollTop
    event.preventDefault()
  }

  @HostListener('document:mousemove', ['$event'])
  onMove(event: MouseEvent): void {
    if (!this.dragging || !this.stage) return
    const dx = event.clientX - this.startX
    const dy = event.clientY - this.startY
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) this.moved = true
    this.stage.nativeElement.scrollLeft = this.startLeft - dx
    this.stage.nativeElement.scrollTop = this.startTop - dy
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
