import type { Pack } from '../types'
import { concept } from '../catalog'

export const bfsPaths: Pack = {
  id: 'bfs-paths',
  title: 'Shortest paths with BFS',
  sheetNo: '5.1',
  topicId: 'graphs',
  statement:
    'Given an unweighted graph $G = (V, E)$ and a start vertex $s$, compute the fewest edges from $s$ to every vertex, in $O(|V| + |E|)$ time.',
  example: 'In a path graph $s - a - b$ the distances are $0$, $1$ and $2$.',
  subs: [concept('bf-queue'), concept('bf-visit'), concept('bf-short')],
  quiz: [
    {
      id: 'bf-q1', sub: 'bf-queue', prompt: 'Breadth-first search (BFS) finds shortest paths in an unweighted graph. Why does its FIFO queue give vertices in non-decreasing order of distance?',
      choices: [
        { id: 'a', label: 'All vertices at distance $d$ are enqueued before any at distance $d+1$.' },
        { id: 'b', label: 'The queue always holds the vertex with the smallest label.' },
        { id: 'c', label: 'The queue sorts vertices by degree.' },
      ],
      correct: 'a', why: 'Vertices at distance $d+1$ are only discovered while processing vertices at distance $d$, and the queue preserves that order.',
    },
    {
      id: 'bf-q2', sub: 'bf-visit', prompt: 'In BFS, when should a vertex be marked as visited?',
      choices: [
        { id: 'a', label: 'When it is first discovered and enqueued, so it cannot be queued twice.' },
        { id: 'b', label: 'Only after all of its neighbours have been processed.' },
        { id: 'c', label: 'Never; compare distances instead.' },
      ],
      correct: 'a', why: 'Marking on discovery gives each vertex exactly one place in the queue and keeps the running time linear.',
    },
    {
      id: 'bf-q3', sub: 'bf-short', prompt: 'In BFS, why is the first time a vertex $v$ is reached along a shortest path?',
      choices: [
        { id: 'a', label: 'Because BFS picks the cheapest edge each time.' },
        { id: 'b', label: 'Paths are explored in order of length, so a shorter path would have found $v$ earlier.' },
        { id: 'c', label: 'Because the graph has no cycles.' },
      ],
      correct: 'b', why: 'Level by level exploration means no shorter path can have been missed.',
    },
  ],
  claims: [
    {
      id: 'bf-c1', sub: 'bf-short', justify: true,
      prompt: '“BFS finds shortest paths in a graph with positive edge weights.”',
      choices: [{ id: 'true', label: 'True.' }, { id: 'false', label: 'False. It minimises the number of edges, not their total weight.' }],
      correct: 'false', why: 'BFS counts edges. With weights a path with more edges can still be cheaper.',
    },
    {
      id: 'bf-c2', sub: 'bf-visit', justify: true,
      prompt: '“BFS with marking on discovery runs in $O(|V| + |E|)$.”',
      choices: [{ id: 'true', label: 'True.' }, { id: 'false', label: 'False.' }],
      correct: 'true', why: 'Each vertex is enqueued once and each edge examined a constant number of times.',
    },
  ],
  defend: [
    {
      id: 'bf-d1', sub: 'bf-queue',
      prompt: 'What would break if you used a stack instead of a queue?',
      choices: [
        { id: 'a', label: 'Vertices would no longer be processed by distance, so recorded distances may be too long.' },
        { id: 'b', label: 'Nothing; the order does not matter.' },
        { id: 'c', label: 'The algorithm would stop after one vertex.' },
      ],
      correct: 'a', why: 'A stack goes deep first, so a vertex can be reached along a long path before a short one.',
    },
    {
      id: 'bf-d2', sub: 'bf-visit',
      prompt: 'Why do you check visited before adding a neighbour to the queue?',
      choices: [
        { id: 'a', label: 'To avoid enqueueing a vertex more than once.' },
        { id: 'b', label: 'To skip vertices with small degree.' },
        { id: 'c', label: 'To sort the neighbours.' },
      ],
      correct: 'a', why: 'Each vertex should be handled once, otherwise cycles would make the loop unbounded.',
    },
    {
      id: 'bf-d3', sub: 'bf-short',
      prompt: 'How is the distance of a newly discovered vertex $w$ computed?',
      choices: [
        { id: 'a', label: '$dist(w) = dist(v) + 1$, where $v$ discovered $w$.' },
        { id: 'b', label: '$dist(w) = \\min$ over all neighbours.' },
        { id: 'c', label: '$dist(w) = 0$.' },
      ],
      correct: 'a', why: 'The vertex is exactly one edge further than the one that discovered it.',
    },
  ],
  mistakes: {
    title: 'A solution with one planted mistake',
    lines: [
      'Set $dist(s) = 0$ and enqueue $s$.',
      'While the queue is not empty: remove $v$ from the **back** of the queue.',
      'For each neighbour $w$ of $v$ that has not been visited: mark it, set $dist(w) = dist(v) + 1$ and enqueue it.',
      'Return $dist$.',
    ],
    faulty: 1,
    whys: [
      { id: 'a', label: 'Removing from the back makes the queue a stack, so vertices are not processed by distance.' },
      { id: 'b', label: 'The start vertex must have distance $1$.' },
      { id: 'c', label: 'Neighbours should be checked before the vertex is removed.' },
    ],
    correctWhy: 'a',
    explanation: 'BFS removes from the front. Taking from the back changes the order to depth first and breaks the distance guarantee.',
    sub: 'bf-queue',
  },
  explain: {
    prompt: 'Explain the algorithm and why the first time a vertex is reached gives its distance.',
    points: [
      { sub: 'bf-queue', label: 'Uses a FIFO queue so vertices are processed by distance' },
      { sub: 'bf-visit', label: 'Marks vertices when first discovered' },
      { sub: 'bf-short', label: 'Argues the first discovery is along a shortest path' },
    ],
    feedback: {
      complete: {
        covered: ['FIFO order gives level by level exploration', 'Visited marked on discovery', 'First discovery argued to be shortest'],
        gap: null,
        next: 'No gap on these points. Continue to the post-quiz, or add a deeper check.',
      },
      partial: {
        covered: ['FIFO order gives level by level exploration', 'Distance computed as plus one'],
        gap: { sub: 'bf-short', text: 'You describe what the algorithm does but not why the first discovery is the shortest one.' },
        next: 'Add one sentence on why a shorter path would have been found earlier.',
      },
      offtrack: {
        covered: [],
        gap: { sub: 'bf-queue', text: 'Exploring deep first does not process vertices by distance, so the first path found need not be shortest.' },
        next: 'Rewrite around a queue and levels, then continue.',
      },
    },
  },
  work: {
    minutes: 11,
    opening: 'Start anywhere. Paste an attempt, or draw a small graph in words and we can walk through it.',
    questions: [
      'Which vertices are discovered first, and which after them?',
      'Why would a vertex that is already queued need a second entry?',
      'Could a shorter path to $v$ appear after $v$ has been discovered?',
    ],
    hints: [
      'Think in layers: the start, its neighbours, their new neighbours. What data structure keeps layers in order?',
      'Mark vertices as soon as they are discovered. What does that prevent in a graph with cycles?',
      'Queue $s$ with $dist(s)=0$. Take from the front; for each unvisited neighbour $w$: mark, $dist(w)=dist(v)+1$, enqueue.',
    ],
    outline: [
      { text: 'Start: $dist(s) =$', blank: 'd0', answer: '0' },
      { text: 'Take vertices from the', blank: 'front', answer: 'front of the queue' },
      { text: 'Mark a neighbour as visited when it is', blank: 'mark', answer: 'first discovered' },
      { text: '$dist(w) =$', blank: 'dw', answer: 'dist(v) + 1' },
    ],
    solution: {
      steps: [
        'Set $dist(s)=0$, mark $s$, and enqueue it.',
        'Repeatedly remove $v$ from the front. For each unvisited neighbour $w$: mark it, set $dist(w)=dist(v)+1$, enqueue it.',
        'FIFO order means all vertices at distance $d$ are processed before any at $d+1$.',
        'The first discovery happens along a shortest path, because a shorter one would have discovered $w$ earlier.',
      ],
      code: 'from collections import deque\n\ndef bfs(graph: dict[int, list[int]], s: int) -> dict[int, int]:\n    dist = {s: 0}\n    queue = deque([s])\n    while queue:\n        v = queue.popleft()\n        for w in graph[v]:\n            if w not in dist:\n                dist[w] = dist[v] + 1\n                queue.append(w)\n    return dist',
    },
    replies: {
      questions: [
        'Take a triangle $s, a, b$. When is $b$ first discovered, and from where? What happens if you add it again from $a$?',
        'If you want distances level by level, which end of the queue should you take from?',
      ],
      hints: [
        'Keep a set of vertices you have already seen. When should a vertex enter it?',
        'You are close. Which end of the queue do you take from, and which end do you add to?',
      ],
      steps: [
        'Step 1: queue with $s$. Step 2: take from the front. Step 3: mark on discovery. Step 4: $dist(w) = dist(v)+1$. Fill in the outline first.',
        'Step 5: explain why the first discovery is the shortest. That is the part to prepare for the check.',
      ],
      solution: ['Here is the full solution. Read it, close it, and re-derive each line. The check afterwards will not show it.'],
    },
  },
  twin: {
    title: 'Shortest path in a grid',
    statement: 'A grid has open cells and walls. Find the fewest moves (up, down, left, right) from the top-left cell to the bottom-right cell, or report that none exists.',
    worked: 'Treat every open cell as a vertex and every pair of adjacent open cells as an edge. All edges have cost one, so BFS applies directly.\n\nQueue the start cell, mark cells on discovery, and set $dist(w) = dist(v) + 1$ for each open, unvisited neighbour.',
    code: 'def grid_path(grid: list[str]) -> int:\n    R, C = len(grid), len(grid[0])\n    dist = {(0, 0): 0}\n    q = deque([(0, 0)])\n    while q:\n        r, c = q.popleft()\n        if (r, c) == (R - 1, C - 1):\n            return dist[(r, c)]\n        for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):\n            n = (r + dr, c + dc)\n            if 0 <= n[0] < R and 0 <= n[1] < C and grid[n[0]][n[1]] == "." and n not in dist:\n                dist[n] = dist[(r, c)] + 1\n                q.append(n)\n    return -1',
    task: [
      {
        id: 'bf-t1', sub: 'bf-queue', prompt: 'Why is a queue, not a stack, used for the grid?',
        choices: [
          { id: 'a', label: 'Cells must be processed in order of distance from the start.' },
          { id: 'b', label: 'Stacks cannot store coordinates.' },
          { id: 'c', label: 'Queues are faster for 2D arrays.' },
        ],
        correct: 'a', why: 'The same argument as for graphs: FIFO order means level-by-level exploration.',
      },
      {
        id: 'bf-t2', sub: 'bf-short', prompt: 'When the target cell is first dequeued, why is its distance the minimum?',
        choices: [
          { id: 'a', label: 'No shorter path exists, since shorter paths would have reached it earlier.' },
          { id: 'b', label: 'Because grid paths are always unique.' },
          { id: 'c', label: 'Because walls force a single route.' },
        ],
        correct: 'a', why: 'Level-by-level exploration discovers the cell along the fewest moves first.',
      },
    ],
    target: ['bf-queue', 'bf-short'],
  },
  /** Prepared text for the “Fill sample” chips. Each sample matches the feedback written for it. */
  sampleAnswers: {
    message: 'I would use a queue and add every neighbour I have not seen yet, but I am not sure why the first visit gives the shortest distance.',
    explain: {
      complete:
        'I keep a queue and mark vertices when I first discover them. All vertices at distance $d$ are in the queue before any at $d+1$, so I explore level by level. A vertex is first found from a vertex one level closer, and no shorter path could have found it earlier.',
      partial: 'I start at $s$, put its neighbours in a queue, and keep taking vertices from the queue, adding their new neighbours with distance plus one.',
      offtrack: 'I would explore as deep as possible along each path and keep the shortest one found.',
    },
    similar: {
      complete: 'Cells are vertices and moves are edges with cost one. A queue processes cells by distance, I mark on discovery, and the first time I reach the target is along a shortest path.',
      partial: 'I run BFS from the top-left cell and count the steps until I reach the bottom-right cell.',
      offtrack: 'I would follow one path to the end and try again from the other side if it is blocked.',
    },
    elsewhere:
      'from collections import deque\n\ndef bfs(graph, s):\n    dist = {s: 0}\n    queue = deque([s])\n    while queue:\n        v = queue.popleft()\n        for w in graph[v]:\n            if w not in dist:\n                dist[w] = dist[v] + 1\n                queue.append(w)\n    return dist',
    why: {
      'bf-c1': 'BFS counts edges, not weights. With positive weights a path with more edges can still be cheaper.',
      'bf-c2': 'Each vertex is added to the queue once and each edge is looked at a constant number of times, so it is linear in vertices plus edges.',
      'bf-d1': 'It does not work because a stack goes deep first, so a vertex can be reached along a long path before a short one.',
      'bf-d2': 'It does not work because without the check a vertex could be added many times, and cycles would make the loop run forever.',
      'bf-d3': 'It does not work because the new vertex is exactly one edge further than the vertex that discovered it, so its distance is that distance plus one.',
    },
  },
}
