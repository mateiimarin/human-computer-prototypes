import { describe, expect, it } from 'vitest'
import { packList, sampleWhy } from '../app/data/packs'
import { sampleKeyFor } from '../app/lib/samples'

/** The submit buttons need at least this many characters (explain.vue, twin.vue). */
const MIN = 24

describe.each(packList.map(p => [p.title, p] as const))('sample answers for %s', (_, p) => {
  it('gives each explanation outcome its own text, long enough to submit', () => {
    const texts = Object.values(p.sampleAnswers.explain)
    expect(new Set(texts).size).toBe(3)
    for (const t of texts) expect(t.trim().length).toBeGreaterThanOrEqual(MIN)
  })
  it('matches the feedback written for each explanation outcome', () => {
    expect(p.explain.feedback.partial.gap).not.toBeNull()
    expect(p.explain.feedback.offtrack.gap).not.toBeNull()
    expect(p.explain.feedback.complete.gap).toBeNull()
    // the incomplete sample is the one that triggers the repeated-mistake link where one is authored
    const gap = p.explain.feedback.partial.gap!.sub
    if (p.echoes?.length) expect(p.echoes.some(e => e.sub === gap)).toBe(true)
  })
  it('has similar-problem samples for all three outcomes', () => {
    const texts = Object.values(p.sampleAnswers.similar)
    expect(new Set(texts).size).toBe(3)
    for (const t of texts) expect(t.trim().length).toBeGreaterThanOrEqual(MIN)
  })
  it('has a reason for every claim and every why-question', () => {
    for (const q of [...p.claims, ...p.defend]) expect(sampleWhy(q.id), q.id).not.toBe('')
  })
  it('has a chat message, an elsewhere solution and an answer for every blank', () => {
    expect(p.sampleAnswers.message.length).toBeGreaterThan(10)
    expect(p.sampleAnswers.elsewhere.length).toBeGreaterThan(10)
    for (const o of p.work.outline.filter(o => o.blank)) expect(o.answer, o.blank).toBeTruthy()
  })
})

describe('which sample the chip gives', () => {
  it('shows the gap first and the corrected explanation afterwards', () => {
    expect(sampleKeyFor('auto', 0)).toBe('partial')
    expect(sampleKeyFor('auto', 1)).toBe('complete')
    expect(sampleKeyFor('auto', 4)).toBe('complete')
  })
  it('follows a facilitator’s choice on every attempt', () => {
    for (const k of ['complete', 'partial', 'offtrack'] as const) {
      expect(sampleKeyFor(k, 0)).toBe(k)
      expect(sampleKeyFor(k, 3)).toBe(k)
    }
  })
})
