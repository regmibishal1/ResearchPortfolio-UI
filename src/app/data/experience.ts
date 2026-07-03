/**
 * Career start date: first day at T. Rowe Price (June 1, 2021).
 * Used to compute the years-of-experience figure shown across the site
 * so it never goes stale.
 */
const CAREER_START = new Date(2021, 5, 1)

/** Completed years of professional experience since CAREER_START. */
export function yearsOfExperience(): number {
  const now = new Date()
  let years = now.getFullYear() - CAREER_START.getFullYear()
  const anniversary = new Date(now.getFullYear(), CAREER_START.getMonth(), CAREER_START.getDate())
  if (now < anniversary) {
    years--
  }
  return years
}

/** Display form, e.g. "5+". */
export function experienceLabel(): string {
  return `${yearsOfExperience()}+`
}
