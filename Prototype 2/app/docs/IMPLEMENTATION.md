# Implementation notes

- `app/data/catalog.ts`: the syllabus. Topics, and in each topic its concepts (standard names). In the code a concept is a `sub` and a topic is `topicId`.
- `app/data/packs/*`: four authored exercises (maximum subarray, coin change, binary search, BFS). Each lists the three concepts it checks and holds its questions (baseline/final quiz, claims, why-questions, planted mistake, similar problem), explain-it-back feedback, the Work script, sheet notes and `sampleAnswers` for the “Fill sample” chips.
- `app/lib/evidence.ts`: pure rules for turning answers into a status. Only independent answers give demonstrated, partial or gap; skipped and assisted checks stay unverified and never erase earlier results.
- `app/lib/session.ts`: builds evidence entries and the before/after comparison from a session. `app/lib/samples.ts`: which sample the chip gives.
- `app/composables/useWorkspace.ts`: in-memory state (`useState`, seeded by `data/seed.ts`) and the topic/concept views. `useSession.ts`: open, start over, finish. One open session per exercise (`ws.open`); `ws.active` is the one showing.
- `components/shared/SampleInput.vue` + `SampleChip.vue`: the “Fill sample” chip.
- Design: `design-system/DESIGN_SYSTEM.md`; tokens in `app/assets/css`. `cn` is aliased to `app/lib/utils.ts`.
- After adding new files, restart the dev server: Tailwind only scans files it has seen at start.
- Tests: `tests/*.test.ts` (rules, catalog, sample text), `tests/e2e/journey.spec.ts` (the popup dismisses itself with a locator handler, except in its own test).
