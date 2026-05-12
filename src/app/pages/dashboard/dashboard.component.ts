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
    { name: 'Python', icon: '🐍', category: 'Languages' },
    { name: 'C#', icon: '🔷', category: 'Languages' },
    { name: 'JavaScript', icon: '🟨', category: 'Languages' },
    { name: 'TypeScript', icon: '📘', category: 'Languages' },
    { name: 'Java', icon: '☕', category: 'Languages' },
    { name: 'C++', icon: '⚙️', category: 'Languages' },
    { name: 'C', icon: '💠', category: 'Languages' },
    { name: 'R', icon: '📈', category: 'Languages' },
    { name: '.Net', icon: '🟣', category: 'Frameworks' },
    { name: 'Spring', icon: '🍃', category: 'Frameworks' },
    { name: 'React', icon: '⚛️', category: 'Frameworks' },
    { name: 'Angular', icon: '🅰️', category: 'Frameworks' },
    { name: 'Django', icon: '🐎', category: 'Frameworks' },
    { name: 'Flask', icon: '🌶️', category: 'Frameworks' },
    { name: 'PyTorch', icon: '🔥', category: 'ML & Data' },
    { name: 'HuggingFace', icon: '🤗', category: 'ML & Data' },
    { name: 'Scikit', icon: '🤖', category: 'ML & Data' },
    { name: 'NLTK', icon: '💬', category: 'ML & Data' },
    { name: 'Dask', icon: '📊', category: 'ML & Data' },
    { name: 'TensorFlow', icon: '🧠', category: 'ML & Data' },
    { name: 'Keras', icon: '📕', category: 'ML & Data' },
    { name: 'Kubernetes', icon: '☸️', category: 'Tools' },
    { name: 'Docker', icon: '🐳', category: 'Tools' },
    { name: 'GIT', icon: '📂', category: 'Tools' },
    { name: 'AWS', icon: '☁️', category: 'Tools' },
    { name: 'MySQL', icon: '🐬', category: 'Databases' },
    { name: 'PostgreSQL', icon: '🐘', category: 'Databases' },
    { name: 'MongoDB', icon: '🍃', category: 'Databases' },
  ]

  /** Show the first 4 projects as featured on the home page */
  featuredProjects: Project[] = PROJECTS.slice(0, 4)
}
