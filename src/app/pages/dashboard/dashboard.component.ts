import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'
import { Title, Meta } from '@angular/platform-browser'
import { StatsExplorerComponent } from '../../shared/stats-explorer/stats-explorer.component'
import { PROJECTS, Project } from '../../data/projects'
import { Skill, homeSkills } from '../../data/skills'
import { experienceLabel } from '../../data/experience'

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, StatsExplorerComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  constructor(title: Title, meta: Meta) {
    title.setTitle('Bishal Regmi — Software Engineer & Data Scientist')
    meta.updateTag({
      name: 'description',
      content: `Bishal Regmi — Software Engineer & Data Scientist with ${experienceLabel()} years at T. Rowe Price. Explore projects in full-stack development, data science, and machine learning.`,
    })
  }

  skills: Skill[] = homeSkills()

  /** Show the first 4 projects as featured on the home page */
  featuredProjects: Project[] = PROJECTS.slice(0, 4)
}
