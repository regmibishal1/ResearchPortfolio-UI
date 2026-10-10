// Writes smaller copies of each project screenshot (400 and 800 px wide) to
// src/assets/projects/thumbs, so cards can offer them through srcset and a
// phone does not download a 1280 px image to show it 340 px wide. Run it
// after adding or replacing a screenshot, then commit the results:
//   node scripts/generate-thumbs.mjs
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import sharp from 'sharp'
import { root } from './lib/load-data.mjs'

const SOURCE = resolve(root, 'src/assets/projects')
const OUT = join(SOURCE, 'thumbs')
const WIDTHS = [400, 800]

mkdirSync(OUT, { recursive: true })
let written = 0
for (const file of readdirSync(SOURCE).filter((f) => f.endsWith('.webp'))) {
  const source = join(SOURCE, file)
  const { width } = await sharp(source).metadata()
  for (const target of WIDTHS.filter((w) => w < width)) {
    const out = join(OUT, `${basename(file, '.webp')}-${target}.webp`)
    if (existsSync(out) && statSync(out).mtimeMs >= statSync(source).mtimeMs) continue
    await sharp(source).resize({ width: target }).webp({ quality: 78 }).toFile(out)
    written++
  }
}
console.log(`generate-thumbs: ${written} written`)
