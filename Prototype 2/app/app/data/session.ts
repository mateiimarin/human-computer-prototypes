import type { Confidence, HelpLevel, SampleKey } from './types'

export type StepId =
  | 'pre-quiz' | 'route' | 'work' | 'elsewhere'
  | 'explain' | 'defend' | 'mistakes' | 'post-quiz' | 'summary' | 'twin'

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
  kind?: 'reply' | 'hint' | 'question' | 'steps' | 'solution'
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
  startedAt: string
  step: StepId
  pre: { answers: Record<string, AnswerState>; submitted: boolean; skipped: boolean; at: string | null }
  route: 'work' | 'bypass' | 'elsewhere' | null
  work: {
    messages: Msg[]
    help: HelpLevel
    hints: number
    questions: number
    draft: string
    blanks: Record<string, string>
    blanksChecked: boolean
    revealed: boolean
  }
  elsewhere: { left: boolean; solution: string; attached: boolean }
  explain: {
    text: string
    confidence: Confidence | null
    submitted: boolean
    sample: SampleKey | null
    attempts: ExplainAttempt[]
  }
  /** The optional extra check taken before the final quiz. */
  deeper: { defend: boolean; mistakes: boolean }
  defend: { answers: Record<string, AnswerState>; own: Record<string, string>; checked: string[]; idx: number; done: boolean }
  mistakes: { line: number | null; why: string | null; submitted: boolean; done: boolean }
  post: { answers: Record<string, AnswerState>; claims: Record<string, AnswerState>; submitted: boolean; skipped: boolean; at: string | null }
  assisted: CheckId[]
  /** checks the student passed over; `deferred` is the subset they chose to do later */
  skipped: CheckId[]
  deferred: CheckId[]
  entryIds: string[]
  twin: {
    phase: 'intro' | 'explain' | 'check' | 'result'
    answers: Record<string, AnswerState>
    text: string
    sample: SampleKey | null
    confidence: Confidence | null
    submitted: boolean
    attempts: TwinAttempt[]
  }
}
