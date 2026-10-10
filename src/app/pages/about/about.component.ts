import { Component, ChangeDetectionStrategy, inject } from '@angular/core'
import { SeoService, PERSON_ID, SITE_URL } from '../../services/seo.service'
import { SKILL_CATEGORIES } from '../../data/skills'
import { experienceLabel } from '../../data/experience'
import { IconComponent } from '../../shared/icon/icon.component'

interface TimelineItem {
  title: string
  subtitle: string
  date: string
  description: string[]
}

interface Certification {
  name: string
  issuer: string
}

interface Stat {
  label: string
  value: string
}

@Component({
  selector: 'app-about',
  imports: [IconComponent],
  templateUrl: './about.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  constructor() {
    const seo = inject(SeoService)

    seo.setPage({
      title: 'About | Bishal Regmi',
      path: '/about',
      image: '/assets/og/about.jpg',
      description:
        'Learn about Bishal Regmi, an AWS-certified Software Engineer and Data Scientist at T. Rowe Price, with degrees from UMBC and the University of Maryland.',
      breadcrumbs: [{ name: 'About', path: '/about' }],
      schema: [
        {
          '@type': 'ProfilePage',
          url: `${SITE_URL}/about`,
          name: 'About Bishal Regmi',
          mainEntity: { '@id': PERSON_ID },
        },
      ],
    })
  }

  /** Read as label and value pairs, e.g. "Experience: 5+ years". */
  stats: Stat[] = [
    { label: 'Experience', value: `${experienceLabel()} years` },
    { label: 'Certification', value: 'AWS Solutions Architect' },
    { label: 'Domain', value: 'Fintech' },
    { label: 'Education', value: "Master's & B.S." },
  ]

  roles = ['Software Engineer', 'Data Scientist', 'AWS Certified', 'Fintech']

  bio = `Software Engineer and Data Scientist with ${experienceLabel()} years of experience at T. Rowe Price, building systems that process billions of dollars in daily cash flows and serve thousands of traders. I hold an AWS Solutions Architect certification.

I hold a B.S. in Computer Science (Summa Cum Laude) from UMBC and an M.P.S. in Data Science & Analytics from the University of Maryland, College Park.

My work spans large-scale .NET microservice platforms, ML-powered financial forecasting, event-driven AWS architectures, and full-stack React and Angular applications. The projects on this site are the same skills applied to problems I picked myself.`

  skillCategories = SKILL_CATEGORIES

  certifications: Certification[] = [
    {
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
    },
  ]

  education: TimelineItem[] = [
    {
      title: 'M.P.S. Data Science & Analytics',
      subtitle: 'University of Maryland, College Park',
      date: 'Aug 2021 - Aug 2023',
      description: ['GPA: 4.0'],
    },
    {
      title: 'B.S. Computer Science, Summa Cum Laude',
      subtitle: 'University of Maryland, Baltimore County',
      date: 'Aug 2018 - May 2021',
      description: ['GPA: 4.0'],
    },
  ]

  experience: TimelineItem[] = [
    {
      title: 'Software Engineer',
      subtitle: 'T. Rowe Price',
      date: 'Dec 2022 - Present',
      description: [
        'Led a large-scale order modeling system refactor across 10+ repositories and 7 .NET microservices, transitioning from legacy order generation to a modern target-based architecture, shipped with zero trading disruptions',
        'Drove platform-wide migration to a gRPC-based reference data service for securities, positions, FX rates, and historical orders, decommissioning 2 legacy data providers and reducing cross-service data latency by 30%',
        'Consolidated multiple business entities and asset types into a unified order modeling system, reducing trade modeling errors by ~80%',
        'Delivered a Prophet-based cash forecasting tool for hundreds of investment accounts handling billions of dollars in daily cash flows, replacing manual processes with no prior forecasting capability',
        'Owned a React observability SPA for trade entry used by trading support and traders; wrote a Python Lambda smoke test that cut system failure detection from over an hour to under 2 minutes',
      ],
    },
    {
      title: 'Associate Software Engineer',
      subtitle: 'T. Rowe Price (Rotation Program)',
      date: 'Jun 2021 - Dec 2022',
      description: [
        'Built internal support tooling and a monitoring UI for financial data ingestion into the trading system using C# and Blazor, integrating with AWS Lambda, S3, and DynamoDB to surface stale data before market open',
        'Designed and delivered new data pipelines expanding the number of financial data sources feeding into the trading system, improving data coverage across asset types',
      ],
    },
  ]

  contactLinks = [
    {
      label: 'GitHub',
      icon: 'github' as const,
      url: 'https://github.com/regmibishal1',
      external: true,
    },
    {
      label: 'LinkedIn',
      icon: 'linkedin' as const,
      url: 'https://www.linkedin.com/in/bishalregmi/',
      external: true,
    },
    {
      label: 'Email',
      icon: 'email' as const,
      url: 'mailto:contact@bishalregmi.com',
      external: false,
    },
  ]
}
