import type { Defaults, Task } from "./types";

/** The exercises on offer. Each one has scripted content in `content/`. */
export const tasks: Task[] = [
  { id: "t1", course: "Discrete Mathematics", title: "A recurrence proof", topic: "Induction" },
  { id: "t2", course: "Discrete Mathematics", title: "Divisibility by 3", topic: "Induction" },
  { id: "t4", course: "Algorithms", title: "Why find_max is correct", topic: "Loop invariants" },
  { id: "t5", course: "Algorithms", title: "The invariant of insertion sort", topic: "Loop invariants" },
];

/** Where every new session starts. The student confirms or changes it in set-up. */
/** Most hints a student can choose. */
export const MAX_HINTS = 5;

export const defaults: Defaults = {
  budget: 3,
  start: "blank",
  starterGuidance: true,
};

/** Length of the pause before more help is granted. */
export const PAUSE_SECONDS = 5;
