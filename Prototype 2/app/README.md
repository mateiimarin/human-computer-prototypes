# Prove-it (Prototype 2)

A low-fidelity prototype of one learning flow: work on an exercise, then check what you can explain without help.
Nothing is connected: feedback, scores and replies are written in advance (`app/data/packs`) and do not react to what you type.
State lives in memory only, so a refresh starts again.

Nuxt 4 · Vue 3 · TypeScript · Tailwind v4 · shadcn/vue · motion-v · KaTeX · Shiki.

## Run

```sh
npm install
npm run dev          # http://127.0.0.1:3002
npm test             # unit tests (Vitest)
npm run test:e2e     # walkthroughs (Playwright, system Chrome)
npm run typecheck
npm run build
```

## What is in it

| Where | What |
| --- | --- |
| `/` Exercises | Exercises by topic. **Start** or **Resume** in one click, **Start over** with a confirmation. |
| `/session/*` | Baseline → how to work → Work → Check (explain it back, one optional extra check) → final quiz → summary → similar problem |
| `/concepts` | Topics and their concepts, each with a status. A row opens the answers behind it. Questions to answer again. |
| `/practice` | A short round of questions without help |
| About this prototype | Opens on every load, and from the header |

Content is organised as topic → concept, with exercises and questions pointing at concepts (`app/data/catalog.ts`).

## For facilitators

- **Fill sample:** click into any text box; a dashed “Fill sample” chip appears on its top edge. It fills that box with prepared text.
  For an explanation the first sample leaves a gap, and after “Edit and submit again” the next one is complete.
- **⌘K (Ctrl+K):** jump to an exercise, or fix which outcome the sample text gives. It is not shown in the interface.
- **Paths worth showing:** core path with the chips only; “I’ve already done it” and the repeat-mistake link on the first sample of
  Maximum subarray; skipping or postponing a check; “Show references” in a check (it becomes assisted); “Find the mistake”;
  the similar problem after a gap; Concepts → a concept → Practise.

## Layout of the code

`app/data/catalog.ts` (topics, concepts) · `app/data/packs/*` (exercises, questions, feedback, sample text) ·
`app/lib/evidence.ts` (how answers become a status; only independent answers can show a concept) · `app/lib/session.ts` ·
`app/composables/*` (state) · `app/pages`, `app/components`, `app/layouts` · `docs/` (audit, notes).
