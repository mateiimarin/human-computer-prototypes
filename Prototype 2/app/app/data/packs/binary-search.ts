import type { Pack } from '../types'

export const binarySearch: Pack = {
  id: 'binary-search',
  title: 'Binary search and its invariant',
  sheetNo: '3.1',
  topicId: 'search',
  conceptId: 'search',
  statement:
    'Given a sorted array $a$ and a target $t$, return an index $i$ with $a_i = t$, or $-1$ if there is none. State a **loop invariant** that makes the algorithm correct.',
  example: 'For $a = [1, 3, 5, 7, 9, 11]$ and $t = 7$ the answer is $3$.',
  subs: [
    { id: 'bs-inv', name: 'Loop invariant', blurb: 'The statement that stays true on every iteration.' },
    { id: 'bs-bounds', name: 'Updating the bounds', blurb: 'Why the bound moves to $mid \\pm 1$.' },
    { id: 'bs-term', name: 'Termination', blurb: 'Why the loop must end.' },
  ],
  echoes: [{ sub: 'bs-inv', earlier: 'mx-safe', text: 'Both come down to saying why a step is safe: what stays true after it.' }],
  quiz: [
    {
      id: 'bs-q1', sub: 'bs-inv', prompt: 'Which statement is a valid loop invariant for the search over $a[lo..hi]$?',
      choices: [
        { id: 'a', label: 'If $t$ occurs in the array, it occurs within $a[lo..hi]$.' },
        { id: 'b', label: '$a[mid] \\le t$ holds in every iteration.' },
        { id: 'c', label: 'The distance $hi - lo$ is always even.' },
      ],
      correct: 'a',
      why: 'The invariant says the search space still contains the target if it exists. It is true at the start and preserved by each update.',
    },
    {
      id: 'bs-q2', sub: 'bs-bounds', prompt: 'After comparing, $a[mid] < t$. How do you update the bounds?',
      choices: [
        { id: 'a', label: '$lo = mid$.' },
        { id: 'b', label: '$lo = mid + 1$.' },
        { id: 'c', label: '$hi = mid - 1$.' },
      ],
      correct: 'b',
      why: '$a[mid]$ is too small and so is everything left of it. Moving to $mid+1$ also shrinks the interval.',
    },
    {
      id: 'bs-q3', sub: 'bs-term', prompt: 'What guarantees that the loop terminates?',
      choices: [
        { id: 'a', label: 'The array is finite.' },
        { id: 'b', label: 'The interval strictly shrinks each iteration and cannot go below empty.' },
        { id: 'c', label: '$mid$ is rounded down.' },
      ],
      correct: 'b',
      why: 'A finite array alone does not rule out a loop that makes no progress. A strictly shrinking interval does.',
    },
  ],
  claims: [
    {
      id: 'bs-c1', sub: 'bs-bounds', justify: true,
      prompt: '“If you set $lo = mid$ instead of $mid + 1$, the loop can run forever.”',
      choices: [{ id: 'true', label: 'True.' }, { id: 'false', label: 'False.' }],
      correct: 'true',
      why: 'When $hi = lo + 1$, $mid = lo$ and the interval never shrinks.',
    },
    {
      id: 'bs-c2', sub: 'bs-inv', justify: true,
      prompt: '“A loop invariant only has to hold when the loop ends.”',
      choices: [{ id: 'true', label: 'True.' }, { id: 'false', label: 'False. It holds before and after every iteration.' }],
      correct: 'false',
      why: 'An invariant holds before the first iteration and is preserved by each one; that is what makes the final state meaningful.',
    },
  ],
  defend: [
    {
      id: 'bs-d1', sub: 'bs-inv',
      prompt: 'Why is the invariant true before the first iteration?',
      choices: [
        { id: 'a', label: 'Because $lo = 0$ and $hi = n - 1$ cover the whole array.' },
        { id: 'b', label: 'Because the array is sorted.' },
        { id: 'c', label: 'Because $mid$ has not been computed yet.' },
      ],
      correct: 'a', why: 'Initially the interval is the whole array, so if $t$ is present it is inside.',
    },
    {
      id: 'bs-d2', sub: 'bs-bounds',
      prompt: 'Why is it safe to discard $a[mid]$ when $a[mid] < t$?',
      choices: [
        { id: 'a', label: 'Sortedness means everything at or left of $mid$ is also smaller than $t$.' },
        { id: 'b', label: 'Because $mid$ was already checked in the previous iteration.' },
        { id: 'c', label: 'It is not safe; $a[mid]$ must stay in the interval.' },
      ],
      correct: 'a', why: 'Sorted order lets one comparison remove the whole left part.',
    },
    {
      id: 'bs-d3', sub: 'bs-term',
      prompt: 'What does the loop return when the interval becomes empty?',
      choices: [
        { id: 'a', label: '$-1$, because the invariant says $t$ would still be in the interval.' },
        { id: 'b', label: '$lo$.' },
        { id: 'c', label: '$mid$ from the last iteration.' },
      ],
      correct: 'a', why: 'An empty interval containing $t$ if it exists means that $t$ does not exist.',
    },
  ],
  mistakes: {
    title: 'A solution with one planted mistake',
    lines: [
      'Set $lo = 0$ and $hi = n - 1$.',
      'While $lo \\le hi$: let $mid = \\lfloor (lo + hi) / 2 \\rfloor$.',
      'If $a[mid] = t$ return $mid$.',
      'If $a[mid] < t$ set $lo = mid$; otherwise set $hi = mid - 1$.',
      'Return $-1$.',
    ],
    faulty: 3,
    whys: [
      { id: 'a', label: 'With $lo = mid$ the interval may not shrink, so the loop can run forever.' },
      { id: 'b', label: 'It should compare $a[mid]$ with $a[lo]$.' },
      { id: 'c', label: 'The target would be skipped because $mid$ is rounded down.' },
    ],
    correctWhy: 'a',
    explanation: '$a[mid] < t$ means $mid$ itself is excluded, so the new bound is $mid + 1$. Using $mid$ breaks termination when $hi = lo + 1$.',
    sub: 'bs-bounds',
  },
  explain: {
    prompt: 'Explain the algorithm, the invariant, and why the loop returns the right answer.',
    points: [
      { sub: 'bs-inv', label: 'States an invariant: the target, if present, lies in $a[lo..hi]$' },
      { sub: 'bs-bounds', label: 'Explains why the bounds move to $mid \\pm 1$' },
      { sub: 'bs-term', label: 'Argues termination from the shrinking interval' },
    ],
    samples: {
      complete:
        'I keep an interval $a[lo..hi]$ and the invariant that the target, if it is in the array, is inside it. I compare with the middle: if it is smaller I move $lo$ to $mid+1$, if larger I move $hi$ to $mid-1$. The interval shrinks every time, so the loop ends, and if it ends empty the invariant says the target is not there.',
      partial: 'I look at the middle element and throw away the half that cannot contain the target, repeating until I find it or run out of elements.',
      offtrack: 'I scan the array from the left until I find the target, which is fast enough because the array is sorted.',
    },
    feedback: {
      complete: {
        covered: ['Invariant stated for $a[lo..hi]$', 'Bounds move past $mid$', 'Termination from a shrinking interval'],
        gap: null,
        next: 'No gap on these points. Continue to the post-quiz, or add a deeper check.',
      },
      partial: {
        covered: ['Halving idea', 'Discarding the half that cannot contain the target'],
        gap: { sub: 'bs-inv', text: 'No invariant is stated. Say what is always true about $a[lo..hi]$ and why it survives each update.' },
        next: 'Write the invariant in one sentence, then continue.',
      },
      offtrack: {
        covered: [],
        gap: { sub: 'bs-inv', text: 'A left-to-right scan is linear and does not use an interval or an invariant.' },
        next: 'Rewrite using an interval and an invariant, then continue.',
      },
    },
    transcript: 'I keep an interval and the invariant that the target is in it if it exists. I compare with the middle element and cut the interval on one side.',
  },
  work: {
    minutes: 10,
    opening: 'Start anywhere. Paste an attempt, or tell me which part of the proof you find slippery.',
    questions: [
      'What do you want to be true about the interval on every iteration?',
      'After you compare with $a[mid]$, which indices can you rule out?',
      'What would happen on an interval of length two if you update with $mid$ instead of $mid+1$?',
    ],
    hints: [
      'Name the thing that must stay true. It is a statement about the target and the interval.',
      'Make it precise: if the target is anywhere in the array, where must it be? Check it is true at the start.',
      'Invariant: if $t$ is in $a$, it is in $a[lo..hi]$. Updates $lo = mid+1$ or $hi = mid-1$ keep it true and shrink the interval.',
    ],
    outline: [
      { text: 'Initially $lo =$', blank: 'lo', answer: '0' },
      { text: 'Invariant: if $t$ is in $a$, it is in', blank: 'inv', answer: 'a[lo..hi]' },
      { text: 'If $a[mid] < t$ then', blank: 'upd', answer: 'lo = mid + 1' },
      { text: 'The loop ends because the interval', blank: 'term', answer: 'shrinks every iteration' },
    ],
    solution: {
      steps: [
        'Invariant: if $t$ occurs in $a$, it occurs in $a[lo..hi]$. It is true at the start with $lo=0$, $hi=n-1$.',
        'If $a[mid] < t$, sortedness rules out $a[lo..mid]$, so $lo = mid+1$. If $a[mid] > t$, set $hi = mid-1$.',
        'Each update strictly shrinks the interval, so the loop terminates.',
        'At the end the interval is empty, so by the invariant $t$ is absent: return $-1$.',
      ],
      code: 'def search(a: list[int], t: int) -> int:\n    lo, hi = 0, len(a) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if a[mid] == t:\n            return mid\n        if a[mid] < t:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1',
    },
    replies: {
      questions: [
        'Try writing the invariant as a sentence beginning “If $t$ is in the array, then …”. What goes after “then”?',
        'Take $a=[2,4]$ and $t=4$. Run the loop by hand with $lo = mid$. What happens?',
      ],
      hints: [
        'The invariant is about where the target can be. Is it still true after you move $lo$?',
        'Compare $lo = mid$ and $lo = mid+1$ on an interval of two elements. Which one makes progress?',
      ],
      steps: [
        'Step 1: state the invariant. Step 2: show it holds at the start. Step 3: show each update preserves it. Fill in the outline first.',
        'Step 4: argue that the interval shrinks, then use the invariant on the empty interval.',
      ],
      solution: ['Here is the full solution. Read it, close it, and re-derive each line. The check afterwards will not show it.'],
    },
    attempt:
      'def search(a, t):\n    lo, hi = 0, len(a) - 1\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if a[mid] < t:\n            lo = mid\n        else:\n            hi = mid\n    return lo if a[lo] == t else -1',
  },
  sheet: {
    summary: 'Orientation only. This feedback does not count as a demonstration of understanding.',
    solution:
      'def search(a, t):\n    lo, hi = 0, len(a) - 1\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if a[mid] < t:\n            lo = mid\n        else:\n            hi = mid\n    return lo if a[lo] == t else -1',
    annotations: [
      { line: 3, kind: 'note', text: 'With `lo < hi` the interval can end with one element left. Check that the invariant still covers it.' },
      { line: 6, kind: 'issue', text: '`lo = mid` does not shrink the interval when `hi = lo + 1`, so the loop can run forever.' },
      { line: 10, kind: 'ok', text: 'Checking `a[lo] == t` at the end is the right way to finish this variant.' },
    ],
  },
  elsewhere: {
    solution:
      'def search(a, t):\n    lo, hi = 0, len(a) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if a[mid] == t:\n            return mid\n        if a[mid] < t:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1',
  },
  twin: {
    title: 'First index at least $t$',
    statement: 'Given a sorted array $a$ and a value $t$, return the first index $i$ with $a_i \\ge t$, or $n$ if there is none.',
    worked: 'Use the invariant: *the answer lies in $[lo, hi]$*, where $hi$ starts at $n$ (one past the end).\n\nIf $a[mid] < t$ the answer is right of $mid$, so $lo = mid+1$. Otherwise $mid$ could be the answer, so $hi = mid$. The interval $[lo, hi)$ shrinks each time, and when $lo = hi$ that index is the answer.',
    code: 'def lower_bound(a: list[int], t: int) -> int:\n    lo, hi = 0, len(a)\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if a[mid] < t:\n            lo = mid + 1\n        else:\n            hi = mid\n    return lo',
    task: [
      {
        id: 'bs-t1', sub: 'bs-inv', prompt: 'What is a valid invariant for the first-index-at-least-$t$ search?',
        choices: [
          { id: 'a', label: 'The answer lies in $[lo, hi]$, with $hi$ starting at $n$.' },
          { id: 'b', label: '$a[mid] = t$ in every iteration.' },
          { id: 'c', label: '$lo$ is always the answer.' },
        ],
        correct: 'a', why: 'It has the same shape as before: the thing you are looking for stays inside the interval.',
      },
      {
        id: 'bs-t2', sub: 'bs-bounds', prompt: 'Why is the upper update $hi = mid$ rather than $mid - 1$ here?',
        choices: [
          { id: 'a', label: '$mid$ itself can be the answer, so it must stay in the interval.' },
          { id: 'b', label: 'Because $hi$ is exclusive in every binary search.' },
          { id: 'c', label: 'It does not matter.' },
        ],
        correct: 'a', why: 'When $a[mid] \\ge t$, index $mid$ is a candidate for the first such index.',
      },
    ],
    target: ['bs-inv', 'bs-bounds'],
    sample: {
      complete: 'The invariant is that the answer is in $[lo, hi]$. If $a[mid] < t$ then $lo = mid+1$; otherwise $mid$ may be the answer, so $hi = mid$. The interval shrinks, and at $lo = hi$ that index is the answer.',
      partial: 'It is like binary search, but I keep $mid$ when $a[mid] \\ge t$ because it might be the first one.',
      offtrack: 'I would scan from the left until I find the first value that is at least $t$.',
    },
  },
}
