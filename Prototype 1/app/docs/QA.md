# Verification

## Automated

| Check | Command | Result at hand-off |
| --- | --- | --- |
| Domain rules (hint charging and gating, policy changes, snapshots, stale feedback, scripted outcomes, attribution, fixtures) | `npm test` | 16 tests pass (adds step-targeted help and attribution corrections) |
| Types | `npm run typecheck` | No errors |
| Production build | `npm run build` | Builds (SPA output, Nitro node-server preset) |
| Browser journeys (Playwright, system Chrome) | `npm run test:e2e` | 10 tests pass: auth redirect; sign-in and onboarding; full attempt → review → revise → reflect → finish → History; empty review; gated and bounded hints with the answer lock; assistance pause and cancel; add-sheet flow; help tied to a step with a way back to the attempt; revision keeps the feedback and explanation beside the step; correcting an attribution label |
| Screens and overflow | `npm run qa:visual` (dev server on :3100) | Writes desktop and phone screenshots to `docs/screenshots`; fails on horizontal overflow |

## Checked by hand while building

- Widths 390, 768, 1024, 1280 and 1440 px for the workspace; 390 px for every destination. No horizontal overflow.
- Layout at ≥1280 px: context · attempt · tutor. At 1024–1279 px the task becomes a collapsible block. Below 1024 px the
  tutor opens as a Sheet and the journey header condenses to "Step 2 of 4".
- Empty review, locked hint, exhausted hints, scaffold with hints off, cancelled assistance change, stale feedback,
  repeated gap with the earlier explanation, finishing with a gap, correcting an attribution label, reopening a finished task,
  discarding a session.

## Not covered

- No screen-reader or native-zoom audit; keyboard behaviour comes from reka-ui primitives and was only spot-checked.
- Colour contrast was set from the v0.2 audit and extended to the new tokens by eye, not re-measured.
- Preview panes that report `document.visibilityState = hidden` pause CSS transitions, so animations can look stalled
  there. Use a normal browser window to judge motion.
