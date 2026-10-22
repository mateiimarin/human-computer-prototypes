import type { Workspace, SavedQuestion } from './workspace'
import type { EvidenceEntry } from '~/lib/evidence'
import { daysAgo, daysFrom } from '~/lib/format'
import { packs } from './packs'
import type { Question } from './types'

const q = (packId: string, id: string): Question => {
  const p = packs[packId]!
  return [...p.quiz, ...p.claims, ...p.defend, ...p.twin.task].find(x => x.id === id)!
}
const wrong = (qq: Question) => qq.choices.find(c => c.id !== qq.correct)!.label
const right = (qq: Question) => qq.choices.find(c => c.id === qq.correct)!.label

export function makeSeed(): Workspace {
  const bs = packs['binary-search']!
  const mx = packs['max-subarray']!

  const entries: EvidenceEntry[] = [
    // A review in the previous week gave real evidence on termination…
    {
      id: 'e-seed-1', sub: 'bs-term', at: daysAgo(12), state: 'demonstrated', condition: 'independent', source: 'review',
      sessionId: 'r-seed-1', title: 'Review · Searching', attempt: 1,
      items: [{ label: q('binary-search', 'bs-q3').prompt, answer: right(q('binary-search', 'bs-q3')), verdict: 'correct', confidence: 'medium', note: q('binary-search', 'bs-q3').why }],
    },
    // …the binary search session: a misconception held with high confidence,
    {
      id: 'e-seed-2', sub: 'bs-inv', at: daysAgo(6), state: 'gap', condition: 'independent', source: 'session',
      sessionId: 's-seed-1', title: 'Binary search and its invariant', attempt: 1,
      items: [
        { label: q('binary-search', 'bs-q1').prompt, answer: wrong(q('binary-search', 'bs-q1')), verdict: 'incorrect', confidence: 'high', note: q('binary-search', 'bs-q1').why },
        { label: 'Explain it back: States an invariant', answer: 'Not covered', verdict: 'incorrect', confidence: 'medium', note: 'No invariant is stated. Say what is always true about $a[lo..hi]$ and why it survives each update.' },
      ],
    },
    // a partial result,
    {
      id: 'e-seed-3', sub: 'bs-bounds', at: daysAgo(6), state: 'partial', condition: 'independent', source: 'session',
      sessionId: 's-seed-1', title: 'Binary search and its invariant', attempt: 1,
      items: [
        { label: q('binary-search', 'bs-q2').prompt, answer: right(q('binary-search', 'bs-q2')), verdict: 'correct', confidence: 'medium', note: q('binary-search', 'bs-q2').why },
        { label: q('binary-search', 'bs-c1').prompt, answer: wrong(q('binary-search', 'bs-c1')), verdict: 'incorrect', confidence: 'low', note: q('binary-search', 'bs-c1').why },
      ],
    },
    // and a skipped check that leaves the earlier evidence as history.
    {
      id: 'e-seed-4', sub: 'bs-term', at: daysAgo(6), state: 'unverified', condition: 'skipped', source: 'session',
      sessionId: 's-seed-1', title: 'Binary search and its invariant', attempt: 1,
      items: [{ label: q('binary-search', 'bs-q3').prompt, answer: 'Skipped', verdict: 'skipped', confidence: null, note: q('binary-search', 'bs-q3').why }],
    },
    // Maximum subarray was finished with help: everything stays unverified.
    ...mx.subs.map((s, i): EvidenceEntry => ({
      id: `e-seed-${5 + i}`, sub: s.id, at: daysAgo(12), state: 'unverified', condition: 'assisted', source: 'session',
      sessionId: 's-seed-2', title: 'Maximum subarray', attempt: 1,
      items: [{ label: `Explain it back: ${mx.explain.points[i]!.label}`, answer: 'Completed after viewing the worked solution', verdict: 'assisted', confidence: 'high', note: 'The check was finished with the solution open, so it cannot count as independent evidence.' }],
    })),
  ]

  const sv = (packId: string, qid: string, sessionId: string, sessionTitle: string, days: number, due: number | null, over: Partial<SavedQuestion> = {}): SavedQuestion => ({
    qid, packId, savedAt: daysAgo(days), sessionId, sessionTitle,
    dueAt: due === null ? null : due <= 0 ? daysAgo(-due, 8) : daysFrom(due), last: null, times: 0, ...over,
  })

  return {
    entries,
    sessions: [
      {
        id: 's-seed-1', packId: 'binary-search', at: daysAgo(6), title: bs.title, condition: 'independent',
        line: 'Invariant gap observed. Bounds partial. Termination skipped.',
        bySub: { 'bs-inv': 'gap', 'bs-bounds': 'partial', 'bs-term': 'unverified' },
      },
      {
        id: 's-seed-2', packId: 'max-subarray', at: daysAgo(12), title: mx.title, condition: 'assisted',
        line: 'Completed with the solution open. Nothing counts as independent evidence yet.',
        bySub: { 'dp-state': 'unverified', 'dp-recurrence': 'unverified', 'dp-substructure': 'unverified' },
      },
    ],
    saved: [
      sv('binary-search', 'bs-q1', 's-seed-1', bs.title, 6, 0),
      sv('binary-search', 'bs-q2', 's-seed-1', bs.title, 6, 0),
      sv('max-subarray', 'mx-q3', 's-seed-2', mx.title, 12, 0),
      sv('binary-search', 'bs-c1', 's-seed-1', bs.title, 6, 2),
      sv('max-subarray', 'mx-c1', 's-seed-2', mx.title, 12, 5),
    ],
    open: {},
    active: null,
  }
}
