import type { ActiveSession, AnswerState, CheckId, StepId } from '~/data/session'
import type { Confidence, Condition, EvidenceState, Pack, Question } from '~/data/types'
import { packs } from '~/data/packs'
import { uid } from './format'
import { aggregate, type EvidenceEntry, type EvidenceItem, type Result, type Signal } from './evidence'

export const emptyAnswer = (): AnswerState => ({ choice: null, idk: false, confidence: null })

export function emptyAnswers(qs: Question[]): Record<string, AnswerState> {
  return Object.fromEntries(qs.map(q => [q.id, emptyAnswer()]))
}

export function blankSession(pack: Pack): ActiveSession {
  return {
    id: uid('s'),
    packId: pack.id,
    startedAt: new Date().toISOString(),
    step: 'pre-quiz',
    pre: { answers: emptyAnswers(pack.quiz), submitted: false, skipped: false, at: null },
    route: null,
    work: {
      messages: [{ id: uid('m'), role: 'companion', text: pack.work.opening }],
      help: 'hints', hints: 0, questions: 0, draft: '',
      blanks: {}, blanksChecked: false, revealed: false,
    },
    elsewhere: { left: false, solution: '', attached: false },
    explain: { text: '', confidence: null, submitted: false, sample: null, attempts: [] },
    deeper: { defend: false, mistakes: false },
    defend: { answers: emptyAnswers(pack.defend), own: {}, checked: [], idx: 0, done: false },
    mistakes: { line: null, why: null, submitted: false, done: false },
    post: { answers: emptyAnswers(pack.quiz), claims: emptyAnswers(pack.claims), submitted: false, skipped: false, at: null },
    assisted: [], skipped: [], deferred: [], entryIds: [],
    twin: { phase: 'intro', answers: emptyAnswers(pack.twin.task), text: '', sample: null, confidence: null, submitted: false, attempts: [] },
  }
}

export const packOf = (s: ActiveSession) => packs[s.packId]!

export const isAnswered = (a?: AnswerState) => !!a && (!!a.choice || a.idk)

export function answerText(q: Question, a?: AnswerState) {
  if (!a) return 'No answer'
  if (a.idk) return 'I don’t know'
  return q.choices.find(c => c.id === a.choice)?.label ?? 'No answer'
}

/** Which checks does the session currently have a result for? */
export function condition(s: ActiveSession, check: CheckId): Condition {
  if (s.skipped.includes(check)) return s.deferred.includes(check) ? 'deferred' : 'skipped'
  if (s.assisted.includes(check)) return 'assisted'
  return 'independent'
}

function qResult(q: Question, a?: AnswerState): Result | null {
  if (!a || !isAnswered(a)) return null
  if (a.idk) return 'incorrect'
  return a.choice === q.correct ? 'correct' : 'incorrect'
}

interface Obs { sub: string; signal: Signal; item: EvidenceItem }

const passed = (c: Condition) => c === 'skipped' || c === 'deferred'
const passedWord = (c: Condition) => (c === 'deferred' ? 'Postponed' : 'Skipped')

function qObs(q: Question, a: AnswerState | undefined, cond: Condition, extra = ''): Obs {
  const r = qResult(q, a)
  const skipped = passed(cond) || !r
  const verdict: EvidenceItem['verdict'] = passed(cond) ? (cond as 'skipped' | 'deferred') : cond === 'assisted' ? 'assisted' : a?.idk ? 'idk' : (r ?? 'skipped')
  return {
    sub: q.sub,
    signal: { sub: q.sub, result: r ?? 'incorrect', condition: passed(cond) ? cond : skipped ? 'skipped' : cond },
    item: {
      label: q.prompt,
      answer: passed(cond) ? passedWord(cond) : answerText(q, a) + (a?.justification ? ` — “${a.justification}”` : ''),
      verdict,
      confidence: a?.confidence ?? null,
      note: q.why + extra,
    },
  }
}

export function explainObs(pack: Pack, s: ActiveSession): Obs[] {
  const cond = condition(s, 'explain')
  const sample = s.explain.sample ?? 'partial'
  const fb = pack.explain.feedback[sample]
  return pack.explain.points.map((p) => {
    const isGap = fb.gap?.sub === p.sub
    const result: Result = isGap ? 'incorrect' : sample === 'offtrack' ? 'incorrect' : 'correct'
    const c: Condition = passed(cond) ? cond : !s.explain.submitted ? 'skipped' : cond
    return {
      sub: p.sub,
      signal: { sub: p.sub, result, condition: c },
      item: {
        label: `Explain it back: ${p.label}`,
        answer: passed(c) ? passedWord(c) : isGap ? 'Not covered' : result === 'correct' ? 'Covered' : 'Not covered',
        verdict: passed(c) ? (c as 'skipped' | 'deferred') : c === 'assisted' ? 'assisted' : result,
        confidence: s.explain.confidence,
        note: isGap ? fb.gap!.text : '',
      },
    }
  })
}

export function defendObs(pack: Pack, s: ActiveSession): Obs[] {
  if (!s.deeper.defend) return []
  const cond = condition(s, 'defend')
  return pack.defend.filter(q => isAnswered(s.defend.answers[q.id]) || passed(cond))
    .map(q => qObs(q, s.defend.answers[q.id], cond))
}

export function mistakesObs(pack: Pack, s: ActiveSession): Obs[] {
  if (!s.deeper.mistakes) return []
  const cond = condition(s, 'mistakes')
  const m = pack.mistakes
  const done = s.mistakes.submitted
  if (!done && !passed(cond)) return []
  const lineOk = s.mistakes.line === m.faulty
  const whyOk = s.mistakes.why === m.correctWhy
  const result: Result = lineOk && whyOk ? 'correct' : lineOk || whyOk ? 'partial' : 'incorrect'
  const c: Condition = cond
  return [{
    sub: m.sub,
    signal: { sub: m.sub, result, condition: c },
    item: {
      label: 'Find the mistake',
      answer: passed(c) ? passedWord(c) : `Line ${(s.mistakes.line ?? -1) + 1}${lineOk ? ' (correct line)' : ''}`,
      verdict: passed(c) ? (c as 'skipped' | 'deferred') : c === 'assisted' ? 'assisted' : result,
      confidence: null,
      note: m.explanation,
    },
  }]
}

export function postObs(pack: Pack, s: ActiveSession): Obs[] {
  const cond = condition(s, 'post')
  if (!s.post.submitted && !passed(cond)) return []
  return [
    ...pack.quiz.map(q => qObs(q, s.post.answers[q.id], cond)),
    ...pack.claims.map(q => qObs(q, s.post.claims[q.id], cond)),
  ]
}

export function allObs(pack: Pack, s: ActiveSession): Obs[] {
  return [...explainObs(pack, s), ...defendObs(pack, s), ...mistakesObs(pack, s), ...postObs(pack, s)]
}

/** Build one evidence entry per concept from what the session has produced so far. */
export function buildEntries(pack: Pack, s: ActiveSession, title: string, attempt = 1): EvidenceEntry[] {
  const obs = allObs(pack, s)
  const at = new Date().toISOString()
  return pack.subs.map((sub) => {
    const mine = obs.filter(o => o.sub === sub.id)
    const { state, condition } = aggregate(mine.map(o => o.signal))
    return {
      id: uid('e'), sub: sub.id, at, state, condition,
      source: 'session' as const, sessionId: s.id, title, attempt,
      items: mine.map(o => o.item),
    }
  }).filter(e => e.items.length)
}

export function twinObs(pack: Pack, s: ActiveSession): Obs[] {
  const out: Obs[] = []
  const cond: Condition = 'independent'
  const sample = s.twin.sample ?? 'partial'
  const fbTargets = pack.twin.target
  pack.twin.task.forEach(q => out.push(qObs(q, s.twin.answers[q.id], cond)))
  // The short explanation adds one signal for each target sub-concept.
  fbTargets.forEach((sub) => {
    out.push({
      sub,
      signal: { sub, result: sample === 'offtrack' ? 'incorrect' : sample === 'partial' ? 'partial' : 'correct', condition: cond },
      item: { label: 'Similar problem: explain it without help', answer: sample === 'offtrack' ? 'Did not carry over' : sample === 'partial' ? 'Carried over in part' : 'Carried over', verdict: sample === 'offtrack' ? 'incorrect' : sample === 'partial' ? 'partial' : 'correct', confidence: s.twin.confidence, note: '' },
    })
  })
  return out
}

export function buildTwinEntries(pack: Pack, s: ActiveSession, attempt: number): EvidenceEntry[] {
  const obs = twinObs(pack, s)
  const at = new Date().toISOString()
  return pack.twin.target.map((sub) => {
    const mine = obs.filter(o => o.sub === sub)
    const { state, condition } = aggregate(mine.map(o => o.signal))
    return { id: uid('e'), sub, at, state, condition, source: 'twin' as const, sessionId: s.id, title: `Similar problem · ${pack.twin.title.replace(/\$/g, '')}`, attempt, items: mine.map(o => o.item) }
  })
}

export interface ComparisonRow {
  q: Question
  before: AnswerState | null
  after: AnswerState | null
  beforeOk: boolean | null
  afterOk: boolean | null
}

export function comparison(pack: Pack, s: ActiveSession): ComparisonRow[] {
  return pack.quiz.map((q) => {
    const b = s.pre.skipped || !s.pre.submitted ? null : s.pre.answers[q.id] ?? null
    const a = s.post.skipped || !s.post.submitted ? null : s.post.answers[q.id] ?? null
    return {
      q, before: b, after: a,
      beforeOk: b && isAnswered(b) ? !b.idk && b.choice === q.correct : null,
      afterOk: a && isAnswered(a) ? !a.idk && a.choice === q.correct : null,
    }
  })
}

export function quizCount(s: ActiveSession, pack: Pack, which: 'pre' | 'post') {
  const answers = which === 'pre' ? s.pre.answers : s.post.answers
  return pack.quiz.filter(q => isAnswered(answers[q.id]) && !answers[q.id]!.idk && answers[q.id]!.choice === q.correct).length
}

export function answeredCount(qs: Question[], answers: Record<string, AnswerState>) {
  return qs.filter(q => isAnswered(answers[q.id])).length
}

/** Where a student should land when resuming. */
export function resumePath(s: ActiveSession): string {
  const map: Record<StepId, string> = {
    'pre-quiz': '/session/pre-quiz', route: '/session/route',
    work: '/session/work', elsewhere: '/session/elsewhere', explain: '/session/explain',
    defend: '/session/defend', mistakes: '/session/mistakes',
    'post-quiz': '/session/post-quiz', summary: '/session/summary', twin: '/session/twin',
  }
  return map[s.step]
}

export type Stage = 'prepare' | 'work' | 'check' | 'summary'
export const stages: { id: Stage; label: string }[] = [
  { id: 'prepare', label: 'Prepare' },
  { id: 'work', label: 'Work' },
  { id: 'check', label: 'Check' },
  { id: 'summary', label: 'Summary' },
]
export function stageOf(step: StepId): Stage {
  if (['pre-quiz', 'route'].includes(step)) return 'prepare'
  if (['work', 'elsewhere'].includes(step)) return 'work'
  if (['explain', 'defend', 'mistakes', 'post-quiz'].includes(step)) return 'check'
  return 'summary'
}
export const stateOrder: EvidenceState[] = ['gap', 'partial', 'unverified', 'demonstrated']
export type { Confidence }
