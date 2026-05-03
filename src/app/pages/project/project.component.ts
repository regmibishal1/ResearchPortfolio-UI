import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, RouterModule } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'
import { PROJECTS, Project } from '../../data/projects'

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss',
})
export class ProjectComponent {
  activeFilter = 'All'

  categories = ['All', 'Data Science', 'Full Stack', 'Machine Learning', 'Tools']

  projects: Project[] = PROJECTS

  constructor(private router: Router) {}

  get filteredProjects(): Project[] {
    if (this.activeFilter === 'All') return this.projects
    return this.projects.filter((p) => p.category === this.activeFilter)
  }

  setFilter(category: string) {
    this.activeFilter = category
  }

  goToProject(id: string) {
    this.router.navigate(['/project', id])
  }
}
