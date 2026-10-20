import type { TaskContent } from "../types";

export const t4: TaskContent = {
  taskId: "t4",
  statement:
    "Use a loop invariant to prove that `find_max` returns the largest element of any non-empty array $a$ of length $n$.",
  givens: [],
  code: {
    lang: "python",
    source: `def find_max(a):
    m = a[0]
    for i in range(1, len(a)):
        if a[i] > m:
            m = a[i]
    return m`,
  },
  reminder: "An invariant is a statement about the state before an iteration, not a description of what the loop does.",
  steps: [
    {
      label: "Initialization",
      scaffold: "State the invariant, then show it holds before the first iteration.",
      placeholder: "State your invariant, then check it before the first iteration…",
    },
    {
      label: "Maintenance",
      scaffold: "Assume it holds before an iteration. Show it holds before the next one.",
      placeholder: "Assume the invariant before iteration i and show it holds after…",
    },
    {
      label: "Termination",
      scaffold: "Use the invariant at the moment the loop ends.",
      placeholder: "Say what the invariant gives you when the loop stops…",
    },
  ],
  hints: [
    "Say what the invariant claims about $m$ before the first iteration, when $i=1$.",
    "Write the invariant in terms of $i$: what does $m$ hold when the loop is about to read $a[i]$?",
    "For maintenance, split the iteration into the cases $a[i]>m$ and $a[i]\\leq m$.",
    "When the loop ends, what is the value of $i$? What does the invariant say about it?",
    "Connect the invariant at termination to the claim you set out to prove.",
  ],
  gateQuestion: "Without rereading, what does your invariant say about $m$?",
  starterQuestion: "After the first line, what do you know about $m$ before the loop starts?",
  tutor: {
    keywords: [
      {
        test: /invariant|state/i,
        step: 0,
        reply: "What should be true about $m$ every time the loop is about to start an iteration?",
      },
      {
        test: /maintenance|iteration|if/i,
        step: 1,
        reply: "How many cases does the if-statement split an iteration into? What happens to $m$ in each?",
      },
      {
        test: /terminat|end|finish|stop/i,
        step: 2,
        reply: "What is the value of $i$ when the loop exits, and what does the invariant say then?",
      },
      {
        test: /stuck|confus|lost|unclear/i,
        reply: "Which of the three parts feels least solid? Tell me what you have, even if it's rough.",
      },
    ],
    fallbacks: [
      "What does $m$ represent at the top of each iteration?",
      "Which case of the if-statement have you not covered yet?",
      "What does the invariant promise at the exact moment the loop stops?",
    ],
    suggestions: [
      "How do I phrase the invariant?",
      "Do I need both cases in maintenance?",
      "What is i at the end?",
    ],
  },
  samples: {
    issue: [
      "Before the first iteration $i=1$ and $m=a[0]$, which is the maximum of $a[0..0]$.",
      "Invariant: before iteration $i$, $m$ is the maximum of $a[0..i-1]$.\nIn each iteration $m$ only grows, so it stays a maximum.",
      "The loop ends and $m$ is returned.",
    ],
    repeat: [
      "Before the first iteration $i=1$ and $m=a[0]$, which is the maximum of $a[0..0]$.",
      "Invariant: before iteration $i$, $m$ is the maximum of $a[0..i-1]$.\nThe value of $m$ never decreases, so it is still a maximum afterwards.",
      "The loop ends and $m$ is returned.",
    ],
    clear: [
      "Invariant: before iteration $i$, $m=\\max(a_0,\\dots,a_{i-1})$. For $i=1$, $m=a_0$, so it holds.",
      "Assume it holds before iteration $i$. If $a_i>m$, the loop sets $m=a_i$, the new maximum. Otherwise $m\\geq a_i$ and stays. Either way $m=\\max(a_0,\\dots,a_i)$.",
      "The loop ends with $i=n$. The invariant gives $m=\\max(a_0,\\dots,a_{n-1})$, the largest element of the array.",
    ],
  },
  gap: {
    step: 1,
    title: "Does the invariant survive an iteration?",
    detail:
      "\"m only grows\" doesn't show that m equals the maximum of the longer prefix. It leaves out the case where $a[i]$ is not larger than $m$.",
    prompt: "What is $m$ after an iteration in which $a[i]\\leq m$?",
    revisit: "Maintenance: covering every branch of the loop body",
  },
  repeatNote:
    "This is the same gap as in your last review. Your explanation from attempt 1 is below.",
  supported: [
    "States the invariant and checks it for $i=1$.",
    "Covers both branches of the if-statement.",
    "Uses the invariant at $i=n$ to conclude about the whole array.",
  ],
};
