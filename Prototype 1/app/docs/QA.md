# Verification

## Automated

| Check | Command | Result at hand-off |
| --- | --- | --- |
| Domain rules (hint charging and gating, policy changes, snapshots, stale feedback, scripted outcomes, attribution, fixtures) | `npm test` | 16 tests pass |
| Types | `npm run typecheck` | No errors |
| Browser journeys (Playwright, system Chrome) | `npm run test:e2e` | 14 tests pass: About dialog (content, opens on load, reopen); exercise list; one-screen set-up with the hint slider and the scaffold conflict; full attempt → review → revise → reflect → finish → view and reopen; start over, leave and refresh reset; test chips on every open-ended input; empty review; gated and bounded hints with the answer lock; more hints need a pause, fewer apply at once; help tied to a step; revision keeps the feedback and explanation; attribution correction; ⌘K animation |
| Screens and overflow | `npm run qa:visual` (dev server running; set `BASE_URL`) | Writes desktop and phone screenshots to `docs/screenshots`; fails on horizontal overflow |

## Not covered

- No screen-reader or native-zoom audit; keyboard behaviour comes from reka-ui primitives and was only spot-checked.
- Preview panes that report `document.visibilityState = hidden` pause CSS transitions, so animations can look stalled
  there. Use a normal browser window to judge motion.
