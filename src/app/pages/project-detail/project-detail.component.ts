import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'
import { Title, Meta } from '@angular/platform-browser'
import { PROJECTS, Project } from '../../data/projects'
import { WorldCupSummaryComponent } from '../../shared/world-cup-summary/world-cup-summary.component'
import { MriExplorerComponent } from '../../shared/mri-explorer/mri-explorer.component'
import { EmpathyExplorerComponent } from '../../shared/empathy-explorer/empathy-explorer.component'

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    WorldCupSummaryComponent,
    MriExplorerComponent,
    EmpathyExplorerComponent,
  ],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss',
})
export class ProjectDetailComponent implements OnInit {
  project: Project | null = null

  readonly statusConfig: Record<string, { label: string; cssClass: string }> = {
    live: { label: 'Live', cssClass: 'status-live' },
    'in-progress': { label: 'In Progress', cssClass: 'status-wip' },
    research: { label: 'Research', cssClass: 'status-research' },
    proposal: { label: 'Research Proposal', cssClass: 'status-proposal' },
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private title: Title,
    private meta: Meta
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')
    this.project = PROJECTS.find((p) => p.id === id) ?? null
    if (!this.project) {
      this.router.navigate(['/project'])
      return
    }
    this.title.setTitle(`${this.project.title} | Bishal Regmi`)
    this.meta.updateTag({ name: 'description', content: this.project.shortDescription })
  }

  get statusDisplay() {
    if (!this.project?.status) return null
    return this.statusConfig[this.project.status] ?? null
  }
}
