// Writes the resume PDF from the same data as the /resume page
// (src/app/data/resume.ts, skills.ts and the featured projects), so the
// two never drift. Runs after ng build and writes into the built site.
// The layout is plain text in Helvetica so applicant tracking systems can
// read it.
import { createWriteStream } from 'node:fs'
import { resolve } from 'node:path'
import PDFDocument from 'pdfkit'
import { loadData, root } from './lib/load-data.mjs'

const SITE = 'https://bishalregmi.com'
const { CONTACT, SUMMARY, EXPERIENCE, EDUCATION, CERTIFICATIONS, RESUME_PDF } =
  await loadData('src/app/data/resume.ts')
const { SKILL_CATEGORIES } = await loadData('src/app/data/skills.ts')
const { PROJECTS } = await loadData('src/app/data/projects.ts')

const out = resolve(root, 'dist/research-portfolio-ui/browser', RESUME_PDF)
const doc = new PDFDocument({
  size: 'LETTER',
  margins: { top: 32, bottom: 30, left: 44, right: 44 },
  info: { Title: `${CONTACT.name} - Resume`, Author: CONTACT.name },
})
doc.pipe(createWriteStream(out))
let pages = 1
doc.on('pageAdded', () => pages++)

const width = doc.page.width - doc.page.margins.left - doc.page.margins.right
const left = doc.page.margins.left
const GREY = '#444444'

function section(title) {
  doc.moveDown(0.35)
  doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#000').text(title.toUpperCase(), left)
  const y = doc.y + 1
  doc
    .moveTo(left, y)
    .lineTo(left + width, y)
    .lineWidth(0.6)
    .strokeColor('#999')
    .stroke()
  doc.moveDown(0.3)
}

// A bold heading on the left with a date flush right on the same line.
function heading(text, date) {
  const y = doc.y
  doc.font('Helvetica').fontSize(9).fillColor(GREY)
  const dateWidth = date ? doc.widthOfString(date) : 0
  if (date) doc.text(date, left + width - dateWidth, y, { lineBreak: false })
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#000')
  doc.text(text, left, y, { width: width - dateWidth - 12 })
}

function bullets(lines) {
  doc.font('Helvetica').fontSize(8.75).fillColor('#000')
  for (const line of lines) {
    doc.text(line, left + 10, doc.y, { width: width - 10, indent: -8, paragraphGap: 0.5 })
  }
}

// Header
doc.font('Helvetica-Bold').fontSize(20).fillColor('#000').text(CONTACT.name, left)
doc.font('Helvetica').fontSize(11).fillColor(GREY).text(CONTACT.role)
doc.moveDown(0.2)
doc.fontSize(9).fillColor('#000')
const contactBits = [
  CONTACT.location,
  CONTACT.email,
  CONTACT.linkedin.replace(/^https:\/\/(www\.)?/, '').replace(/\/$/, ''),
  CONTACT.github.replace(/^https:\/\//, ''),
  CONTACT.site,
]
doc.text(contactBits.join('  |  '))
doc.moveDown(0.5)
doc.fontSize(9).text(SUMMARY, { width })

section('Experience')
for (const job of EXPERIENCE) {
  heading(`${job.title}, ${job.subtitle}`, job.date)
  doc.moveDown(0.15)
  bullets(job.description.map((d) => `\u2022 ${d}`))
  doc.moveDown(0.25)
}

section('Selected projects')
for (const project of PROJECTS.filter((p) => p.featured)) {
  heading(project.title, project.period)
  doc
    .font('Helvetica')
    .fontSize(8.75)
    .fillColor('#000')
    .text(project.outcome ?? project.shortDescription, left, doc.y, { width })
  doc
    .fontSize(8.5)
    .fillColor(GREY)
    .text(`${project.tags.join(', ')}  |  ${SITE.replace('https://', '')}/project/${project.id}`, {
      width,
      link: `${SITE}/project/${project.id}`,
    })
  doc.moveDown(0.25)
}

section('Education')
for (const school of EDUCATION) {
  heading(school.title, school.date)
  doc
    .font('Helvetica')
    .fontSize(8.75)
    .fillColor(GREY)
    .text([school.subtitle, ...school.description].join('  |  '), left, doc.y, { width })
  doc.moveDown(0.2)
}

// Certifications ride along with the skills they cover (the category's
// highlight), as on a one-page resume; any others get their own line.
section('Skills and certifications')
for (const category of SKILL_CATEGORIES) {
  const name = category.highlight ? `${category.name} (${category.highlight})` : category.name
  doc
    .font('Helvetica-Bold')
    .fontSize(8.75)
    .fillColor('#000')
    .text(`${name}: `, left, doc.y, { continued: true, width })
    .font('Helvetica')
    .text(category.skills.join(', '))
  doc.moveDown(0.1)
}
const covered = SKILL_CATEGORIES.map((c) => c.highlight ?? '').join(' ')
const others = CERTIFICATIONS.filter(
  (c) => !covered.includes(c.name.replace(/^AWS Certified /, 'AWS '))
)
if (others.length) {
  doc
    .font('Helvetica')
    .fontSize(8.75)
    .text(`Certifications: ${others.map((c) => `${c.name}, ${c.issuer}`).join('; ')}`, left)
}

doc.end()
const spare = Math.round(doc.page.height - doc.page.margins.bottom - doc.y)
if (pages > 1) console.warn('generate-resume-pdf: warning, the resume no longer fits on one page')
console.log(
  `generate-resume-pdf: ${RESUME_PDF}, ${pages} page${pages === 1 ? '' : 's'}, ${spare}pt spare on the last`
)
