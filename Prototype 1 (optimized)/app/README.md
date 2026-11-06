# Attempt First

A study workspace where students do the thinking and an AI tutor helps with the rest. The core loop is
**attempt → ask for targeted help → review → explain and revise → reflect on who thought it.**

Nuxt 4 · Vue 3 · TypeScript · Tailwind CSS v4 · shadcn/vue · motion-v for animation · KaTeX for maths.

This is a low-fidelity prototype of the core flow. Tutor replies, feedback and attribution come from prepared content, and
state lives in the browser (`localStorage`). There is no backend, account system or model call.

## Run it

Node.js 22.12+ (verified with Node 24).

```sh
npm ci
npm run dev        # http://localhost:3000
```

```sh
npm run build && npm run preview   # production build
npm test                           # domain tests (Vitest)
npm run test:e2e                   # browser journeys (Playwright, uses system Chrome)
npm run typecheck
```

## What's in the app

One list and one journey. See [docs/SIMPLIFICATION.md](docs/SIMPLIFICATION.md) for what was removed and why.

| Screen | What it does |
| --- | --- |
| **Exercises** (`/`) | The four exercises. Each row says *Start*, *Continue* or *View reflection*. |
| **Exercise** | The statement, and the button to start or continue. |
| **Set up** | Three choices on one page (number of hints 0–5, starter question, how to begin) with a summary of what they mean. |
| **Work** | The exercise, one attempt sheet with three steps, a tutor that asks which step you mean and sends you back to it, gated hints, a way to change the number of hints (with a pause). |
| **Review** | A labelled wait, then the same sheet with feedback on each step, then explain and revise. |
| **Reflect** | Who thought it: counts, points to revisit, every contribution with a link back, and a way to correct a label. *Finish* returns to the list. |

A short "About this prototype" dialog opens on every page load (limits of the prepared replies, the test button, and the needs the prototype addresses); it can be reopened from the header or the session menu. Every open-ended input shows a dashed **Test · Fill sample** chip while it is focused; click it to fill the input with prepared text. The session menu (top right) has **Start over**. `⌘K` / `Ctrl K` is for the facilitator: jump to an exercise or choose the next review outcome.

### Exercises

- Discrete Mathematics: **A recurrence proof**, **Divisibility by 3**
- Algorithms: **Why `find_max` is correct**, **The invariant of insertion sort**

Each has full content (statement, steps, hints, tutor replies, sample attempts, feedback).

### Choosing the review outcome

The first review of an attempt shows a gap and the next one shows no issues. To walk another path, press `⌘K` and choose
**Review outcome for the next check**: *A gap, then resolved*, *The same gap twice* or *No issues found*. The choice applies to
the current exercise and to exercises started afterwards.

Nothing is stored. A page refresh starts everything again; **Start over** resets one exercise.

## Structure

```
app/
  pages/          index (Exercises), task/[id]/{index,setup,work,review,reflect}
  layouts/        default (logo only), session (journey header)
  components/     brand/, session/, shared/, shell/ (⌘K), ui/ (shadcn/vue)
  composables/    useApp (store + persistence), useSession, useAssistDialog, useCommandMenu
  domain/         session.ts: pure rules for hints, policy changes, review snapshots, attribution
  data/           types, exercises, content/ (one file per exercise)
  assets/css/     tokens.css (design tokens), tailwind-theme.css, main.css
```

See [docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md) for the design and state notes and [docs/QA.md](docs/QA.md) for verification.
