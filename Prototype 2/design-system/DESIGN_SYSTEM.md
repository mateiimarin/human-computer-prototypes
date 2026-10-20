# Prove-it Companion · Design system

**Direction:** Quiet workspace · **Version:** 0.3 (“Plain”, see §15) · **Updated:** 20 October 2026

A design handoff for Prototype 2. It adds visual and interaction detail to [`PROTOTYPE_ARCHITECTURE.md`](../PROTOTYPE_ARCHITECTURE.md) and does not change its flows, rules (G01–G16), or evidence semantics. Exact values live in [`tokens.css`](tokens.css); the visual reference is [`preview.html`](preview.html).

---

## 1. Design brief

**The promise:** help students tell apart what they can explain on their own from what they could only follow with help.

The interface therefore has two jobs that pull in opposite directions:

1. **Work** should feel as fast and familiar as the AI chat tools students already use, so nobody has to "switch into learning mode" to start.
2. **Verify** should feel noticeably different — quieter, more focused, and honest about what was and wasn't shown — so the moment of "can I do this without help?" is unmistakable.

The visual system is built around that contrast: a neutral, chat-native workspace, plus one clearly signalled **check mode**.

### Reading the inspiration

The ChatGPT screenshots are a direction for *feel*, not for layout or branding:

| Take | Leave |
| --- | --- |
| Near-monochrome palette; colour reserved for meaning | ChatGPT branding, logo, icons, product names, "GPT" model picker semantics |
| Thin icon rail + one centered content column with lots of air | Plugin-marketplace layout and promotional grids |
| Pill-shaped buttons, search and segmented controls; a large rounded composer | Treating every screen as a chat — checks and summaries are *not* conversations |
| Soft, borderless surfaces separated by tone rather than lines | Hover-only affordances (e.g. icon buttons whose meaning only shows on hover) |
| Rendered maths (KaTeX) and calm code blocks inside prose | A "Run" button or any control without a defined outcome (G12) |
| The floating right-hand context card ("Outputs / Sources") | A floating robot mascot or anthropomorphic AI persona |

### Direction and alternatives considered

| Direction | Strength | Trade-off | Decision |
| --- | --- | --- | --- |
| **Quiet workspace** — monochrome, Geist, pill controls, one meaning-colour per state | Familiar to AI-tool users; status colours carry real meaning because nothing else is coloured | Risks feeling generic; needs the check-mode signal to give the product an identity | **Recommended** |
| Warm study (Prototype 1's "Focused study") | Calm and friendly | Too close to P1; makes side-by-side testing of the two prototypes less informative | Not used, so the two prototypes are visually distinguishable in evaluation |
| Exam paper — serif, ruled lines, strict grid | Signals rigour during checks | Slow and formal for the Work stage; fights the "low friction" goal | Borrow only its *quietness* for check mode |

---

## 2. Research translated into design

| Need (report pp. 5–7) | Design response | Observe in testing |
| --- | --- | --- |
| N1 Productive friction | Verification is a distinct visual mode with references physically removed, not just a new tab | Does the student notice they've entered a check? |
| N2 Understanding vs. following | Every result carries **evidence**, **condition** and (separately) **confidence**, each with its own visual grammar | Can the student explain the difference between confidence and evidence? |
| N3 Own attempt first | In checks the student's input is the largest element; feedback appears only after submit | Do students start typing before looking for help? |
| N4 Adjustable scaffolding | Help level lives in the composer (like a model picker) — visible, adjustable, never hidden in settings | Do students find and change help level unprompted? |
| N5 Verification with control | Skip/defer is a quiet but always-present option; one short confirmation; the gap stays visible as *Unverified* | Do students understand the consequence of skipping? |
| Secondary: concise, honest feedback | Feedback cards have a fixed three-part shape: *Covered · Gap · Next* | Can the student name the next action within 5 seconds? |
| Secondary: prioritisation (Wei) | Overview shows **one** next action card above everything else | Does Wei's scenario reach a clear next step without browsing? |

**Persona checks.** *Lukas* can jump to verification and gets terse feedback with no praise. *Mia* gets twin problems and mistake checks one click from any gap. *Wei* always sees one recommended next action and a finite list, never an endless chain.

---

## 3. Principles

1. **Colour means evidence.** The UI is grey. Colour appears only for evidence state, assistance, check mode, and errors. If something is coloured, it is telling you something about understanding or help.
2. **Two modes, one look.** Work and Verify share components, but Verify swaps the companion thread for the student's own input and adds a persistent *References hidden* signal.
3. **Never colour alone.** Every state = icon + text label + colour. Unverified is a *dashed* outline so it is distinguishable in greyscale.
4. **Confidence is not evidence.** Self-ratings are neutral grey with signal-bar icons. They never use the traffic-light hues.
5. **One next move.** One primary (filled pill) action per screen region. Everything else is secondary (tonal pill) or ghost.
6. **Say less.** Short copy, no praise, no exclamation marks. Feedback names a specific point and a specific next action.
7. **Optional looks optional.** Deeper checks, twin problems and exports are offered as tonal choices — never as the primary pill, never with urgency.

---

## 4. Colour

Neutrals occupy ~95 % of any screen. Light and dark themes are both first-class; the app follows the system preference, with a manual toggle in the user menu.

### Foundation

| Role | Token | Light | Dark | Use |
| --- | --- | --- | --- | --- |
| Canvas | `--background` | `#FFFFFF` | `#0E0E0E` | App background |
| Ink | `--foreground` | `#0D0D0D` | `#ECECEC` | Text, icons |
| Secondary ink | `--muted-foreground` | `#5D5D5D` | `#A1A1A1` | Metadata, helper text |
| Raised surface | `--surface-raised` / `--card` | `#F9F9F9` / `#FFF` | `#1B1B1B` | Problem card, session panel, code |
| Composer / muted | `--composer` / `--muted` | `#F4F4F4` | `#212121` | Input fills, segmented track |
| Hover / selected | `--accent` | `#ECECEC` | `#2B2B2B` | Nav rows, ghost hover, selected option |
| Divider | `--border` | `#E6E6E6` | `#2C2C2C` | Decorative only |
| Control edge | `--input` | `#8A8A8A` | `#6B6B6B` | Radio rings, checkbox edges, focused-field edge (≥ 3:1) |
| Primary | `--primary` | `#0D0D0D` | `#ECECEC` | Primary pill — inverts with theme |
| Focus / link | `--ring` / `--link` | `#2F6FE4` / `#1F5FD6` | `#5C9BFF` / `#7AAEFF` | Focus ring, inline links |

### Meaning colours

| Meaning | Surface · foreground · dot (light) | Dark | Icon (Lucide) | Label |
| --- | --- | --- | --- | --- |
| **Demonstrated** | `#E7F5EC` · `#17663F` · `#1E9E5A` | `#0F2A1C` · `#6FD6A0` · `#3ECF86` | `circle-check` | "Demonstrated in check" |
| **Partial** | `#FCF2D9` · `#7D5300` · `#B57D00` | `#2C230E` · `#F0C25A` · `#F0B232` | `contrast` (half-filled circle) | "Partial" |
| **Gap** | `#FDEBEA` · `#AC2E25` · `#DF3B2F` | `#331615` · `#FF958B` · `#FF6A5C` | `circle-alert` | "Gap observed" |
| **Unverified** | `#F1F1F1` · `#5D5D5D` · dashed `#8A8A8A` | `#222` · `#A1A1A1` · dashed `#7A7A7A` | `circle-dashed` | "Unverified" |
| **Assistance** | `#F1EDFB` · `#5B3FB5` | `#221C36` · `#BCA9FF` | `life-buoy` | "Assisted", companion hint, revealed solution |
| **Check mode** | `#E9F0FD` · `#1D55C0` | `#132238` · `#8CBAFF` | `eye-off` | "Independent check · references hidden" |
| **Destructive** | `#C42B20` on white | `#FF7B6E` on `#1B1B1B` | `trash-2` | Discard/reset only — never for a wrong answer |

Rules:

- A wrong answer uses **Gap** colours, not destructive red. Destructive is reserved for actions that delete student input.
- **Assistance violet** marks anything the companion supplied. It is how the student sees "this came from help" at a glance, in the thread, on the stage chip, and on results.
- **Check blue** appears only while an independent check is running. It never appears on Work screens.
- Status surfaces are used for badges and small inline callouts. Never fill a whole page or large card with a status colour.

---

## 5. Typography

**Geist** (interface) and **Geist Mono** (code), both open source (SIL OFL), available as `geist` on npm and on Google Fonts. Geist is close in spirit to the neutral grotesque of the inspiration, and pairs naturally with the Nuxt/Vercel stack. Maths is set with **KaTeX** — never in monospace.

| Role | Size / line height | Weight | Use |
| --- | --- | --- | --- |
| Display | 32 / 40 | 600, −1.5 % | Overview greeting, summary headline. Max one per screen |
| Page title (H1) | 24 / 32 | 600, −1.5 % | Destination titles, stage titles |
| Section | 18 / 26 | 600 | Card titles, section headings |
| Body large | 16 / 28 | 400 | Companion prose, question text, explain-it-back input |
| Body | 15 / 24 | 400 | UI body, list rows, feedback |
| Label | 14 / 20 | 500 | Buttons, tabs, field labels, badges |
| Caption | 12 / 16 | 500 | Overlines (uppercase, +4 % tracking), counts, timestamps |
| Code | 14 / 24 | 400 | Geist Mono, ligatures off |

Measure: 60–75 characters for prose. Use `text-wrap: balance` on headings, `pretty` on paragraphs. Use the tabular figures feature (`font-variant-numeric: tabular-nums`) for counts and pre/post scores.

### Voice

Direct, calm, specific. The companion speaks in short paragraphs and asks one question at a time.

| Write | Don't write |
| --- | --- |
| "You covered the recurrence. You didn't explain why earlier subarrays can be dropped." | "Great job! You're almost there 🎉" |
| "Skipping leaves *Optimal substructure* unverified. You can come back to it from Review." | "Are you sure? You'll lose progress!" |
| "Sample feedback — prepared for this walkthrough." | "AI analysis complete" |
| "3 of 5 sub-concepts checked" | "60 % mastered" |

---

## 6. Layout, spacing, shape

- **Spacing:** 4 px base — 4, 8, 12, 16, 20, 24, 32, 40, 48, 64. Inside cards 20–24 px; between sections 40–48 px; between related controls 8 px.
- **Shell:** a 56 px icon rail (expands to a 260 px sidebar) + a top bar (56 px) + one centered column. Thread-type screens (Work, questions, explain-it-back) are capped at **768 px**; page-type screens (Overview, Concepts, Review, Summary) at **1040 px**.
- **Shape:** pills for anything you press or toggle (buttons, badges, segmented controls, search). 12 px fields and option rows, 16 px cards and code blocks, 20 px floating panels and sheets, 28 px composer.
- **Surfaces:** flat. Separate regions by tone (`--surface-raised` on `--background`), not by borders. Use a 1 px `--border` only for floating layers, tables, and between list rows. Never nest a card inside a card.
- **Elevation:** only the composer (subtle), popovers, and dialogs have shadows. In dark mode, elevation is expressed by a lighter surface plus a 1 px ring.

### Responsive

| Width | Composition |
| --- | --- |
| ≥ 1280 px | Icon rail (or 260 px sidebar) · centered column · floating session panel (320 px) on the right during a session |
| 1024–1279 | Rail · column; session panel collapses into a top-bar button that opens a right `Sheet` |
| 768–1023 | Rail hidden behind a menu button (`Sheet` from left); stage stepper shows current stage name + "2 of 4" |
| < 768 | 16 px gutters, full-width composer pinned to the bottom with safe-area padding; actions stack; tables become stacked rows |

---

## 7. App shell and navigation

**Rail / sidebar** (shadcn-vue `Sidebar`, `collapsible="icon"`): product mark, course switcher, Overview, Study, Concepts, Review; resume card and user menu at the bottom. Active destination = `--accent` fill + medium weight. Labels appear as tooltips in collapsed mode *and* are available to screen readers.

**Top bar:** left — course · topic breadcrumb; centre — the **stage stepper** when in a session; right — session-panel toggle, overflow menu.

**Stage stepper** (`Stepper`): four text steps — *Prepare · Work · Verify · Review* — in a pill track. Done steps show a check; the current step is a filled pill; future steps are muted text. Skipped or partially verified stages show a small dashed ring (Unverified). It is a landmark, not a progress bar, and never shows a percentage.

**Session panel** (borrowed from the reference's floating card): course/topic, stage, checks completed/skipped list, current help level, and "Leave & resume later". Collapsible; always reachable.

---

## 8. Component contracts (shadcn-vue)

Keep shadcn-vue semantics, keyboard handling, and focus management. Restyle variants with these tokens.

### Base components

| Component | Variant(s) | Appearance |
| --- | --- | --- |
| `Button` | `default` | Pill, 40 px, `--primary` / `--primary-foreground`, 14/20 medium, 16–20 px padding. One per region |
| | `secondary` | Pill, `--secondary` fill, ink text. Optional actions ("Add a deeper check") |
| | `outline` | Pill, 1 px `--input` edge. Used sparingly (e.g. "Do this later") |
| | `ghost` | No fill until hover (`--accent`). Navigation, tertiary actions, "Skip" |
| | `destructive` | Pill, `--destructive`. Only in `AlertDialog` for discard/reset |
| | `icon` | 36 px circle, ghost, 20 px icon, always has `aria-label` + tooltip |
| `Input` (search) | — | Pill, 44 px, `--composer` fill, leading search icon. Like the reference's search |
| `Textarea` | — | 12 px radius, `--composer` fill, no visible border at rest; `--input` edge + ring on focus. Visible label above |
| `Badge` | `evidence-*`, `assist`, `check`, `neutral` | Pill, 24 px, 12/16 medium, icon 14 px + text |
| `Card` | — | 16 px radius, `--surface-raised`, no border, no shadow, 20–24 px padding |
| `Tabs` / `ToggleGroup` | segmented | Pill track in `--muted`, selected segment `--background` (light) / `--accent` (dark) with medium weight. Like "Plugins / Skills" |
| `RadioGroup` (quiz option) | option row | 12 px radius row, 48 px min height, visible radio ring (`--input`), whole row clickable; selected = `--accent` fill + filled ring |
| `Checkbox` | — | 4 px radius, `--input` edge, ink fill when checked |
| `Switch` | — | Ink track when on; used in exam scope topics |
| `Dialog` / `AlertDialog` | — | 16 px radius, `--shadow-dialog`, max 480 px, title + one paragraph + right-aligned actions |
| `Sheet` | right / left / bottom | 20 px inner radius on the free edge; session panel on narrow screens; mobile help picker |
| `DropdownMenu` / `Select` | — | 12 px radius popover, 10 px rows, check icon for current value |
| `Tooltip` | — | Supplementary only; never the only place information lives |
| `Progress` | coverage | Only with a visible denominator ("3 of 5 checked"). Never readiness or mastery |
| `Sonner` | — | Bottom-centre pill toast for local confirmations ("3 questions saved to Review") |
| `Skeleton` | — | Prepared loading ≤ 800 ms; always ends |
| `Accordion` / `Collapsible` | — | Concept → sub-concepts; "Show worked solution" |
| `Table` | — | Pre/post comparison; row separators only, no vertical lines |

### Domain components

| Component | Built from | Contract |
| --- | --- | --- |
| **`EvidenceBadge`** | `Badge` | `state: demonstrated \| partial \| gap \| unverified`. Icon + label + colour, always all three. Unverified uses a dashed outline |
| **`ConditionTag`** | `Badge` neutral/assist | `independent` (user icon) · `assisted` (violet, life-buoy) · `skipped` (skip-forward) · `deferred` (clock) · `not attempted` (minus). Explains *how* evidence was produced |
| **`ConfidencePicker`** | `ToggleGroup` | Segmented pill: *Low · Medium · High* with signal-bar icons. Neutral colours only. Optional per item; label "How sure are you?" |
| **`ConfidenceTag`** | `Badge` neutral | Read-only "You said: High" with signal icon. Shown next to — never merged with — evidence |
| **`QuestionCard`** | `Card`, `RadioGroup`, `Textarea` | Question counter ("2 of 5"), question in body-large, options or free input, ConfidencePicker, footer: Back (ghost) · *I don't know* (secondary) · Next (primary). Skip lives in the overflow ("Skip this check") |
| **`CompanionMessage`** | prose + KaTeX + code | Companion text has **no bubble** (like the reference); the student's messages sit in a `--muted` 20 px bubble aligned right. Hints get a violet left-rule card labelled "Hint 1 of 3" |
| **`Composer`** | `Textarea`, `Button`, `DropdownMenu` | 28 px radius, `--composer` fill, `--shadow-composer`. Left: + (attach / paste work). Right: **help-level picker** ("Hints only ▾"), mic, send (filled circle). Grows to 8 lines then scrolls |
| **`HelpLevelPicker`** | `DropdownMenu` | Four plain levels: *Questions only · Hints · Step-by-step · Show solution*. "Show solution" opens a confirmation (it marks related checks as assisted). Current level always visible |
| **`ProblemCard`** | `Card`, `Collapsible` | Pinned at the top of Work and Verify: exercise title, statement (KaTeX), source sheet. Collapses to one line on scroll. **Remains visible in Verify** (architecture §5.4) |
| **`CheckModeBanner`** | `Alert` check | Persistent strip under the top bar during independent checks: eye-off icon, "Independent check · your chat and solutions are hidden", and a ghost action "Show references" → confirmation → attempt becomes **Assisted**; draft preserved |
| **`ExplainBackInput`** | `Textarea`, `ToggleGroup` | Large composer-style input (min 6 lines) with *Type · Speak* toggle. Speak shows a record button, a prepared transcript and an editable textarea before submit |
| **`FeedbackCard`** | `Card` | Fixed anatomy: label "Sample feedback" · **Covered** (✓ list) · **Gap** (one specific item, Gap colour) · **Next** (one action button). No score, no praise |
| **`DeeperCheckChooser`** | `Card` + `Checkbox` | Two optional cards: *Defend your solution* (≈3 questions) and *Spot the planted mistake* (1 solution). Primary stays "Continue to post-quiz"; chooser actions are secondary |
| **`MistakeLine`** | list row | Numbered solution lines; selectable; selected line gets `--accent` and a text field "What's wrong here?" |
| **`SkipConfirm`** | `AlertDialog` | One dialog per skip or batch: "Skip this check? *Recurrence* will stay **Unverified**. You can return from Review." Actions: *Keep going* (primary, focused) · *Skip* (ghost). No countdown |
| **`ConceptRow`** | `Accordion` | Concept name, mixed-state mini-bar (one segment per sub-concept, each with its own colour + count text), chevron. Expands to sub-concepts with `EvidenceBadge` + `ConditionTag` + "See evidence" |
| **`PrePostTable`** | `Table` | Item · Before · After · Confidence. Cells use ✓ / ✗ / "—" (skipped) / "no baseline", with text. Claims listed in a separate table below |
| **`NextActionCard`** | `Card` | The one recommendation: title, one-line reason, primary button. Secondary list of at most 2 alternatives |
| **`ReviewQueueItem`** | row + `Checkbox` | Question preview, concept, source session, due label; select/exclude/restore |
| **`ExamScopeForm`** | `Popover`+`Calendar`, `Switch`, `ToggleGroup` | Exam date, included topics, priority (Low/Normal/High). Prepared queue updates live with a one-line explanation of why |
| **`EmptyState`** | — | 40 px muted icon, one sentence, one action. No illustrations |
| **`SampleLabel`** | caption | "Sample feedback" / "Prepared example" with an info icon; required on any free-text feedback (§9 of the architecture) |

### States for every interactive component

| State | Treatment |
| --- | --- |
| Hover | Fill shifts one step (`--accent` / `--primary-hover`); no movement |
| Pressed | Same fill as hover; no scale, bounce or geometry change |
| Focus-visible | 2 px `--ring` outline, 2 px offset, never clipped |
| Disabled | `--muted` fill, `--muted-foreground` text, with a nearby reason ("Answer all 5 to submit, or skip remaining") — no 40 % opacity |
| Loading | Label changes ("Preparing feedback…"), spinner in reserved space, ≤ 800 ms, then always resolves |
| Error | Inline text under the field + `aria-invalid`; input retained; Retry for simulated failures |

---

## 9. Screen patterns

These summarise each architecture screen's visual priority. The order of elements is top → bottom.

**Overview** (page width). Display greeting ("Good afternoon, Mia") · `NextActionCard` (resume session *or* start) · Concept overview: 4–6 `ConceptRow`s with "View all" · Due review card with count · Exam date chip. First-use state: one card "Pick a topic to start" with Study button.

**Study setup** (page width). Search pill · segmented *Topics · Sheets · Upload* · list of topics or sheet → exercises (option rows) · selected context summary + the four stages explained in one line each · primary "Start pre-quiz". Incomplete selection disables Start with a reason.

**Pre-quiz** (thread width). `QuestionCard` × N, results hidden. After submit: "Baseline saved — results appear after your check." Then two equal **secondary** options: *Work on it* / *I've already done this* (→ short `AlertDialog` explaining what's bypassed), plus "Skip pre-quiz" as ghost.

**Work** (thread width + session panel). `ProblemCard` pinned · companion thread · optional "Recall a past problem" card (only when a match exists) · `Composer` at bottom with help-level picker · primary **"Check my understanding"** in the top-right of the thread header, plus "I worked elsewhere" in the overflow. Assistance is visible in-thread through violet hint/solution cards.

**Explain it back** (thread width, check mode). `CheckModeBanner` · `ProblemCard` · prompt "Explain the approach, the key steps, and why they hold." · `ExplainBackInput` · Submit. After submit: `FeedbackCard`, then `DeeperCheckChooser`.

**Deeper checks** (thread width, check mode). Finite stepper "Question 2 of 3" · "Finish" always visible. Incorrect answer → inline *Explain your mistake* prompt, not a new screen.

**Post-quiz & claims** (thread width, check mode). Same `QuestionCard`s; claims section visibly separated ("Additional claims — not part of the before/after comparison").

**Summary** (page width). Headline answering Q1 in one sentence · four summary blocks in order: *Demonstrated · Gaps & unverified · Before → after · Next* · concept evidence list · actions: Save questions to Review (secondary), Try a twin problem (secondary), Back to Overview (primary). New attempts (twin) are appended with a "Retry · 14:32" label, never replacing the first.

**Concepts** (page width). Filter pills (All · Gaps · Unverified · Demonstrated) · `ConceptRow` accordion · detail: sub-concepts, latest evidence with date and condition, past sessions, "Practise this gap".

**Review** (page width). Segmented *Library · Due · Exam plan* · library with `ReviewQueueItem`s, select → "Start review (6)" / "Export preview" · Exam plan: `ExamScopeForm` + prepared queue with explanation. Empty library: `EmptyState` "No saved questions yet — save them from a session summary."

---

## 10. Motion

| Token | Duration | Use |
| --- | --- | --- |
| `--duration-instant` | 80 ms | Hover, press |
| `--duration-fast` | 150 ms | Toggle, badge change, collapsible |
| `--duration-normal` | 220 ms | Dialog, sheet, new message fade-up (8 px) |
| `--duration-stage` | 320 ms | **Work → Verify**: the companion thread fades and collapses up; the check banner slides down; problem card stays put as the anchor |

Easing: `--ease-out` for entries, `--ease-in` for exits. No typing animation for prepared companion text — show it at once with a 150 ms fade. No confetti, no bouncing, no pulsing badges. With `prefers-reduced-motion`, all durations are 0 and stage changes are instant swaps.

---

## 11. Accessibility

- WCAG 2.2 AA target. All text pairs ≥ 4.5:1 and all state dots / control edges / focus rings ≥ 3:1, in **both** themes (see [VALIDATION.md](VALIDATION.md)).
- State is never colour-only: icon + text + colour; Unverified additionally uses a dashed outline.
- Targets ≥ 40 px for buttons; 36 px icon buttons have ≥ 4 px spacing; option rows ≥ 48 px.
- One H1 per screen; on route or stage change, focus moves to the new H1. After a dialog closes, focus returns to the trigger.
- Check mode is announced (`role="status"`) once on entry: "Independent check started. Chat and solutions are hidden."
- The help-level picker, confidence picker and stepper are fully keyboard-operable (arrow keys in groups).
- Reflow to 320 px with no horizontal page scroll; maths and code scroll in their own focusable regions.

---

## 12. Technical content

- **Maths:** KaTeX (`output: 'htmlAndMathml'`, `trust: false`), inline in prose and display blocks left-aligned. Body-large text size. Long expressions scroll locally.
- **Code:** Shiki with `github-light` / `github-dark` matched to theme; 16 px radius block on `--surface-raised`, header row with language label and a working Copy button (copies exact source, toast confirms). No Run button.
- **Inline code:** Geist Mono, `--muted` background, 6 px radius.

---

## 13. Handoff

1. Initialise Nuxt + shadcn-vue (CSS variables on, Tailwind v4). Add `@nuxtjs/color-mode` with `classSuffix: ''` so `.dark` is applied to `<html>`.
2. Copy `tokens.css` and `tailwind-theme.css` into `assets/css/`, import them after `tailwindcss` in `main.css`, and replace the shadcn-generated variable block.
3. Install the `geist` font package (or self-host) and `lucide-vue-next` for icons (20 px, 1.75 stroke; 16 px in badges).
4. Restyle generated components' variants per §8 rather than wrapping them; build domain components on top.
5. Keep sample content in one data module so concept names and evidence agree everywhere (G16).

**Acceptance:** all ten walkthroughs in architecture §11 work; both themes checked at 375 / 768 / 1024 / 1280 / 1440 px; keyboard-only run of a full core session; reduced-motion run; no control without an outcome.

## 14. Sources

- [Needfinding report](../../../Milestone%201%20-%20Needfinding/Needfinding_Report_Final.pdf) — personas pp. 2–4, key needs pp. 5–7, secondary needs pp. 7–8.
- [Prototype architecture](../PROTOTYPE_ARCHITECTURE.md) — IA, flows, evidence states, G01–G16.
- Two ChatGPT screenshots supplied by the team — mood reference only; no logos, product names, or proprietary assets reused.
- Prototype 1 design system — used for handoff structure only; visual direction intentionally different.
- [shadcn-vue theming](https://www.shadcn-vue.com/docs/theming), [Geist](https://vercel.com/font), [Lucide](https://lucide.dev), [KaTeX](https://katex.org), [WCAG 2.2 contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

## 15. v0.3 “Plain”: less decoration, more meaning

v0.2 added atmosphere (gradient buttons and chips, aurora hero cards, serif accents, vanity stat tiles). It read as busy and made the learning path harder to follow. v0.3 keeps every token and evidence meaning and removes what did not help a student decide or understand.

**Rule of thumb:** colour and icons appear where they *mean* something. A tinted icon tile says what kind of thing a row is; it is never there to fill space.

| Element | Rule |
| --- | --- |
| **Gradient** | One only: the resume card in the sidebar (`.hero-field`). Never on buttons, chips, the stepper, avatars or the logo |
| **Buttons** | Primary is the solid ink pill (`default`). Secondary is `outline`, tertiary `ghost`. There is no `brand` or `hero` variant |
| **Logo** | A solid ink square with a check, plus the word “Prove-it”. One colour, no gradient |
| **Semantic tint tiles** | Icon in a 40–48px rounded tile: `assist` (companion help, Work), `check` (verification), `partial` (caution, skipping ahead), `gap` (practise a gap), `muted` (neutral). These are the only coloured fills outside evidence |
| **Evidence ring** | One arc per sub-concept, centre shows checked/total. Used on Concepts, concept detail, Overview, Study topics and the summary headline. Unverified arcs are dashed, never filled |
| **Evidence bar** | Not used next to a ring (one encoding per fact) |
| **Condition tags** | Shown only where the reason matters: *Unverified* rows say whether it was assisted, skipped or postponed. A result that is partial, gap or demonstrated is independent by definition and is not tagged |
| **Overlines and eyebrow labels** | None. The stepper already names the stage; each screen has a title, one line on what to do and, where useful, a “Next:” line on what follows |
| **Check mode** | Banner plus a faint edge (`.check-vignette`); the Verify step in the stepper takes the `check` tint |
| **Raised surfaces** | One panel style: 1px border, 16–20px radius, no fill (problem statement, next step, session details). Lists use dividers |
| **Motion** | Short and functional: 240ms page change, 280ms entrances, question slides. No blur, count-ups or drifting backdrops. Honours `prefers-reduced-motion` and the Settings switch |

**Sidebar.** Expanded 256px, collapsed **56px** (8px padding, 40px targets). Collapsed shows the mark, the course initials, four icons (Review carries a dot when questions are due), a resume icon when a session is open, and the avatar. Every icon-only control keeps an accessible name and a tooltip. There is no separate *New session* button; Study is the way in.

**Top bar.** Sidebar toggle, course name, search. Exam countdown, theme toggle and statistics live where they belong (Overview and the account menu).
