import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatIconModule } from '@angular/material/icon'

interface Project {
  title: string
  description: string
  tags: string[]
  category: string
  icon: string
  github?: string
  demo?: string
}

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss',
})
export class ProjectComponent {
  activeFilter = 'All'

  categories = ['All', 'Data Science', 'Full Stack', 'Machine Learning', 'Tools']

  projects: Project[] = [
    {
      title: 'Research Portfolio Platform',
      description:
        'Architected a full-stack portfolio platform to showcase exploratory data analysis and machine learning research. Designed an Angular frontend integrated with a secure Java Spring Boot authentication API and a Python FastAPI resource server for hosting machine learning models and utilities.',
      tags: ['Angular', 'Java Spring Boot', 'Python FastAPI', 'PostgreSQL'],
      category: 'Full Stack',
      icon: '🌐',
      github: 'https://github.com/regmibishal1',
    },
    {
      title: 'Classification of MRI Images',
      description:
        "Investigated the efficacy of various ResNet architectures for early Alzheimer's Disease classification utilizing constrained MRI datasets. Demonstrated the robust stability and clinical potential of pre-trained convolutional neural networks, specifically ResNet-50, and leveraged saliency maps to interpret predictive performance.",
      tags: ['Python', 'PyTorch', 'CNN', 'ResNet'],
      category: 'Machine Learning',
      icon: '🧠',
    },
    {
      title: 'Empathy and Emotion Prediction',
      description:
        'Developed a multimodal transformer model for the WASSA 2023 Shared Task, classifying empathy and emotional valence in conversational reactions to news articles. Enhanced natural language processing architectures by integrating non-textual contextual variables to significantly boost predictive accuracy.',
      tags: ['Python', 'NLP', 'Transformers', 'NLTK'],
      category: 'Machine Learning',
      icon: '💬',
    },
    {
      title: 'Autism Tweet Sentiment Analysis',
      description:
        'Engineered a scalable data processing pipeline using Dask and Scikit-Learn to analyze sentiment shifts in Twitter data surrounding autism awareness events. Applied advanced natural language processing techniques to quantify public perception trends at scale.',
      tags: ['Python', 'Dask', 'NLTK', 'Scikit-Learn'],
      category: 'Data Science',
      icon: '📊',
    },
  ]

  get filteredProjects(): Project[] {
    if (this.activeFilter === 'All') return this.projects
    return this.projects.filter((p) => p.category === this.activeFilter)
  }

  setFilter(category: string) {
    this.activeFilter = category
  }
}
