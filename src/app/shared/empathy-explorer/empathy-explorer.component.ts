import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatIconModule } from '@angular/material/icon'
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js'

Chart.register(
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
)

interface RegressionRow {
  method: string
  mse: number
  rmse: number
  mae: number
  pearson: number
  baseline?: boolean
}

interface RegressionTable {
  target: string
  rows: RegressionRow[]
}

/**
 * Per-epoch eval metrics for the emotion classification model
 * (multimodal concat), taken from the training run's trainer state.
 * Loss at epoch 8 is null because that eval produced NaN on the unstable
 * local CUDA setup described in the report, so the gap is kept honest.
 */
const CLASSIFICATION_CURVE = [
  { epoch: 1, acc: 0.3623, macroF1: 0.0313, loss: 2.2175 },
  { epoch: 2, acc: 0.5169, macroF1: 0.0756, loss: 1.9181 },
  { epoch: 3, acc: 0.5845, macroF1: 0.1294, loss: 1.8235 },
  { epoch: 4, acc: 0.5749, macroF1: 0.1099, loss: 1.7495 },
  { epoch: 5, acc: 0.5556, macroF1: 0.1226, loss: 1.744 },
  { epoch: 6, acc: 0.5749, macroF1: 0.1475, loss: 1.7422 },
  { epoch: 7, acc: 0.5845, macroF1: 0.1664, loss: 1.7436 },
  { epoch: 8, acc: 0.5507, macroF1: 0.1407, loss: null },
  { epoch: 9, acc: 0.5604, macroF1: 0.1463, loss: 1.79 },
  { epoch: 10, acc: 0.5459, macroF1: 0.1373, loss: 1.8175 },
]

@Component({
  selector: 'app-empathy-explorer',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './empathy-explorer.component.html',
  styleUrl: './empathy-explorer.component.scss',
})
export class EmpathyExplorerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('curveCanvas') curveCanvas!: ElementRef<HTMLCanvasElement>

  private chart?: Chart

  /** Regression results from the final report (Tables 1 and 2) */
  regressionTables: RegressionTable[] = [
    {
      target: 'Empathy',
      rows: [
        {
          method: 'Text-only baseline',
          mse: 0.4886,
          rmse: 0.699,
          mae: 0.5471,
          pearson: 0.6858,
          baseline: true,
        },
        { method: 'Multimodal (concat)', mse: 0.5063, rmse: 0.7115, mae: 0.5557, pearson: 0.687 },
        {
          method: 'Multimodal (MLP on categorical)',
          mse: 0.4952,
          rmse: 0.7037,
          mae: 0.548,
          pearson: 0.6846,
        },
      ],
    },
    {
      target: 'Emotional Intensity',
      rows: [
        {
          method: 'Text-only baseline',
          mse: 0.3198,
          rmse: 0.5654,
          mae: 0.4416,
          pearson: 0.7556,
          baseline: true,
        },
        { method: 'Multimodal (concat)', mse: 0.3265, rmse: 0.5714, mae: 0.4468, pearson: 0.7572 },
      ],
    },
    {
      target: 'Emotional Polarity',
      rows: [
        {
          method: 'Text-only baseline',
          mse: 0.1658,
          rmse: 0.4072,
          mae: 0.3012,
          pearson: 0.764,
          baseline: true,
        },
        { method: 'Multimodal (concat)', mse: 0.1682, rmse: 0.4102, mae: 0.3012, pearson: 0.7677 },
      ],
    },
  ]

  ngAfterViewInit() {
    const styles = getComputedStyle(document.documentElement)
    const gold = styles.getPropertyValue('--accent-gold').trim() || '#f0c040'
    const textColor = styles.getPropertyValue('--text-secondary').trim() || '#a0a0b8'
    const gridColor = 'rgba(255, 255, 255, 0.06)'

    this.chart = new Chart(this.curveCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: CLASSIFICATION_CURVE.map((r) => `Epoch ${r.epoch}`),
        datasets: [
          {
            label: 'Eval accuracy',
            data: CLASSIFICATION_CURVE.map((r) => r.acc),
            borderColor: gold,
            backgroundColor: gold,
            tension: 0.3,
            yAxisID: 'y',
          },
          {
            label: 'Macro F1',
            data: CLASSIFICATION_CURVE.map((r) => r.macroF1),
            borderColor: '#89b4fa',
            backgroundColor: '#89b4fa',
            tension: 0.3,
            yAxisID: 'y',
          },
          {
            label: 'Eval loss',
            data: CLASSIFICATION_CURVE.map((r) => r.loss),
            borderColor: '#f87171',
            backgroundColor: '#f87171',
            borderDash: [6, 4],
            tension: 0.3,
            yAxisID: 'y1',
            spanGaps: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: textColor } },
        },
        scales: {
          x: { ticks: { color: textColor }, grid: { color: gridColor } },
          y: {
            position: 'left',
            min: 0,
            max: 1,
            title: { display: true, text: 'Accuracy / Macro F1', color: textColor },
            ticks: { color: textColor },
            grid: { color: gridColor },
          },
          y1: {
            position: 'right',
            title: { display: true, text: 'Cross-entropy loss', color: textColor },
            ticks: { color: textColor },
            grid: { drawOnChartArea: false },
          },
        },
      },
    })
  }

  ngOnDestroy() {
    this.chart?.destroy()
  }
}
