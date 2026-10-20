import { useLocalStorage } from '@vueuse/core'
import type { Course, ExamPlan, Priority, SavedQuestion, SessionRecord, Sheet, Workspace } from '~/data/workspace'
import { makeSeed } from '~/data/seed'
import { packs } from '~/data/packs'
import { topics, concepts, topicById, conceptById } from '~/data/catalog'
import { currentEvidence, headlineState, type EvidenceEntry } from '~/lib/evidence'
import { daysFrom, uid } from '~/lib/format'
import type { EvidenceState, Pack, Question } from '~/data/types'

const KEY = 'prove-it:workspace:v1'
let store: Ref<Workspace> | null = null

function getStore() {
  if (!store) {
    store = useLocalStorage<Workspace>(KEY, makeSeed(), { deep: true, mergeDefaults: false, writeDefaults: true })
    if (!store.value?.version || store.value.version !== 3) store.value = makeSeed()
  }
  return store
}

export interface SubView {
  id: string; name: string; blurb: string; packId: string
  state: EvidenceState; condition: string; at: string | null
  previous?: EvidenceEntry; entry?: EvidenceEntry
}
export interface ConceptView {
  id: string; name: string; blurb: string; topicId: string
  packs: Pack[]; subs: SubView[]; headline: EvidenceState; checked: number; total: number
}

export function useWorkspace() {
  const ws = getStore()

  const course = computed<Course>(() => ws.value.courses.find(c => c.id === ws.value.courseId) ?? ws.value.courses[0]!)
  const sheets = computed(() => ws.value.sheets.filter(s => s.courseId === course.value.id).sort((a, b) => a.no - b.no))
  const courseTopics = computed(() => topics.filter(t => sheets.value.some(s => s.topicId === t.id)))
  const coursePacks = computed(() => sheets.value.flatMap(s => s.packIds.map(id => packs[id]!)))
  const isFirstUse = computed(() => sheets.value.length === 0)

  const conceptViews = computed<ConceptView[]>(() =>
    concepts.filter(c => courseTopics.value.some(t => t.conceptId === c.id)).map((c) => {
      const ps = coursePacks.value.filter(p => p.conceptId === c.id)
      const subs = ps.flatMap(p => p.subs.map((s): SubView => {
        const cur = currentEvidence(ws.value.entries, s.id)
        return { ...s, packId: p.id, state: cur.state, condition: cur.condition, at: cur.entry?.at ?? null, previous: cur.previous, entry: cur.entry }
      }))
      return {
        id: c.id, name: c.name, blurb: c.blurb, topicId: c.id, packs: ps, subs,
        headline: headlineState(subs.map(s => s.state)),
        checked: subs.filter(s => s.condition === 'independent').length, total: subs.length,
      }
    }))

  const savedForCourse = computed(() => ws.value.saved.filter(s => s.courseId === course.value.id))
  const dueNow = computed(() => savedForCourse.value.filter(s => !s.excluded && s.dueAt && new Date(s.dueAt) <= new Date()))

  function findQuestion(qid: string): { q: Question; pack: Pack } | undefined {
    for (const p of Object.values(packs)) {
      const q = [...p.quiz, ...p.claims, ...p.defend].find(x => x.id === qid)
      if (q) return { q, pack: p }
    }
  }

  function setCourse(id: string) { ws.value.courseId = id }

  function addCourse(name: string, code: string) {
    const id = uid('c')
    ws.value.courses.push({ id, name: name.trim(), code: code.trim() || 'COURSE', term: 'Autumn 2026', exam: { date: null, topics: {} } })
    ws.value.courseId = id
    return id
  }

  function addSheet(input: { no: number; title: string; topicId: string; packIds: string[]; fileName?: string; courseId?: string; due?: string | null }) {
    const sheet: Sheet = {
      id: uid('sh'), courseId: input.courseId ?? course.value.id, no: input.no, title: input.title, topicId: input.topicId,
      packIds: input.packIds, addedAt: new Date().toISOString(), source: 'upload', fileName: input.fileName, due: input.due ?? daysFrom(4),
    }
    ws.value.sheets.push(sheet)
    const c = ws.value.courses.find(x => x.id === sheet.courseId)
    if (c && !c.exam.topics[input.topicId]) c.exam.topics[input.topicId] = { on: true, priority: 'normal' }
    return sheet
  }
  function removeSheet(id: string) { ws.value.sheets = ws.value.sheets.filter(s => s.id !== id) }
  function renameSheet(id: string, title: string) { const s = ws.value.sheets.find(x => x.id === id); if (s) s.title = title }

  function saveQuestions(sessionId: string, sessionTitle: string, items: { qid: string; packId: string }[]) {
    for (const it of items) {
      const existing = ws.value.saved.find(s => s.qid === it.qid && s.courseId === course.value.id)
      if (existing) { existing.excluded = false; continue }
      ws.value.saved.push({ qid: it.qid, packId: it.packId, courseId: course.value.id, savedAt: new Date().toISOString(), sessionId, sessionTitle, excluded: false, dueAt: daysFrom(1), last: null, times: 0 })
    }
  }
  function setExcluded(qids: string[], excluded: boolean) {
    for (const s of ws.value.saved) if (qids.includes(s.qid) && s.courseId === course.value.id) s.excluded = excluded
  }
  function removeSaved(qids: string[]) { ws.value.saved = ws.value.saved.filter(s => !(qids.includes(s.qid) && s.courseId === course.value.id)) }

  function setExam(patch: Partial<ExamPlan>) { Object.assign(course.value.exam, patch) }
  function setTopicPlan(topicId: string, patch: Partial<{ on: boolean; priority: Priority }>) {
    const cur = course.value.exam.topics[topicId] ?? { on: true, priority: 'normal' as Priority }
    course.value.exam.topics[topicId] = { ...cur, ...patch }
  }

  /** The prepared review queue for the selected exam scope. */
  const examQueue = computed<{ item: SavedQuestion; reason: string }[]>(() => {
    const plan = course.value.exam
    const weight = { high: 3, normal: 2, low: 1 } as const
    return savedForCourse.value
      .filter(s => !s.excluded)
      .map((item) => {
        const pack = packs[item.packId]!
        const tp = plan.topics[pack.topicId]
        return { item, topic: pack.topicId, tp }
      })
      .filter(x => x.tp?.on !== false)
      .sort((a, b) => weight[b.tp?.priority ?? 'normal'] - weight[a.tp?.priority ?? 'normal'] || +new Date(a.item.dueAt ?? 0) - +new Date(b.item.dueAt ?? 0))
      .map(x => ({
        item: x.item,
        reason: x.tp?.priority === 'high' ? `${topicById(x.topic).name} is a high priority` : x.item.dueAt && new Date(x.item.dueAt) <= new Date() ? 'Due now' : 'In scope',
      }))
  })

  function archiveSession(record: Omit<SessionRecord, 'at'>) {
    ws.value.sessions.unshift({ ...record, at: new Date().toISOString() })
  }

  function reset() { ws.value = makeSeed() }
  function signOut() { ws.value.signedIn = false }
  function signIn() { ws.value.signedIn = true }

  return {
    ws, course, sheets, courseTopics, coursePacks, isFirstUse, concepts: conceptViews, savedForCourse, dueNow, examQueue,
    findQuestion, setCourse, addCourse, addSheet, removeSheet, renameSheet, saveQuestions, setExcluded, removeSaved,
    setExam, setTopicPlan, archiveSession, reset, signOut, signIn, conceptById, topicById,
  }
}
