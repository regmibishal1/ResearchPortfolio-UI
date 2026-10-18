import { ChangeDetectorRef, Component, ChangeDetectionStrategy, inject } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { SeoService } from '../../services/seo.service'
import { PROJECTS, Project, ProjectType, TYPE_LABEL, projectYear } from '../../data/projects'
import { WorkCardComponent } from '../../shared/work-card/work-card.component'

type TypeFilter = 'all' | ProjectType
type SortKey = 'year' | 'title'
type SortDir = 'asc' | 'desc'

const FILTERS: TypeFilter[] = ['all', 'product', 'research', 'coursework']

@Component({
  selector: 'app-project',
  imports: [RouterModule, WorkCardComponent],
  templateUrl: './project.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './project.component.scss',
})
export class ProjectComponent {
  private router = inject(Router)
  private route = inject(ActivatedRoute)

  readonly typeLabel = TYPE_LABEL
  readonly yearOf = projectYear

  /** e.g. "15 projects, 2021-2026" */
  readonly summary: string

  readonly filters = FILTERS.map((value) => ({
    value,
    label: value === 'all' ? 'All' : TYPE_LABEL[value],
    count: value === 'all' ? PROJECTS.length : PROJECTS.filter((p) => p.type === value).length,
  }))

  /** Set from the ?type= query parameter so a filtered view can be linked. */
  filter: TypeFilter = 'all'
  sortKey: SortKey = 'year'
  sortDir: SortDir = 'desc'

  constructor() {
    const seo = inject(SeoService)

    seo.setPage({
      title: 'Projects | Bishal Regmi',
      path: '/project',
      image: '/assets/og/projects.jpg',
      description:
        "Browse Bishal Regmi's software and research projects spanning full-stack development, machine learning, data science, and civic technology.",
      breadcrumbs: [{ name: 'Projects', path: '/project' }],
    })

    const years = PROJECTS.map(projectYear).filter((y): y is number => y !== null)
    this.summary = `${PROJECTS.length} projects, ${Math.min(...years)}-${Math.max(...years)}`

    const cdr = inject(ChangeDetectorRef)
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const type = params.get('type') as TypeFilter | null
      this.filter = type && FILTERS.includes(type) ? type : 'all'
      cdr.markForCheck()
    })
  }

  get featured(): Project[] {
    return PROJECTS.filter((p) => p.featured && this.matches(p))
  }

  /** Everything not featured, in the chosen column order. */
  get archive(): Project[] {
    const rows = PROJECTS.filter((p) => !p.featured && this.matches(p))
    // PROJECTS is already newest first, so year order is that or its reverse.
    if (this.sortKey === 'title') rows.sort((a, b) => a.title.localeCompare(b.title))
    const ascendingByDefault = this.sortKey === 'title'
    return (this.sortDir === 'asc') === ascendingByDefault ? rows : rows.reverse()
  }

  setFilter(value: TypeFilter) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { type: value === 'all' ? null : value },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    })
  }

  sortBy(key: SortKey) {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc'
    } else {
      this.sortKey = key
      // Newest years first, titles A to Z.
      this.sortDir = key === 'year' ? 'desc' : 'asc'
    }
  }

  ariaSort(key: SortKey): 'ascending' | 'descending' | 'none' {
    if (this.sortKey !== key) return 'none'
    return this.sortDir === 'asc' ? 'ascending' : 'descending'
  }

  codeLink(project: Project): string | null {
    return project.repoLinks?.[0]?.url ?? project.github ?? null
  }

  private matches(project: Project): boolean {
    return this.filter === 'all' || project.type === this.filter
  }
}
