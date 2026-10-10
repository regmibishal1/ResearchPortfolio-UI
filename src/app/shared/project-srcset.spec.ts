import { IMAGE_SIZES } from '../data/image-sizes'
import { PROJECTS } from '../data/projects'
import { projectSrcset } from './project-srcset'

describe('projectSrcset', () => {
  it('offers the smaller copies before the original, each with its real width', () => {
    const srcset = projectSrcset('assets/projects/showupmd.webp')!
    expect(srcset).toBe(
      'assets/projects/thumbs/showupmd-400.webp 400w, ' +
        'assets/projects/thumbs/showupmd-800.webp 800w, ' +
        `assets/projects/showupmd.webp ${IMAGE_SIZES['assets/projects/showupmd.webp'][0]}w`
    )
  })

  it('gives every project screenshot its smaller copies (run scripts/generate-thumbs.mjs)', () => {
    for (const p of PROJECTS.filter((x) => x.image)) {
      const width = IMAGE_SIZES[p.image!][0]
      if (width <= 400) continue
      expect(projectSrcset(p.image!)).withContext(p.id).not.toBeNull()
    }
  })

  it('leaves other images alone', () => {
    expect(projectSrcset('assets/blog/snow-model.webp')).toBeNull()
  })
})
