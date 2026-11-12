// Stops a Cloudflare Pages build early when a required variable is unset,
// instead of shipping a site whose API calls go to a '%%...%%' placeholder.
// A node script rather than ${VAR:?} in package.json, which yarn's own
// shell does not understand.
const missing = process.argv.slice(2).filter((name) => !process.env[name])
if (missing.length > 0) {
  console.error(`Set ${missing.join(', ')} before building for Cloudflare Pages.`)
  process.exit(1)
}
