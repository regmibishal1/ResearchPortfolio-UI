import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common'
import { RouterModule } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { Title, Meta } from '@angular/platform-browser'
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import { forkJoin, of } from 'rxjs'
import { catchError } from 'rxjs/operators'
import {
  CompaniesResponse,
  CompanyDetailResponse,
  CompanyRow,
  LatestResponse,
  SectorRow,
  StocksService,
  TrackRecordResponse,
} from '../../services/stocks.service'

Chart.register(
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Legend,
  Tooltip
)

interface MetricCard {
  label: string
  value: string
  hint: string
}

@Component({
  selector: 'app-stocks',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DatePipe,
    DecimalPipe,
  ],
  templateUrl: './stocks.component.html',
  styleUrl: './stocks.component.scss',
})
export class StocksComponent implements OnInit, OnDestroy {
  // The canvas only enters the DOM once the loading gate flips, which happens
  // in the same change-detection pass that delivers the data. Rendering from
  // a ViewChild setter draws the chart exactly when the element exists,
  // instead of racing change detection from the subscribe callback.
  private trackCanvas?: ElementRef<HTMLCanvasElement>

  @ViewChild('trackCanvas')
  set trackCanvasRef(ref: ElementRef<HTMLCanvasElement> | undefined) {
    this.trackCanvas = ref
    if (ref) this.renderTrackChart()
  }

  loading = true
  error: string | null = null

  latest: LatestResponse | null = null
  sectors: SectorRow[] = []
  sectorMaxAbs = 1

  companies: CompanyRow[] = []
  selectedSector: string | null = null

  selectedTicker: string | null = null
  companyDetail: CompanyDetailResponse | null = null
  companyLoading = false

  trackRecord: TrackRecordResponse | null = null
  metricCards: MetricCard[] = []

  private chart: Chart | null = null

  constructor(
    private stocks: StocksService,
    title: Title,
    meta: Meta
  ) {
    title.setTitle('EDGAR Fundamentals Signals | Bishal Regmi')
    meta.updateTag({
      name: 'description',
      content:
        'Point-in-time earnings-surprise signals from SEC EDGAR filings across 11 sectors, ' +
        'with an honest walk-forward track record.',
    })
  }

  ngOnInit(): void {
    forkJoin({
      latest: this.stocks.getLatest(),
      companies: this.stocks
        .getCompanies({ limit: 400 })
        .pipe(catchError(() => of(null as CompaniesResponse | null))),
      track: this.stocks
        .getTrackRecord()
        .pipe(catchError(() => of(null as TrackRecordResponse | null))),
    }).subscribe({
      next: ({ latest, companies, track }) => {
        this.latest = latest
        this.sectors = [...latest.sectors].sort(
          (a, b) => (b.mean_sue ?? 0) - (a.mean_sue ?? 0)
        )
        this.sectorMaxAbs = Math.max(
          0.0001,
          ...this.sectors.map((s) => Math.abs(s.mean_sue ?? 0))
        )
        this.companies = companies?.companies ?? []
        this.trackRecord = track
        this.metricCards = this.buildMetricCards(latest)
        this.loading = false
      },
      error: () => {
        this.error = 'Could not load the latest snapshot. The data feed may not be seeded yet.'
        this.loading = false
      },
    })
  }

  ngOnDestroy(): void {
    this.chart?.destroy()
  }

  get visibleCompanies(): CompanyRow[] {
    const list = this.selectedSector
      ? this.companies.filter((c) => c.sector === this.selectedSector)
      : this.companies
    return [...list].sort((a, b) => (b.sue ?? -Infinity) - (a.sue ?? -Infinity))
  }

  selectSector(sector: string): void {
    this.selectedSector = this.selectedSector === sector ? null : sector
  }

  selectCompany(ticker: string): void {
    if (this.selectedTicker === ticker) {
      this.selectedTicker = null
      this.companyDetail = null
      return
    }
    this.selectedTicker = ticker
    this.companyLoading = true
    this.companyDetail = null
    this.stocks
      .getCompany(ticker)
      .pipe(catchError(() => of(null as CompanyDetailResponse | null)))
      .subscribe((detail) => {
        this.companyDetail = detail
        this.companyLoading = false
      })
  }

  // Diverging heat colour: green for positive mean surprise, red for
  // negative, scaled by the strongest absolute value in the set.
  heatColor(value: number | null): string {
    if (value === null) return 'rgba(160, 160, 184, 0.12)'
    const t = Math.max(-1, Math.min(1, value / this.sectorMaxAbs))
    const hue = t >= 0 ? 145 : 5
    const alpha = 0.12 + 0.5 * Math.abs(t)
    return `hsla(${hue}, 55%, 45%, ${alpha.toFixed(3)})`
  }

  private buildMetricCards(latest: LatestResponse): MetricCard[] {
    const m = latest.run.metrics || {}
    const fmt = (v: number | undefined, digits = 2, suffix = '') =>
      v === undefined || v === null ? '-' : `${v.toFixed(digits)}${suffix}`
    return [
      {
        label: 'Information coefficient',
        value: fmt(m['ic_mean'], 3),
        hint: `t-stat ${fmt(m['ic_t'], 2)} across ${latest.run.n_events} filing events`,
      },
      {
        label: 'Long-short, per quarter',
        value: fmt(m['ls_mean_qtr'], 2, '%'),
        hint: `Sharpe ${fmt(m['ls_sharpe'], 2)}, net of costs`,
      },
      {
        label: 'Return direction AUC',
        value: fmt(m['ret_auc'], 3),
        hint: '0.50 is a coin flip; single-name returns are close to it',
      },
      {
        label: 'Volatility R-squared',
        value: fmt(m['vol_r2_model'], 3),
        hint: `vs ${fmt(m['vol_r2_persistence'], 3)} for calibrated persistence`,
      },
    ]
  }

  private renderTrackChart(): void {
    const points = this.trackRecord?.points ?? []
    if (!points.length || !this.trackCanvas) return
    const ctx = this.trackCanvas.nativeElement.getContext('2d')
    if (!ctx) return

    const labels = points.map((p) => p.period_label)
    const lsData = points.map((p) => (p.long_short_ret === null ? null : p.long_short_ret * 100))
    const icData = points.map((p) => p.ic)

    this.chart?.destroy()
    this.chart = new Chart(ctx, {
      data: {
        labels,
        datasets: [
          {
            type: 'bar',
            label: 'Long-short (%/qtr)',
            data: lsData,
            backgroundColor: lsData.map((v) =>
              (v ?? 0) >= 0 ? 'rgba(63, 125, 92, 0.75)' : 'rgba(164, 72, 61, 0.75)'
            ),
            yAxisID: 'y',
            order: 2,
          },
          {
            type: 'line',
            label: 'Information coefficient',
            data: icData,
            borderColor: '#f0c040',
            backgroundColor: '#f0c040',
            borderWidth: 2,
            pointRadius: 3,
            tension: 0.2,
            spanGaps: true,
            yAxisID: 'y1',
            order: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#cdd6f4', boxWidth: 12, font: { size: 11 } },
          },
        },
        scales: {
          x: {
            ticks: { color: '#a6adc8', maxRotation: 90, minRotation: 90 },
            grid: { color: 'rgba(255,255,255,0.05)' },
          },
          y: {
            position: 'left',
            ticks: { color: '#a6adc8', callback: (v) => `${v}%` },
            grid: { color: 'rgba(255,255,255,0.05)' },
            title: { display: true, text: 'Long-short (%/qtr)', color: '#a6adc8' },
          },
          y1: {
            position: 'right',
            ticks: { color: '#f0c040' },
            grid: { drawOnChartArea: false },
            title: { display: true, text: 'IC', color: '#f0c040' },
          },
        },
      },
    })
  }
}
