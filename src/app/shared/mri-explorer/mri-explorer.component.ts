import {
  AfterViewInit,
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  PLATFORM_ID,
  ViewChild,
  inject,
} from '@angular/core'
import { DecimalPipe, isPlatformBrowser } from '@angular/common'

import { ZoomableImageComponent } from '../zoomable-image/zoomable-image.component'

interface MriModel {
  id: string
  label: string
  layers: number
  /** Overall test accuracy (%) from the final report */
  accuracy: number
  /**
   * Mean of the per-class recalls (%), from the model's confusion matrix.
   * Unlike plain accuracy it weighs the 15 Moderate scans as much as the
   * 634 Non-Demented ones.
   */
  balancedAccuracy: number
  /** Best-epoch test loss from the final report */
  testLoss: number
  note: string
}

interface SaliencyClass {
  id: string
  label: string
}

type TabId = 'saliency' | 'confusion' | 'training'

@Component({
  selector: 'app-mri-explorer',
  imports: [DecimalPipe, ZoomableImageComponent],
  templateUrl: './mri-explorer.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './mri-explorer.component.scss',
})
export class MriExplorerComponent implements AfterViewInit {
  /** Results published in the DATA 612 final report */
  models: MriModel[] = [
    {
      id: 'rn18',
      label: 'ResNet-18',
      layers: 18,
      accuracy: 98.83,
      balancedAccuracy: 97.07,
      testLoss: 0.0387,
      note: 'Unstable early in training but converges cleanly. A strong baseline for the smallest variant.',
    },
    {
      id: 'rn34',
      label: 'ResNet-34',
      layers: 34,
      accuracy: 98.91,
      balancedAccuracy: 97.0,
      testLoss: 0.0327,
      note: 'More volatile than ResNet-18 during training despite the slightly better final numbers.',
    },
    {
      id: 'rn50',
      label: 'ResNet-50',
      layers: 50,
      accuracy: 99.06,
      balancedAccuracy: 97.22,
      testLoss: 0.0514,
      note: 'Best overall accuracy and the most stable learner. The bottleneck architecture pays off.',
    },
    {
      id: 'rn101',
      label: 'ResNet-101',
      layers: 101,
      accuracy: 98.52,
      balancedAccuracy: 98.39,
      testLoss: 0.0631,
      note: 'Deeper but not better here: more capacity than the limited dataset can support.',
    },
    {
      id: 'rn152',
      label: 'ResNet-152',
      layers: 152,
      accuracy: 97.42,
      balancedAccuracy: 96.18,
      testLoss: 0.0748,
      note: 'Weakest of the five. With this dataset size, the deepest variant overfits the hardest.',
    },
  ]

  saliencyClasses: SaliencyClass[] = [
    { id: 'non-demented', label: 'Non-Demented' },
    { id: 'very-mild-demented', label: 'Very Mild' },
    { id: 'mild-demented', label: 'Mild' },
    { id: 'moderate-demented', label: 'Moderate' },
  ]

  tabs: { id: TabId; label: string }[] = [
    { id: 'saliency', label: 'Saliency maps' },
    { id: 'confusion', label: 'Confusion matrix' },
    { id: 'training', label: 'Training curves' },
  ]

  selectedModel: MriModel = this.models[2] // ResNet-50, the headline result
  activeTab: TabId = 'saliency'

  private readonly assetBase = 'assets/research/mri'

  @ViewChild('picker') picker?: ElementRef<HTMLElement>
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID))

  // On a narrow screen the model row scrolls sideways; start with the
  // selected model in view rather than cut off at the edge.
  ngAfterViewInit() {
    if (!this.isBrowser) return
    const row = this.picker?.nativeElement
    const chip = row?.querySelector<HTMLElement>('[aria-pressed="true"]')
    if (!row || !chip || row.scrollWidth <= row.clientWidth) return
    row.scrollLeft = chip.offsetLeft - (row.clientWidth - chip.offsetWidth) / 2
  }

  selectModel(model: MriModel) {
    this.selectedModel = model
  }

  selectTab(tab: TabId) {
    this.activeTab = tab
  }

  // Arrow keys, Home and End move between tabs, as in a native tab list.
  onTabKeydown(event: KeyboardEvent, index: number) {
    const last = this.tabs.length - 1
    const next: Record<string, number> = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }
    if (!(event.key in next)) return
    event.preventDefault()
    const tab = this.tabs[next[event.key]]
    this.selectTab(tab.id)
    setTimeout(() => document.getElementById('mri-tab-' + tab.id)?.focus())
  }

  saliencyImage(classId: string): string {
    return `${this.assetBase}/${this.selectedModel.id}-saliency-${classId}.webp`
  }

  get confusionImage(): string {
    return `${this.assetBase}/${this.selectedModel.id}-confusion-matrix.png`
  }

  get trainingImage(): string {
    return `${this.assetBase}/${this.selectedModel.id}-training-curves.png`
  }
}
