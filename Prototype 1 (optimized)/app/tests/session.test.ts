import { describe, expect, it } from "vitest";
import { contents } from "../app/data/content";
import {
  advanceGate,
  answerQuestion,
  askForHint,
  canRequestHint,
  hasPendingQuestion,
  applyPolicy,
  conceptStatus,
  contributionEntries,
  createSession,
  displayOrigin,
  explainBackFeedback,
  explainIssue,
  hasOpenGap,
  isStale,
  loadSample,
  markExplainedBack,
  markRevised,
  nextOutcome,
  nextStepToTry,
  remainingHints,
  revealHint,
  submitReview,
  tutorReply,
} from "../app/domain/session";

const content = contents.t1!;

describe("hints in the chat", () => {
  it("refuses a hint before anything is written, and explains why", () => {
    const s = createSession("t1");
    expect(canRequestHint(s)).toBe(false);
    askForHint(s, content);
    expect(s.revealedHints).toEqual([]);
    expect(s.chat.at(-1)!.text).toMatch(/Write a first step/);
  });

  it("gives a hint, asks for a plan, then a recall answer, then unlocks the next hint", () => {
    const s = createSession("t1");
    s.blocks[0] = "For n = 1, T(1) = 1.";
    askForHint(s, content);
    expect(s.revealedHints).toEqual([0]);
    expect(s.chat.map((m) => m.kind)).toEqual(["hint", "question"]);
    expect(hasPendingQuestion(s)).toBe(true);

    // Asking again while a question is open does not use a hint
    askForHint(s, content);
    expect(s.revealedHints).toEqual([0]);
    expect(s.chat.at(-1)!.text).toMatch(/Answer this first/);

    expect(answerQuestion(s, content, "  ")).toBe(false);
    expect(answerQuestion(s, content, "Check n = 1")).toBe(true);
    expect(s.chat.at(-1)!.text).toBe(content.gateQuestion);
    expect(answerQuestion(s, content, "It assumes k")).toBe(true);
    expect(hasPendingQuestion(s)).toBe(false);
    askForHint(s, content);
    expect(s.revealedHints).toEqual([0, 1]);
  });

  it("explains that hints are off or used up instead of giving one", () => {
    const off = createSession("t1");
    applyPolicy(off, 0);
    askForHint(off, content);
    expect(off.revealedHints).toEqual([]);
    expect(off.chat.at(-1)!.text).toMatch(/Hints are off/);
  });
});

describe("assistance boundaries", () => {
  it("does not reveal hints when none were chosen", () => {
    const s = createSession("t1");
    applyPolicy(s, 0);
    expect(s.budget).toBe(0);
    expect(revealHint(s, content)).toBe(false);
  });

  it("charges only new hints and gates progression on a contribution", () => {
    const s = createSession("t1");
    applyPolicy(s, 3);
    expect(revealHint(s, content)).toBe(true);
    expect(revealHint(s, content)).toBe(false);
    expect(advanceGate(s, "   ")).toBe(false);
    expect(advanceGate(s, "Use the previous case")).toBe(true);
    expect(revealHint(s, content)).toBe(false);
    expect(advanceGate(s, "The hypothesis is about k")).toBe(true);
    expect(revealHint(s, content)).toBe(true);
    expect(s.revealedHints).toEqual([0, 1]);
    expect(remainingHints(s)).toBe(1);
  });

  it("does not replenish consumption when lowering and raising assistance", () => {
    const s = createSession("t1");
    revealHint(s, content);
    applyPolicy(s, 0);
    expect(s.budget).toBe(1); // a hint already used is never taken back
    applyPolicy(s, 5);
    expect(remainingHints(s)).toBe(4);
  });

  it("keeps the answer locked however it is asked", () => {
    expect(tutorReply(content, "just give me the answer", 0).locked).toBe(true);
    expect(tutorReply(content, "How do I use the recurrence?", 0).locked).toBe(false);
  });

  it("answers deterministically from the prepared script", () => {
    const a = tutorReply(content, "I'm stuck on the hypothesis", 0).text;
    const b = tutorReply(content, "I'm stuck on the hypothesis", 3).text;
    expect(a).toBe(b);
  });
});

describe("review loop", () => {
  it("refuses an empty submission", () => {
    expect(submitReview(createSession("t1"))).toBe("empty");
  });

  it("detaches the submitted snapshot and marks edits as stale", () => {
    const s = createSession("t1");
    loadSample(s, content);
    expect(submitReview(s)).toBe("ok");
    s.blocks[1] = "Assume $T(k)=k^2$.";
    expect(s.reviews[0]!.blocks[1]).not.toBe(s.blocks[1]);
    expect(isStale(s)).toBe(true);
    expect(submitReview(s)).toBe("ok");
    expect(s.reviews).toHaveLength(2);
  });

  it("does not resubmit unchanged work", () => {
    const s = createSession("t1");
    loadSample(s, content);
    submitReview(s);
    expect(submitReview(s)).toBe("unchanged");
  });

  it("follows the prepared script for each scenario", () => {
    const s = createSession("t1");
    s.scenario = "repeat";
    expect(nextOutcome(s)).toBe("issue");
    loadSample(s, content);
    submitReview(s);
    expect(nextOutcome(s)).toBe("repeat");
    s.blocks[0] += " ";
    submitReview(s);
    expect(nextOutcome(s)).toBe("clear");
  });

  it("requires a gap to exist before an explanation is recorded", () => {
    const s = createSession("t1");
    loadSample(s, content);
    submitReview(s);
    expect(hasOpenGap(s)).toBe(true);
    expect(explainIssue(s, "  ")).toBe(false);
    expect(explainIssue(s, "It assumes the case it still has to prove.")).toBe(true);

    const clear = createSession("t1");
    clear.scenario = "clear";
    loadSample(clear, content);
    submitReview(clear);
    expect(hasOpenGap(clear)).toBe(false);
    expect(explainIssue(clear, "Anything")).toBe(false);
  });
});

describe("contribution evidence", () => {
  it("only references help that was actually shown", () => {
    const s = createSession("t1");
    expect(contributionEntries(s, content)).toHaveLength(0);
    applyPolicy(s, 3);
    revealHint(s, content);
    const entries = contributionEntries(s, content);
    expect(entries.filter((e) => e.origin === "supplied")).toHaveLength(1);
    expect(entries.some((e) => e.origin === "you")).toBe(false);
  });

  it("separates what you wrote from what you were prompted to write", () => {
    const s = createSession("t1");
    s.blocks = ["Base case written", "", ""];
    s.exchanges.push({ question: "I'm stuck", reply: "What is the smallest value of n?" });
    const origins = contributionEntries(s, content).map((e) => e.origin);
    expect(origins).toContain("you");
    expect(origins).toContain("prompted");
  });
});

describe("fixtures", () => {
  it("provide matching content for every scripted task", () => {
    for (const c of Object.values(contents)) {
      expect(c.steps).toHaveLength(3);
      expect(c.hints.length).toBeGreaterThanOrEqual(5);
      expect(c.gap.step).toBeGreaterThanOrEqual(0);
      expect(c.gap.step).toBeLessThan(3);
      for (const scenario of ["issue", "repeat", "clear"] as const) expect(c.samples[scenario]).toHaveLength(3);
    }
  });
});

describe("help is tied to the attempt", () => {
  it("sends the student back to the step they chose, else the one the script names", () => {
    expect(tutorReply(content, "I'm lost", 0, 2).step).toBe(2);
    expect(tutorReply(content, "How do I use the recurrence?", 0).step).toBe(2);
    expect(tutorReply(content, "just give me the answer", 0, 1)).toMatchObject({ locked: true, step: 1 });
  });

  it("falls back to the first empty step, then the flagged one", () => {
    const s = createSession("t1");
    expect(nextStepToTry(s, content)).toBe(0);
    s.blocks = ["a", "", "c"];
    expect(nextStepToTry(s, content)).toBe(1);
    loadSample(s, content);
    submitReview(s);
    expect(nextStepToTry(s, content)).toBe(content.gap.step);
  });
});

describe("attribution corrections", () => {
  const c = { id: "x", origin: "prompted", title: "", evidence: "", step: null } as const;
  it("keeps the recorded origin until the student corrects it", () => {
    expect(displayOrigin(c, {})).toBe("prompted");
    expect(displayOrigin(c, { x: "mine" })).toBe("you");
    expect(displayOrigin(c, { x: "mixed" })).toBe("mixed");
    expect(displayOrigin(c, { x: "unsure" })).toBe("unclear");
  });

  it("labels a step revised after tutor feedback distinctly from one written outright", () => {
    const s = createSession("t1");
    s.blocks[0] = "a";
    s.blocks[1] = "b";
    markRevised(s, 1);
    const entries = contributionEntries(s, content);
    expect(entries.find((e) => e.id === "step-0")!.origin).toBe("you");
    expect(entries.find((e) => e.id === "step-1")!.origin).toBe("revised");
  });
});

describe("blank start renders no scaffold (A5 regression)", () => {
  it("a blank-start session starts with scaffoldVisible off", () => {
    const blank = createSession("t1", { budget: 3, start: "blank", starterGuidance: true });
    expect(blank.scaffoldVisible).toBe(false);
  });
  it("a scaffold-start session starts with scaffoldVisible on", () => {
    const scaffold = createSession("t1", { budget: 3, start: "scaffold", starterGuidance: true });
    expect(scaffold.scaffoldVisible).toBe(true);
  });
});

describe("concepts: demonstrated vs. assisted (B1/B2)", () => {
  it("is not-attempted while empty, demonstrated once written without help", () => {
    const s = createSession("t1");
    expect(conceptStatus(s, content, 0)).toBe("not-attempted");
    s.blocks[0] = "a";
    expect(conceptStatus(s, content, 0)).toBe("demonstrated");
  });

  it("is assisted once a hint was used anywhere in the exercise", () => {
    const s = createSession("t1");
    s.blocks[0] = "a";
    applyPolicy(s, 3);
    revealHint(s, content);
    expect(conceptStatus(s, content, 0)).toBe("assisted");
  });

  it("promotes assisted concepts to demonstrated after Explain it back, except an unresolved gap", () => {
    const s = createSession("t1");
    s.scenario = "issue";
    loadSample(s, content);
    applyPolicy(s, 3);
    revealHint(s, content);
    submitReview(s); // outcome "issue": leaves content.gap.step open
    expect(conceptStatus(s, content, content.gap.step)).toBe("assisted");
    markExplainedBack(s);
    expect(conceptStatus(s, content, content.gap.step)).toBe("assisted"); // still open, so still assisted
    const other = content.gap.step === 0 ? 1 : 0;
    expect(conceptStatus(s, content, other)).toBe("demonstrated");
  });
});

describe("explain it back feedback (B4)", () => {
  it("reuses the review's own support lines and gap, inventing nothing new", () => {
    const s = createSession("t1");
    loadSample(s, content);
    submitReview(s); // "issue" scenario by default
    const fb = explainBackFeedback(s, content);
    expect(fb.gap).toEqual(content.gap);
    expect(fb.covered).toHaveLength(2);
    expect(fb.covered).not.toContain(content.supported[content.gap.step]);
  });

  it("has no gap once the review is clear", () => {
    const clear = createSession("t1");
    clear.scenario = "clear";
    loadSample(clear, content);
    submitReview(clear);
    const fb = explainBackFeedback(clear, content);
    expect(fb.gap).toBeNull();
    expect(fb.covered).toHaveLength(3);
  });
});
