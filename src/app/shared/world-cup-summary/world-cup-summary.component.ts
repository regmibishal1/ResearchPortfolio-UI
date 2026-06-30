import { Component, OnInit } from '@angular/core'
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common'
import { RouterModule } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { LatestResponse, WorldCupService } from '../../services/world-cup.service'

/**
 * Compact "live snapshot" card embedded on the World Cup project detail page.
 * Shows the latest run timestamp and the top 5 teams. Links to the full
 * /world-cup page for the leaderboard, bracket, history chart, and matches.
 */
@Component({
  selector: 'app-world-cup-summary',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DatePipe,
    DecimalPipe,
  ],
  templateUrl: './world-cup-summary.component.html',
  styleUrl: './world-cup-summary.component.scss',
})
export class WorldCupSummaryComponent implements OnInit {
  loading = true
  error: string | null = null
  data: LatestResponse | null = null

  constructor(private wc: WorldCupService) {}

  ngOnInit(): void {
    this.wc.getLatest({ limit: 5 }).subscribe({
      next: (res) => {
        this.data = res
        this.loading = false
      },
      error: (err) => {
        this.loading = false
        this.error =
          err?.error?.detail ?? err?.message ?? 'Live predictions are temporarily unavailable.'
      },
    })
  }
}
