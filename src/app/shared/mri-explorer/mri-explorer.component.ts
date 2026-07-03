import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatIconModule } from '@angular/material/icon'

interface MriModel {
  id: string
  label: string
  layers: number
  /** Overall test accuracy (%) from the final report */
  accuracy: number
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
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './mri-explorer.component.html',
  styleUrl: './mri-explorer.component.scss',
})
export class MriExplorerComponent {
  /** Results published in the DATA 612 final report */
  models: MriModel[] = [
    {
      id: 'rn18',
      label: 'ResNet-18',
      layers: 18,
      accuracy: 98.83,
      testLoss: 0.0387,
      note: 'Unstable early in training but converges cleanly — strong baseline for the smallest variant.',
    },
    {
      id: 'rn34',
      label: 'ResNet-34',
      layers: 34,
      accuracy: 98.91,
      testLoss: 0.0327,
      note: 'More volatile than ResNet-18 during training despite the slightly better final numbers.',
    },
    {
      id: 'rn50',
      label: 'ResNet-50',
      layers: 50,
      accuracy: 99.06,
      testLoss: 0.0514,
      note: 'Best overall accuracy and the most stable learner — the bottleneck architecture pays off.',
    },
    {
      id: 'rn101',
      label: 'ResNet-101',
      layers: 101,
      accuracy: 98.52,
      testLoss: 0.0631,
      note: 'Deeper but not better here: more capacity than the limited dataset can support.',
    },
    {
      id: 'rn152',
      label: 'ResNet-152',
      layers: 152,
      accuracy: 97.42,
      testLoss: 0.0748,
      note: 'Weakest of the five — with this dataset size, the deepest variant overfits the hardest.',
    },
  ]

  saliencyClasses: SaliencyClass[] = [
    { id: 'non-demented', label: 'Non-Demented' },
    { id: 'very-mild-demented', label: 'Very Mild' },
    { id: 'mild-demented', label: 'Mild' },
    { id: 'moderate-demented', label: 'Moderate' },
  ]

  tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'saliency', label: 'Saliency Maps', icon: 'blur_on' },
    { id: 'confusion', label: 'Confusion Matrix', icon: 'grid_on' },
    { id: 'training', label: 'Training Curves', icon: 'show_chart' },
  ]

  selectedModel: MriModel = this.models[2] // ResNet-50 — the headline result
  activeTab: TabId = 'saliency'

  private readonly assetBase = 'assets/research/mri'

  selectModel(model: MriModel) {
    this.selectedModel = model
  }

  selectTab(tab: TabId) {
    this.activeTab = tab
  }

  saliencyImage(classId: string): string {
    return `${this.assetBase}/${this.selectedModel.id}-saliency-${classId}.png`
  }

  get confusionImage(): string {
    return `${this.assetBase}/${this.selectedModel.id}-confusion-matrix.png`
  }

  get trainingImage(): string {
    return `${this.assetBase}/${this.selectedModel.id}-training-curves.png`
  }
}
