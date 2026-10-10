import { Component, ChangeDetectionStrategy, inject } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { ActivatedRoute, RouterModule } from '@angular/router'
import { PageNotFoundComponent } from '../page-not-found/page-not-found.component'
import { SeoService, PERSON_ID, SITE_URL, paperSchema } from '../../services/seo.service'
import { PROJECTS, Project, TYPE_LABEL, fileSize, statusText } from '../../data/projects'
import { WorldCupSummaryComponent } from '../../shared/world-cup-summary/world-cup-summary.component'
import { MriExplorerComponent } from '../../shared/mri-explorer/mri-explorer.component'
import { EmpathyExplorerComponent } from '../../shared/empathy-explorer/empathy-explorer.component'
import { ZoomableImageComponent } from '../../shared/zoomable-image/zoomable-image.component'
import { StatusBadgeComponent } from '../../shared/status-badge/status-badge.component'

@Component({
  selector: 'app-project-detail',
  imports: [
    PageNotFoundComponent,
    RouterModule,
    WorldCupSummaryComponent,
    MriExplorerComponent,
    EmpathyExplorerComponent,
    ZoomableImageComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './project-detail.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './project-detail.component.scss',
})
export class ProjectDetailComponent {
  private seo = inject(SeoService)

  readonly typeLabel = TYPE_LABEL
  readonly statusLabel = statusText
  readonly fileSize = fileSize

  project: Project | null = null
  /** Neighbors in the Projects list order, for the links at the foot of the page. */
  previous: Project | null = null
  next: Project | null = null

  constructor() {
    // The component stays in place when the previous/next links change the
    // id, so it follows the parameter rather than reading it once.
    inject(ActivatedRoute)
      .paramMap.pipe(takeUntilDestroyed())
      .subscribe((params) => this.show(params.get('id')))
  }

  isExternal(url: string): boolean {
    return /^https?:\/\//.test(url)
  }

  private show(id: string | null) {
    const index = PROJECTS.findIndex((p) => p.id === id)
    this.project = PROJECTS[index] ?? null
    this.previous = index > 0 ? PROJECTS[index - 1] : null
    this.next = index >= 0 && index < PROJECTS.length - 1 ? PROJECTS[index + 1] : null
    // An unknown slug shows the 404 page in place rather than redirecting,
    // so a broken link is visible instead of silently landing on the list.
    if (!this.project) return
    const path = `/project/${this.project.id}`
    this.seo.setPage({
      title: `${this.project.title} | Bishal Regmi`,
      description: this.project.seoDescription ?? this.project.shortDescription,
      socialDescription: this.project.shortDescription,
      path,
      image: `/assets/og/project-${this.project.id}.jpg`,
      breadcrumbs: [
        { name: 'Projects', path: '/project' },
        { name: this.project.title, path },
      ],
      schema: [
        projectSchema(this.project, path),
        ...(this.project.paper
          ? [paperSchema({ ...this.project, paper: this.project.paper })]
          : []),
      ],
    })
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
