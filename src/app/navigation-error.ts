import { NavigationError } from '@angular/router'

const MISSING_CHUNK = /dynamically imported module|Importing a module script failed|ChunkLoadError/i

/**
 * After a deploy, a tab opened earlier still asks for the old page chunks,
 * which no longer exist, so a link would seem to do nothing. Load the page
 * fresh instead, which also picks up the new build.
 */
export function reloadOnMissingChunk(
  error: NavigationError,
  load: (url: string) => void = (url) => location.assign(url)
): void {
  const reason = error.error as { message?: unknown } | null
  const message = String(reason?.message ?? reason)
  if (MISSING_CHUNK.test(message)) load(error.url)
}
