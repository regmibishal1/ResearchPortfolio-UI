import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'
import { SeoService } from '../../services/seo.service'
import { PROJECTS, Project } from '../../data/projects'

@Component({
  selector: 'app-project',
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss',
})
export class ProjectComponent {
  activeFilter = 'All'

  categories = ['All', 'Data Science', 'Full Stack', 'Machine Learning', 'Tools']

  projects: Project[] = PROJECTS

  constructor(seo: SeoService) {
    seo.setPage({
      title: 'Projects | Bishal Regmi',
      path: '/project',
      image: '/assets/og/projects.jpg',
      description:
        "Browse Bishal Regmi's software and research projects spanning full-stack development, machine learning, data science, and civic technology.",
      breadcrumbs: [{ name: 'Projects', path: '/project' }],
    })
  }

  get filteredProjects(): Project[] {
    if (this.activeFilter === 'All') return this.projects
    return this.projects.filter((p) => p.category === this.activeFilter)
  }

  setFilter(category: string) {
    this.activeFilter = category
  }
}
