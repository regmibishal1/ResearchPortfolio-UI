import { Component, ChangeDetectionStrategy, inject } from '@angular/core'
import { RouterModule } from '@angular/router'
import { SeoService } from '../../services/seo.service'
import {
  CERTIFICATIONS,
  CONTACT,
  EDUCATION,
  EXPERIENCE,
  RESUME_PDF,
  SUMMARY,
} from '../../data/resume'
import { SKILL_CATEGORIES } from '../../data/skills'
import { PROJECTS, Project } from '../../data/projects'
import { IconComponent } from '../../shared/icon/icon.component'
import { CopyEmailComponent } from '../../shared/copy-email/copy-email.component'

/** Lowercase forms a skill may appear as in text, e.g. ".NET 8" also as ".net". */
function forms(skill: string): string[] {
  const base = skill.toLowerCase()
  const short = base.replace(/\s+\d+$/, '')
  return short === base ? [base] : [base, short]
}

function mentions(text: string, skill: string): boolean {
  const haystack = text.toLowerCase()
  return forms(skill).some((form) => {
    const escaped = form.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // Whole-word match so "R" does not light up every bullet.
    return new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`).test(haystack)
  })
}

@Component({
  selector: 'app-resume',
  imports: [RouterModule, IconComponent, CopyEmailComponent],
  templateUrl: './resume.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './resume.component.scss',
})
export class ResumeComponent {
  readonly contact = CONTACT
  readonly summary = SUMMARY
  readonly experience = EXPERIENCE
  readonly education = EDUCATION
  readonly certifications = CERTIFICATIONS
  readonly skillCategories = SKILL_CATEGORIES
  readonly pdf = `/${RESUME_PDF}`
  readonly projects: Project[] = PROJECTS.filter((p) => p.featured)

  /** Skills that appear somewhere in the experience or projects, so each one finds something. */
  readonly filterSkills: string[] = [...new Set(SKILL_CATEGORIES.flatMap((c) => c.skills))].filter(
    (skill) =>
      EXPERIENCE.some((job) => job.description.some((d) => mentions(d, skill))) ||
      this.projects.some((p) => this.projectMentions(p, skill))
  )

  selected: string | null = null

  constructor() {
    inject(SeoService).setPage({
      title: 'R\u00e9sum\u00e9 | Bishal Regmi',
      path: '/resume',
      image: '/assets/og/resume.jpg',
      description:
        'Resume of Bishal Regmi, Software Engineer and Data Scientist at T. Rowe Price: experience, projects, education and skills, with a PDF to download.',
      breadcrumbs: [{ name: 'R\u00e9sum\u00e9', path: '/resume' }],
    })
  }

  toggle(skill: string): void {
    this.selected = this.selected === skill ? null : skill
  }

  bulletMatches(text: string): boolean {
    return !!this.selected && mentions(text, this.selected)
  }

  projectMatches(project: Project): boolean {
    return !!this.selected && this.projectMentions(project, this.selected)
  }

  /** Read out when the filter changes. */
  get status(): string {
    if (!this.selected) return ''
    const bullets = this.experience
      .flatMap((j) => j.description)
      .filter((d) => mentions(d, this.selected!))
    const projects = this.projects.filter((p) => this.projectMentions(p, this.selected!))
    const parts = [
      bullets.length && `${bullets.length} experience point${bullets.length === 1 ? '' : 's'}`,
      projects.length && `${projects.length} project${projects.length === 1 ? '' : 's'}`,
    ].filter(Boolean)
    return `${this.selected}: highlighted in ${parts.join(' and ')}.`
  }

  private projectMentions(project: Project, skill: string): boolean {
    return (
      project.tags.some((t) => mentions(t, skill)) ||
      mentions(`${project.shortDescription} ${project.outcome ?? ''}`, skill)
    )
  }
}
