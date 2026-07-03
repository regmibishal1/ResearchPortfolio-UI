/**
 * Central skills data: single source of truth used by the About page
 * (full categorized list) and the dashboard tech-stack strip (curated
 * subset resolved by name so the two can never drift apart).
 */

export interface SkillCategory {
  name: string
  /** Material icon shown next to the category heading */
  icon: string
  skills: string[]
  /** Optional badge rendered above the skills (e.g. a certification) */
  highlight?: string
}

export interface Skill {
  name: string
  icon: string
  category: string
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    name: 'Languages',
    icon: 'code',
    skills: [
      'C#',
      'Python',
      'JavaScript',
      'TypeScript',
      'Java',
      'C++',
      'R',
      'SQL',
      'Bash',
      'HTML',
      'CSS',
    ],
  },
  {
    name: 'Frameworks & Libraries',
    icon: 'library_books',
    skills: [
      '.NET 8',
      'ASP.NET Core',
      'Entity Framework',
      'Spring Boot',
      'React',
      'Next.js',
      'Angular',
      'Redux',
      'FastAPI',
      'Django',
      'Flask',
      'Node.js',
      'Express',
      'gRPC',
      'PyTorch',
      'TensorFlow',
      'Scikit-Learn',
      'HuggingFace',
      'Pandas',
      'NumPy',
      'Matplotlib',
      'Polly',
      'FluentValidation',
      'Autofac',
    ],
  },
  {
    name: 'Cloud & DevOps',
    icon: 'cloud',
    skills: [
      'AWS',
      'Azure',
      'GCP',
      'Lambda',
      'S3',
      'DynamoDB',
      'Step Functions',
      'Fargate',
      'SNS',
      'SQS',
      'API Gateway',
      'Athena',
      'Docker',
      'Kubernetes',
      'Terraform',
      'GitHub Actions',
      'GitLab CI/CD',
      'Git',
    ],
    highlight: 'AWS Solutions Architect Certified',
  },
  {
    name: 'Databases',
    icon: 'storage',
    skills: ['PostgreSQL', 'MySQL', 'MongoDB', 'SQLite', 'Redis', 'SQL Server'],
  },
  {
    name: 'Testing & Monitoring',
    icon: 'monitor_heart',
    skills: ['xUnit', 'FsCheck', 'Jest', 'PyTest', 'Splunk', 'Prometheus', 'Grafana'],
  },
]

/**
 * Curated highlight set for the home-page tech-stack strip. Names must
 * match an entry in SKILL_CATEGORIES; unknown names are dropped by
 * homeSkills() rather than rendered with a stale label.
 */
const HOME_TECH_STACK: string[] = [
  'Python',
  'C#',
  'JavaScript',
  'TypeScript',
  'Java',
  'SQL',
  '.NET 8',
  'Spring Boot',
  'React',
  'Next.js',
  'Angular',
  'FastAPI',
  'PyTorch',
  'TensorFlow',
  'Scikit-Learn',
  'HuggingFace',
  'AWS',
  'Docker',
  'Kubernetes',
  'Terraform',
  'GitHub Actions',
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Redis',
]

/** Flat, icon-annotated list for compact displays like the dashboard chips. */
export function homeSkills(): Skill[] {
  const byName = new Map<string, Skill>()
  for (const category of SKILL_CATEGORIES) {
    for (const name of category.skills) {
      byName.set(name, { name, icon: category.icon, category: category.name })
    }
  }
  return HOME_TECH_STACK.flatMap((name) => byName.get(name) ?? [])
}
