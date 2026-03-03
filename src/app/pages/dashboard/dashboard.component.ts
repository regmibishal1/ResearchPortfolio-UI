import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'

interface Skill {
  name: string
  icon: string
  category: string
}

interface FeaturedProject {
  title: string
  description: string
  tags: string[]
  icon: string
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  currentYear = new Date().getFullYear()

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

  featuredProjects: FeaturedProject[] = [
    {
      title: 'Research Portfolio Platform',
      description:
        'Architected a full-stack platform to showcase data analysis and research, featuring an Angular frontend, Spring Boot authentication, and FastAPI resource server.',
      tags: ['Angular', 'Spring Boot', 'FastAPI', 'PostgreSQL'],
      icon: '🌐',
    },
    {
      title: 'MRI Image Classification',
      description:
        "Investigated ResNet CNN architectures for early Alzheimer's Disease classification using MRI data, leveraging saliency maps for model interpretation.",
      tags: ['Python', 'PyTorch', 'ResNet'],
      icon: '🧠',
    },
    {
      title: 'Empathy & Emotion Prediction',
      description:
        'Developed a multimodal transformer model to classify empathy and emotional valence in conversational data for the WASSA 2023 NLP Shared Task.',
      tags: ['Python', 'NLP', 'Transformers'],
      icon: '💬',
    },
  ]

  socialLinks = [
    { name: 'GitHub', url: 'https://github.com', icon: 'code' },
    { name: 'LinkedIn', url: 'https://linkedin.com', icon: 'work' },
    { name: 'Email', url: 'mailto:contact@example.com', icon: 'email' },
  ]
}
