import type { AnswerState } from '~/data/session'
import { packs } from '~/data/packs'

export interface ReviewRun {
  kind: 'due' | 'weekly' | 'selected' | 'plan' | 'drill'
  /** for a drill: the one sub-concept being practised */
  sub?: string
  qids: string[]
  answers: Record<string, AnswerState>
  phase: 'answer' | 'feedback' | 'summary'
  skipped: boolean
  result: { qid: string; ok: boolean | null }[]
  evidence: { sub: string; before: string; after: string }[]
}

export function useReviewRun() {
  const run = useState<ReviewRun | null>('review-run', () => null)
  function begin(kind: ReviewRun['kind'], qids: string[]) {
    run.value = { kind, qids, answers: Object.fromEntries(qids.map(id => [id, { choice: null, idk: false, confidence: null }])), phase: 'answer', skipped: false, result: [], evidence: [] }
    return navigateTo('/review/session')
  }
  /** Practice one sub-concept: its questions from every exercise, answered independently with solutions hidden. */
  function questionsFor(sub: string) {
    return Object.values(packs).flatMap(p => [...p.quiz, ...p.claims, ...p.defend]).filter(q => q.sub === sub).map(q => q.id).slice(0, 4)
  }
  function drill(sub: string) {
    const qids = questionsFor(sub)
    if (!qids.length) return false
    begin('drill', qids)
    run.value!.sub = sub
    return true
  }
  return { run, begin, drill, questionsFor }
}
