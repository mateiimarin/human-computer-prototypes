import { describe, expect, it } from 'vitest'
import { aggregate, currentEvidence, headlineState, mixedLabel, repeatedMistake, type EvidenceEntry } from '../app/lib/evidence'
import { blankSession, buildEntries, comparison } from '../app/lib/session'
import { packs } from '../app/data/packs'

const entry = (over: Partial<EvidenceEntry>): EvidenceEntry => ({
  id: Math.random().toString(), sub: 's', at: '2026-10-10T10:00:00Z', state: 'demonstrated', condition: 'independent',
  source: 'session', sessionId: 'x', title: 't', attempt: 1, items: [], ...over,
})

describe('aggregate', () => {
  it('needs independent signals to reach demonstrated', () => {
    expect(aggregate([{ sub: 's', result: 'correct', condition: 'independent' }]).state).toBe('demonstrated')
    expect(aggregate([{ sub: 's', result: 'correct', condition: 'assisted' }]).state).toBe('unverified')
    expect(aggregate([{ sub: 's', result: 'correct', condition: 'skipped' }]).state).toBe('unverified')
  })
  it('keeps mixed outcomes visible as partial', () => {
    expect(aggregate([
      { sub: 's', result: 'correct', condition: 'independent' },
      { sub: 's', result: 'incorrect', condition: 'independent' },
    ]).state).toBe('partial')
  })
  it('reports a gap only from independent wrong answers', () => {
    expect(aggregate([{ sub: 's', result: 'incorrect', condition: 'independent' }]).state).toBe('gap')
    expect(aggregate([{ sub: 's', result: 'incorrect', condition: 'assisted' }]).state).toBe('unverified')
  })
})

describe('currentEvidence', () => {
  it('lets a skip leave earlier evidence as history', () => {
    const entries = [
      entry({ at: '2026-10-01T10:00:00Z', state: 'demonstrated' }),
      entry({ at: '2026-10-08T10:00:00Z', state: 'unverified', condition: 'skipped' }),
    ]
    const cur = currentEvidence(entries, 's')
    expect(cur.state).toBe('unverified')
    expect(cur.previous?.state).toBe('demonstrated')
  })
  it('does not invent evidence', () => {
    expect(currentEvidence([], 's')).toEqual({ state: 'unverified', condition: 'none' })
  })
})

describe('concept headline', () => {
  it('never hides a gap behind green', () => {
    expect(headlineState(['demonstrated', 'demonstrated', 'gap'])).toBe('gap')
    expect(headlineState(['demonstrated', 'unverified'])).toBe('partial')
    expect(mixedLabel(['demonstrated', 'gap', 'unverified'])).toBe('1 demonstrated · 1 gap · 1 not shown')
  })
})

describe('session evidence', () => {
  const pack = packs['max-subarray']!
  const make = () => {
    const s = blankSession(pack)
    pack.quiz.forEach(q => (s.post.answers[q.id] = { choice: q.correct, idk: false, confidence: 'high' }))
    pack.claims.forEach(q => (s.post.claims[q.id] = { choice: q.correct, idk: false, confidence: 'high' }))
    s.explain.submitted = true
    s.explain.sample = 'complete'
    s.post.submitted = true
    return s
  }
  it('gives demonstrated when everything was independent and right', () => {
    expect(buildEntries(pack, make(), pack.title).every(e => e.state === 'demonstrated')).toBe(true)
  })
  it('never gives demonstrated when the check was assisted', () => {
    const s = make()
    s.assisted.push('explain', 'post')
    expect(buildEntries(pack, s, pack.title).every(e => e.state === 'unverified' && e.condition === 'assisted')).toBe(true)
  })
  it('keeps a skipped final quiz unverified', () => {
    const s = make()
    s.post.submitted = false
    s.post.skipped = true
    s.skipped.push('post', 'explain')
    expect(buildEntries(pack, s, pack.title).every(e => e.state === 'unverified')).toBe(true)
  })
  it('records a postponed check as deferred, never as evidence', () => {
    const s = make()
    s.post.submitted = false
    s.post.skipped = true
    s.skipped.push('post', 'explain')
    s.deferred.push('post', 'explain')
    const entries = buildEntries(pack, s, pack.title)
    expect(entries.every(e => e.state === 'unverified' && e.condition === 'deferred')).toBe(true)
    expect(entries.flatMap(e => e.items).every(i => i.verdict === 'deferred')).toBe(true)
  })
  it('reports no comparison when the baseline was skipped', () => {
    const s = make()
    s.pre.skipped = true
    expect(comparison(pack, s).every(r => r.before === null)).toBe(true)
  })
})

describe('repeated mistakes', () => {
  const gapOn = (sub: string, sessionId: string, at = '2026-10-14T10:00:00Z') => entry({ sub, sessionId, at, state: 'gap' })
  const links = [{ sub: 'dp-substructure', earlier: 'bs-inv', text: 'Both come down to saying why a step is safe.' }]

  it('finds an earlier gap on the same point', () => {
    const hit = repeatedMistake([gapOn('dp-substructure', 'old')], 'dp-substructure', 'now')
    expect(hit?.related).toBe(false)
  })
  it('follows an authored link to a related point', () => {
    const hit = repeatedMistake([gapOn('bs-inv', 'old')], 'dp-substructure', 'now', links)
    expect(hit).toMatchObject({ related: true, text: 'Both come down to saying why a step is safe.' })
  })
  it('never counts the current session against the student', () => {
    expect(repeatedMistake([gapOn('dp-substructure', 'now')], 'dp-substructure', 'now', links)).toBeNull()
  })
  it('ignores earlier evidence that was not a gap', () => {
    expect(repeatedMistake([entry({ sub: 'dp-substructure', sessionId: 'old', state: 'partial' })], 'dp-substructure', 'now')).toBeNull()
  })
})
