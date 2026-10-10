import { Component } from '@angular/core'

import { RouterModule } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'
import { SeoService } from '../../services/seo.service'
import { StatsExplorerComponent } from '../../shared/stats-explorer/stats-explorer.component'
import { PROJECTS, Project } from '../../data/projects'
import { Skill, homeSkills } from '../../data/skills'
import { experienceLabel } from '../../data/experience'

@Component({
  selector: 'app-dashboard',
  imports: [RouterModule, MatIconModule, StatsExplorerComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  constructor(seo: SeoService) {
    seo.setPage({
      title: 'Bishal Regmi | Software Engineer & Data Scientist',
      path: '/',
      image: '/assets/og/home.jpg',
      description: `Bishal Regmi is a Software Engineer and Data Scientist with ${experienceLabel()} years at T. Rowe Price. Case studies in applied ML, data systems and full-stack apps.`,
    })
  }

  skills: Skill[] = homeSkills()

  /** Show the first 4 projects as featured on the home page */
  featuredProjects: Project[] = PROJECTS.slice(0, 4)
}
