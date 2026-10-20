import type {
  Contribution,
  Course,
  HistoryEntry,
  Settings,
  Sheet,
  Task,
  UserProfile,
} from "./types";

const DAY = 86_400_000;
export const daysFromNow = (n: number, hour = 12) => {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  return new Date(d.getTime() + n * DAY).toISOString();
};

export const seedUser: UserProfile = {
  name: "Lukas Brunner",
  email: "lukas.brunner@student.example.edu",
  program: "BSc Computer Science · 3rd semester",
};

export const seedSettings: Settings = {
  mode: "questions",
  budget: 3,
  start: "blank",
  starterGuidance: true,
  pauseSeconds: 5,
  reminders: true,
  weeklyDigest: false,
  reduceMotion: false,
  largeText: false,
};

export const seedCourses: Course[] = [
  {
    id: "dm",
    name: "Discrete Mathematics",
    term: "Autumn 2026",
    tone: "sunrise",
    illo: "stairs",
  },
  {
    id: "alg",
    name: "Algorithms & Data Structures",
    term: "Autumn 2026",
    tone: "dusk",
    illo: "orbit",
  },
  {
    id: "la",
    name: "Linear Algebra",
    term: "Autumn 2026",
    tone: "sky",
    illo: "waves",
  },
];

export const seedSheets: Sheet[] = [
  {
    id: "dm3",
    courseId: "dm",
    number: 3,
    title: "Induction",
    due: daysFromNow(4, 18),
    taskIds: ["t1", "t2", "t3"],
    addedAt: daysFromNow(-6),
  },
  {
    id: "dm2",
    courseId: "dm",
    number: 2,
    title: "Sets and relations",
    due: daysFromNow(-3, 18),
    taskIds: ["d1", "d2"],
    addedAt: daysFromNow(-14),
  },
  {
    id: "alg4",
    courseId: "alg",
    number: 4,
    title: "Sorting",
    due: daysFromNow(-5, 18),
    taskIds: ["a1", "a2"],
    addedAt: daysFromNow(-16),
  },
  {
    id: "la2",
    courseId: "la",
    number: 2,
    title: "Vector spaces",
    due: daysFromNow(-8, 18),
    taskIds: ["l1"],
    addedAt: daysFromNow(-20),
  },
];

export const seedTasks: Task[] = [
  { id: "t1", sheetId: "dm3", courseId: "dm", number: 1, title: "A recurrence proof", topic: "Mathematical induction", minutes: 20 },
  { id: "t2", sheetId: "dm3", courseId: "dm", number: 2, title: "Divisibility by 3", topic: "Mathematical induction", minutes: 25 },
  { id: "t3", sheetId: "dm3", courseId: "dm", number: 3, title: "A geometric sum", topic: "Mathematical induction", minutes: 15 },
  { id: "d1", sheetId: "dm2", courseId: "dm", number: 1, title: "Equivalence relations", topic: "Relations", minutes: 20 },
  { id: "d2", sheetId: "dm2", courseId: "dm", number: 2, title: "Power set identities", topic: "Sets", minutes: 15 },
  { id: "a1", sheetId: "alg4", courseId: "alg", number: 1, title: "Merge sort recurrence", topic: "Sorting", minutes: 25 },
  { id: "a2", sheetId: "alg4", courseId: "alg", number: 2, title: "Quicksort worst case", topic: "Sorting", minutes: 20 },
  { id: "l1", sheetId: "la2", courseId: "la", number: 1, title: "Subspaces of R³", topic: "Vector spaces", minutes: 20 },
];

/** What the add-sheet flow "finds" in any uploaded sheet. */
export const scannedSheet: { sheet: Sheet; tasks: Task[]; excerpts: Record<string, string> } = {
  sheet: {
    id: "alg5",
    courseId: "alg",
    number: 5,
    title: "Loop invariants",
    due: daysFromNow(8, 18),
    taskIds: ["t4", "t5"],
    addedAt: new Date().toISOString(),
  },
  tasks: [
    { id: "t4", sheetId: "alg5", courseId: "alg", number: 1, title: "Why find_max is correct", topic: "Loop invariants", minutes: 20 },
    { id: "t5", sheetId: "alg5", courseId: "alg", number: 2, title: "The invariant of insertion sort", topic: "Loop invariants", minutes: 25 },
  ],
  excerpts: {
    t4: "Use a loop invariant to prove that find_max returns the largest element of any non-empty array.",
    t5: "State a loop invariant for the outer loop of insertion_sort and use it to prove the array is sorted.",
  },
};

const you = (id: string, title: string, evidence: string, step: number | null = null): Contribution => ({
  id,
  origin: "you",
  title,
  evidence,
  step,
});
const prompted = (id: string, title: string, evidence: string): Contribution => ({
  id,
  origin: "prompted",
  title,
  evidence,
  step: null,
});
const supplied = (id: string, title: string, evidence: string): Contribution => ({
  id,
  origin: "supplied",
  title,
  evidence,
  step: null,
});

function past(
  taskId: string,
  daysAgo: number,
  outcome: HistoryEntry["outcome"],
  entries: Contribution[],
  gaps: string[] = [],
  hintsUsed = 0,
  attempts = 1,
): HistoryEntry {
  return {
    id: `h-${taskId}`,
    taskId,
    finishedAt: daysFromNow(-daysAgo, 19),
    outcome,
    gaps,
    entries,
    attempts,
    hintsUsed,
    live: false,
  };
}

export const seedHistory: HistoryEntry[] = [
  past(
    "t3",
    1,
    "resolved",
    [
      you("a", "Base case", "For $n=0$, $\\sum_{i=0}^{0}2^i=1=2^1-1$."),
      you("b", "Induction step", "Add $2^{k+1}$ to both sides and simplify to $2^{k+2}-1$."),
      prompted("c", "Tutor question", "What does the right-hand side look like for $k+1$?"),
      you("d", "Response to the question", "It should be $2^{k+2}-1$, so I need to add $2^{k+1}$."),
      supplied("e", "Hint 1", "Start by writing the sum up to $k+1$ as the sum up to $k$ plus one term."),
    ],
    [],
    1,
    1,
  ),
  past(
    "d1",
    6,
    "gaps",
    [
      you("a", "Reflexivity", "Every element is related to itself, since $a-a=0$ is a multiple of 3."),
      you("b", "Symmetry", "If $a-b$ is a multiple of 3, so is $b-a$."),
      prompted("c", "Tutor question", "Which of the three properties have you not checked yet?"),
      you("d", "Transitivity (draft)", "If $a\\sim b$ and $b\\sim c$ then... I'm not sure how to combine them."),
    ],
    ["Transitivity: combining two multiples of 3"],
    0,
    2,
  ),
  past(
    "d2",
    6,
    "resolved",
    [
      you("a", "Both inclusions", "Showed $\\mathcal{P}(A\\cap B)\\subseteq\\mathcal{P}(A)\\cap\\mathcal{P}(B)$ and the reverse."),
      supplied("b", "Hint 1", "Pick an arbitrary element of one side and follow its definition."),
      you("c", "Reasoning after the hint", "I'll start with an arbitrary subset $X$ and check both membership conditions."),
    ],
    [],
    1,
    1,
  ),
  past(
    "a1",
    9,
    "resolved",
    [
      you("a", "Recurrence", "$T(n)=2T(n/2)+n$ with $T(1)=1$."),
      you("b", "Recursion tree", "Each of the $\\log_2 n$ levels costs $n$, so $T(n)=n\\log_2 n+n$."),
      prompted("c", "Tutor question", "How many levels does the recursion tree have?"),
      you("d", "Response to the question", "$\\log_2 n$ levels, because $n$ halves each time."),
    ],
    [],
    0,
    1,
  ),
  past(
    "a2",
    9,
    "gaps",
    [
      you("a", "Worst-case input", "An already sorted array with the first element as pivot."),
      supplied("b", "Hint 1", "Look at the sizes of the two subarrays for the pivot you described."),
      supplied("c", "Hint 2", "One of the two subarrays is empty each time."),
      you("d", "Reasoning after the hint", "So the recursion depth is $n$ and each level scans the remaining elements."),
    ],
    ["Summing the cost across levels to reach $\\Theta(n^2)$"],
    2,
    1,
  ),
  past(
    "l1",
    12,
    "resolved",
    [
      you("a", "Closure under addition", "Adding two vectors that satisfy $x+y+z=0$ gives another that does."),
      you("b", "Zero vector", "$(0,0,0)$ satisfies the equation."),
      you("c", "Scalar multiples", "Multiplying by $c$ keeps the sum at $c\\cdot0=0$."),
      prompted("d", "Tutor question", "Is the zero vector in your set?"),
    ],
    [],
    0,
    1,
  ),
];
