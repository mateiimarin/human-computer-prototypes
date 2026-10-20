import type { Confidence, HelpLevel, SampleKey } from './types'

export type StepId =
  | 'pre-quiz' | 'baseline' | 'route' | 'recall' | 'work' | 'elsewhere' | 'sheet'
  | 'explain' | 'deeper' | 'defend' | 'mistakes' | 'post-quiz' | 'summary' | 'twin'

export type CheckId = 'pre' | 'explain' | 'defend' | 'mistakes' | 'post'

export interface AnswerState {
  choice: string | null
  idk: boolean
  confidence: Confidence | null
  justification?: string
}

export interface Msg {
  id: string
  role: 'student' | 'companion'
  text: string
  kind?: 'reply' | 'hint' | 'question' | 'steps' | 'solution' | 'attempt'
  note?: string
}

export interface ExplainAttempt { text: string; sample: SampleKey; at: string; confidence: Confidence | null }

export interface TwinAttempt {
  at: string
  label: string
  states: Record<string, 'demonstrated' | 'partial' | 'gap' | 'unverified'>
}

export interface ActiveSession {
  id: string
  packId: string
  courseId: string
  mode: 'full' | 'twin'
  startedAt: string
  step: StepId
  pre: { answers: Record<string, AnswerState>; submitted: boolean; skipped: boolean; at: string | null }
  route: 'work' | 'bypass' | 'elsewhere' | null
  recall: { done: boolean; text: string; revealed: boolean }
  work: {
    messages: Msg[]
    help: HelpLevel
    hints: number
    questions: number
    draft: string
    attempt: string
    blanks: Record<string, string>
    blanksChecked: boolean
    revealed: boolean
  }
  elsewhere: { left: boolean; solution: string; attached: boolean }
  sheetViewed: boolean
  explain: {
    mode: 'type' | 'speak'
    text: string
    voice: 'idle' | 'recording' | 'done'
    confidence: Confidence | null
    submitted: boolean
    sample: SampleKey | null
    attempts: ExplainAttempt[]
  }
  deeper: { defend: boolean; mistakes: boolean; chosen: boolean }
  defend: { answers: Record<string, AnswerState>; own: Record<string, string>; checked: string[]; idx: number; done: boolean }
  mistakes: { line: number | null; why: string | null; text: string; submitted: boolean; done: boolean }
  post: { answers: Record<string, AnswerState>; claims: Record<string, AnswerState>; submitted: boolean; skipped: boolean; at: string | null }
  assisted: CheckId[]
  /** checks the student passed over; `deferred` is the subset they chose to do later */
  skipped: CheckId[]
  deferred: CheckId[]
  entryIds: string[]
  savedNow: string[]
  twin: {
    phase: 'intro' | 'task' | 'explain' | 'check' | 'result'
    answers: Record<string, AnswerState>
    text: string
    sample: SampleKey | null
    confidence: Confidence | null
    submitted: boolean
    attempts: TwinAttempt[]
  }
}
