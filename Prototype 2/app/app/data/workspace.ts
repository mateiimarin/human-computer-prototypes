import type { EvidenceState } from './types'
import type { EvidenceEntry } from '~/lib/evidence'
import type { ActiveSession } from './session'

export interface SessionRecord {
  id: string
  packId: string
  at: string
  title: string
  condition: 'independent' | 'assisted' | 'mixed'
  line: string
  bySub: Record<string, EvidenceState>
}

export interface SavedQuestion {
  qid: string
  packId: string
  savedAt: string
  sessionId: string
  sessionTitle: string
  dueAt: string | null
  last: 'correct' | 'incorrect' | null
  times: number
}

/** Everything the prototype remembers. It lives in memory only, so a refresh starts again from the seed. */
export interface Workspace {
  entries: EvidenceEntry[]
  sessions: SessionRecord[]
  saved: SavedQuestion[]
  /** the open session of each exercise, by exercise id */
  open: Record<string, ActiveSession>
  /** the session whose screens are showing */
  active: ActiveSession | null
}
