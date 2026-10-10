/**
 * Career data shared by the About page, the /resume page and the resume
 * PDF (scripts/generate-resume-pdf.mjs), so the three never disagree.
 */

export interface TimelineItem {
  title: string
  /** Employer or school. */
  subtitle: string
  date: string
  description: string[]
}

export interface Certification {
  name: string
  issuer: string
}

export const CONTACT = {
  name: 'Bishal Regmi',
  role: 'Software Engineer & Data Scientist',
  location: 'Ellicott City, MD',
  email: 'contact@bishalregmi.com',
  site: 'bishalregmi.com',
  github: 'https://github.com/regmibishal1',
  linkedin: 'https://www.linkedin.com/in/bishalregmi/',
}

export const EXPERIENCE: TimelineItem[] = [
  {
    title: 'Software Engineer',
    subtitle: 'T. Rowe Price',
    date: 'Dec 2022 - Present',
    description: [
      'Led a large-scale order modeling system refactor across 10+ repositories and 7 .NET microservices, transitioning from legacy order generation to a modern target-based architecture with a phased rollout and backward-compatible fallback logic, shipped with zero trading disruptions',
      'Drove platform-wide migration to a gRPC-based reference data service for securities, positions, FX rates, and historical orders, decommissioning 2 legacy data providers and reducing cross-service data latency by 30%',
      'Architected a Python parity testing framework that surfaced production-breaking regressions during the migration before rollout, and led a cross-service move from reflection-based mapping to compile-time mappers for measurable hot-path performance gains',
      'Consolidated multiple business entities and asset types into a unified order modeling system, decommissioning legacy applications and reducing trade modeling errors by ~80%',
      'Delivered a Prophet-based cash forecasting tool for hundreds of investment accounts handling billions of dollars in cash flows, replacing manual calculations with no forecasting capability and giving traders better cash flow visibility',
      'Owned a React observability SPA for trade entry used by trading support and traders, and wrote a Python Lambda smoke test that cut system failure detection from over an hour to under 2 minutes',
    ],
  },
  {
    title: 'Associate Software Engineer',
    subtitle: 'T. Rowe Price (Rotation Program)',
    date: 'Jun 2021 - Dec 2022',
    description: [
      'Built internal support tooling and a monitoring UI for financial data ingestion into the Charles River trading system using C# and Blazor, integrating with AWS Lambda, S3, and DynamoDB to surface stale data before market open and reduce trade errors',
      'Designed and delivered new data pipelines expanding the number of financial data sources feeding into the trading system, improving data coverage across asset types',
    ],
  },
]

export const EDUCATION: TimelineItem[] = [
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

export const CERTIFICATIONS: Certification[] = [
  { name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services' },
]

/** One line under the name, shared with the Home hero. */
export const SUMMARY =
  'Building scalable applications and extracting insights from data. Focused on full-stack development, machine learning, and distributed systems.'

/** Where the build writes the resume PDF (scripts/generate-resume-pdf.mjs). */
export const RESUME_PDF = 'bishal-regmi-resume.pdf'
