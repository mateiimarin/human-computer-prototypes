import type { Condition, Confidence, EvidenceState } from '~/data/types'

export type Result = 'correct' | 'incorrect' | 'partial'
export interface Signal { sub: string; result: Result; condition: Condition }

export interface EvidenceItem {
  label: string
  answer: string
  verdict: Result | 'skipped' | 'deferred' | 'assisted' | 'idk'
  confidence: Confidence | null
  note: string
}

export interface EvidenceEntry {
  id: string
  sub: string
  at: string
  state: EvidenceState
  condition: Condition
  source: 'session' | 'review' | 'twin'
  sessionId: string
  title: string
  /** 1 for the first attempt in a session, 2+ for twin retries */
  attempt: number
  items: EvidenceItem[]
}

/**
 * Combine the signals for one sub-concept into a single state.
 * Only independent signals can produce demonstrated, partial or gap.
 * Assisted and skipped checks never upgrade understanding: they leave it unverified.
 */
export function aggregate(signals: Signal[]): { state: EvidenceState; condition: Condition } {
  const independent = signals.filter(s => s.condition === 'independent')
  if (!independent.length) {
    if (signals.some(s => s.condition === 'deferred')) return { state: 'unverified', condition: 'deferred' }
    if (signals.some(s => s.condition === 'skipped')) return { state: 'unverified', condition: 'skipped' }
    return { state: 'unverified', condition: 'assisted' }
  }
  const results = independent.map(s => s.result)
  if (results.every(r => r === 'correct')) return { state: 'demonstrated', condition: 'independent' }
  if (results.every(r => r === 'incorrect')) return { state: 'gap', condition: 'independent' }
  return { state: 'partial', condition: 'independent' }
}

export interface Current {
  state: EvidenceState
  condition: Condition | 'none'
  entry?: EvidenceEntry
  /** latest earlier entry that gave real (independent) evidence, when the current one did not */
  previous?: EvidenceEntry
}

const byDate = (a: EvidenceEntry, b: EvidenceEntry) => +new Date(b.at) - +new Date(a.at)

export function currentEvidence(entries: EvidenceEntry[], sub: string): Current {
  const own = entries.filter(e => e.sub === sub).sort(byDate)
  if (!own.length) return { state: 'unverified', condition: 'none' }
  const latest = own[0]!
  if (latest.state !== 'unverified') return { state: latest.state, condition: latest.condition, entry: latest }
  const previous = own.find(e => e.state !== 'unverified')
  return { state: 'unverified', condition: latest.condition, entry: latest, previous }
}

export function tally(states: EvidenceState[]) {
  const t: Record<EvidenceState, number> = { demonstrated: 0, partial: 0, gap: 0, unverified: 0 }
  for (const s of states) t[s]++
  return t
}

/** The label that goes with a mixed concept: never an average, always the counts. */
export function mixedLabel(states: EvidenceState[]) {
  const t = tally(states)
  const parts: string[] = []
  if (t.demonstrated) parts.push(`${t.demonstrated} demonstrated`)
  if (t.partial) parts.push(`${t.partial} partial`)
  if (t.gap) parts.push(`${t.gap} gap`)
  if (t.unverified) parts.push(`${t.unverified} not shown`)
  return parts.join(' · ')
}

/** Worst-first ordering so a concept's headline state never hides a gap. */
export function headlineState(states: EvidenceState[]): EvidenceState {
  const t = tally(states)
  if (t.gap) return 'gap'
  if (t.partial) return 'partial'
  if (t.demonstrated && !t.unverified) return 'demonstrated'
  if (t.demonstrated) return 'partial'
  return 'unverified'
}

export const stateLabel: Record<EvidenceState, string> = {
  demonstrated: 'Demonstrated in check',
  partial: 'Partial',
  gap: 'Gap observed',
  unverified: 'Not shown yet',
}
export const stateShort: Record<EvidenceState, string> = {
  demonstrated: 'Demonstrated',
  partial: 'Partial',
  gap: 'Gap',
  unverified: 'Not shown',
}
export const conditionLabel: Record<Condition, string> = {
  independent: 'Independent',
  assisted: 'Assisted',
  skipped: 'Skipped',
  deferred: 'Postponed',
}
export const confidenceLabel: Record<Confidence, string> = { low: 'Low', medium: 'Medium', high: 'High' }

export interface Repeat {
  /** the earlier evidence the new gap echoes */
  entry: EvidenceEntry
  /** true when it is a different sub-concept with the same kind of mistake */
  related: boolean
  text: string | null
}

/**
 * Has this gap been seen before? Looks at earlier sessions and reviews (never the current session),
 * first at the same sub-concept, then at authored links between sub-concepts.
 */
export function repeatedMistake(
  entries: EvidenceEntry[], sub: string, sessionId: string, links: { sub: string; earlier: string; text: string }[] = [],
): Repeat | null {
  const earlierGaps = entries.filter(e => e.sessionId !== sessionId && e.state === 'gap').sort(byDate)
  const same = earlierGaps.find(e => e.sub === sub)
  if (same) return { entry: same, related: false, text: null }
  for (const l of links.filter(x => x.sub === sub)) {
    const hit = earlierGaps.find(e => e.sub === l.earlier)
    if (hit) return { entry: hit, related: true, text: l.text }
  }
  return null
}
