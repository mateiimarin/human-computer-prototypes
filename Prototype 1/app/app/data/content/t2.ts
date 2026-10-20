import type { TaskContent } from "../types";

export const t2: TaskContent = {
  taskId: "t2",
  statement:
    "Show by induction that $n^3-n$ is divisible by $3$ for every integer $n\\geq1$.",
  givens: ["Write $3\\mid m$ when $m$ is an integer multiple of $3$."],
  reminder: "The step has to use your hypothesis. An expansion on its own isn't a proof.",
  steps: [
    {
      label: "Base case",
      scaffold: "Evaluate the expression for the smallest allowed n.",
      placeholder: "Evaluate the expression for the first value of n…",
    },
    {
      label: "Induction hypothesis",
      scaffold: "Write the assumption as an equation with an integer.",
      placeholder: "Write what you assume about k, with a name for the multiple…",
    },
    {
      label: "Induction step",
      scaffold: "Expand the expression for k + 1 and look for the assumed part.",
      placeholder: "Expand the expression for k + 1 and show where the hypothesis enters…",
    },
  ],
  hints: [
    "What is $1^3-1$, and is it a multiple of 3?",
    "Assume the divisibility for $k$ and write it as an equation, such as $k^3-k=3m$.",
    "Expand $(k+1)^3$ before you subtract $k+1$.",
    "After expanding, which part of the expression is $k^3-k$?",
    "What is left once you take out $k^3-k$? Why is that part a multiple of 3?",
  ],
  gateQuestion: "Without rereading, what is the equation you assume for k?",
  starterQuestion: "What is the expression equal to when n is the smallest allowed value?",
  tutor: {
    keywords: [
      {
        test: /base|first|smallest|start/i,
        step: 0,
        reply: "Evaluate the expression at the smallest allowed n. Is the result a multiple of 3?",
      },
      {
        test: /hypothes|assume|suppose/i,
        step: 1,
        reply:
          "Can you write the assumption as an equation, giving the multiple of 3 a name?",
      },
      {
        test: /expand|cube|\(k\+1\)/i,
        step: 2,
        reply: "After you expand, which part of the result looks like the expression for k?",
      },
      {
        test: /stuck|confus|lost|unclear/i,
        reply: "Which of your steps do you trust least? Tell me what you have there, even if it's rough.",
      },
    ],
    fallbacks: [
      "Which part of your expansion can you replace using the hypothesis?",
      "What would make the leftover part a multiple of 3?",
      "What does your hypothesis give you that the expansion doesn't yet use?",
    ],
    suggestions: [
      "Where does the hypothesis go in the step?",
      "Do I need to expand the cube?",
      "Is 0 a multiple of 3?",
    ],
  },
  samples: {
    issue: [
      "For $n=1$, $1^3-1=0=3\\cdot0$, so $3\\mid0$.",
      "Assume $3\\mid k^3-k$ for some integer $k\\geq1$.",
      "$(k+1)^3-(k+1)=k^3+3k^2+3k+1-k-1=k^3+3k^2+2k$.\nThis is divisible by 3 because of the $3k^2$ term.",
    ],
    repeat: [
      "For $n=1$, $1^3-1=0=3\\cdot0$, so $3\\mid0$.",
      "Assume $3\\mid k^3-k$ for some integer $k\\geq1$.",
      "Expanding gives $k^3+2k+3k^2$. The term $3k^2$ is a multiple of 3, so the sum is too.",
    ],
    clear: [
      "For $n=1$, $1^3-1=0=3\\cdot0$, so $3\\mid0$.",
      "Assume $k^3-k=3m$ for some integer $m$ and a fixed $k\\geq1$.",
      "$(k+1)^3-(k+1)=(k^3-k)+3k^2+3k=3m+3(k^2+k)=3(m+k^2+k)$.\nThis is a multiple of 3, which completes the step.",
    ],
  },
  gap: {
    step: 2,
    title: "Where does the hypothesis enter?",
    detail:
      "The expansion is correct, but the conclusion rests on one term only. The remaining terms are not accounted for, and the hypothesis from step 2 is never used.",
    prompt: "Which terms are left after $3k^2$, and what do you know about them?",
    revisit: "Induction step: using the hypothesis for every remaining term",
  },
  repeatNote:
    "This is the same gap as in your last review. Your explanation from attempt 1 is below.",
  supported: [
    "Evaluates $1^3-1$ and recognises it as a multiple of 3.",
    "Names the assumption for k.",
    "Expands $(k+1)^3-(k+1)$ and relates it to the assumption.",
  ],
};
