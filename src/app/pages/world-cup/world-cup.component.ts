import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common'
import { RouterModule } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'
import { MatTabsModule } from '@angular/material/tabs'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { Title, Meta } from '@angular/platform-browser'
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  CategoryScale,
  Legend,
  Tooltip,
} from 'chart.js'
import { forkJoin } from 'rxjs'
import {
  BracketResponse,
  HistoryResponse,
  LatestResponse,
  PlayedMatchesResponse,
  WorldCupService,
} from '../../services/world-cup.service'

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  TimeScale,
  Legend,
  Tooltip
)

// 10-colour palette for the history chart. Repeated if more than 10 teams.
const PALETTE = [
  '#89b4fa',
  '#a6e3a1',
  '#f9e2af',
  '#fab387',
  '#f38ba8',
  '#cba6f7',
  '#94e2d5',
  '#f5c2e7',
  '#74c7ec',
  '#eba0ac',
]

@Component({
  selector: 'app-world-cup',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    DatePipe,
    DecimalPipe,
  ],
  templateUrl: './world-cup.component.html',
  styleUrl: './world-cup.component.scss',
})
export class WorldCupComponent implements OnInit, OnDestroy {
  @ViewChild('historyCanvas') historyCanvas?: ElementRef<HTMLCanvasElement>

  loading = true
  error: string | null = null

  latest: LatestResponse | null = null
  bracket: BracketResponse | null = null
  history: HistoryResponse | null = null
  playedMatches: PlayedMatchesResponse | null = null

  // Precomputed once when data arrives. Avoids the Angular getter trap
  // where a property returning a new array on every change-detection
  // cycle re-renders *ngFor children continuously.
  groupKeys: string[] = []
  matchesByDate: { date: string; matches: PlayedMatchesResponse['matches'] }[] = []

  /**
   * Bracket split into left and right halves so the template can render
   * a symmetric tournament layout (R32 ─ R16 ─ QF ─ SF │ FINAL │ SF ─ QF ─ R16 ─ R32).
   */
  bracketHalves: {
    left: { r32: string[][]; r16: string[][]; qf: string[][]; sf: string[][] }
    right: { r32: string[][]; r16: string[][]; qf: string[][]; sf: string[][] }
  } | null = null

  /**
   * Teams that won each round = teams that appear in the next round.
   * Used by the template to bold the winning side of every match.
   */
  advancers: {
    r32: Set<string>
    r16: Set<string>
    qf: Set<string>
    sf: Set<string>
  } = { r32: new Set(), r16: new Set(), qf: new Set(), sf: new Set() }

  private chart: Chart | null = null

  constructor(
    private wc: WorldCupService,
    title: Title,
    meta: Meta
  ) {
    title.setTitle('World Cup 2026 Live Predictions | Bishal Regmi')
    meta.updateTag({
      name: 'description',
      content:
        'Live calibrated XGBoost + Monte Carlo predictions for the FIFA World Cup 2026. ' +
        'Updated daily with locked-in group-stage results.',
    })
  }

  ngOnInit(): void {
    forkJoin({
      latest: this.wc.getLatest({ limit: 48 }),
      bracket: this.wc.getBracket(),
      history: this.wc.getHistory({ stage: 'winner' }),
      played: this.wc.getPlayedMatches(),
    }).subscribe({
      next: ({ latest, bracket, history, played }) => {
        this.latest = latest
        this.bracket = bracket
        this.history = history
        this.playedMatches = played

        // Precompute derived views so templates get stable references.
        this.groupKeys = Object.keys(bracket.group_winners).sort()
        this.matchesByDate = this.computeMatchesByDate(played)
        this.bracketHalves = this.computeBracketHalves(bracket)
        this.advancers = this.computeAdvancers(bracket)

        this.loading = false
        // Draw chart on next macrotask so the canvas is in the DOM.
        setTimeout(() => this.renderHistoryChart())
      },
      error: (err) => {
        this.loading = false
        this.error =
          err?.error?.detail ??
          err?.message ??
          'Could not load predictions. The backend may still be warming up.'
      },
    })
  }

  ngOnDestroy(): void {
    this.chart?.destroy()
  }

  // ── Derived ──────────────────────────────────────────────────────────

  /** Build the left/right halves for a symmetric bracket layout. */
  private computeBracketHalves(b: BracketResponse) {
    return {
      left: {
        r32: b.r32.slice(0, 8),
        r16: b.r16.slice(0, 4),
        qf: b.qf.slice(0, 2),
        sf: b.sf.slice(0, 1),
      },
      right: {
        r32: b.r32.slice(8),
        r16: b.r16.slice(4),
        qf: b.qf.slice(2),
        sf: b.sf.slice(1),
      },
    }
  }

  /**
   * A team "advances" from round X if they appear in round X+1.
   * Building these sets once makes the template-side winner lookup O(1).
   */
  private computeAdvancers(b: BracketResponse) {
    const flat = (pairs: string[][]) => new Set(pairs.flat())
    return {
      r32: flat(b.r16),
      r16: flat(b.qf),
      qf: flat(b.sf),
      sf: new Set(b.final_pair),
    }
  }

  /** Group played matches by date for the Played tab. Called once. */
  private computeMatchesByDate(
    played: PlayedMatchesResponse
  ): { date: string; matches: PlayedMatchesResponse['matches'] }[] {
    const groups = new Map<string, PlayedMatchesResponse['matches']>()
    for (const m of played.matches) {
      const list = groups.get(m.match_date) ?? []
      list.push(m)
      groups.set(m.match_date, list)
    }
    return [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, matches]) => ({ date, matches }))
  }

  // ── trackBy for template *ngFor stability ────────────────────────────
  trackByTeam = (_: number, row: { team: string }) => row.team
  trackByMatch = (_: number, m: PlayedMatchesResponse['matches'][number]) =>
    `${m.match_date}-${m.home_team}-${m.away_team}`
  trackByDate = (_: number, d: { date: string }) => d.date
  trackByPair = (i: number, pair: string[]) => `${i}-${pair[0]}-${pair[1]}`
  trackByGroup = (_: number, g: string) => g

  // ── Chart ────────────────────────────────────────────────────────────

  private renderHistoryChart(): void {
    if (!this.history || !this.historyCanvas) return

    const ctx = this.historyCanvas.nativeElement.getContext('2d')
    if (!ctx) return

    // Build labels = union of all snapshot dates (sorted).
    const dateSet = new Set<string>()
    for (const series of this.history.series) {
      for (const p of series.points) dateSet.add(p.as_of_date)
    }
    const labels = [...dateSet].sort()

    const datasets = this.history.series.map((s, i) => {
      const dateToValue = new Map(s.points.map((p) => [p.as_of_date, p.value]))
      return {
        label: s.team,
        data: labels.map((d) => dateToValue.get(d) ?? null),
        borderColor: PALETTE[i % PALETTE.length],
        backgroundColor: PALETTE[i % PALETTE.length],
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.2,
        spanGaps: true,
      }
    })

    this.chart?.destroy()
    this.chart = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#cdd6f4', boxWidth: 12, font: { size: 11 } },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${(ctx.raw as number)?.toFixed(2) ?? '-'}%`,
            },
          },
        },
        scales: {
          x: {
            ticks: { color: '#a6adc8', maxRotation: 0 },
            grid: { color: 'rgba(255,255,255,0.05)' },
          },
          y: {
            ticks: { color: '#a6adc8', callback: (v) => `${v}%` },
            grid: { color: 'rgba(255,255,255,0.05)' },
            title: { display: true, text: 'Winner %', color: '#a6adc8' },
          },
        },
      },
    })
  }
}
