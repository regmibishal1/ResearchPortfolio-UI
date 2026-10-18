import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core'
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common'
import { RouterModule } from '@angular/router'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { LatestResponse, WorldCupService } from '../../services/world-cup.service'
import { IconComponent } from '../icon/icon.component'

/**
 * Compact "final snapshot" card embedded on the World Cup project detail page.
 * Shows the latest run timestamp and the top 5 teams. Links to the full
 * /world-cup page for the leaderboard, bracket, history chart, and matches.
 */
@Component({
  selector: 'app-world-cup-summary',
  imports: [
    IconComponent,
    CommonModule,
    RouterModule,
    MatProgressSpinnerModule,
    DatePipe,
    DecimalPipe,
  ],
  templateUrl: './world-cup-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './world-cup-summary.component.scss',
})
export class WorldCupSummaryComponent implements OnInit {
  private wc = inject(WorldCupService)

  readonly loading = signal(true)
  readonly error = signal<string | null>(null)
  readonly data = signal<LatestResponse | null>(null)

  ngOnInit(): void {
    this.wc.getLatest({ limit: 5 }).subscribe({
      next: (res) => {
        this.data.set(res)
        this.loading.set(false)
      },
      error: (err) => {
        this.loading.set(false)
        this.error.set(
          err?.error?.detail ?? err?.message ?? 'Predictions are temporarily unavailable.'
        )
      },
    })
  }
}
