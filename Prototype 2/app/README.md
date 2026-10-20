# Prove-it

A study workspace that helps students tell what they can explain on their own from what they could only follow with help.
**Prepare → Work → Verify → Review.**

Nuxt 4 · Vue 3 · TypeScript · Tailwind v4 · shadcn/vue (with its message, bubble, questionnaire, code-block, sidebar,
calendar and command components) · motion-v · KaTeX · Shiki.

State lives in the browser (`localStorage`, key `prove-it:workspace:v1`). Feedback and scoring come from authored content in
`app/data/packs`, so every screen agrees with every other.

## Run

```sh
npm install
npm run dev          # http://127.0.0.1:3002
npm test             # evidence rules (Vitest)
npm run test:e2e     # core journeys (Playwright, system Chrome)
npm run typecheck
```

## Where things are

| Area | Screens |
| --- | --- |
| Sign in | `/sign-in` |
| Overview | `/` next action, concept status, due review, recent sessions, first-use state for new courses |
| Study | `/study` topics, sheets, add a sheet (file, paste or sample, with a read step and a failure state) |
| Session | `/session/pre-quiz` → `route` → `recall` / `work` / `elsewhere` / `sheet` → `explain` → `defend` / `mistakes` → `post-quiz` → `summary` → `twin` |
| Concepts | `/concepts`, `/concepts/:id`, evidence sheet for every status |
| Review | `/review` library, due and exam plan; `/review/session` for the question flow |
| Settings | `/settings` |

## Walkthroughs worth trying

- **Core:** Study → Maximum subarray → baseline → Work (hint, outline) → check → explain it back → post-quiz → summary → twin problem.
- **Work already complete:** route screen → “I’ve already done this” → confirm → check. The summary calls the baseline a starting snapshot.
- **Assisted:** during any check choose “Show references”. The check becomes assisted and cannot produce a green result.
- **Skip or postpone:** skip the baseline, explain it back or post-quiz, or choose “Do this later”. The summary marks them unverified (or postponed) and offers a way back.
- **Repeat mistake:** Study → Maximum subarray → “I’ve already done it” → fill in “A partial explanation”. The feedback links the gap to the earlier loop-invariant gap.
- **Resume:** the seeded Coin change session is open at Work. Leave and resume from the sidebar.
- **Review and exam plan:** Review → Due → start; Review → Exam plan → switch a topic off.
- **First use:** switch to Discrete Probability from the course menu.

Settings → Reset workspace returns everything to the starting state.
