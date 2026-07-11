import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatIconModule } from '@angular/material/icon'

/**
 * An image that opens in a full-screen lightbox on click. In the lightbox the
 * image is fit to the screen; clicking it toggles to full resolution, and when
 * zoomed the user drags to pan (the stage scrolls). Escape or a click on the
 * backdrop closes it.
 */
@Component({
  selector: 'app-zoomable-image',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './zoomable-image.component.html',
  styleUrl: './zoomable-image.component.scss',
})
export class ZoomableImageComponent {
  @Input({ required: true }) src!: string
  @Input() alt = ''
  @Input() caption?: string

  @ViewChild('stage') stage?: ElementRef<HTMLElement>

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
    this.isOpen = false
    this.zoomed = false
    this.dragging = false
    document.body.style.overflow = ''
  }

  onBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('lightbox')) {
      this.close()
    }
  }

  toggleZoom(): void {
    // A drag ends in a click; ignore that click so panning does not also zoom.
    if (this.moved) {
      this.moved = false
      return
    }
    this.zoomed = !this.zoomed
    if (!this.zoomed) {
      this.stage?.nativeElement.scrollTo({ left: 0, top: 0 })
    }
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
