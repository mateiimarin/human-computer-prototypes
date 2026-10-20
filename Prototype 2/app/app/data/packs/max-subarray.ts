import type { Pack } from '../types'

export const maxSubarray: Pack = {
  id: 'max-subarray',
  title: 'Maximum subarray',
  sheetNo: '4.1',
  topicId: 'dp',
  conceptId: 'dp',
  statement:
    'Given an integer array $a_0, \\dots, a_{n-1}$, find the largest sum of a **non-empty** contiguous subarray in $O(n)$ time.',
  example: 'For $[-2, 1, -3, 4, -1, 2, 1, -5, 4]$ the answer is $6$, from $[4, -1, 2, 1]$.',
  subs: [
    { id: 'mx-state', name: 'State definition', blurb: 'What $D_i$ stands for, and why its endpoint matters.' },
    { id: 'mx-rec', name: 'Recurrence', blurb: 'Starting fresh versus extending, including all-negative input.' },
    { id: 'mx-safe', name: 'Why discarding is safe', blurb: 'Why only the best earlier sum needs to be kept.' },
  ],
  echoes: [{ sub: 'mx-safe', earlier: 'bs-inv', text: 'Both come down to saying why a step is safe: what stays true after it.' }],
  quiz: [
    {
      id: 'mx-q1', sub: 'mx-state', prompt: 'What does the state $D_i$ represent?',
      choices: [
        { id: 'a', label: 'The largest sum of a non-empty subarray ending exactly at index $i$.' },
        { id: 'b', label: 'The largest sum of any subarray somewhere in $a_0 \\dots a_i$.' },
        { id: 'c', label: 'The largest single element seen up to index $i$.' },
      ],
      correct: 'a',
      why: 'The endpoint matters. $D_i$ must end at $i$ so that it can be extended; a separate variable records the best sum seen anywhere.',
    },
    {
      id: 'mx-q2', sub: 'mx-rec', prompt: 'How do you compute $D_i$ from the previous state?',
      choices: [
        { id: 'a', label: 'Always extend: $D_i = D_{i-1} + a_i$.' },
        { id: 'b', label: 'Take the better of starting at $a_i$ and extending: $\\max(a_i,\\, D_{i-1} + a_i)$.' },
        { id: 'c', label: 'Reset to $0$ whenever the running sum becomes negative.' },
      ],
      correct: 'b',
      why: 'Every candidate either starts at $i$ or extends one ending at $i-1$. Choosing between the two also handles all-negative arrays.',
    },
    {
      id: 'mx-q3', sub: 'mx-safe', prompt: 'Why can you discard every other subarray ending at $i-1$?',
      choices: [
        { id: 'a', label: 'Because the next value will always make the best subarray positive.' },
        { id: 'b', label: 'Because the shortest subarray is always the best one to extend.' },
        { id: 'c', label: 'Adding the same value keeps their order, so a smaller sum can never overtake the largest.' },
      ],
      correct: 'c',
      why: 'If $a \\ge b$ then $a + x \\ge b + x$. Only the largest earlier sum can ever matter.',
    },
  ],
  claims: [
    {
      id: 'mx-c1', sub: 'mx-rec', justify: true,
      prompt: '“For an array containing only negative values, the answer is always $0$.”',
      choices: [
        { id: 'true', label: 'True. An empty subarray has sum $0$.' },
        { id: 'false', label: 'False. The subarray must be non-empty, so the answer is the largest element.' },
      ],
      correct: 'false',
      why: 'The problem asks for a non-empty subarray. For negative input the best choice is the single largest element.',
    },
    {
      id: 'mx-c2', sub: 'mx-state', justify: true,
      prompt: '“The answer is always $D_{n-1}$, the best sum ending at the last index.”',
      choices: [
        { id: 'true', label: 'True.' },
        { id: 'false', label: 'False. The best subarray can end at any index.' },
      ],
      correct: 'false',
      why: '$D_{n-1}$ only covers subarrays ending at the last index. The answer is the maximum of all $D_i$.',
    },
  ],
  defend: [
    {
      id: 'mx-d1', sub: 'mx-state',
      prompt: 'Your solution keeps both `ending_here` and `best`. Why is one variable not enough?',
      choices: [
        { id: 'a', label: '`ending_here` must end at the current index to be extendable; `best` may end earlier.' },
        { id: 'b', label: 'Python needs a second variable to compare values.' },
        { id: 'c', label: '`best` makes the loop run in linear time.' },
      ],
      correct: 'a',
      why: 'The two answer different questions: the best sum ending here, and the best sum anywhere so far.',
    },
    {
      id: 'mx-d2', sub: 'mx-safe',
      prompt: 'If the best sum ending at $i-1$ is negative, what does the recurrence do?',
      choices: [
        { id: 'a', label: 'It extends anyway, because subarrays must be contiguous.' },
        { id: 'b', label: 'It starts fresh at $a_i$, because $a_i$ beats $D_{i-1} + a_i$.' },
        { id: 'c', label: 'It sets $D_i = 0$.' },
      ],
      correct: 'b',
      why: 'A negative prefix only makes the sum smaller, so starting at $a_i$ wins and the max picks it.',
    },
    {
      id: 'mx-d3', sub: 'mx-rec',
      prompt: 'What is the running time, and why?',
      choices: [
        { id: 'a', label: '$O(n^2)$, since every subarray is considered.' },
        { id: 'b', label: '$O(n)$, since each index does constant work.' },
        { id: 'c', label: '$O(n \\log n)$, since the array is sorted first.' },
      ],
      correct: 'b',
      why: 'One pass; each step compares two values and updates two variables.',
    },
  ],
  mistakes: {
    title: 'A solution with one planted mistake',
    lines: [
      'Let $D_i$ be the best sum of a non-empty subarray ending at index $i$.',
      'Set $D_0 = a_0$ and `best = a_0`.',
      'For $i \\ge 1$: $D_i = \\max(a_i,\; D_{i-1}) + a_i$.',
      'After each step, update `best = max(best, D_i)`.',
      'Return `best`.',
    ],
    faulty: 2,
    whys: [
      { id: 'a', label: 'It adds $a_i$ twice when starting fresh; the sum belongs inside the max.' },
      { id: 'b', label: 'It ignores that subarrays must be contiguous.' },
      { id: 'c', label: 'It should compare against $0$ instead of $D_{i-1}$.' },
    ],
    correctWhy: 'a',
    explanation:
      'The intended choice is between $a_i$ and $D_{i-1} + a_i$. Writing $\\max(a_i, D_{i-1}) + a_i$ always adds $a_i$ once more, so starting fresh gives $2a_i$ instead of $a_i$.',
    sub: 'mx-rec',
  },
  explain: {
    prompt: 'Explain the approach, the key steps, and why they hold.',
    points: [
      { sub: 'mx-state', label: 'Defines a state as the best sum ending at index $i$' },
      { sub: 'mx-rec', label: 'Chooses between starting at $a_i$ and extending the previous state' },
      { sub: 'mx-safe', label: 'Explains why only the largest earlier sum needs to be kept' },
    ],
    samples: {
      complete:
        'For every index I keep the best sum of a subarray that ends there. It either starts again at the current value or extends the best one ending just before. Only the largest earlier sum matters, because adding the same value to two sums keeps their order, so a smaller one can never overtake it. The answer is the maximum over all positions.',
      partial:
        'I keep the best sum ending at each index. At every index I either start again at the current value or extend the previous best, and then I take the maximum over all indices.',
      offtrack:
        'I would check every subarray and keep the biggest sum, using prefix sums to make each sum quick to compute.',
    },
    feedback: {
      complete: {
        covered: [
          'State defined as the best sum ending at $i$',
          'Choice between starting fresh and extending',
          'Reason an earlier smaller sum can be dropped',
        ],
        gap: null,
        next: 'No gap on these three points. Continue to the post-quiz, or add a deeper check.',
      },
      partial: {
        covered: ['State defined as the best sum ending at $i$', 'Choice between starting fresh and extending'],
        gap: {
          sub: 'mx-safe',
          text: 'You describe the choice but not why the other earlier subarrays can be dropped. Add one sentence on why a smaller sum cannot overtake the largest.',
        },
        next: 'Add the missing reason in one sentence, or continue and see it in the summary.',
      },
      offtrack: {
        covered: [],
        gap: {
          sub: 'mx-state',
          text: 'The explanation compares all subarrays. It does not define a state that can be extended, so it does not reach linear time.',
        },
        next: 'Rewrite it around a state that ends at index $i$, then continue.',
      },
    },
    transcript:
      'So for each index I keep the best sum ending there. Then I either start again at the current value or extend the previous best, and I take the maximum over all indices at the end.',
  },
  work: {
    minutes: 12,
    opening: 'Start anywhere. Paste an attempt, say where you are stuck, or ask for a smaller version of the problem.',
    questions: [
      'What would you need to know about position $i-1$ to decide what to do at position $i$?',
      'Two candidate subarrays both end at $i-1$. You add $a_i$ to each. Can their order change?',
      'What should happen when every value is negative?',
    ],
    hints: [
      'Think about where a subarray *ends* rather than where it starts. What changes when the end moves one step right?',
      'If you know the best sum ending at $i-1$, you have exactly two options for index $i$: start fresh at $a_i$, or extend. Which values would you compare?',
      'Define $D_i$ as the best sum of a subarray ending at $i$. Then $D_i = \\max(a_i,\\, D_{i-1} + a_i)$, and the answer is the largest $D_i$.',
    ],
    outline: [
      { text: 'Define the state: $D_i$ = best sum of a subarray ending at index $i$.' },
      { text: 'Base case: $D_0 =$', blank: 'D0', answer: 'a0' },
      { text: 'Recurrence: $D_i =$', blank: 'rec', answer: 'max(a_i, D_{i-1} + a_i)' },
      { text: 'Answer: the', blank: 'ans', answer: 'maximum over all D_i' },
    ],
    solution: {
      steps: [
        'Let $D_i$ be the largest sum of a non-empty subarray ending at index $i$.',
        'Set $D_0 = a_0$. For $i \\ge 1$, $D_i = \\max(a_i, D_{i-1} + a_i)$.',
        'A smaller earlier sum can never overtake the largest, because adding $a_i$ keeps their order.',
        'The answer is $\\max_i D_i$, tracked in a second variable.',
      ],
      code: 'def max_subarray(nums: list[int]) -> int:\n    ending_here = best = nums[0]\n    for value in nums[1:]:\n        ending_here = max(value, ending_here + value)\n        best = max(best, ending_here)\n    return best',
    },
    replies: {
      questions: [
        'Good place to look. Before the formula: if you know the best subarray *ending* at the previous index, what are your choices at this one?',
        'Try a tiny case. For $[2, -5, 4]$, write the best sum ending at each index by hand. What do you notice at the last one?',
      ],
      hints: [
        'Compare starting a new subarray at this value with extending the best one from the previous position. What would make you choose one over the other?',
        'You are close. Keep two quantities: the best sum ending here, and the best sum seen anywhere. Which one do you return?',
      ],
      steps: [
        'Step 1: define $D_i$ as the best sum ending at $i$. Step 2: write the choice between $a_i$ and $D_{i-1} + a_i$. Try filling in the outline before opening the solution.',
        'Step 3: keep a separate `best` that records the maximum over all $D_i$. That is what you return.',
      ],
      solution: [
        'Here is the full solution. Read it, close it, and re-derive each line. The check afterwards will not show it.',
      ],
    },
    attempt:
      'def max_subarray(nums):\n    best = 0\n    current = 0\n    for x in nums:\n        current = max(0, current + x)\n        best = max(best, current)\n    return best',
  },
  sheet: {
    summary: 'Orientation only. This feedback does not count as a demonstration of understanding.',
    solution:
      'def max_subarray(nums):\n    best = 0\n    current = 0\n    for x in nums:\n        current = max(0, current + x)\n        best = max(best, current)\n    return best',
    annotations: [
      { line: 2, kind: 'issue', text: 'Starting `best` at $0$ returns $0$ for an all-negative array. The subarray must be non-empty.' },
      { line: 5, kind: 'note', text: 'Resetting to $0$ drops the option “start at $x$” when $x$ is negative but $current$ is worse.' },
      { line: 6, kind: 'ok', text: 'Keeping `best` separate from `current` is the right structure.' },
    ],
  },
  elsewhere: {
    solution:
      'def max_subarray(nums):\n    ending_here = best = nums[0]\n    for x in nums[1:]:\n        ending_here = max(x, ending_here + x)\n        best = max(best, ending_here)\n    return best',
  },
  twin: {
    title: 'Longest increasing run',
    statement:
      'Given integers $a_0, \\dots, a_{n-1}$, find the length of the longest contiguous run that is strictly increasing.',
    worked:
      'Define $L_i$ as the length of the longest increasing run **ending at** $i$. Either the run continues from $i-1$, or it starts fresh at $i$:\n\n$$L_i = \\begin{cases} L_{i-1} + 1 & a_i > a_{i-1} \\\\ 1 & \\text{otherwise} \\end{cases}$$\n\nThe answer is $\\max_i L_i$, kept in a second variable, exactly as for maximum subarray.',
    code: 'def longest_run(a: list[int]) -> int:\n    ending_here = best = 1\n    for i in range(1, len(a)):\n        ending_here = ending_here + 1 if a[i] > a[i - 1] else 1\n        best = max(best, ending_here)\n    return best',
    task: [
      {
        id: 'mx-t1', sub: 'mx-state',
        prompt: 'For $[1, 3, 2, 4, 5, 6]$, what is the answer?',
        choices: [{ id: 'a', label: '$3$' }, { id: 'b', label: '$4$' }, { id: 'c', label: '$6$' }],
        correct: 'b',
        why: 'The run $2, 4, 5, 6$ has length $4$. $L_5 = 4$, and the answer is the maximum over all $L_i$.',
      },
      {
        id: 'mx-t2', sub: 'mx-safe',
        prompt: 'Why is returning $L_{n-1}$ alone not enough?',
        choices: [
          { id: 'a', label: 'The longest run can end at any index, so the answer is the maximum over all $L_i$.' },
          { id: 'b', label: '$L_{n-1}$ is always $1$.' },
          { id: 'c', label: 'The last element is ignored by the recurrence.' },
        ],
        correct: 'a',
        why: 'Like $D_i$, the state ends at $i$. A separate variable must track the best over every end index.',
      },
    ],
    target: ['mx-state', 'mx-safe'],
    sample: {
      complete:
        'It is the same shape. The state is the length of the run ending at $i$. At each index I either extend the previous run or restart at 1, and I keep a separate best because the longest run can end anywhere.',
      partial: 'It is similar to maximum subarray: I keep the length of the run ending at each index and extend it if the next value is bigger.',
      offtrack: 'I would compare every pair of positions and count how many increase in a row.',
    },
  },
}
