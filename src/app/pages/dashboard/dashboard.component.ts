import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'
import { Title, Meta } from '@angular/platform-browser'
import { StatsExplorerComponent } from '../../shared/stats-explorer/stats-explorer.component'
import { PROJECTS, Project } from '../../data/projects'

interface Skill {
  name: string
  icon: string
  category: string
}

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
      content:
        'Bishal Regmi — Software Engineer & Data Scientist with 4+ years at T. Rowe Price. Explore projects in full-stack development, data science, and machine learning.',
    })
  }

  skills: Skill[] = [
    { name: 'Python', icon: 'code', category: 'Languages' },
    { name: 'C#', icon: 'code', category: 'Languages' },
    { name: 'JavaScript', icon: 'code', category: 'Languages' },
    { name: 'TypeScript', icon: 'code', category: 'Languages' },
    { name: 'Java', icon: 'code', category: 'Languages' },
    { name: 'C++', icon: 'code', category: 'Languages' },
    { name: 'C', icon: 'code', category: 'Languages' },
    { name: 'R', icon: 'code', category: 'Languages' },
    { name: '.Net', icon: 'view_in_ar', category: 'Frameworks' },
    { name: 'Spring', icon: 'view_in_ar', category: 'Frameworks' },
    { name: 'React', icon: 'view_in_ar', category: 'Frameworks' },
    { name: 'Angular', icon: 'view_in_ar', category: 'Frameworks' },
    { name: 'Django', icon: 'view_in_ar', category: 'Frameworks' },
    { name: 'Flask', icon: 'view_in_ar', category: 'Frameworks' },
    { name: 'PyTorch', icon: 'psychology', category: 'ML & Data' },
    { name: 'HuggingFace', icon: 'psychology', category: 'ML & Data' },
    { name: 'Scikit', icon: 'psychology', category: 'ML & Data' },
    { name: 'NLTK', icon: 'psychology', category: 'ML & Data' },
    { name: 'Dask', icon: 'psychology', category: 'ML & Data' },
    { name: 'TensorFlow', icon: 'psychology', category: 'ML & Data' },
    { name: 'Keras', icon: 'psychology', category: 'ML & Data' },
    { name: 'Kubernetes', icon: 'build', category: 'Tools' },
    { name: 'Docker', icon: 'build', category: 'Tools' },
    { name: 'GIT', icon: 'build', category: 'Tools' },
    { name: 'AWS', icon: 'build', category: 'Tools' },
    { name: 'MySQL', icon: 'storage', category: 'Databases' },
    { name: 'PostgreSQL', icon: 'storage', category: 'Databases' },
    { name: 'MongoDB', icon: 'storage', category: 'Databases' },
  ]

  /** Show the first 4 projects as featured on the home page */
  featuredProjects: Project[] = PROJECTS.slice(0, 4)
}
