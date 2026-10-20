export type Confidence = 'low' | 'medium' | 'high'
export type EvidenceState = 'demonstrated' | 'partial' | 'gap' | 'unverified'
export type Condition = 'independent' | 'assisted' | 'skipped' | 'deferred'
export type HelpLevel = 'questions' | 'hints' | 'steps' | 'solution'
export type SampleKey = 'complete' | 'partial' | 'offtrack'

export interface Choice { id: string; label: string }

/** One multiple-choice item. The same item is reused in quizzes, claims, deeper checks and review. */
export interface Question {
  id: string
  sub: string
  prompt: string
  choices: Choice[]
  correct: string
  why: string
  /** claims ask for a short justification to expose guessing */
  justify?: boolean
}

export interface SubConcept { id: string; name: string; blurb: string }

export interface Annotation { line: number; kind: 'ok' | 'note' | 'issue'; text: string }

export interface Feedback {
  covered: string[]
  gap: { sub: string; text: string } | null
  next: string
}

export interface Pack {
  id: string
  title: string
  sheetNo: string
  topicId: string
  conceptId: string
  statement: string
  example: string
  subs: SubConcept[]
  quiz: Question[]
  claims: Question[]
  defend: Question[]
  mistakes: {
    title: string
    lines: string[]
    faulty: number
    whys: Choice[]
    correctWhy: string
    explanation: string
    sub: string
  }
  explain: {
    prompt: string
    points: { sub: string; label: string }[]
    samples: Record<SampleKey, string>
    feedback: Record<SampleKey, Feedback>
    transcript: string
  }
  work: {
    opening: string
    questions: string[]
    hints: string[]
    outline: { text: string; blank?: string; answer?: string }[]
    solution: { steps: string[]; code: string }
    replies: Record<HelpLevel, string[]>
    attempt: string
    minutes: number
  }
  sheet: { solution: string; annotations: Annotation[]; summary: string }
  elsewhere: { solution: string }
  recall?: { packId: string; prompt: string; reveal: string }
  /** Links a gap here to an earlier gap elsewhere, so a repeated kind of mistake can be pointed out. */
  echoes?: { sub: string; earlier: string; text: string }[]
  twin: {
    title: string
    statement: string
    worked: string
    code: string
    task: Question[]
    target: string[]
    sample: Record<SampleKey, string>
  }
}

export interface Topic { id: string; name: string; conceptId: string; blurb: string }
export interface ConceptDef { id: string; name: string; blurb: string }
