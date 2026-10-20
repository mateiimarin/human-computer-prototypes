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
