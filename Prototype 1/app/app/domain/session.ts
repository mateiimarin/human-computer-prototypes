import type {
  Blocks,
  Contribution,
  Mode,
  Review,
  Scenario,
  Session,
  Settings,
  TaskContent,
} from "~/data/types";

export const originLabels = {
  you: "You introduced",
  prompted: "Tutor prompted",
  supplied: "Tutor supplied",
  setting: "Your choice",
  mixed: "A mix of both",
  unclear: "Not sure",
} as const;

/** How a student can correct a label in the reflection. */
export const relabelChoices = [
  { value: "mine", label: "I thought of this myself" },
  { value: "mixed", label: "A mix of mine and the tutor's" },
  { value: "unsure", label: "I'm not sure" },
] as const;

export type DisplayOrigin = keyof typeof originLabels;

/** The label shown for a contribution once the student's correction, if any, is applied. */
export function displayOrigin(c: Contribution, flags: Record<string, string>): DisplayOrigin {
  if (!(c.id in flags)) return c.origin;
  const v = flags[c.id];
  return v === "mine" ? "you" : v === "mixed" ? "mixed" : "unclear";
}

/** Prepared review outcomes per scenario, indexed by review number. */
const scripts: Record<Scenario, Scenario[]> = {
  issue: ["issue", "clear"],
  repeat: ["issue", "repeat", "clear"],
  clear: ["clear"],
};

export const scenarioLabels: Record<Scenario, string> = {
  issue: "A gap, then resolved",
  repeat: "The same gap twice",
  clear: "No issues found",
};

export function createSession(taskId: string, defaults?: Settings): Session {
  return {
    taskId,
    phase: "setup",
    started: false,
    startedAt: new Date().toISOString(),
    mode: defaults?.mode ?? "questions",
    budget: defaults?.budget ?? 3,
    start: defaults?.start ?? "blank",
    starterGuidance: defaults?.starterGuidance ?? true,
    blocks: ["", "", ""],
    revealedHints: [],
    gate: "hint",
    gateResponses: [],
    exchanges: [],
    policyHistory: [],
    reviews: [],
    scenario: "issue",
    attachment: false,
    flags: {},
    focusStep: null,
    openTutor: false,
    aboutDraft: null,
    tutorDraft: "",
    gateDraft: "",
    explainDraft: "",
    seenReview: 0,
    finishedAt: null,
  };
}

export function hasWork(s: Session) {
  return s.blocks.some((b) => b.trim());
}

export function remainingHints(s: Session) {
  return Math.max(0, s.budget - s.revealedHints.length);
}

export function agreementLabel(mode: Mode, budget: number) {
  return mode === "questions" ? "Questions only" : `Questions + ${budget} hints`;
}

export function applyPolicy(s: Session, mode: Mode, budget: number) {
  if (s.mode === mode && s.budget === budget) return;
  s.mode = mode;
  s.budget = Math.max(budget, s.revealedHints.length);
  s.policyHistory.push(
    mode === "questions"
      ? "Changed to questions only"
      : `Changed to questions + ${s.budget} hints`,
  );
}

export function revealHint(s: Session, content: TaskContent): boolean {
  if (
    s.mode !== "hints" ||
    s.gate !== "hint" ||
    s.revealedHints.length >= s.budget ||
    s.revealedHints.length >= content.hints.length
  )
    return false;
  s.revealedHints.push(s.revealedHints.length);
  s.gate = "reasoning";
  return true;
}

export function advanceGate(s: Session, response: string): boolean {
  if (!response.trim() || s.gate === "hint") return false;
  s.gateResponses.push(response.trim());
  s.gate = s.gate === "reasoning" ? "recall" : "hint";
  return true;
}

const answerRequest = /answer|solution|solve it|just tell|give me the|show me the proof|finish it/i;

/** The first step still empty, else the one the last review flagged: where a reply sends the student back to. */
export function nextStepToTry(s: Session, content: TaskContent): number {
  const empty = s.blocks.findIndex((b) => !b.trim());
  if (empty !== -1) return empty;
  return hasOpenGap(s) ? content.gap.step : s.blocks.length - 1;
}

/**
 * Prepared tutor reply. `about` is the step the student chose in the composer, if any;
 * the returned `step` is the step the reply sends them back to, or null to let the caller pick.
 */
export function tutorReply(content: TaskContent, question: string, count: number, about: number | null = null) {
  if (answerRequest.test(question))
    return {
      locked: true,
      step: about,
      text: "Final answers stay hidden, whichever help you've chosen. Which step could you try next? I can ask you a question about it.",
    };
  const hit = content.tutor.keywords.find((k) => k.test.test(question));
  return {
    locked: false,
    step: about ?? hit?.step ?? null,
    text: hit?.reply ?? content.tutor.fallbacks[count % content.tutor.fallbacks.length]!,
  };
}

/** The outcome the next review will show for the current scenario. */
export function nextOutcome(s: Session): Scenario {
  const script = scripts[s.scenario];
  return script[Math.min(s.reviews.length, script.length - 1)]!;
}

export function loadSample(s: Session, content: TaskContent) {
  s.blocks = [...content.samples[nextOutcome(s)]] as Blocks;
}

export type SubmitResult = "ok" | "empty" | "unchanged";

export function submitReview(s: Session): SubmitResult {
  if (!hasWork(s)) return "empty";
  const last = s.reviews.at(-1);
  if (last && s.blocks.every((b, i) => b === last.blocks[i])) return "unchanged";
  s.reviews.push({
    version: s.reviews.length + 1,
    blocks: [...s.blocks] as Blocks,
    outcome: nextOutcome(s),
    explanation: "",
    explained: false,
    at: new Date().toISOString(),
  });
  return "ok";
}

export function latestReview(s: Session): Review | undefined {
  return s.reviews.at(-1);
}

export function isStale(s: Session): boolean {
  const r = latestReview(s);
  return !!r && s.blocks.some((b, i) => b !== r.blocks[i]);
}

export function hasOpenGap(s: Session): boolean {
  const r = latestReview(s);
  return !!r && r.outcome !== "clear";
}

export function explainIssue(s: Session, explanation: string): boolean {
  const r = latestReview(s);
  if (!r || !explanation.trim() || r.outcome === "clear") return false;
  r.explanation = explanation.trim();
  r.explained = true;
  return true;
}

export function relabel(flags: Record<string, string>, id: string, value: string | null) {
  if (value === null) delete flags[id];
  else flags[id] = value;
}

export function contributionEntries(s: Session, content: TaskContent): Contribution[] {
  return [
    ...s.blocks.flatMap((b, i) =>
      b.trim()
        ? [
            {
              id: `step-${i}`,
              origin: "you" as const,
              title: content.steps[i]!.label,
              evidence: b,
              step: i,
            },
          ]
        : [],
    ),
    ...s.gateResponses.map((response, i) => ({
      id: `response-${i}`,
      origin: "you" as const,
      title: i % 2 === 0 ? "Reasoning after a hint" : "Recall response",
      evidence: response,
      step: null,
    })),
    ...s.revealedHints.map((i) => ({
      id: `hint-${i}`,
      origin: "supplied" as const,
      title: `Hint ${i + 1}`,
      evidence: content.hints[i]!,
      step: null,
      target: "tutor" as const,
    })),
    ...s.exchanges.map((e, i) => ({
      id: `exchange-${i}`,
      origin: "prompted" as const,
      title: `Tutor question ${i + 1}`,
      evidence: e.reply,
      step: null,
      target: "tutor" as const,
    })),
    ...s.reviews
      .filter((r) => r.explained)
      .map((r) => ({
        id: `explanation-${r.version}`,
        origin: "you" as const,
        title: `Explanation of the gap (attempt ${r.version})`,
        evidence: r.explanation,
        step: null,
      })),
    ...s.policyHistory.map((p, i) => ({
      id: `policy-${i}`,
      origin: "setting" as const,
      title: "Assistance changed",
      evidence: p,
      step: null,
    })),
  ];
}
