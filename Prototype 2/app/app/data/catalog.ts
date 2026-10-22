import type { SubConcept, Topic } from './types'

/** The one course the prototype is about. The course selector lists only this one. */
export const courses = [{ id: 'dsa', name: 'Algorithms and Data Structures' }]
export const course = courses[0]!

/**
 * The syllabus: topics, and in each topic the standard concepts a student has to know.
 * Exercises and questions point at these concepts, so what a student shows is collected per concept, whichever exercise it came from.
 */
export const topics: Topic[] = [
  {
    id: 'dp', name: 'Dynamic programming',
    concepts: [
      { id: 'dp-state', name: 'State' },
      { id: 'dp-recurrence', name: 'Recurrence' },
      { id: 'dp-base', name: 'Base cases' },
      { id: 'dp-substructure', name: 'Optimal substructure' },
    ],
  },
  {
    id: 'search', name: 'Binary search',
    concepts: [
      { id: 'bs-inv', name: 'Loop invariant' },
      { id: 'bs-bounds', name: 'Interval bounds' },
      { id: 'bs-term', name: 'Termination' },
    ],
  },
  {
    id: 'graphs', name: 'Graph traversal',
    concepts: [
      { id: 'bf-queue', name: 'FIFO queue' },
      { id: 'bf-visit', name: 'Visited set' },
      { id: 'bf-short', name: 'Shortest paths' },
    ],
  },
]

export const topicById = (id: string) => topics.find(t => t.id === id)!
export const allConcepts: SubConcept[] = topics.flatMap(t => t.concepts)
export const concept = (id: string): SubConcept => allConcepts.find(c => c.id === id)!
