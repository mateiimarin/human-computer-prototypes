import type { SavedQuestion, SessionRecord, Workspace } from '~/data/workspace'
import { makeSeed } from '~/data/seed'
import { exercises, packList } from '~/data/packs'
import { topics } from '~/data/catalog'
import { currentEvidence, type EvidenceEntry } from '~/lib/evidence'
import { daysFrom } from '~/lib/format'
import type { EvidenceState, Pack, Question } from '~/data/types'

export interface ConceptView {
  id: string; name: string; topicId: string
  state: EvidenceState; condition: string
  entry?: EvidenceEntry
  /** the exercises that check this concept */
  exercises: Pack[]
}
export interface TopicView {
  id: string; name: string
  concepts: ConceptView[]; exercises: Pack[]
  /** concepts shown without help, and how many there are */
  checked: number; total: number
}

/**
 * All state of the prototype. It lives in memory only, so a refresh returns everything to the seed.
 */
export function useWorkspace() {
  const ws = useState<Workspace>('workspace', makeSeed)

  const topicViews = computed<TopicView[]>(() =>
    topics.map((tp) => {
      const concepts = tp.concepts.map((c): ConceptView => {
        const cur = currentEvidence(ws.value.entries, c.id)
        return { id: c.id, name: c.name, topicId: tp.id, state: cur.state, condition: cur.condition, entry: cur.entry, exercises: exercises.filter(p => p.subs.some(s => s.id === c.id)) }
      })
      return {
        id: tp.id, name: tp.name, concepts, exercises: exercises.filter(p => p.topicId === tp.id),
        checked: concepts.filter(c => c.condition === 'independent' && c.state === 'demonstrated').length, total: concepts.length,
      }
    }))

  const dueNow = computed(() => ws.value.saved.filter(s => s.dueAt && new Date(s.dueAt) <= new Date()))

  function findQuestion(qid: string): { q: Question; pack: Pack } | undefined {
    for (const p of packList) {
      const q = [...p.quiz, ...p.claims, ...p.defend].find(x => x.id === qid)
      if (q) return { q, pack: p }
    }
  }

  function saveQuestions(sessionId: string, sessionTitle: string, items: { qid: string; packId: string }[]) {
    for (const it of items) {
      if (ws.value.saved.some(s => s.qid === it.qid)) continue
      ws.value.saved.push({ qid: it.qid, packId: it.packId, savedAt: new Date().toISOString(), sessionId, sessionTitle, dueAt: daysFrom(1), last: null, times: 0 })
    }
  }

  function archiveSession(record: Omit<SessionRecord, 'at'>) {
    ws.value.sessions.unshift({ ...record, at: new Date().toISOString() })
  }

  return { ws, topics: topicViews, dueNow, findQuestion, saveQuestions, archiveSession }
}

export type { SavedQuestion }
