/**
 * Central skills data for the About page's categorized skills list.
 */

export interface SkillCategory {
  name: string
  /** Material icon shown next to the category heading */
  icon: string
  skills: string[]
  /** Optional badge rendered above the skills (e.g. a certification) */
  highlight?: string
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
