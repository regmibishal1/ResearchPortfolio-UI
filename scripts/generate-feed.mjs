// Builds src/feed.xml, an RSS 2.0 feed of the blog, from the post data so it
// cannot drift from what the site publishes. Runs before every build, like
// the sitemap. Dates come from the posts, not the clock, so the file only
// changes when a post does.
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { loadData, root } from './lib/load-data.mjs'

const SITE = 'https://bishalregmi.com'

const { POSTS } = await loadData('src/app/data/blog.ts')

const escape = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// RFC 822 dates, at noon UTC so no time zone pushes a post onto another day.
const rfc822 = (isoDate) => new Date(`${isoDate}T12:00:00Z`).toUTCString()

const items = POSTS.map((post) => {
  const url = `${SITE}/blog/${post.slug}`
  return [
    '    <item>',
    `      <title>${escape(post.title)}</title>`,
    `      <link>${url}</link>`,
    `      <guid isPermaLink="true">${url}</guid>`,
    `      <pubDate>${rfc822(post.date)}</pubDate>`,
    `      <description>${escape(post.summary)}</description>`,
    ...post.tags.map((tag) => `      <category>${escape(tag)}</category>`),
    '    </item>',
  ].join('\n')
})

const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n' +
  '  <channel>\n' +
  '    <title>Bishal Regmi | Blog</title>\n' +
  `    <link>${SITE}/blog</link>\n` +
  `    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />\n` +
  '    <description>Going back through old projects, redoing them honestly, and writing down what the data actually says.</description>\n' +
  '    <language>en-us</language>\n' +
  `    <lastBuildDate>${rfc822(POSTS[0].date)}</lastBuildDate>\n` +
  items.join('\n') +
  '\n  </channel>\n</rss>\n'

writeFileSync(resolve(root, 'src/feed.xml'), xml)
console.log(`feed.xml: ${POSTS.length} posts`)
