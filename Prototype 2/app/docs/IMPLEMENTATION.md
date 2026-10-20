# Implementation notes

- `app/data/packs/*`: four authored exercises (maximum subarray, coin change, binary search, BFS) with quiz, claims, defence questions, planted mistake, explain-it-back feedback, work script, sheet feedback and a twin problem.
- `app/lib/evidence.ts`: pure rules for turning signals into evidence. Only independent signals reach demonstrated, partial or gap; skipped and assisted checks stay unverified and never erase earlier evidence.
- `app/lib/session.ts`: builds evidence entries and the before/after comparison from an active session.
- `app/composables/useWorkspace.ts`: persisted state and the derived concept view. `useSession.ts` holds session actions.
- Design: `design-system/DESIGN_SYSTEM.md` (v0.2 “Lift”), tokens in `app/assets/css`.
- `cn` is aliased to `app/lib/utils.ts` so every shadcn component merges Tailwind classes with tailwind-merge.
- After adding new files, restart the dev server: Tailwind only scans files it has seen at start.
