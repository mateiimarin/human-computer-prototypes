export type Scenario = "issue" | "repeat" | "clear";
export type Mode = "questions" | "hints";
export type StartApproach = "blank" | "scaffold";
export type Origin = "you" | "prompted" | "supplied" | "setting";
export type Blocks = [string, string, string];
export type Tone = "sunrise" | "dusk" | "sky" | "meadow" | "coral";
export type IlloName = "stairs" | "hills" | "orbit" | "blocks" | "waves" | "sun";
export type Phase = "setup" | "work" | "review" | "reflect" | "done";

export interface Course {
  id: string;
  name: string;
  term: string;
  tone: Tone;
  illo: IlloName;
}

export interface Sheet {
  id: string;
  courseId: string;
  title: string;
  number: number;
  /** ISO date */
  due: string;
  taskIds: string[];
  addedAt: string;
}

export interface Task {
  id: string;
  sheetId: string;
  courseId: string;
  number: number;
  title: string;
  topic: string;
  minutes: number;
}

export interface ReviewGap {
  step: number;
  title: string;
  detail: string;
  /** A question that points at the gap without resolving it. */
  prompt: string;
  /** Short phrase shown under "Points to revisit". */
  revisit: string;
}

export interface TaskContent {
  taskId: string;
  statement: string;
  givens: string[];
  code?: { lang: string; source: string };
  reminder: string;
  steps: { label: string; scaffold: string; placeholder: string }[];
  hints: string[];
  gateQuestion: string;
  starterQuestion: string;
  tutor: {
    keywords: { test: RegExp; reply: string; step?: number }[];
    fallbacks: string[];
    suggestions: string[];
  };
  samples: Record<Scenario, Blocks>;
  gap: ReviewGap;
  repeatNote: string;
  supported: [string, string, string];
}

export interface Exchange {
  question: string;
  reply: string;
  /** The step the student said the question is about. */
  about?: number | null;
  /** The step the reply sends the student back to. */
  step?: number | null;
  locked?: boolean;
}

export interface Review {
  version: number;
  blocks: Blocks;
  outcome: Scenario;
  explanation: string;
  explained: boolean;
  at: string;
}

export interface Session {
  taskId: string;
  phase: Phase;
  started: boolean;
  startedAt: string;
  mode: Mode;
  budget: number;
  start: StartApproach;
  starterGuidance: boolean;
  blocks: Blocks;
  revealedHints: number[];
  gate: "hint" | "reasoning" | "recall";
  gateResponses: string[];
  exchanges: Exchange[];
  policyHistory: string[];
  reviews: Review[];
  scenario: Scenario;
  attachment: boolean;
  /** Attribution id → optional note. Presence means flagged. */
  flags: Record<string, string>;
  focusStep: number | null;
  /** Open the tutor panel on arrival in the workspace (set by "Show in tutor"). */
  openTutor?: boolean;
  /** The step chosen in the tutor composer, kept while the panel changes. */
  aboutDraft?: number | null;
  tutorDraft: string;
  gateDraft: string;
  explainDraft: string;
  seenReview: number;
  finishedAt: string | null;
}

export interface Contribution {
  id: string;
  origin: Origin;
  title: string;
  evidence: string;
  step: number | null;
  /** Where "Show in…" leads when it is not an attempt step. */
  target?: "tutor";
}

export interface HistoryEntry {
  id: string;
  taskId: string;
  finishedAt: string;
  /** "resolved" or "gaps" (finished with something to revisit) */
  outcome: "resolved" | "gaps";
  gaps: string[];
  entries: Contribution[];
  attempts: number;
  hintsUsed: number;
  /** Present when it came from a live session, so it can be reopened. */
  live: boolean;
  session?: Session;
  flags?: Record<string, string>;
}

export interface Settings {
  mode: Mode;
  budget: number;
  start: StartApproach;
  starterGuidance: boolean;
  pauseSeconds: number;
  reminders: boolean;
  weeklyDigest: boolean;
  reduceMotion: boolean;
  largeText: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  program: string;
}
