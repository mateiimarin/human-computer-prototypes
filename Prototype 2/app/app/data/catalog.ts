import type { ConceptDef, Topic } from './types'

export const concepts: ConceptDef[] = [
  { id: 'dp', name: 'Dynamic programming', blurb: 'Define a state, find the recurrence, and argue why it is enough.' },
  { id: 'search', name: 'Searching and invariants', blurb: 'State what stays true on every iteration, and use it.' },
  { id: 'graphs', name: 'Graph traversal', blurb: 'Explore by distance and know why the first visit counts.' },
]

export const topics: Topic[] = [
  { id: 'dp', name: 'Dynamic programming', conceptId: 'dp', blurb: 'States, recurrences and optimal substructure' },
  { id: 'search', name: 'Searching and invariants', conceptId: 'search', blurb: 'Binary search and loop invariants' },
  { id: 'graphs', name: 'Graph traversal', conceptId: 'graphs', blurb: 'Breadth-first search and shortest paths' },
]

export const conceptById = (id: string) => concepts.find(c => c.id === id)!
export const topicById = (id: string) => topics.find(t => t.id === id)!

/** The sheet the sample upload "reads". */
export const sampleSheet = {
  title: 'Graph traversal',
  no: 5,
  topicId: 'graphs',
  fileName: 'ADS_Exercise_Sheet_5.pdf',
  pages: 3,
  size: '412 KB',
  due: 'Due Friday',
  packIds: ['bfs-paths'],
  course: 'Algorithms and Data Structures',
}
