import { IMAGE_SIZES } from './image-sizes'
import { PAPERS, PROJECTS, SPOTLIGHT, fileSize, statusText } from './projects'

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

  it('records each report at its real file size, so the download labels are right', async () => {
    expect(PAPERS.length).toBeGreaterThan(0)
    for (const p of PAPERS) {
      const res = await fetch(`/${p.paper.url}`, { method: 'HEAD' })
      expect(res.ok).withContext(`${p.paper.url} is served`).toBeTrue()
      const length = res.headers.get('content-length')
      if (length) expect(Number(length)).withContext(p.paper.url).toBe(p.paper.bytes)
    }
  })

  it('lists reports newest first with an ISO cover date', () => {
    const dates = PAPERS.map((p) => p.paper.date)
    expect(dates).toEqual([...dates].sort().reverse())
    for (const date of dates) expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('formats download sizes in KB below a megabyte and MB above', () => {
    expect(fileSize(208500)).toBe('204 KB')
    expect(fileSize(7877382)).toBe('7.5 MB')
  })

  it('fills in every field of each model card', () => {
    const cards = PROJECTS.filter((p) => p.modelCard)
    expect(cards.map((p) => p.id).sort()).toEqual([
      'empathy-emotion',
      'mri-classification',
      'world-cup-prediction',
    ])
    for (const p of cards) {
      for (const [field, text] of Object.entries(p.modelCard!)) {
        expect(text.trim()).withContext(`${p.id} ${field}`).not.toBe('')
      }
    }
  })

  it('knows the size of every screenshot and diagram', () => {
    for (const p of PROJECTS) {
      for (const src of [p.image, p.architecture].filter((x): x is string => !!x)) {
        expect(IMAGE_SIZES[src]).withContext(`${p.id}: ${src}`).toBeDefined()
      }
    }
  })

  it('keeps search descriptions to 155 characters', () => {
    for (const p of PROJECTS) {
      const description = p.seoDescription ?? p.shortDescription
      expect(description.length).withContext(p.id).toBeLessThanOrEqual(155)
    }
  })
})
