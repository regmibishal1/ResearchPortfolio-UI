import { Component, ChangeDetectionStrategy, inject } from '@angular/core'
import { SeoService, PERSON_ID, SITE_URL } from '../../services/seo.service'
import { SKILL_CATEGORIES } from '../../data/skills'
import { experienceLabel } from '../../data/experience'
import { CERTIFICATIONS, CONTACT, EDUCATION, EXPERIENCE } from '../../data/resume'
import { IconComponent } from '../../shared/icon/icon.component'
import { CopyEmailComponent } from '../../shared/copy-email/copy-email.component'

interface Stat {
  label: string
  value: string
}

@Component({
  selector: 'app-about',
  imports: [IconComponent, CopyEmailComponent],
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

  certifications = CERTIFICATIONS
  education = EDUCATION
  experience = EXPERIENCE

  contactLinks = [
    {
      label: 'GitHub',
      icon: 'github' as const,
      url: CONTACT.github,
      external: true,
    },
    {
      label: 'LinkedIn',
      icon: 'linkedin' as const,
      url: CONTACT.linkedin,
      external: true,
    },
    {
      label: 'Email',
      icon: 'email' as const,
      url: `mailto:${CONTACT.email}`,
      external: false,
    },
  ]
}
