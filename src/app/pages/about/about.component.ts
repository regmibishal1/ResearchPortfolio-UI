import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatIconModule } from '@angular/material/icon'
import { Title, Meta } from '@angular/platform-browser'
import { SKILL_CATEGORIES } from '../../data/skills'

interface TimelineItem {
  title: string
  subtitle: string
  date: string
  description: string[]
  icon: string
}

interface Certification {
  name: string
  issuer: string
  icon: string
  color: string
}

interface Stat {
  value: string
  label: string
  icon: string
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  constructor(title: Title, meta: Meta) {
    title.setTitle('About | Bishal Regmi')
    meta.updateTag({
      name: 'description',
      content:
        'Learn about Bishal Regmi — AWS-certified Software Engineer & Data Scientist at T. Rowe Price, holding dual degrees from UMD and UMBC.',
    })
  }

  stats: Stat[] = [
    { value: '4+', label: 'Years Experience', icon: 'work_history' },
    { value: '', label: 'AWS SA Certified', icon: 'cloud_done' },
    { value: '', label: 'Fintech Domain', icon: 'account_balance' },
    { value: '', label: "Dual Master's & B.S.", icon: 'school' },
  ]

  bio = `Software Engineer and Data Scientist with 4+ years of experience at T. Rowe Price, building systems that process billions of dollars in daily cash flows and serve thousands of traders. I hold an AWS Solutions Architect certification.

I hold a B.S. in Computer Science (Summa Cum Laude) from UMBC and an M.S. in Data Science from the University of Maryland, College Park.

My work spans large-scale .NET microservice platforms, ML-powered financial forecasting, event-driven AWS architectures, and full-stack React and Angular applications. I thrive at the intersection of rigorous software engineering and applied data science.`

  skillCategories = SKILL_CATEGORIES

  certifications: Certification[] = [
    {
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      icon: 'cloud_done',
      color: '#FF9900',
    },
  ]

  education: TimelineItem[] = [
    {
      title: 'M.P.S. Data Science & Analytics',
      subtitle: 'University of Maryland, College Park',
      date: 'Aug 2021 – Aug 2023',
      description: ['GPA: 4.0'],
      icon: 'school',
    },
    {
      title: 'B.S. Computer Science — Summa Cum Laude',
      subtitle: 'University of Maryland, Baltimore County',
      date: 'Aug 2018 – May 2021',
      description: ['GPA: 4.0'],
      icon: 'school',
    },
  ]

  experience: TimelineItem[] = [
    {
      title: 'Software Engineer',
      subtitle: 'T. Rowe Price',
      date: 'Dec 2022 – Present',
      description: [
        'Led a large-scale order modeling system refactor across 10+ repositories and 7 .NET microservices, transitioning from legacy order generation to a modern target-based architecture — shipped with zero trading disruptions',
        'Drove platform-wide migration to a gRPC-based reference data service for securities, positions, FX rates, and historical orders, decommissioning 2 legacy data providers and reducing cross-service data latency by 30%',
        'Consolidated multiple business entities and asset types into a unified order modeling system, reducing trade modeling errors by ~80%',
        'Delivered a Prophet-based cash forecasting tool for hundreds of investment accounts handling billions of dollars in daily cash flows, replacing manual processes with no prior forecasting capability',
        'Owned a React observability SPA for trade entry used by trading support and traders; wrote a Python Lambda smoke test that cut system failure detection from over an hour to under 2 minutes',
      ],
      icon: 'work',
    },
    {
      title: 'Associate Software Engineer',
      subtitle: 'T. Rowe Price (Rotation Program)',
      date: 'Jun 2021 – Dec 2022',
      description: [
        'Built internal support tooling and a monitoring UI for financial data ingestion into the trading system using C# and Blazor, integrating with AWS Lambda, S3, and DynamoDB to surface stale data before market open',
        'Designed and delivered new data pipelines expanding the number of financial data sources feeding into the trading system, improving data coverage across asset types',
      ],
      icon: 'work',
    },
  ]

  interests = [
    { name: 'Full-Stack Development', icon: 'terminal' },
    { name: 'Data Science & Analytics', icon: 'analytics' },
    { name: 'Machine Learning & AI', icon: 'psychology' },
    { name: 'Distributed Computing', icon: 'hub' },
    { name: 'Cloud Architecture', icon: 'cloud' },
    { name: 'Open Source', icon: 'public' },
    { name: 'System Design', icon: 'architecture' },
    { name: 'Developer Tooling', icon: 'build' },
    { name: 'Financial Technology', icon: 'trending_up' },
  ]

  contactLinks = [
    { label: 'GitHub', icon: 'code', url: 'https://github.com/regmibishal1' },
    { label: 'LinkedIn', icon: 'person', url: 'https://linkedin.com/in/bishalregmi' },
    { label: 'Email', icon: 'email', url: 'mailto:regmibishal.ai@gmail.com' },
  ]
}
