import { IMAGE_SIZES } from '../data/image-sizes'

/**
 * The srcset for a project screenshot: the smaller copies made by
 * scripts/generate-thumbs.mjs plus the original, each with its real width,
 * so the browser picks the smallest one that fills the slot. Null when the
 * image has no smaller copies.
 */
export function projectSrcset(src: string): string | null {
  const key = src.replace(/^\//, '')
  const match = key.match(/^assets\/projects\/([^/]+)\.webp$/)
  const original = IMAGE_SIZES[key]
  if (!match || !original) return null
  const thumbs = [400, 800]
    .map((width) => `assets/projects/thumbs/${match[1]}-${width}.webp`)
    .filter((path) => IMAGE_SIZES[path])
    .map((path) => `${path} ${IMAGE_SIZES[path][0]}w`)
  return thumbs.length ? [...thumbs, `${key} ${original[0]}w`].join(', ') : null
}
