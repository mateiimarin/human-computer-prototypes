# Simplification audit (20 October 2026)

**Why:** reviewers need to judge whether the flow answers the needs (N1–N5), not use a study app. Too many destinations and
options made it hard to see what was the product and what was filler.

**Test applied to every element:** (1) is it part of the core journey in `PROTOTYPE_ARCHITECTURE.md` (F1–F7)? (2) does a
reviewer need it to judge the flow? Kept, simplified, or removed. Rules G35–G42 record the outcome.

## Screens and destinations

| Element | Verdict | Reason |
| --- | --- | --- |
| Sign-in, onboarding, welcome | Removed (already gone) | Account setup is out of scope (Section 4). |
| **Today** (greeting, hero, "Up next", "Worth another look", "Recent sessions") | Removed | Dashboard. Six sections competing with the one thing to do. Replaced by the **Exercises** list. |
| **Library** (courses, filters, search, sheet progress) | Removed | Course management. Reviewers never need more than four exercises. |
| Sheet page (rename, deadline picker, remove) | Removed | Housekeeping with no learning-flow value. |
| **Add exercise sheet** (upload, scan, confirm) | Removed | Simulated document processing. The architecture says a small predefined set replaces it. |
| **History** (+ detail page) | Removed | Cross-session memory, explicitly out of scope. Finished exercises show *View reflection* in the list. |
| **Settings** (profile, defaults, notifications, appearance, privacy) | Removed | Settings destination is "unnecessary" (Section 4). Defaults are confirmed per exercise in set-up. |
| Sidebar, mobile tab bar, account menu, "Add exercise sheet" button, resume card | Removed | Navigation for destinations that no longer exist. A logo link is enough. |
| Search button | Removed | ⌘K stays as a hidden facilitator tool (jump + review outcome). |
| Deadlines ("Due Friday"), durations ("20 min"), course artwork, thumbnails | Removed | Decoration or planning data that is not part of the journey. |

## Journey screens

| Element | Verdict | Reason |
| --- | --- | --- |
| Exercises list | New, simple | Answers "What am I working on?" Four rows, one action each. |
| Exercise page: statement, **Start / Continue / View reflection** | Kept, simplified | F1 step 2 (confirm the context). Hero art, "How a session goes", earlier sessions and tip line removed. |
| Journey header (Set up · Work · Review · Reflect) | Kept | The only map of the flow. |
| Header: assistance pill | Kept | Shows the current rules once and is the way to change them (F4). |
| Header menu | Simplified | Only *Start over* (and *Change assistance* on phones). "Task details" removed. |
| **Set-up**: three questions, then summary, then start (four clicks, three sub-screens) | Simplified | One screen, summary updates live, one *Start working* button. Questions and the scaffold/hints conflict rule are unchanged (F1). |
| Workspace: exercise, attempt, tutor, hints, "Change hints" | Kept | All named in F2–F4. |
| "Which step?" chips in the tutor composer | Kept, relabelled | Required by F2/G27; "About" was unclear. |
| Tutor tab **Who thought it?** | Kept | Contribution sidebar (I11), listed in the core journey. |
| Review: labelled wait, feedback per step, explain, revise, finish with gap | Kept | F5, F6. |
| Reflection: counts, points to revisit, entries with links, **Not quite right?** | Kept | F7, G32, G33. |
| Reflection: gradient banner, filter (Everything / Yours / Tutor), "How to read these labels" | Removed | Decoration, an extra feature, and a hidden legend. Each count now carries a one-line meaning. |
| Reflection: two-option finish dialog | Simplified | One *Finish* button; the exercise can be reopened from the list. |
| Hint allowance (3 or 5) in the assistance dialog | Kept | Needed to recover when hints run out (F3). |

## Second round (21 October 2026)

| Change | Reason |
| --- | --- |
| "View reflection" opens the reflection directly; in-progress rows open where you left off; the ✕ in a session goes to the list | An intermediate exercise page made every return an extra click. |
| Hints are a 0–5 slider (set-up and "Change hints"), not "Questions only / Questions and hints" | The two modes were hard to tell apart; one number is the whole decision. |
| Nothing is stored; refresh resets everything | Testers start clean. *Start over* still resets one exercise. |
| Workspace: exercise and attempt on one page, steps joined by one line, tutor docked to the right edge; review uses the same step line | Fewer separate boxes; the exercise, the work and the feedback read as one thing. |
| Handwritten upload removed | Not part of the flow reviewers judge, and it added a dialog, a menu and a chip. |
| **Test · Fill sample** chip on each open-ended input, shown while the input is focused | Testers don't have to invent text; the label says it is a test aid. |
| Copy pass: taglines and reassurance lines removed, vague labels renamed | See below. |

## Wording

| Before | After |
| --- | --- |
| Up next | Exercises |
| Task 1 · … / Task details | the exercise title / Exercise |
| Your agreement for this task | What this means |
| If you freeze at the very start, what should happen? | Need a nudge to get started? |
| A guided scaffold | Guided steps |
| About [Step 1] [Step 2] [Step 3] | Which step? [1] [2] [3] |
| Discard session | Start over |
| Points to revisit / gap | Still open / problem, issue |
| You introduced · Tutor prompted · Tutor supplied | You wrote · Tutor asked · Tutor gave a hint |
| Questions only / Questions and hints | Number of hints (0–5) |
| Take a moment first | Wait a few seconds (adding hints starts a 5-second countdown) |
| Pick up where you left off, Worth another look, Recent sessions | removed |

The interface says "exercise"; code and routes keep `task`.

## Not changed on purpose

Tutor, hint ladder and gates, answer lock, deliberate pause, review script, repeated-gap note, explain-then-revise,
attribution correction, review-outcome control (⌘K). These are the flow being reviewed.

## Open question for the team

The workspace still has three regions (exercise, attempt, tutor with two tabs). If reviewers still struggle there, the next
candidate is hiding the **Who thought it?** tab until review, since the reflection shows the same history.
