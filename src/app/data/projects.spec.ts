import { PROJECTS } from './projects'

/** Index of a project id in the exported (sorted) list. */
function at(id: string): number {
  const i = PROJECTS.findIndex((p) => p.id === id)
  expect(i).withContext(`project '${id}' should exist`).toBeGreaterThanOrEqual(0)
  return i
}

describe('PROJECTS ordering', () => {
  it('gives every project a period', () => {
    for (const p of PROJECTS) {
      expect(p.period).withContext(`'${p.id}' is missing a period`).toBeTruthy()
    }
  })

  it('is sorted newest first by period', () => {
    // Pivots across every period represented in the data, newest to oldest:
    // 2026, 2023-present, Summer 2023, Spring 2023, Fall 2022, Summer 2022,
    // Spring 2022, Fall 2021.
    const newestToOldest = [
      'edgar-signals',
      'research-portfolio',
      'mri-classification',
      'empathy-emotion',
      'spacex-launch-analysis',
      'autism-sentiment',
      'monte-carlo-notebooks',
      'climate-snowfall',
    ]
    for (let i = 1; i < newestToOldest.length; i++) {
      expect(at(newestToOldest[i - 1]))
        .withContext(`${newestToOldest[i - 1]} should list before ${newestToOldest[i]}`)
        .toBeLessThan(at(newestToOldest[i]))
    }
  })

  it('keeps the earliest notebooks at the very end', () => {
    expect(PROJECTS[PROJECTS.length - 1].id).toBe('first-semester-notebooks')
  })

  it('features current work first for the dashboard slice', () => {
    for (const p of PROJECTS.slice(0, 4)) {
      expect(p.period).withContext(`featured '${p.id}' should be current`).toContain('2026')
    }
  })
})
