import type { Pack } from '../types'
import { concept } from '../catalog'

export const coinChange: Pack = {
  id: 'coin-change',
  title: 'Coin change, fewest coins',
  sheetNo: '4.2',
  topicId: 'dp',
  statement:
    'You have coin values $c_1, \\dots, c_k$ with an unlimited supply of each. Find the **minimum number of coins** that add up to exactly $T$, or report that it is impossible.',
  example: 'With coins $\\{1, 3, 4\\}$ and $T = 6$ the answer is $2$, using $3 + 3$.',
  subs: [concept('dp-state'), concept('dp-recurrence'), concept('dp-base')],
  quiz: [
    {
      id: 'cc-q1', sub: 'dp-state', prompt: 'Coin change asks for the fewest coins that add up to a total. In the usual dynamic-programming solution, what does $F(x)$ represent?',
      choices: [
        { id: 'a', label: 'The number of different ways to form amount $x$.' },
        { id: 'b', label: 'The fewest coins whose values sum to exactly $x$.' },
        { id: 'c', label: 'The largest coin that is at most $x$.' },
      ],
      correct: 'b',
      why: '$F(x)$ is a minimum count for one exact amount. Counting ways is a different recurrence (with sums, not minima).',
    },
    {
      id: 'cc-q2', sub: 'dp-recurrence', prompt: 'In that solution, how is $F(x)$ computed from smaller amounts?',
      choices: [
        { id: 'a', label: '$F(x) = F(x - c_{\\max}) + 1$, always taking the largest coin.' },
        { id: 'b', label: '$F(x) = \\min_c F(x - c)$ over all coins $c \\le x$.' },
        { id: 'c', label: '$F(x) = 1 + \\min_c F(x - c)$ over all coins $c \\le x$.' },
      ],
      correct: 'c',
      why: 'Whichever coin you use last adds one to the count for the remainder. Trying every coin makes the minimum safe.',
    },
    {
      id: 'cc-q3', sub: 'dp-base', prompt: 'In that solution, what value should $F(x)$ have when the amount $x$ cannot be formed?',
      choices: [
        { id: 'a', label: '$0$, since no coins are used.' },
        { id: 'b', label: '$\\infty$, a value that can never win a minimum.' },
        { id: 'c', label: '$-1$, used directly inside the minimum.' },
      ],
      correct: 'b',
      why: 'An infinite value loses every comparison, so impossible remainders are never chosen. Stored as $0$ or $-1$ they would win.',
    },
  ],
  claims: [
    {
      id: 'cc-c1', sub: 'dp-recurrence', justify: true,
      prompt: '“Always taking the largest coin that still fits gives the fewest coins.”',
      choices: [{ id: 'true', label: 'True.' }, { id: 'false', label: 'False. The largest coin can lead to more coins overall.' }],
      correct: 'false',
      why: 'With coins $\\{1, 3, 4\\}$ and $T = 6$, greedy gives $4+1+1$ (three coins) while $3+3$ uses two.',
    },
    {
      id: 'cc-c2', sub: 'dp-base', justify: true,
      prompt: '“$F(0) = 0$ is needed even though nobody asks for amount $0$.”',
      choices: [{ id: 'true', label: 'True. Every amount reduces to $0$ at the end.' }, { id: 'false', label: 'False.' }],
      correct: 'true',
      why: 'When the last coin exactly matches $x$, the remainder is $0$ and must cost $0$ coins.',
    },
  ],
  defend: [
    {
      id: 'cc-d1', sub: 'dp-recurrence',
      prompt: 'Why do you take the minimum over all coins instead of just one?',
      choices: [
        { id: 'a', label: 'The best last coin is not known in advance, so every option has to be tried.' },
        { id: 'b', label: 'It makes the loop shorter.' },
        { id: 'c', label: 'Coins are sorted, so the first one always works.' },
      ],
      correct: 'a',
      why: 'The recurrence is correct only because it covers every possible last coin.',
    },
    {
      id: 'cc-d2', sub: 'dp-state',
      prompt: 'Why can $F(x)$ be computed from smaller amounts only?',
      choices: [
        { id: 'a', label: 'Each coin has positive value, so $x - c < x$.' },
        { id: 'b', label: 'Because the table is filled left to right by convention.' },
        { id: 'c', label: 'Because amounts are always even.' },
      ],
      correct: 'a',
      why: 'Positive coin values guarantee that every remainder is strictly smaller, so no circular dependency.',
    },
    {
      id: 'cc-d3', sub: 'dp-base',
      prompt: 'What goes wrong if impossible amounts are stored as $0$?',
      choices: [
        { id: 'a', label: 'Nothing, since $0$ means no coins.' },
        { id: 'b', label: 'The minimum picks a fake “free” path and reports too few coins.' },
        { id: 'c', label: 'The loop runs forever.' },
      ],
      correct: 'b',
      why: 'A stored $0$ is smaller than any real count, so impossible remainders would win the minimum.',
    },
  ],
  mistakes: {
    title: 'A solution with one planted mistake',
    lines: [
      'Let $F(x)$ be the fewest coins that sum to exactly $x$.',
      'Set $F(0) = 0$ and $F(x) = \\infty$ for $x > 0$.',
      'For $x = 1, \\dots, T$: $F(x) = \\min_{c \\le x} F(x - c)$.',
      'If $F(T) = \\infty$ report “impossible”.',
      'Otherwise return $F(T)$.',
    ],
    faulty: 2,
    whys: [
      { id: 'a', label: 'The coin used last is never counted, so every $F(x)$ stays $0$ or $\\infty$.' },
      { id: 'b', label: 'It should iterate over coins first, then amounts.' },
      { id: 'c', label: 'It should use $\\max$ so that the largest coin wins.' },
    ],
    correctWhy: 'a',
    explanation: 'The recurrence needs $1 + \\min_c F(x-c)$: the coin just used adds one to the count. Without it no count ever grows.',
    sub: 'dp-recurrence',
  },
  explain: {
    prompt: 'Explain the approach, the key steps, and why they hold.',
    points: [
      { sub: 'dp-state', label: 'Defines $F(x)$ as the fewest coins for exactly $x$' },
      { sub: 'dp-recurrence', label: 'Takes $1 + \\min$ over every coin as the last coin' },
      { sub: 'dp-base', label: 'Handles $F(0)=0$ and unreachable amounts with $\\infty$' },
    ],
    feedback: {
      complete: {
        covered: ['$F(x)$ defined as fewest coins for exactly $x$', 'Minimum over every last coin, plus one', 'Base case and infinity for impossible amounts'],
        gap: null,
        next: 'No gap on these points. Continue to the post-quiz, or add a deeper check.',
      },
      partial: {
        covered: ['$F(x)$ defined as fewest coins for exactly $x$', 'Minimum over every last coin, plus one'],
        gap: { sub: 'dp-base', text: 'The base case and the value for impossible amounts are missing. Say what $F(0)$ is and what an unreachable remainder holds.' },
        next: 'Add the base case and the impossible-amount rule, then continue.',
      },
      offtrack: {
        covered: [],
        gap: { sub: 'dp-recurrence', text: 'Taking the biggest coin is greedy and fails for some coin sets, e.g. $\\{1,3,4\\}$ with $T=6$. The recurrence has to try every coin.' },
        next: 'Rewrite around $F(x)$ and the minimum over all coins, then continue.',
      },
    },
  },
  work: {
    minutes: 14,
    opening: 'Start anywhere. Paste an attempt, describe your idea, or ask me to check a small case.',
    questions: [
      'If the last coin used is $c$, what remains to be paid?',
      'For coins $\\{1, 3, 4\\}$ and $T = 6$, can you find an answer that beats “always take the largest”?',
      'What should the table hold for amounts that cannot be formed?',
    ],
    hints: [
      'Pick the *last* coin. Whatever it is, the rest is the same problem with a smaller amount.',
      'You do not know the best last coin, so try them all. What do you add for the coin you just used?',
      'Let $F(x)$ be the fewest coins for exactly $x$. $F(0)=0$, and $F(x) = 1 + \\min_{c \\le x} F(x-c)$ with $\\infty$ for unreachable remainders.',
    ],
    outline: [
      { text: 'Define $F(x)$ = fewest coins that sum to exactly $x$.' },
      { text: 'Base case: $F(0) =$', blank: 'F0', answer: '0' },
      { text: 'Transition: $F(x) =$', blank: 'tr', answer: '1 + min F(x - c)' },
      { text: 'Unreachable amounts hold', blank: 'inf', answer: 'infinity' },
    ],
    solution: {
      steps: [
        'Let $F(x)$ be the fewest coins whose values sum to exactly $x$.',
        '$F(0) = 0$ and $F(x) = \\infty$ until a coin reaches it.',
        'For $x \\ge 1$: $F(x) = 1 + \\min_{c \\le x} F(x - c)$.',
        'Return $F(T)$, or “impossible” if it is still $\\infty$.',
      ],
      code: 'def min_coins(coins: list[int], T: int) -> int:\n    INF = float("inf")\n    F = [0] + [INF] * T\n    for x in range(1, T + 1):\n        for c in coins:\n            if c <= x:\n                F[x] = min(F[x], 1 + F[x - c])\n    return F[T] if F[T] < INF else -1',
    },
    replies: {
      questions: [
        'Take $T = 6$ with coins $\\{1,3,4\\}$. What are the possible last coins, and what remains in each case?',
        'Which remainders could be impossible, and what would you want the table to say for them?',
      ],
      hints: [
        'Try each coin as the last one and look at what remains. Which of those remainders did you already solve?',
        'You are close. What do you add to $F(x-c)$ to account for the coin you just used?',
      ],
      steps: [
        'Step 1: define $F(x)$. Step 2: $F(0)=0$. Step 3: $F(x) = 1 + \\min_c F(x-c)$. Fill in the outline before opening the solution.',
        'Step 4: use $\\infty$ for impossible remainders so they never win the minimum.',
      ],
      solution: ['Here is the full solution. Read it, close it, and re-derive each line. The check afterwards will not show it.'],
    },
  },
  twin: {
    title: 'Minimum cost climbing stairs',
    statement: 'Each stair $i$ has a cost $c_i$. From stair $i$ you may climb one or two stairs. Find the cheapest way to reach the top, starting from stair $0$ or $1$.',
    worked: 'Define $G(i)$ as the cheapest cost of standing on stair $i$. The last move came from $i-1$ or $i-2$:\n\n$$G(i) = c_i + \\min\\bigl(G(i-1),\\, G(i-2)\\bigr)$$\n\nAs in coin change, every possible last move is tried and the cost of the move is added.',
    code: 'def min_cost(cost: list[int]) -> int:\n    a, b = cost[0], cost[1]\n    for i in range(2, len(cost)):\n        a, b = b, cost[i] + min(a, b)\n    return min(a, b)',
    task: [
      {
        id: 'cc-t1', sub: 'dp-recurrence', prompt: 'Why does $G(i)$ take a minimum over two predecessors?',
        choices: [
          { id: 'a', label: 'The best last move is unknown, so both are tried.' },
          { id: 'b', label: 'Stairs are always climbed two at a time.' },
          { id: 'c', label: 'The cost is always the smaller of the two stairs.' },
        ],
        correct: 'a', why: 'As with coins, the recurrence considers every possible last step.',
      },
      {
        id: 'cc-t2', sub: 'dp-base', prompt: 'Which value must the base cases $G(0)$ and $G(1)$ hold?',
        choices: [
          { id: 'a', label: 'Their own stair costs, because starting there is free.' },
          { id: 'b', label: '$\\infty$.' },
          { id: 'c', label: '$0$ for both.' },
        ],
        correct: 'a', why: 'Standing on stair 0 or 1 costs only that stair; the recurrence builds from those two values.',
      },
    ],
    target: ['dp-recurrence', 'dp-base'],
  },
  /** Prepared text for the “Fill sample” chips. Each sample matches the feedback written for it. */
  sampleAnswers: {
    message: 'I think greedy works: always take the largest coin that still fits.',
    explain: {
      complete:
        'I compute the fewest coins for every amount up to $T$. For an amount $x$ I try every coin as the last one: the count is one plus the count for what remains. I take the minimum. $F(0)$ is $0$, and amounts that cannot be formed are infinity so they never win a minimum.',
      partial:
        'I fill a table of the fewest coins for each amount. For each amount I try every coin and take the minimum of the counts for the remainders, plus one.',
      offtrack: 'I would keep taking the biggest coin that fits until I reach $T$.',
    },
    similar: {
      complete: 'The state is the cheapest cost of standing on stair $i$. I try both possible last moves, add the stair cost, and the first two stairs are base cases.',
      partial: 'It is like coin change. I compute the cheapest cost for each stair from the two before it.',
      offtrack: 'I would always take the cheaper of the next two stairs.',
    },
    elsewhere:
      'def min_coins(coins, T):\n    INF = float("inf")\n    F = [0] + [INF] * T\n    for x in range(1, T + 1):\n        for c in coins:\n            if c <= x:\n                F[x] = min(F[x], 1 + F[x - c])\n    return F[T] if F[T] < INF else -1',
    why: {
      'cc-c1': 'The largest coin can lead to more coins overall. With coins 1, 3 and 4 and a total of 6, greedy gives 4+1+1 but 3+3 needs fewer.',
      'cc-c2': 'Every amount eventually reduces to 0 when the last coin matches exactly, and that remainder has to cost 0 coins.',
      'cc-d1': 'It does not work because the best last coin is not known in advance, so the recurrence has to try every coin and take the minimum.',
      'cc-d2': 'It does not work because every coin has a positive value, so each remainder is strictly smaller and the table can be filled in order.',
      'cc-d3': 'It does not work because a stored 0 is smaller than any real count, so an impossible amount would win the minimum and report too few coins.',
    },
  },
}
