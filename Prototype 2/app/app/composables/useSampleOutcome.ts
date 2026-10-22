import { sampleKeyFor, type SampleOutcome } from '~/lib/samples'
import type { SampleKey } from '~/data/types'

/** The outcome chosen with ⌘K, and the sample key it gives for the next attempt. */
export function useSampleOutcome() {
  const outcome = useState<SampleOutcome>('sample-outcome', () => 'auto')
  const pick = (attempts: number): SampleKey => sampleKeyFor(outcome.value, attempts)
  return { outcome, pick }
}
