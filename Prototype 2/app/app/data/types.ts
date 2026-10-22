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

/** A concept of a topic, such as “Recurrence”. Exercises check a few of them. */
export interface SubConcept { id: string; name: string }

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
    feedback: Record<SampleKey, Feedback>
  }
  work: {
    opening: string
    questions: string[]
    hints: string[]
    outline: { text: string; blank?: string; answer?: string }[]
    solution: { steps: string[]; code: string }
    replies: Record<HelpLevel, string[]>
    minutes: number
  }
  /** Links a gap here to an earlier gap elsewhere, so a repeated kind of mistake can be pointed out. */
  echoes?: { sub: string; earlier: string; text: string }[]
  twin: {
    title: string
    statement: string
    worked: string
    code: string
    task: Question[]
    target: string[]
  }
  /** Prepared text for the “Fill sample” chips. Each sample matches the feedback written for it. */
  sampleAnswers: SampleAnswers
}

export interface SampleAnswers {
  /** A message in the Work chat. */
  message: string
  /** Explain it back. `partial` shows a gap, `complete` shows none, `offtrack` is for facilitators. */
  explain: Record<SampleKey, string>
  /** The same three outcomes for the similar problem. */
  similar: Record<SampleKey, string>
  /** A solution written outside the app. */
  elsewhere: string
  /** One-sentence reasons for the “Why?” box on claims and the “Explain your mistake” box on why-questions, by question id. */
  why: Record<string, string>
}

/** A topic of the course, such as “Dynamic programming”. */
export interface Topic { id: string; name: string; concepts: SubConcept[] }
