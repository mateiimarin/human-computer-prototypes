import { describe, expect, it } from 'vitest'
import { allConcepts, topics } from '../app/data/catalog'
import { packList } from '../app/data/packs'

describe('syllabus', () => {
  it('has uniquely named concepts, a few per topic', () => {
    expect(new Set(allConcepts.map(c => c.id)).size).toBe(allConcepts.length)
    for (const t of topics) expect(t.concepts.length, t.name).toBeGreaterThanOrEqual(3)
  })
  it('lets every exercise check concepts of its own topic', () => {
    for (const p of packList) {
      const topic = topics.find(t => t.id === p.topicId)!
      expect(topic, p.title).toBeTruthy()
      for (const s of p.subs) expect(topic.concepts.map(c => c.id), `${p.title}: ${s.name}`).toContain(s.id)
    }
  })
  it('tags every question with a concept its exercise checks', () => {
    for (const p of packList) {
      const ids = p.subs.map(s => s.id)
      for (const q of [...p.quiz, ...p.claims, ...p.defend, ...p.twin.task]) expect(ids, q.id).toContain(q.sub)
      expect(ids).toContain(p.mistakes.sub)
      for (const pt of p.explain.points) expect(ids).toContain(pt.sub)
    }
  })
  it('shares a concept between exercises instead of repeating it', () => {
    const checkers = packList.filter(p => p.subs.some(s => s.id === 'dp-state')).map(p => p.title)
    expect(checkers.length).toBe(2)
  })
})
