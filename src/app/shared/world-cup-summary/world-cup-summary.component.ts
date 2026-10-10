import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core'
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
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './world-cup-summary.component.scss',
})
export class WorldCupSummaryComponent implements OnInit {
  private wc = inject(WorldCupService)

  loading = true
  error: string | null = null
  data: LatestResponse | null = null

  ngOnInit(): void {
    this.wc.getLatest({ limit: 5 }).subscribe({
      next: (res) => {
        this.data = res
        this.loading = false
      },
      error: (err) => {
        this.loading = false
        this.error =
          err?.error?.detail ?? err?.message ?? 'Predictions are temporarily unavailable.'
      },
    })
  }
}
