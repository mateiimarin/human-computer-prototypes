export type Scenario = "issue" | "repeat" | "clear";
export type StartApproach = "blank" | "scaffold";
export type Origin = "you" | "prompted" | "supplied" | "setting";
export type Blocks = [string, string, string];
export type Phase = "setup" | "work" | "review" | "reflect" | "done";

export interface Task {
  id: string;
  /** Subject shown under the title, e.g. "Discrete Mathematics". */
  course: string;
  title: string;
  topic: string;
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
  steps: { label: string; scaffold: string; placeholder: string }[];
  hints: string[];
  /** Text the "fill with sample" buttons put into open-ended inputs. */
  sampleAnswers: { plan: string; recall: string; explanation: string };
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

/** One line of the tutor chat. Display only: contributions are derived from hints, exchanges and answers. */
export interface ChatMessage {
  role: "you" | "tutor";
  kind: "text" | "hint" | "question";
  text: string;
  /** Hint number, for kind "hint". */
  hint?: number;
  /** The step a tutor reply sends the student back to. */
  step?: number | null;
  locked?: boolean;
  /** The step a student's message is about. */
  about?: number | null;
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
  /** How many hints the student agreed to (0–5). 0 means the tutor only asks questions. */
  budget: number;
  start: StartApproach;
  starterGuidance: boolean;
  blocks: Blocks;
  revealedHints: number[];
  gate: "hint" | "reasoning" | "recall";
  gateResponses: string[];
  exchanges: Exchange[];
  chat: ChatMessage[];
  policyHistory: string[];
  reviews: Review[];
  scenario: Scenario;
  /** Contribution id → the student's correction of its label (see relabelChoices). */
  flags: Record<string, string>;
  focusStep: number | null;
  /** Open the tutor panel on arrival in the workspace (set by "Show in tutor"). */
  openTutor?: boolean;
  /** What is typed in the tutor chat, kept while the panel changes. */
  tutorDraft: string;
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

/** The assistance agreement a new session starts from. */
export interface Defaults {
  budget: number;
  start: StartApproach;
  starterGuidance: boolean;
}
