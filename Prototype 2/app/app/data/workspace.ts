import type { Confidence, EvidenceState, HelpLevel } from './types'
import type { EvidenceEntry } from '~/lib/evidence'
import type { ActiveSession } from './session'

export type Priority = 'low' | 'normal' | 'high'

export interface ExamPlan {
  date: string | null
  topics: Record<string, { on: boolean; priority: Priority }>
}

export interface Course {
  id: string
  name: string
  code: string
  term: string
  exam: ExamPlan
}

export interface Sheet {
  id: string
  courseId: string
  no: number
  title: string
  topicId: string
  packIds: string[]
  addedAt: string
  source: 'syllabus' | 'upload'
  fileName?: string
  due?: string | null
}

export interface SessionRecord {
  id: string
  packId: string
  courseId: string
  at: string
  title: string
  mode: 'full' | 'twin' | 'review'
  condition: 'independent' | 'assisted' | 'mixed'
  line: string
  bySub: Record<string, EvidenceState>
}

export interface SavedQuestion {
  qid: string
  packId: string
  courseId: string
  savedAt: string
  sessionId: string
  sessionTitle: string
  excluded: boolean
  dueAt: string | null
  last: 'correct' | 'incorrect' | null
  times: number
}

export interface Settings {
  theme: 'dark' | 'light' | 'system'
  reduceMotion: boolean
  largeText: boolean
  defaultHelp: HelpLevel
  askConfidence: boolean
  remindDue: boolean
  remindWeekly: boolean
  weeklyDay: string
}

export interface Profile { name: string; email: string; university: string }

export interface Workspace {
  version: number
  signedIn: boolean
  profile: Profile
  settings: Settings
  courseId: string
  courses: Course[]
  sheets: Sheet[]
  entries: EvidenceEntry[]
  sessions: SessionRecord[]
  saved: SavedQuestion[]
  active: ActiveSession | null
  /** per-course flag so “weekly review” can be marked done */
  weeklyDoneAt: string | null
}

export type { Confidence }
