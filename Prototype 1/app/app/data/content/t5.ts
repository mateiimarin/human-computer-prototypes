import type { TaskContent } from "../types";

export const t5: TaskContent = {
  taskId: "t5",
  statement:
    "State a loop invariant for the outer loop of `insertion_sort`, and use it to prove that the array is sorted when the algorithm finishes.",
  givens: [],
  code: {
    lang: "python",
    source: `def insertion_sort(a):
    for j in range(1, len(a)):
        key = a[j]
        i = j - 1
        while i >= 0 and a[i] > key:
            a[i + 1] = a[i]
            i -= 1
        a[i + 1] = key`,
  },
  steps: [
    {
      label: "Initialization",
      scaffold: "State the invariant about the prefix before iteration j.",
      placeholder: "State the invariant for the prefix before iteration j…",
    },
    {
      label: "Maintenance",
      scaffold: "Explain what the inner loop does to keep the invariant true.",
      placeholder: "Explain how one iteration of the outer loop keeps it true…",
    },
    {
      label: "Termination",
      scaffold: "Say what the invariant gives you when j reaches the end.",
      placeholder: "Say what the invariant gives you when the loop stops…",
    },
  ],
  hints: [
    "Describe the prefix $a[0..j-1]$ before iteration $j$. What property does it have?",
    "Besides being sorted, what should be true about the elements in that prefix?",
    "What does the inner loop do to the elements larger than $key$?",
    "Where does the inner loop leave $key$, relative to the smaller and larger elements?",
    "When $j$ reaches the end, which positions does the invariant cover?",
  ],
  sampleAnswers: {
    plan: "I'll write what holds for the prefix before each pass, then check j = 1.",
    recall: "The prefix a[0..j-1] is sorted and holds the original elements of a[0..j-1].",
    explanation: "Saying the prefix is sorted is not enough: it could contain different values than the original prefix. The invariant also has to say it holds the same elements.",
  },
  gateQuestion: "Without rereading, which two things does your invariant say about the prefix?",
  starterQuestion: "Before iteration $j$, what can you say about the first $j$ elements?",
  tutor: {
    keywords: [
      {
        test: /invariant|state/i,
        step: 0,
        reply: "Which property of the first $j$ elements does the outer loop rely on?",
      },
      {
        test: /inner|while|shift/i,
        step: 1,
        reply: "What does the inner loop do to the elements that are larger than $key$?",
      },
      {
        test: /terminat|end|finish/i,
        step: 2,
        reply: "What is $j$ when the outer loop exits? Which positions does the invariant then cover?",
      },
      {
        test: /stuck|confus|lost|unclear/i,
        reply: "Which of the three parts feels least solid? Tell me what you have, even if it's rough.",
      },
    ],
    fallbacks: [
      "Is \"sorted\" the only thing the prefix needs to satisfy?",
      "What ensures no element is lost or duplicated by the inner loop?",
      "What does the invariant promise at the moment the outer loop stops?",
    ],
    suggestions: [
      "What should the invariant say?",
      "Do I need to analyse the inner loop?",
      "What is j at the end?",
    ],
  },
  samples: {
    issue: [
      "Invariant: before iteration $j$, the subarray $a[0..j-1]$ is sorted. For $j=1$ it has one element, so it is sorted.",
      "The inner loop shifts larger elements to the right and inserts $key$, so $a[0..j]$ is sorted afterwards.",
      "When the loop ends, $j=n$, so $a[0..n-1]$ is sorted.",
    ],
    repeat: [
      "Invariant: before iteration $j$, the subarray $a[0..j-1]$ is sorted. For $j=1$ it has one element, so it is sorted.",
      "The inner loop shifts larger elements to the right and inserts $key$, so $a[0..j]$ is sorted afterwards.",
      "When the loop ends, $j=n$, so the whole array is sorted.",
    ],
    clear: [
      "Invariant: before iteration $j$, $a[0..j-1]$ is sorted and consists of the original elements $a[0..j-1]$. For $j=1$ it is one element, so it holds.",
      "The inner loop shifts every element larger than $key$ one place right, without losing any, and writes $key$ into the gap. So $a[0..j]$ is sorted and holds the original $a[0..j]$.",
      "When the loop ends, $j=n$. The invariant says $a[0..n-1]$ is sorted and holds the original elements, so the array is sorted.",
    ],
  },
  gap: {
    step: 0,
    title: "Is \"sorted\" enough for an invariant?",
    detail:
      "A sorted prefix could contain different values than the original one. The invariant has to rule that out, otherwise the final claim says nothing about the input.",
    prompt: "What else must be true about the elements of the prefix?",
    revisit: "Initialization: stating an invariant that is strong enough",
  },
  repeatNote:
    "This is the same problem as in your last review. Your earlier explanation is below.",
  supported: [
    "States a property of the prefix and checks it for $j=1$.",
    "Explains how the inner loop places $key$.",
    "Uses $j=n$ at termination.",
  ],
};
