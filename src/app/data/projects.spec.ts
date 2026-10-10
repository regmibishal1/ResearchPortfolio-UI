import { PROJECTS, SPOTLIGHT, statusText } from './projects'

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
      'world-cup-prediction',
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

  it('spotlights exactly one public project, and never the World Cup', () => {
    // There is no fallback: newest-first would put the World Cup back on Home.
    const spotlit = PROJECTS.filter((p) => p.spotlight)
    expect(spotlit.length).withContext('public projects with spotlight: true').toBe(1)
    expect(spotlit[0].id).not.toBe('world-cup-prediction')
    expect(SPOTLIGHT).toBe(spotlit[0])
  })

  it('features four projects besides the spotlight, for Home', () => {
    expect(PROJECTS.filter((p) => p.featured && !p.spotlight).length).toBe(4)
  })

  it('labels a status badge for every project that has a status', () => {
    for (const p of PROJECTS.filter((p) => p.status)) {
      expect(statusText(p)).withContext(`'${p.id}' status`).toBeTruthy()
    }
    const worldCup = PROJECTS.find((p) => p.id === 'world-cup-prediction')!
    expect(statusText(worldCup)).toBe('Final results')
  })

  it('excludes hidden entries from the exported list', () => {
    for (const p of PROJECTS) {
      expect(p.hidden).withContext(`'${p.id}' is hidden and should not export`).toBeFalsy()
    }
  })
})
