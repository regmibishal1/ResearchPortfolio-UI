import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatIconModule } from '@angular/material/icon'

interface SkillCategory {
  name: string
  icon: string
  skills: string[]
}

interface TimelineItem {
  title: string
  subtitle: string
  date: string
  description: string[]
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
  bio = `I'm a Software Engineer and Data Scientist with 4+ years of professional experience building production-grade applications and data-driven solutions at enterprise scale. I hold a B.S. in Computer Science from UMBC and an M.S. in Data Science & Analytics from the University of Maryland, College Park, both with a perfect 4.0 GPA.

At T. Rowe Price, I've architected and delivered full-stack applications, microservice platforms, and data pipelines that serve thousands of internal users and process millions of records daily. I specialize in bridging the gap between software engineering best practices and data science, building systems that are not only analytically powerful but also production-hardened, scalable, and maintainable.

My technical range spans front-end frameworks (Angular, React), backend services (Spring Boot, .NET, FastAPI), distributed computing (Dask, Spark), and cloud-native infrastructure (AWS, Docker, Kubernetes). I thrive on solving complex problems that sit at the intersection of engineering and data.`

  skillCategories: SkillCategory[] = [
    {
      name: 'Languages',
      icon: 'code',
      skills: ['Python', 'C#', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C', 'R'],
    },
    {
      name: 'Frameworks & Libraries',
      icon: 'library_books',
      skills: [
        '.Net',
        'Spring',
        'React',
        'Angular',
        'Django',
        'Flask',
        'PyTorch',
        'HuggingFace',
        'Scikit',
        'NLTK',
        'Dask',
        'TensorFlow',
        'Keras',
      ],
    },
    {
      name: 'Tools & Systems',
      icon: 'build',
      skills: ['Kubernetes', 'Docker', 'GIT', 'AWS', 'MySQL', 'PostgreSQL', 'MongoDB'],
    },
    {
      name: 'Soft Skills',
      icon: 'people',
      skills: [
        'Leadership',
        'Team Collaboration',
        'Problem Solving',
        'Effective Communication',
        'Mentoring',
        'Event Management',
        'Writing',
        'Public Speaking',
        'Time Management',
      ],
    },
  ]

  education: TimelineItem[] = [
    {
      title: 'Master of Professional Studies, Data Science',
      subtitle: 'University of Maryland, College Park',
      date: 'August 2021 - August 2023',
      description: ['GPA: 4.0'],
      icon: 'school',
    },
    {
      title: 'Bachelor of Science, Computer Science',
      subtitle: 'University of Maryland, Baltimore County',
      date: 'August 2018 - May 2021',
      description: ['GPA: 4.0'],
      icon: 'school',
    },
  ]

  experience: TimelineItem[] = [
    {
      title: 'Software Engineer',
      subtitle: 'T. Rowe Price',
      date: 'December 2022 - Present',
      description: [
        'Architected and upgraded the order modeling system, which helped decommission multiple legacy applications, helping reduce trade modeling errors and incidents down by approximately 80%',
        'Developed a machine learning-powered cash forecasting tool using the Prophet model to predict investment account cashflows, enabling portfolio managers to anticipate liquidity needs',
        'Designed and implemented a scalable, event-driven API architecture using AWS API Gateway and Node.js Lambdas, integrating SNS and SQS for asynchronous processing',
        'Created a trade entry smoke test using AWS Lambda and Python that reduced system failure detection time from an hour to less than 2 minutes',
        'Designed and developed a React single-page application to enhance the trade entry system observability, extending beyond the capabilities of Splunk and OpenTelemetry',
        'Assumed a leadership role as a Front-End developer and an SME for the order entry system back-end, overseeing all UI-related tasks within the team',
      ],
      icon: 'work',
    },
    {
      title: 'Associate Software Engineer',
      subtitle: 'T. Rowe Price',
      date: 'June 2021 - December 2022',
      description: [
        'Developed a support UI and tooling for monitoring and managing financial data ingestion into Charles River Trading System using C# and Blazor',
        'Integrated seamlessly with Amazon Web Services, including Lambda, S3, DynamoDB, and various third-party services',
        'Incorporated new data pipelines to help feed financial data into Charles River Trading System from new data sources',
      ],
      icon: 'work',
    },
    {
      title: "Teacher's Assistant",
      subtitle: 'University of Maryland',
      date: 'July 2019 - June 2021',
      description: [
        'Conducted teaching sessions and provided support during lectures',
        'Guided and assisted 150 to 200 students with Python assignments and activities',
      ],
      icon: 'school',
    },
  ]

  interests = [
    { name: 'Full-Stack Development', icon: '💻' },
    { name: 'Data Science & Analytics', icon: '📊' },
    { name: 'Machine Learning & AI', icon: '🤖' },
    { name: 'Distributed Computing', icon: '⚡' },
    { name: 'Cloud Architecture', icon: '☁️' },
    { name: 'Open Source', icon: '🌐' },
    { name: 'System Design', icon: '🏗️' },
    { name: 'Developer Tooling', icon: '🔧' },
  ]
}
