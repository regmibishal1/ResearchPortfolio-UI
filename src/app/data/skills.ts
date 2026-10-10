/**
 * Skills by category, shown on the About page, the /resume page and in the
 * resume PDF.
 */

export interface SkillCategory {
  name: string
  skills: string[]
  /** Optional badge rendered above the skills (e.g. a certification) */
  highlight?: string
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    name: 'Languages',
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
      'IAM',
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
    name: 'Databases & Data Platforms',
    skills: [
      'PostgreSQL',
      'MySQL',
      'MongoDB',
      'SQLite',
      'Redis',
      'SQL Server',
      'Vector Databases',
      'Databricks',
      'Spark',
      'Delta Lake',
      'MLflow',
    ],
  },
  {
    name: 'Machine Learning & Data Science',
    skills: [
      'Statistics',
      'Hypothesis Testing',
      'Classification',
      'Regression',
      'Time Series Forecasting',
      'Clustering',
      'Segmentation',
      'Deep Learning',
      'Model Deployment',
      'MLOps',
    ],
  },
  {
    name: 'AI & Generative AI',
    skills: [
      'Generative AI APIs',
      'OpenAI',
      'LangChain',
      'LLM Fine-Tuning',
      'RAG Pipelines',
      'Prompt Engineering',
      'Embedding Models',
    ],
  },
  {
    name: 'Testing & Monitoring',
    skills: ['xUnit', 'FsCheck', 'Jest', 'PyTest', 'Splunk', 'Prometheus', 'Grafana'],
  },
]
