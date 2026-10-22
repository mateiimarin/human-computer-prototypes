import type { AnswerState } from '~/data/session'
import { packList } from '~/data/packs'

export interface ReviewRun {
  kind: 'due' | 'all' | 'drill'
  /** for a drill: the one point being practised */
  sub?: string
  qids: string[]
  answers: Record<string, AnswerState>
  phase: 'answer' | 'results'
  result: { qid: string; ok: boolean | null }[]
  evidence: { sub: string; before: string; after: string }[]
}

export function useReviewRun() {
  const run = useState<ReviewRun | null>('review-run', () => null)
  function begin(kind: ReviewRun['kind'], qids: string[], sub?: string) {
    run.value = { kind, sub, qids, answers: Object.fromEntries(qids.map(id => [id, { choice: null, idk: false, confidence: null }])), phase: 'answer', result: [], evidence: [] }
    return navigateTo('/practice')
  }
  /** Practise one concept: its questions from every exercise, answered without help. */
  function questionsFor(sub: string) {
    return packList.flatMap(p => [...p.quiz, ...p.claims, ...p.defend]).filter(q => q.sub === sub).map(q => q.id).slice(0, 4)
  }
  function drill(sub: string) {
    const qids = questionsFor(sub)
    if (!qids.length) return false
    begin('drill', qids, sub)
    return true
  }
  return { run, begin, drill, questionsFor }
}
