# Attempt First

A study workspace where students do the thinking and an AI tutor helps with the rest. The core loop is
**attempt → ask for targeted help → review → explain and revise → reflect on who thought it.**

Nuxt 4 · Vue 3 · TypeScript · Tailwind CSS v4 · shadcn/vue (+ its message, questionnaire, trace, attachment and
code-block components) · motion-v for animation · KaTeX for maths.

The app is a front-end experience: tutor replies, feedback and attribution come from prepared content, and state lives in
the browser (`localStorage`). There is no backend, account system or model call.

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

| Area | Screens and flows |
| --- | --- |
| **Getting in** | Sign in (email + 6-digit code, or university account) → three-step onboarding that sets standing assistance defaults |
| **Today** | Greeting, resume-where-you-left-off, deadline timeline, points you left open, recent sessions |
| **Library** | Courses and sheets with progress; sheet page with rename, deadline picker, remove; task rows with status |
| **Add a sheet** | Upload / photo / paste → scan → check detected tasks, course and deadline → done. Any file or text produces the same detected sheet (Algorithms · Sheet 5) |
| **Task** | Brief with statement, how a session goes, earlier sessions, reopen, discard |
| **Session** | Set-up questionnaire → workspace (one attempt sheet, tutor that asks which step you mean and sends you back to it, gated hint ladder, assistance change with a pause, sample handwritten photo) → review (labelled wait, the same sheet with feedback written against each step, explain-then-revise) → reflection (who thought it, correct a label, points to revisit, finish) |
| **History** | Every finished session with its reflection; reopen a task |
| **Settings** | Profile, assistance defaults, notifications, appearance (reduce motion, larger text), privacy (export JSON, delete data), sign out |
| **Search** | `⌘K` / `Ctrl K` command palette for pages and tasks |

### Scripted tasks

Four tasks have full content (statement, steps, hints, tutor replies, sample attempts, feedback):

- Discrete Mathematics, sheet 3: **A recurrence proof**, **Divisibility by 3**
- Algorithms & Data Structures, sheet 5 (arrives through *Add exercise sheet*): **Why `find_max` is correct**, **The invariant of insertion sort**

Other tasks are already finished and show their reflection from History.

### Choosing the review outcome

The first review of an attempt shows a gap and the next one shows no issues. To walk another path, open the command
palette (`⌘K`) and choose **Review outcome for the next check**: *A gap, then resolved*, *The same gap twice* or
*No issues found*. The choice applies to the current task and to tasks started afterwards.

### Sign-in

Any well-formed email works, and so does any 6-digit code. The university-account button signs in directly.
State persists in `localStorage` under `attempt-first:v3`; **Settings → Privacy and data → Delete** resets everything.

## Structure

```
app/
  pages/          welcome, onboarding, index (Today), library/, history/, settings, task/[id]/{index,setup,work,review,reflect}
  layouts/        default (sidebar / tab bar), session (journey header), flow (full-screen steps)
  components/     brand/, library/, session/, shared/, shell/, ui/ (shadcn/vue)
  composables/    useApp (store + persistence), useSession, useAssistDialog, useCommandMenu
  domain/         session.ts: pure rules for hints, policy changes, review snapshots, attribution
  data/           types, seed library and history, content/ (one file per scripted task)
  assets/css/     tokens.css (design tokens), tailwind-theme.css, main.css
```

See [docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md) for the design and state notes and [docs/QA.md](docs/QA.md) for verification.
