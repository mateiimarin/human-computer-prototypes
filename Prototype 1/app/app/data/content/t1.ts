import type { TaskContent } from "../types";

export const t1: TaskContent = {
  taskId: "t1",
  statement:
    "Use induction to show that $T(n)=n^2$ for all integers $n\\geq1$, where",
  givens: ["$T(1)=1$", "$T(n)=T(n-1)+2n-1$ for $n\\geq2$"],
  reminder: "Keep the case you assume separate from the case you need to establish.",
  steps: [
    {
      label: "Base case",
      scaffold: "Check the claim for the smallest allowed value of n.",
      placeholder: "Start with the smallest value of n the claim covers…",
    },
    {
      label: "Induction hypothesis",
      scaffold: "State the case you are allowed to assume.",
      placeholder: "Say exactly what you assume, and for which value…",
    },
    {
      label: "Induction step",
      scaffold: "Use the recurrence to connect that case to the next one.",
      placeholder: "Connect the next case to the one you assumed…",
    },
  ],
  hints: [
    "Start with the smallest allowed value of n. What does the recurrence give you?",
    "Keep the case you assume separate from the next case you need to establish.",
    "Relate the next term to the previous one before expanding.",
    "Which part of your expression can use the induction hypothesis?",
    "Compare your expanded expression with the claim for the next integer.",
  ],
  gateQuestion: "Without rereading, what does your hypothesis assume?",
  starterQuestion: "What is the smallest value of n you need to check?",
  tutor: {
    keywords: [
      {
        test: /base|first|smallest|start/i,
        step: 0,
        reply:
          "What is the smallest value of n the claim covers? What does the given value of $T$ say there?",
      },
      {
        test: /hypothes|assume|suppose/i,
        step: 1,
        reply:
          "Look at the case you are assuming. What does it let you say about the next term?",
      },
      {
        test: /recurrence|T\(|expand/i,
        step: 2,
        reply:
          "Write the recurrence for the next term. Which part of it already appears in your hypothesis?",
      },
      {
        test: /stuck|confus|lost|unclear/i,
        reply:
          "Which of your three steps feels least solid right now? Tell me what you have there, even if it's rough.",
      },
    ],
    fallbacks: [
      "Look at the case you are assuming. What does it let you say about the next term?",
      "Which step could you try next using the recurrence?",
      "What would you need to know about the previous term to say something about this one?",
    ],
    suggestions: [
      "I'm not sure what to assume",
      "How do I use the recurrence?",
      "Is my base case enough?",
    ],
  },
  samples: {
    issue: [
      "For $n=1$, $T(1)=1=1^2$, so the base case holds.",
      "Assume $T(k+1)=(k+1)^2$ for an integer $k\\geq1$.",
      "From the recurrence, $T(k+1)=T(k)+2(k+1)-1$.\nI need to connect this expression to the induction hypothesis.",
    ],
    repeat: [
      "For $n=1$, $T(1)=1=1^2$, so the base case holds.",
      "Assume $T(k+1)=(k+1)^2$ for an integer $k\\geq1$.",
      "I rewrote the recurrence: $T(k+1)=T(k)+2k+1$.\nMy hypothesis is still about the next case.",
    ],
    clear: [
      "For $n=1$, $T(1)=1=1^2$, so the base case holds.",
      "Assume $T(k)=k^2$ for a fixed integer $k\\geq1$.",
      "Then $T(k+1)=T(k)+2(k+1)-1=k^2+2k+1=(k+1)^2$.\nThe next case follows, so the claim holds for every integer $n\\geq1$.",
    ],
  },
  gap: {
    step: 1,
    title: "What can you safely assume?",
    detail:
      "The hypothesis states the claim at $k+1$, which is the case you still have to establish. An assumption can only cover the case before it.",
    prompt: "Which case may you assume, and which one are you proving?",
    revisit: "Induction hypothesis: separating the assumed case from the case to prove",
  },
  repeatNote:
    "This is the same gap as in your last review. Your explanation from attempt 1 is below.",
  supported: [
    "Checked for the smallest allowed value, n = 1.",
    "Assumes the claim for a fixed k, not for k + 1.",
    "Connects the next case to the assumed one through the recurrence.",
  ],
};
