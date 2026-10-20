# Implementation notes

## Intent

Make the Attempt First concept feel like a finished product while keeping every service simulated. Every visible
control does something; nothing claims to be real analysis. The source documents are
`../PROTOTYPE_ARCHITECTURE.md` (flows F1–F7, rules G01–G26) and `../design-system/attempt-first/MASTER.md` (v0.3 notes at the top).

## Routes

| Route | Layout | Purpose |
| --- | --- | --- |
| `/welcome`, `/onboarding` | flow | Sign in, then choose standing assistance defaults |
| `/` | default | Today |
| `/library`, `/library/[sheetId]`, `/library/new` | default / flow | Courses, sheet detail, add-sheet flow |
| `/history`, `/history/[id]` | default | Past sessions and their reflections |
| `/settings?tab=` | default | Profile, assistance, notifications, appearance, privacy |
| `/task/[id]` | default | Task brief, entry to a session |
| `/task/[id]/setup` `/work` `/review` `/reflect` | session | The journey; header shows progress and the agreement |

`middleware/auth.global.ts` redirects unauthenticated visitors, finishes onboarding first, and makes sure a task's
session exists before its journey routes render (review and reflect redirect to work until something has been submitted).

## State

- `useApp()` holds one reactive object: user, settings, courses, sheets, tasks, **one session per task**, history and the
  selected review scenario. It persists to `localStorage` (`attempt-first:v3`) and flushes on `pagehide`.
- `domain/session.ts` is pure and unit-tested. It owns hint charging and gating, policy changes (a change never replenishes
  consumption), review snapshots (immutable copies; stale detection), the prepared review script, tutor replies and the
  contribution list. Components render this state, they don't re-implement it.
- A session is created lazily, is independent per task, and moves through `setup → work → review → reflect → done`.
  Finishing archives it into `history` with a snapshot, so **Reopen task** can restore it.

## Content

`data/content/*.ts` is one file per scripted task: statement, steps and scaffold prompts, five hints, gate questions, tutor
keyword replies and fallbacks, three sample attempts (gap / repeated gap / clear), and the review gap with its
"points to revisit" phrasing. Adding a task means adding a file and registering it in `content/index.ts`.
Feedback never refers to help that wasn't shown: the contribution list is derived from the session.

## Design language (v0.3)

Same semantic tokens as v0.2 (paper, ink, sunshine, lavender for guidance, green for the student's own contribution),
pushed toward the supplied reference: saturated hero fields with simple geometric artwork, large radii, soft coloured
depth, a rounded display face (Bricolage Grotesque) over Inter, pill controls and a faint paper grain.

- Cards are reserved for the writing sheet and a few focused panels (feedback gap, points to revisit). Lists use dividers
  and whitespace; course art and gradients carry the colour.
- Gradients and illustrations never sit behind student writing or equations.
- Origin colours stay paired with text labels, so colour is never the only signal.

### Motion

- `motion-v` for entrances (`Reveal`), shared-layout pills (sidebar, tab bar, journey header), spring-in rails and step
  swaps. CSS transitions for hover, disclosure and route changes (`page` and `layout` transitions).
- Labelled waits instead of fake streaming: scanning a sheet and reviewing an attempt show each step finishing.
- The assistance pause is a ring driven by wall-clock time, so a suspended tab can't stall it.
- Reduced motion: honoured from the OS and from Settings → Appearance (`MotionConfig` + CSS).

### shadcn/vue components used

Button, Dialog, AlertDialog, Sheet, Tabs, ToggleGroup, RadioGroup, Checkbox, Switch, Select, Popover, Calendar, Command,
DropdownMenu, Collapsible, Tooltip, Sonner, Empty, Progress, Spinner, Kbd, Input, Textarea, PinInput, **Questionnaire**
(set-up), **Message / Bubble** (tutor), **Trace** (labelled waits), **Attachment** (uploads and handwritten work),
**CodeBlock** with Shiki (code in tasks). Generated primitives were restyled through tokens and a few class changes
(`button/index.ts`, `tabs`, `input`, `textarea`, `dialog`, `alert-dialog`).

## Known edges

- Every uploaded file or pasted text yields the same detected sheet; only the four scripted tasks can be worked on.
- Tasks that are already finished show their reflection but cannot be restarted.
- `localStorage` is the only persistence; clearing it returns the app to the signed-out state.
