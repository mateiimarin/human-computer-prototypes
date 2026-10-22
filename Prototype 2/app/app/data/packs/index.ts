import type { Pack } from '../types'
import { maxSubarray } from './max-subarray'
import { coinChange } from './coin-change'
import { binarySearch } from './binary-search'
import { bfsPaths } from './bfs-paths'

export const packs: Record<string, Pack> = {
  [maxSubarray.id]: maxSubarray,
  [coinChange.id]: coinChange,
  [binarySearch.id]: binarySearch,
  [bfsPaths.id]: bfsPaths,
}
export const packList = Object.values(packs)

/** The exercises in sheet order. */
export const exercises: Pack[] = [...packList].sort((a, b) => a.sheetNo.localeCompare(b.sheetNo))

/** The prepared one-sentence reason for a claim or why-question, wherever it belongs. */
export const sampleWhy = (qid: string) => packList.map(p => p.sampleAnswers.why[qid]).find(Boolean) ?? ''
