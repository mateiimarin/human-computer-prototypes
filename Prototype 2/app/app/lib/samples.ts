import type { SampleKey } from '~/data/types'

/** Which scripted outcome the “Fill sample” chip produces for explanations. */
export type SampleOutcome = 'auto' | SampleKey

/**
 * `auto` gives the incomplete sample on the first attempt and the complete one afterwards, so a single pass shows
 * both a gap and a corrected explanation. A facilitator can fix one outcome with ⌘K.
 */
export function sampleKeyFor(outcome: SampleOutcome, attempts: number): SampleKey {
  return outcome === 'auto' ? (attempts === 0 ? 'partial' : 'complete') : outcome
}
