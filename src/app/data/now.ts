/**
 * A short note on what I am working on right now, shown under the Home
 * hero. Leave NOW as null to hide the block; when it is set, keep the
 * updated date honest so a stale note is visible as one.
 */

export interface NowNote {
  text: string
  /** ISO date the note was last checked. */
  updated: string
}

export const NOW: NowNote | null = null
