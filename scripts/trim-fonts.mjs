// Writes a smaller copy of the Latin Inter font to src/assets/fonts. The
// fontsource file covers every weight from 100 to 900, but the site only uses
// 400 to 700, and pinning the weight axis to that range takes the file from
// about 48 KB to about 29 KB. Outfit gains almost nothing, so it ships as is.
// Run it after upgrading @fontsource-variable/inter, then commit the result:
//   node scripts/trim-fonts.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import subsetFont from 'subset-font'
import { root } from './lib/load-data.mjs'

const SOURCE = resolve(root, 'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')
const OUT_DIR = resolve(root, 'src/assets/fonts')
const OUT = resolve(OUT_DIR, 'inter-latin-wght-400-700.woff2')

// The same Latin range fontsource uses (see the @font-face in src/index.html).
const RANGES = [
  [0x0000, 0x00ff],
  [0x0131, 0x0131],
  [0x0152, 0x0153],
  [0x02bb, 0x02bc],
  [0x02c6, 0x02c6],
  [0x02da, 0x02da],
  [0x02dc, 0x02dc],
  [0x0304, 0x0304],
  [0x0308, 0x0308],
  [0x0329, 0x0329],
  [0x2000, 0x206f],
  [0x20ac, 0x20ac],
  [0x2122, 0x2122],
  [0x2191, 0x2191],
  [0x2193, 0x2193],
  [0x2212, 0x2212],
  [0x2215, 0x2215],
  [0xfeff, 0xfeff],
  [0xfffd, 0xfffd],
]

let text = ''
for (const [from, to] of RANGES) {
  for (let c = from; c <= to; c++) text += String.fromCodePoint(c)
}

const source = readFileSync(SOURCE)
const trimmed = await subsetFont(source, text, {
  targetFormat: 'woff2',
  variationAxes: { wght: { min: 400, max: 700 } },
})
mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(OUT, trimmed)
console.log(`trim-fonts: ${source.length} -> ${trimmed.length} bytes`)
