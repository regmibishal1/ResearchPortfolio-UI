import { Component, ChangeDetectionStrategy, inject } from '@angular/core'
import { DatePipe } from '@angular/common'
import { RouterModule } from '@angular/router'
import { SeoService } from '../../services/seo.service'
import { PROJECTS, Project, SPOTLIGHT } from '../../data/projects'
import { POSTS } from '../../data/blog'
import { experienceLabel } from '../../data/experience'
import { SUMMARY } from '../../data/resume'
import { NOW, NowNote } from '../../data/now'
import { WorkCardComponent } from '../../shared/work-card/work-card.component'

@Component({
  selector: 'app-dashboard',
  imports: [RouterModule, DatePipe, WorkCardComponent],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  constructor() {
    const seo = inject(SeoService)

    seo.setPage({
      title: 'Bishal Regmi | Software Engineer & Data Scientist',
      path: '/',
      image: '/assets/og/home.jpg',
      description: `Bishal Regmi is a Software Engineer and Data Scientist with ${experienceLabel()} years at T. Rowe Price. Case studies in applied ML, data systems and full-stack apps.`,
    })
  }

  readonly summary = SUMMARY

  /** What I am working on now; the block is hidden while this is null. */
  now: NowNote | null = NOW

  /** The project Home leads with; the section is skipped if none is flagged. */
  readonly spotlight = SPOTLIGHT

  /** Featured work other than the spotlight, newest first. */
  readonly selectedWork: Project[] = PROJECTS.filter((p) => p.featured && !p.spotlight).slice(0, 4)

  readonly latestPost = POSTS[0] ?? null

  isExternal(url: string): boolean {
    return /^https?:\/\//.test(url)
  }
}
