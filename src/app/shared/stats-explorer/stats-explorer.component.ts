import { Component, ElementRef, OnDestroy, ViewChild, AfterViewInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { MatCardModule } from '@angular/material/card'
import { MatSelectModule } from '@angular/material/select'
import { MatSliderModule } from '@angular/material/slider'
import { MatButtonModule } from '@angular/material/button'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatChipsModule } from '@angular/material/chips'
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js'
import { StatsService, Distribution, SampleResponse } from '../../services/stats.service'

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip)

interface DistributionConfig {
  label: string
  params: { key: string; label: string; min: number; max: number; step: number; default: number }[]
}

const DISTRIBUTIONS: Record<Distribution, DistributionConfig> = {
  normal: {
    label: 'Normal',
    params: [
      { key: 'mean', label: 'Mean (μ)', min: -10, max: 10, step: 0.5, default: 0 },
      { key: 'std', label: 'Std Dev (σ)', min: 0.1, max: 5, step: 0.1, default: 1 },
    ],
  },
  uniform: {
    label: 'Uniform',
    params: [
      { key: 'low', label: 'Low', min: -10, max: 0, step: 0.5, default: 0 },
      { key: 'high', label: 'High', min: 0.5, max: 10, step: 0.5, default: 1 },
    ],
  },
  exponential: {
    label: 'Exponential',
    params: [{ key: 'scale', label: 'Scale (1/λ)', min: 0.1, max: 5, step: 0.1, default: 1 }],
  },
  beta: {
    label: 'Beta',
    params: [
      { key: 'alpha', label: 'Alpha (α)', min: 0.1, max: 10, step: 0.1, default: 2 },
      { key: 'beta', label: 'Beta (β)', min: 0.1, max: 10, step: 0.1, default: 5 },
    ],
  },
  binomial: {
    label: 'Binomial',
    params: [
      { key: 'n', label: 'Trials (n)', min: 1, max: 50, step: 1, default: 10 },
      { key: 'p', label: 'Probability (p)', min: 0.05, max: 0.95, step: 0.05, default: 0.5 },
    ],
  },
  poisson: {
    label: 'Poisson',
    params: [{ key: 'lambda', label: 'Rate (λ)', min: 0.5, max: 20, step: 0.5, default: 3 }],
  },
}

@Component({
  selector: 'app-stats-explorer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatSelectModule,
    MatSliderModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  templateUrl: './stats-explorer.component.html',
  styleUrls: ['./stats-explorer.component.scss'],
})
export class StatsExplorerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>

  distributions = Object.entries(DISTRIBUTIONS).map(([key, cfg]) => ({
    key: key as Distribution,
    label: cfg.label,
  }))

  selectedDistribution: Distribution = 'normal'
  paramValues: Record<string, number> = { mean: 0, std: 1 }
  nSamples = 2000

  loading = false
  error: string | null = null
  result: SampleResponse | null = null

  private chart: Chart | null = null

  constructor(private statsService: StatsService) {}

  get config(): DistributionConfig {
    return DISTRIBUTIONS[this.selectedDistribution]
  }

  get statEntries(): { key: string; value: number }[] {
    if (!this.result) return []
    return Object.entries(this.result.stats).map(([key, value]) => ({ key, value }))
  }

  ngAfterViewInit(): void {
    this.initChart()
    this.sample()
  }

  onDistributionChange(): void {
    // Reset params to defaults for the new distribution
    this.paramValues = {}
    for (const p of this.config.params) {
      this.paramValues[p.key] = p.default
    }
    this.sample()
  }

  sample(): void {
    this.loading = true
    this.error = null

    const params: Record<string, number> = {}
    for (const p of this.config.params) {
      params[p.key] = this.paramValues[p.key] ?? p.default
    }

    this.statsService
      .sample({
        distribution: this.selectedDistribution,
        params,
        n_samples: this.nSamples,
        n_bins: 40,
      })
      .subscribe({
        next: (res) => {
          this.result = res
          this.loading = false
          this.updateChart(res)
        },
        error: (err) => {
          this.loading = false
          this.error = err?.error?.detail ?? 'Failed to reach the model server.'
        },
      })
  }

  private initChart(): void {
    const ctx = this.chartCanvas.nativeElement.getContext('2d')
    if (!ctx) return

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: 'rgba(100,181,246,0.75)',
            borderColor: 'rgba(100,181,246,1)',
            borderWidth: 1,
            borderRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` frequency: ${(ctx.raw as number).toFixed(4)}`,
            },
          },
        },
        scales: {
          x: { display: false },
          y: {
            beginAtZero: true,
            ticks: { color: '#aaa' },
            grid: { color: 'rgba(255,255,255,0.05)' },
          },
        },
        animation: { duration: 300 },
      },
    })
  }

  private updateChart(res: SampleResponse): void {
    if (!this.chart) return
    this.chart.data.labels = res.histogram.map(
      (b) => `${b.bin_start.toFixed(2)}–${b.bin_end.toFixed(2)}`
    )
    this.chart.data.datasets[0].data = res.histogram.map((b) => b.frequency)
    this.chart.update()
  }

  ngOnDestroy(): void {
    this.chart?.destroy()
  }
}
