# Implementation notes

## Intent

A low-fidelity prototype of the core loop (attempt → targeted help → review → explain and revise → reflect) with every
service simulated. Every visible control does something; nothing claims to be real analysis. Sources:
`../PROTOTYPE_ARCHITECTURE.md` (flows F1–F7, rules G01–G42) and `../design-system/attempt-first/MASTER.md`.
Scope was cut back for reviewers on 20 October 2026; see `SIMPLIFICATION.md`.

## Routes

| Route | Layout | Purpose |
| --- | --- | --- |
| `/` | default | Exercises list |
| `/task/[id]` | default | The exercise, entry to a session |
| `/task/[id]/setup` `/work` `/review` `/reflect` | session | The journey; the header shows progress and the current assistance |

`middleware/task-journey.global.ts` makes sure an exercise and its session exist before the journey routes render (review
and reflect redirect to work until something has been submitted). Unknown exercises redirect to `/`.

## State

- `useApp()` holds `sessions` (one per exercise) and the selected review `scenario` in memory. Nothing is stored, so a
  refresh resets everything. The exercise list and the starting defaults are static (`data/exercises.ts`).
- `IntroDialog` (in `app.vue`) opens on every page load; `useIntro()` reopens it. Its needs list lives in the component.
- Assistance is one number, `session.budget` (0–5 hints). `SampleInput` / `SampleButton` add the test chip to open-ended inputs;
  the text comes from `content.samples` and `content.sampleAnswers`.
- `domain/session.ts` is pure and unit-tested. It owns hint charging and gating, policy changes (a change never replenishes
  consumption), review snapshots (immutable copies; stale detection), the prepared review script, tutor replies and the
  contribution list. Components render this state, they don't re-implement it.
- A session is created when an exercise's set-up opens and moves through `setup → work → review → reflect → done`.
  *Finish* sets `done` and keeps the session, so the exercise can be viewed or reopened. *Start over* deletes it.

## Content

`data/content/*.ts` is one file per exercise: statement, steps and scaffold prompts, five hints, gate questions, tutor keyword
replies and fallbacks, three sample attempts (gap / repeated gap / clear), and the review gap with its "points to revisit"
phrasing. Adding an exercise means adding a file, registering it in `content/index.ts` and listing it in `data/exercises.ts`.
Feedback never refers to help that wasn't shown: the contribution list is derived from the session.

## Design language

Paper, ink, sunshine, lavender for guidance, green for the student's own contribution; a rounded display face (Bricolage
Grotesque) over Inter; pill controls. Cards are reserved for the writing sheet and a few focused panels. Origin colours stay
paired with text labels, so colour is never the only signal.

Motion: `motion-v` for entrances (`Reveal`), the journey-header pill, the tutor rail and step swaps; CSS transitions for hover,
disclosure and route changes. The assistance pause is a ring driven by wall-clock time. Reduced motion follows the OS setting.

## Known edges

- Only the four scripted exercises exist.
- `ui/` still contains shadcn components the screens no longer use (questionnaire, calendar, sidebar, …). They are inert.
