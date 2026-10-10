import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute, RouterModule } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'
import { PageNotFoundComponent } from '../page-not-found/page-not-found.component'
import { SeoService, PERSON_ID, SITE_URL } from '../../services/seo.service'
import { PROJECTS, Project } from '../../data/projects'
import { WorldCupSummaryComponent } from '../../shared/world-cup-summary/world-cup-summary.component'
import { MriExplorerComponent } from '../../shared/mri-explorer/mri-explorer.component'
import { EmpathyExplorerComponent } from '../../shared/empathy-explorer/empathy-explorer.component'
import { ZoomableImageComponent } from '../../shared/zoomable-image/zoomable-image.component'

@Component({
  selector: 'app-project-detail',
  imports: [
    PageNotFoundComponent,
    CommonModule,
    RouterModule,
    MatIconModule,
    WorldCupSummaryComponent,
    MriExplorerComponent,
    EmpathyExplorerComponent,
    ZoomableImageComponent,
  ],
  templateUrl: './project-detail.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './project-detail.component.scss',
})
export class ProjectDetailComponent implements OnInit {
  private route = inject(ActivatedRoute)
  private seo = inject(SeoService)

  project: Project | null = null

  readonly statusConfig: Record<string, { label: string; cssClass: string }> = {
    live: { label: 'Live', cssClass: 'status-live' },
    'in-progress': { label: 'In Progress', cssClass: 'status-wip' },
    research: { label: 'Research', cssClass: 'status-research' },
    proposal: { label: 'Research Proposal', cssClass: 'status-proposal' },
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')
    this.project = PROJECTS.find((p) => p.id === id) ?? null
    // An unknown slug shows the 404 page in place rather than redirecting,
    // so a broken link is visible instead of silently landing on the list.
    if (!this.project) return
    const path = `/project/${this.project.id}`
    this.seo.setPage({
      title: `${this.project.title} | Bishal Regmi`,
      description: this.project.shortDescription,
      path,
      image: `/assets/og/project-${this.project.id}.jpg`,
      breadcrumbs: [
        { name: 'Projects', path: '/project' },
        { name: this.project.title, path },
      ],
      schema: [projectSchema(this.project, path)],
    })
  }

  get statusDisplay() {
    if (!this.project?.status) return null
    return this.statusConfig[this.project.status] ?? null
  }
}

// Projects with source code are described as SoftwareSourceCode so search
// engines can link the repository; reports and notebooks stay CreativeWork.
function projectSchema(project: Project, path: string): Record<string, unknown> {
  const repo = project.github ?? project.repoLinks?.[0]?.url
  return {
    '@type': repo ? 'SoftwareSourceCode' : 'CreativeWork',
    name: project.title,
    description: project.shortDescription,
    url: SITE_URL + path,
    keywords: project.tags.join(', '),
    author: { '@id': PERSON_ID },
    ...(project.image && { image: `${SITE_URL}/${project.image}` }),
    ...(repo && { codeRepository: repo }),
  }
}
