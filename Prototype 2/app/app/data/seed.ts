import type { Workspace, SavedQuestion } from './workspace'
import type { EvidenceEntry } from '~/lib/evidence'
import { daysAgo, daysFrom } from '~/lib/format'
import { packs } from './packs'
import { blankSession, emptyAnswer } from '~/lib/session'
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
    qid, packId, courseId: 'ads', savedAt: daysAgo(days), sessionId, sessionTitle, excluded: false,
    dueAt: due === null ? null : due <= 0 ? daysAgo(-due, 8) : daysFrom(due), last: null, times: 0, ...over,
  })

  const coin = packs['coin-change']!
  const active = blankSession(coin, 'ads')
  active.startedAt = daysAgo(0, 9)
  active.step = 'work'
  active.route = 'work'
  active.pre = {
    submitted: true, skipped: false, at: daysAgo(0, 9),
    answers: {
      'cc-q1': { choice: 'b', idk: false, confidence: 'medium' },
      'cc-q2': { choice: 'a', idk: false, confidence: 'high' },
      'cc-q3': { choice: null, idk: true, confidence: 'low' },
    },
  }
  active.work.messages.push(
    { id: 'm-seed-1', role: 'student', text: 'I think greedy works: always take the largest coin that still fits.' },
    { id: 'm-seed-2', role: 'companion', kind: 'question', text: 'Try it on coins $\\{1, 3, 4\\}$ with $T = 6$. What does greedy give, and can you find any combination with fewer coins?' },
  )
  active.work.hints = 0

  return {
    version: 3,
    signedIn: true,
    profile: { name: 'Mia Keller', email: 'mia.keller@university.edu', university: 'Example University' },
    settings: { theme: 'dark', reduceMotion: false, largeText: false, defaultHelp: 'hints', askConfidence: true, remindDue: true, remindWeekly: true, weeklyDay: 'Sunday' },
    courseId: 'ads',
    courses: [
      {
        id: 'ads', name: 'Algorithms and Data Structures', code: 'CS 241', term: 'Autumn 2026',
        exam: { date: daysFrom(84), topics: { dp: { on: true, priority: 'high' }, search: { on: true, priority: 'normal' }, graphs: { on: true, priority: 'normal' } } },
      },
      { id: 'prob', name: 'Discrete Probability', code: 'MATH 204', term: 'Autumn 2026', exam: { date: null, topics: {} } },
    ],
    sheets: [
      { id: 'ads-3', courseId: 'ads', no: 3, title: 'Searching and invariants', topicId: 'search', packIds: ['binary-search'], addedAt: daysAgo(27), source: 'syllabus', due: daysAgo(8) },
      { id: 'ads-4', courseId: 'ads', no: 4, title: 'Dynamic programming', topicId: 'dp', packIds: ['max-subarray', 'coin-change'], addedAt: daysAgo(14), source: 'syllabus', due: daysFrom(4) },
    ],
    entries,
    sessions: [
      {
        id: 's-seed-1', packId: 'binary-search', courseId: 'ads', at: daysAgo(6), title: bs.title, mode: 'full', condition: 'independent',
        line: 'Invariant gap observed. Bounds partial. Termination skipped.',
        bySub: { 'bs-inv': 'gap', 'bs-bounds': 'partial', 'bs-term': 'unverified' },
      },
      {
        id: 's-seed-2', packId: 'max-subarray', courseId: 'ads', at: daysAgo(12), title: mx.title, mode: 'full', condition: 'assisted',
        line: 'Completed with the solution open. Nothing counts as independent evidence yet.',
        bySub: { 'mx-state': 'unverified', 'mx-rec': 'unverified', 'mx-safe': 'unverified' },
      },
    ],
    saved: [
      sv('binary-search', 'bs-q1', 's-seed-1', bs.title, 6, 0),
      sv('binary-search', 'bs-q2', 's-seed-1', bs.title, 6, 0),
      sv('max-subarray', 'mx-q3', 's-seed-2', mx.title, 12, 0),
      sv('binary-search', 'bs-c1', 's-seed-1', bs.title, 6, 2),
      sv('max-subarray', 'mx-c1', 's-seed-2', mx.title, 12, 5),
      sv('binary-search', 'bs-d1', 's-seed-1', bs.title, 6, null, { excluded: true }),
    ],
    active,
    weeklyDoneAt: null,
  }
}

export { emptyAnswer }
