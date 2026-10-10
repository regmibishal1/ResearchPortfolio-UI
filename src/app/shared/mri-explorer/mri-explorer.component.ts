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
  /**
   * Correctly classified test scans per class, read off the model's confusion
   * matrix, in the order of CLASS_TOTALS.
   */
  correct: [number, number, number, number]
  /** The most common mistake in the confusion matrix. */
  mainMistake: string
  /** What the saliency maps look like, for screen readers. */
  saliencyLooks: string
  /** What the training curves show, for screen readers. */
  curvesShow: string
}

/** Test scans per class (Non-Demented, Very Mild, Mild, Moderate): 1,280 in all. */
export const CLASS_TOTALS = [634, 459, 172, 15] as const

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
      correct: [631, 454, 166, 14],
      mainMistake: '5 Very Mild scans called Non-Demented',
      saliencyLooks: 'an even glow over the whole brain, brightest toward its outer edge',
      curvesShow:
        'Train accuracy stays near 100%. Test accuracy swings early, falling to about 43% at epoch 6 when test loss spikes near 2.7, then settles near 98% from about epoch 22.',
    },
    {
      id: 'rn34',
      label: 'ResNet-34',
      layers: 34,
      accuracy: 98.91,
      balancedAccuracy: 97.0,
      testLoss: 0.0327,
      note: 'More volatile than ResNet-18 during training despite the slightly better final numbers.',
      correct: [633, 454, 165, 14],
      mainMistake: '6 Mild scans called Very Mild',
      saliencyLooks: 'an even glow over the whole brain, a little brighter toward the front',
      curvesShow:
        'Train accuracy stays near 100%. Test accuracy keeps swinging, down to about 45% at epoch 5 and 60% at epochs 12 and 16, with test loss spikes up to 3.0, and drops again near the end.',
    },
    {
      id: 'rn50',
      label: 'ResNet-50',
      layers: 50,
      accuracy: 99.06,
      balancedAccuracy: 97.22,
      testLoss: 0.0514,
      note: 'Best overall accuracy and the most stable learner. The bottleneck architecture pays off.',
      correct: [632, 456, 166, 14],
      mainMistake: '5 Mild scans called Very Mild',
      saliencyLooks: 'patchier, with small bright spots scattered through the tissue',
      curvesShow:
        'Train accuracy stays near 100%. Test accuracy climbs from 27% at epoch 1, swings until about epoch 14, then holds near 99% with test loss flat from about epoch 19.',
    },
    {
      id: 'rn101',
      label: 'ResNet-101',
      layers: 101,
      accuracy: 98.52,
      balancedAccuracy: 98.39,
      testLoss: 0.0631,
      note: 'Deeper but not better here: more capacity than the limited dataset can support.',
      correct: [630, 451, 165, 15],
      mainMistake: '6 Very Mild scans called Non-Demented',
      saliencyLooks: 'patchy, with the brightest spots near the outer edge',
      curvesShow:
        'Train accuracy stays near 100%. Test accuracy mostly climbs, but test loss spikes to about 9 at epoch 19, when test accuracy falls to about 35%, and to 4 at epoch 23, before settling near 98%.',
    },
    {
      id: 'rn152',
      label: 'ResNet-152',
      layers: 152,
      accuracy: 97.42,
      balancedAccuracy: 96.18,
      testLoss: 0.0748,
      note: 'Weakest of the five. With this dataset size, the deepest variant overfits the hardest.',
      correct: [625, 442, 166, 14],
      mainMistake: '11 Very Mild scans called Mild',
      saliencyLooks: 'faint overall, with scattered red specks near the edge',
      curvesShow:
        'Train accuracy rises to near 99%. Test accuracy never settles, swinging between about 50% and 97% to the last epoch, with test loss spikes up to 3.6.',
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

  /** Saliency map alt text: what the map shows, not just what it is. */
  saliencyAlt(cls: SaliencyClass): string {
    const grain =
      cls.id === 'moderate-demented'
        ? ' With only a few Moderate scans to average, it is grainier.'
        : ''
    return (
      `${this.selectedModel.label} saliency map averaged over ${cls.label} scans: an axial brain ` +
      `slice with a green overlay, ${this.selectedModel.saliencyLooks}. The dark ventricles in ` +
      `the middle stay unlit.${grain}`
    )
  }

  get confusionAlt(): string {
    const m = this.selectedModel
    const parts = this.saliencyClasses.map(
      (cls, i) => `${cls.label} ${m.correct[i]} of ${CLASS_TOTALS[i]}`
    )
    return (
      `${m.label} confusion matrix for the 1,280 test scans. Correct: ${parts.join(', ')}. ` +
      `The most common mistake: ${m.mainMistake}.`
    )
  }

  get trainingAlt(): string {
    return `${this.selectedModel.label} loss and accuracy over 30 epochs. ${this.selectedModel.curvesShow}`
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
