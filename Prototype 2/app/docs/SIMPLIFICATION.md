# Simplification audit (22 October 2026)

**Why:** reviewers judge whether the **flow** answers the needs from the interviews (N1–N5). They are not using a real app, and
too many destinations, options and text blocks hid the flow. Content was also unstructured: each exercise had its own
sentence-like "sub-concepts" with descriptions, which cannot be learned or revised and would not scale to a course.

**Test applied to every screen, control and text block:** (1) is it on the core flow in `PROTOTYPE_ARCHITECTURE.md`? (2) does a
reviewer need it to judge the flow? Kept, simplified or removed. Rules G32–G41 record the outcome.

**Not changed on purpose:** the baseline quiz screens and the Work chat (look and behaviour), the design system, the evidence
ring, icons and motion. A pixel comparison against the previous build (Chrome, 1440 px) found the Work chat identical apart from 19–40
of 577,280 pixels (rendering noise). The quiz had 0 differing pixels in the first comparison; after the question wording was
made longer and self-contained the quiz screens are taller only because of that text.

## How the content is organised now

| Level | What it is | Example | Where it shows |
| --- | --- | --- | --- |
| **Topic** | A part of the course | Dynamic programming | Exercises (section), Concepts (section) |
| **Concept** | A standard, named thing in a topic. Shared by every exercise of the topic that checks it | State · Recurrence · Base cases · Optimal substructure | Concepts (one row each), exercise rows (names only) |
| **Exercise** | A problem from a sheet. Checks three concepts of its topic | Maximum subarray (4.1) | Exercises |
| **Question** | One multiple-choice item, tagged with one concept | "How is $D_i$ computed from the previous state?" | Baseline, final quiz, practice |

What a student shows is collected **per concept**, whichever exercise it came from. Concepts carry only a name: no
descriptions, dates or counters in lists. Three topics, ten concepts, four exercises. A real course adds rows to these lists; the
Concepts page groups by topic and each topic collapses, so the page grows by topic, not by concept.

## Destinations

| Element | Verdict | Reason |
| --- | --- | --- |
| Sign-in, account menu, profile | Removed | Account setup is out of scope (§2). |
| Settings (theme, motion, text size, help default, reminders, reset) | Removed | Not part of the flow. Motion still follows the system setting. The theme is fixed to dark. |
| Course switcher, add course, second course | Removed | One course is enough to judge the flow. |
| Sidebar, resume card, rail | Removed | Replaced by a top bar with two links. |
| **Overview** (greeting, next step, due, concepts, recent sessions) | Removed | A dashboard repeating Exercises and Concepts. |
| **Study** (Topics / Sheets / Add a sheet tabs, search, aside) | Replaced by **Exercises** | One list grouped by topic; one click to start or resume; no intermediate page. |
| Upload / scan flow, sheet rename, remove, sample preview | Removed | Simulated document processing. |
| **Concepts** index + detail pages, filter, past sessions | Merged into one **Concepts** page | Topics with their concepts and a status each. A row opens the answers behind it, with "Practise this concept". |
| **Review** (library, selection, exclude, remove, export, search, tabs) | Reduced to one line on Concepts | "N questions to answer again" and one button. Missed questions are added automatically. |
| Exam plan, weekly review | Removed | Scheduling is simulated and not on the core flow. |
| ⌘K command palette | Kept as a hidden facilitator tool | Jump to an exercise; choose which outcome the sample text gives. Not linked from the interface. |

## Session screens

| Element | Verdict | Reason |
| --- | --- | --- |
| Baseline quiz (screens, interaction) | Kept unchanged | Protected. Question wording now names the exercise's setting (see below). |
| Choose how to work | Kept | Three rows: work here, work elsewhere, already done. |
| Recall a past problem | Removed | A detour not tied to any need. |
| Work chat, help buttons, outline, paste, sheet notes | Kept unchanged | Protected. Only "Fill sample" chips were added. |
| Work elsewhere | Simplified | One page: copy the exercise, paste or attach the solution. |
| Explain it back: Type / Speak toggle, simulated recording | Removed (Speak) | One input instead of two. |
| Explain it back: collapsible own text | Simplified | The submitted text is simply shown above the feedback. |
| Go deeper: two checkboxes + a button whose label changed | Replaced | "Continue to the final quiz", or one of two direct buttons: "Why does it work?" / "Find the mistake". |
| Why does it work?: top "Finish" button | Removed | Three questions, one way forward. |
| Find the mistake: optional "In your own words" box | Removed | Not read by anything. |
| Final quiz | Kept | Same questions as the baseline plus two claims. |
| Skip dialog (skip / do this later) | Kept as is | Part of the protected baseline screen. Its confidence picker does nothing, and it is left in place and reported. |
| Leave dialog, "Leave and resume" | Removed | The back arrow keeps progress. "Start over" with a confirmation is on the exercise row. |
| Session side panel, "Session details" sheet, "More" menu | Removed | Repeated the step line and the header. |
| Stage names | Renamed | Prepare · Work · **Check** · **Summary** (was Verify · Review). "Review" is no longer used for two things. |
| Summary: ring, results by concept, one next action, before/after table, claims | Kept, simplified | The next step is one sentence and one button, or just "Back to exercises". |
| Summary: save-questions sheet, export dialog, baseline/after count line | Removed | Missed questions are saved automatically. The table already shows the counts. |
| Similar problem: 5 phases incl. an unused "sketch" box | Simplified to 3 | Read the example, solve and explain, two questions. |

## Content

| Before | After | Why |
| --- | --- | --- |
| Per-exercise "sub-concepts" with descriptions ("Why discarding is safe", "Transition over coins") | Shared concepts with standard names, no descriptions | They were sentences, not units to learn. |
| Baseline questions with undefined symbols ("What does $D_i$ represent?") | Each question opens with the setting ("In the usual dynamic-programming solution to maximum subarray, a state $D_i$ is kept for each index $i$. What does $D_i$ represent?") | The quiz felt out of context. |
| "Last checked 10 Oct", "Earlier result: …", attempt counters, times | Removed from lists | Dates only remain inside the answers sheet. |
| Topic, concept, sub-concept, point, key idea, sheet | **Topic · Concept · Exercise · Question** | One word per thing. |

## Wording

| Before | After |
| --- | --- |
| Study, Overview | Exercises |
| Twin problem | Similar problem |
| Post-quiz | Final quiz |
| Verify, Review (stage) | Check, Summary |
| Evidence, "See evidence" | Answers, "See answers" |
| Sample feedback, prepared | Removed from the product. The About popup says it once. |
| "Go deeper first?" | "Or add one more check first. It is optional and short." |
| Taglines, reassurance, overline tags | Removed |

## Autofill ("Fill sample")

Every free-text input has the chip: Work message, pasted solution and outline blanks (chip only, the chat is unchanged), work
elsewhere, explain it back, "Explain your mistake", the "Why?" box on claims, and the similar-problem explanation. Choice
questions have none. The text lives in `app/data/packs/*` (`sampleAnswers`). Explanations: the first chip gives the incomplete
text (a gap, and a link to an earlier occurrence where one exists), after "Edit and submit again" it gives the complete text.
⌘K can fix one outcome (complete, incomplete, off track).

## Could not be verified

- The PDF of the needfinding report could not be read in this environment. Need names and wording follow the team's own
  summary of the five needs and Prototype 1's architecture. Please check them against the report.
- Screenshots were taken with system Chrome at 1440 px and 390 px. No screen reader or real touch device was used.

## Third round (22 October 2026, after review)

| Change | Reason |
| --- | --- |
| One status for “no check yet” and “unverified”: **Not shown yet** (short: **Not shown**) | Reviewers could not tell the two apart. The reason (help used, skipped, postponed) is one plain line in the answers panel. |
| Answers panel rebuilt: header (topic, concept, status, one reason line), then one group per exercise or practice round with date; each answer has an icon, the question, “Your answer”, confidence and the explanation | It was blocks of text without structure. |
| “Next:” lines removed everywhere; descriptions cut to one short line or removed | Too much text to read on every screen. |
| Baseline: shorter intro, more space under the heading; “Edit” in the recap only on hover (always visible on touch) | Less clutter. |
| Work: “+” menu, paste, upload and sheet feedback removed; **Check my understanding** moved next to the help buttons | It was at the top, away from where the chat ends. Sheet feedback was a supporting extra. |
| “Go straight to the check” dialog: one sentence | Was two paragraphs. |
| Summary: headline and ring, concepts, **Baseline and final quiz** table with a **Confidence** trend column, true or false, **What to do next at the bottom**. Removed the observations text, the “seen before” lines and the long notes | Predictable structure, no generated commentary. |
| Course selector (shadcn Select) on Exercises, with the one course | Shows where a second course would go. |
| Alert dialog buttons no longer force their own variant | “Keep going” in the skip dialog had no contrast. |
