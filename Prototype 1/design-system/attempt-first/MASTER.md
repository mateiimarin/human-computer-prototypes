# Attempt First · Focused study

**Version:** 0.2, proposed design direction · **Updated:** 19 October 2026

**Revision 0.2:** Refined in response to user feedback: adult academic-tool styling, smaller radii, fewer nested boxes, more disciplined spacing, and rendered math/code examples.

> **Revision 0.3 (20 October 2026), warm and vivid.** The app now lives in `app/app/assets/css/tokens.css`, which is the source of truth for colour and shape. Changes from 0.2, made at the brief's request to feel like a premium product rather than a flat tool:
> - **Colour:** same semantic roles, higher saturation. Sunshine `#FFC93C` stays the primary action. Added tangerine, coral, lilac, iris, mint and forest for hero fields, course art, origin labels and status. Hero gradients (`--grad-*`) appear behind headlines and illustration only, never behind student writing or equations.
> - **Type:** Bricolage Grotesque for headings and display numbers, Inter for body and controls, JetBrains Mono for code, Caveat for the handwritten sample.
> - **Shape and depth:** radii 12 / 16 / 22 / 28 px (controls to major surfaces), pill buttons, soft coloured shadows on primary actions and floating surfaces, a faint paper grain.
> - **Surfaces:** fewer boxes. Rows with dividers and whitespace replace card grids; the writing sheet and a few focused panels keep a raised surface.
> - **Motion:** staggered entrances, spring layout pills and labelled waits are allowed. Reduced motion removes them. Tokens in section 9 remain the defaults for hover and disclosure.
> - **Layout:** the app has a sidebar (desktop) or tab bar (phone) for Today, Library, History and Settings. The journey itself keeps its own focused header.
> Everything below describes v0.2 and still applies unless it conflicts with this note.

## 1. Design brief

Help university students stay responsible for their reasoning while using bounded AI guidance. Success means students can identify their next action, work without opening the tutor, understand the help agreement, recover from a mistake, and inspect where visible contributions originated.

The app is a study workspace. Give the student's attempt the strongest spatial and visual priority. Assistance should feel available and approachable, without competing for attention or implying that accepting help is failure.

This specification adds visual and interaction detail to `PROTOTYPE_ARCHITECTURE.md`. It preserves the five destinations, answer lock, deliberate assistance increases, revision loop, and honest contribution history. It proposes design defaults; it does not claim the learning approach has been validated. The report is based on reported experiences and a convenience sample, with conflicting preferences about enforced recall.

### Direction and alternatives considered

| Direction | Strength | Trade-off | Decision |
| --- | --- | --- | --- |
| **Focused study**: warm neutrals, Inter, restrained yellow, flat surfaces | A precise, adult workspace with a little warmth from the supplied reference | Bright accents need careful restraint and dark text | Recommended throughout this handoff |
| Academic editorial: navy, serif headings, rigid grids | Familiar scholarly tone and clear structure | Can feel institutional; less aligned with the reference | Retain its hierarchy and disciplined alignment |
| Playful learning: clay surfaces, vivid multicolor cards | Friendly and immediately expressive | Toy-like controls and decoration compete with technical reasoning | Exclude the toy-like treatment; retain only approachable language |

### Reading the reference image

Transfer the reference's warm neutrals, charcoal text, and restrained accent color. The revised system uses Inter, compact geometry, and flat section structure. Avoid mascots, smiley illustrations, oversized rounded cards, and nested borders. Spacing should support a working tool rather than a wellness presentation.

Adapt those qualities to a desktop work surface: persistent exercise context, a readable attempt area, and optional contextual assistance. The mobile tab bar, tall player view, promotional collections, oversized artwork, and full-screen color fields do not serve the working flow. No artwork behind equations or student input.

## 2. Research translated into design

| Evidence | Design response | What to observe in a usability session |
| --- | --- | --- |
| N1: productive friction | One contextual question at a time; short explained pause only when increasing help | Student can explain why the pause occurs and can cancel |
| N2: cognitive agency | Labeled contribution entries linked to an attempt step or exchange | Student can find evidence and correct an attribution |
| N3: own attempt first | Attempt has the largest surface; blank start selected; help initially closed | Student begins without having to instruct the tutor to avoid spoilers |
| N4: incremental scaffolding | Revealed, available, and gated hint stages; exact remaining budget in text | Student can identify the next contribution and hint cost |
| N5: verification with autonomy | Explicit review, specific feedback, revision, finish with gaps | Student can leave review without being trapped or marked as mastered |
| Secondary: concise answers and honest critique | Brief tutor turns; feedback names a step and a gap; no filler praise | Student can identify the requested action without rereading a long answer |
| Secondary: judgment-free questions | Neutral empty states and a visible “I don't know where to start” path | Student with no attempt can obtain a starter question |

**Persona checks:** Lukas can keep help closed and request concise critique. Mia can choose a scaffold and follow bounded hints. Wei can identify one next step without opening a branching explanation chain. These are design accommodations, not separate persona modes or ability labels.

## 3. Principles

1. **The attempt leads.** A tutor never replaces, overwrites, or dominates student work.
2. **One next move.** One high-emphasis action per active task context. Secondary actions remain visible and plain.
3. **Help has an agreement.** Show the applied assistance and remaining hints before a request. Pending changes look different from applied settings.
4. **Friction has a purpose.** Gate new guidance with a contribution; keep navigation, rereading, cancellation, and recovery immediate.
5. **Feedback stays specific.** Name the affected reasoning, submitted version, and next step. Avoid scores that imply understanding.
6. **History has evidence.** Use “You introduced,” “AI prompted,” “AI supplied,” “Mixed,” and “Unclear.” Never equate these labels with mastery.

## 4. Color system

All exact values live in `tokens.css`. Components consume semantic variables. Warm neutrals should occupy most of a working screen; yellow occupies a small fraction and identifies the primary action or a selected emphasis. Lavender is reserved for assistance; it is not the brand action color.

| Role | Token | Value | Use |
| --- | --- | --- | --- |
| Paper | `--background` | `#FAF8F3` | App canvas |
| Surface | `--card` | `#FFFFFF` | Attempt, raised cards, dialog |
| Ink | `--foreground` | `#2F302C` | Body text, headings, icon strokes |
| Secondary ink | `--muted-foreground` | `#68645D` | Helper text and metadata, never low-opacity gray |
| Quiet surface | `--muted` | `#F0EDE6` | Supporting panels, code surface |
| Divider | `--border` | `#DFDAD0` | Decorative structure; insufficient by itself to identify a form control |
| Control edge | `--input` | `#8D877A` | Input outline and unselected radio boundary |
| Sunshine | `--primary` | `#F6C945` | Main action with ink foreground |
| Sunshine hover / press | `--primary-hover` / `--primary-active` | `#E9B931` / `#DCAA23` | Same geometry; no scale or bounce |
| Quiet hover | `--accent` | `#E8E3D9` | Ghost actions and menu rows |
| Guidance | `--guidance` / `--guidance-foreground` | `#F0EBF7` / `#655285` | Tutor labels, assistance context, focus ring |
| Student origin | `--student` / `--student-foreground` | `#EAF1EB` / `#325E4D` | A contribution's origin, not its correctness |
| Mixed origin | `--mixed` / `--mixed-foreground` | `#F9EDCE` / `#795116` | Mixed authorship with explicit label |
| Neutral origin | `--unclear` / `--unclear-foreground` | `#EEECE6` / `#5F5B55` | Unclear attribution with explanation |
| Review gap | `--warning` / `--warning-foreground` | `#FBF0D7` / `#7A4B13` | Reasoning to revisit; not a destructive action |
| Resolved review | `--success` / `--success-foreground` | `#EAF1EB` / `#325E4D` | “No issues found in this review,” with icon and text |
| Invalid / destructive | `--destructive` | `#A63D32` | Form errors and destructive confirmation; pair with `--danger-surface` for inline errors |
| Apricot decoration | `--apricot` | `#F5A66F` | Reserved palette value, not used for decorative mascots |

Use dark text on sunshine and apricot. Do not use white text on these fills. Origin and feedback colors share some primitives but use different semantic names and explicit labels. A green contribution label must never read as “correct.”

The default action fill remains yellow; selected radio rows use a checked indicator and a strong edge. A colored fill is optional and must never be the only selection cue. Use whitespace and headings to group noninteractive sections; reserve visible boundaries for meaningful structure.

## 5. Typography and content

Use **Inter** for headings, body text, and controls, and **JetBrains Mono** for code. Use 400 for prose, 500 for actions and labels, 600 for headings. Avoid heavy 800-weight headings and rounded novelty typography. Keep body text readable; maturity should come from structure rather than small type.

| Role | Size / line height | Weight | Rule |
| --- | --- | --- | --- |
| Entry display | 40 / 48 px desktop; 32 / 40 px narrow | 600 | Max 20 characters per line approximately; balance short headings |
| Destination heading | 30 / 38 px; 26 / 34 px narrow | 600 | One H1 per destination |
| Section heading | 22 / 30 px | 600 | One clear topic |
| Card heading | 18 / 26 px | 600 | Prefer two lines over truncation |
| Body / editable work | 16 / 26 px | 400 | Default reading and input size |
| Secondary / label | 14 / 20 px | 500 / 400 | Actions and metadata still readable |
| Caption | 12 / 18 px | 600 | Nonessential metadata only |
| Code | 14 / 24 px | 400 | JetBrains Mono; preserve source indentation |

Use rem units. Reading measure: 60–72ch on desktop, naturally shorter on phones. Let task titles, labels, and user content wrap. Use `min-width: 0` on shrinking grid/flex children and `overflow-wrap: anywhere` for long URLs or identifiers. Math and code are already rendered in the reference board. Use the same dedicated rendering approach in the eventual app; see [TECHNICAL_CONTENT.md](TECHNICAL_CONTENT.md). Math is typeset with KaTeX HTML + MathML. Code is rendered with Shiki syntax highlighting and semantic `pre`/`code`. Never style mathematics as a monospace code snippet or fake superscripts through Unicode characters. Preserve editable source separately from its rendered preview. Long formulas and code scroll locally rather than stretching the page.

**Tone:** direct, calm, precise. Use “What have you tried?”, “Add a first step, or tell the tutor where you're stuck,” “This review refers to attempt 1,” and “Explain why this step fails.” Avoid “Amazing work!”, “You failed,” “Only 1 hint left!”, and “You understand 80%.”

Use the architecture's vocabulary: exercise sheet, task, attempt, tutor, hints, assistance agreement, review, reflection. Technical implementation labels belong outside the student journey. State “Sample exercise · prepared feedback” at entry and where an outcome could otherwise appear to evaluate arbitrary work. Do not show “Saved” when durable saving does not exist.

## 6. Layout, spacing, and surfaces

- Base rhythm: 4, 8, 12, 16, 24, 32, 48, 64 px. Standard card padding 24 px; 16 px on narrow screens. Section gaps 32–48 px. Related controls 8–12 px apart.
- Maximum app content width: 1440 px. Desktop gutter 32 px; tablet 24 px; phone 16 px. Single-column setup and reflection content: maximum 760 px; feedback: maximum 1120 px.
- Corners: 4 px compact labels, 6 px controls, 8 px selections, 10 px cards, 12 px major surfaces. Status labels use compact rectangles rather than a row of pills. Use the same radius for components with the same role.
- Start with unboxed sections. Use a single border only where it identifies a control, separates adjacent workspace regions, or defines a floating surface. Avoid a card inside a card inside a card. The workspace has one outer frame and shared column dividers; its attempt has no second card outline. Keep the editor boundary separate from surrounding layout decoration. Default surfaces have no shadow.
- Use medium shadow for popovers and large shadow for modal dialogs only. No inset clay shadows, glass blur, glossy gradients, or decorative floating panels.
- Layers: base 0, local raised 10, sticky task header 20, floating menus 40, modal backdrop 50, modal 60, transient status 70. Keep only one modal active.

### Responsive composition

| Viewport | Composition |
| --- | --- |
| **1280 px and above** | Three columns when assistance is open: 240–280 px exercise context, flexible attempt (at least 480 px), 320–360 px help rail. Use shared dividers between workspace columns and 24 px internal padding; do not add gaps plus separate card outlines between every region. Help closed: two columns and a centered readable attempt. Tutor and contribution history share one rail with tabs. |
| **1024–1279 px** | Exercise context becomes a full-width collapsible block above the work area. Attempt and help rail sit beside each other; preserve at least 480 px for the attempt. |
| **768–1023 px** | Single main work column. Help/contribution history opens in a modal side Sheet, max 440 px, with explicit close and return focus. |
| **Below 768 px** | Task context above attempt; help Sheet uses full available width. Actions wrap or stack. Source badges wrap. No compressed desktop columns or bottom tab bar. |

When zoom or content growth leaves insufficient room for the documented minimum column widths, collapse to the next simpler composition. Use content fit in addition to viewport breakpoints. Never shrink body text to retain a column.

Use one document scroll by default. A modal may scroll internally while its background is locked. Avoid independent exercise/editor/tutor scroll containers unless testing demonstrates a need. Keep the review action in normal flow beneath the attempt. Sticky headers need scroll offsets; no floating composer or footer may cover the attempt or keyboard focus.

## 7. Component contracts for shadcn-vue

Use shadcn-vue primitives for behavior, then apply these tokens and local variants. Build domain components around them. Keep semantics, focus handling, Escape behavior, and accessible names intact.

| Domain component | Primitive(s) | Appearance and behavior |
| --- | --- | --- |
| Primary action | `Button` default | 44 px minimum height, 16 px horizontal padding, 6 px corners, sunshine/ink, 14 px medium label. One per active context. |
| Secondary / tertiary action | `Button` outline / ghost | Ink text, control-edge outline where needed, quiet hover. No yellow fill. Text links underlined in prose. |
| Task choice | `RadioGroup`, `Label`, `Card` | Whole label area selects; explicit radio indicator; title and short description. Selection adds a checked indicator and an ink edge, without a full yellow fill. Continue is a separate action. |
| Assistance choice | `RadioGroup`, `Label` | Plain language: “Questions only” / “Questions + limited hints.” Never a vague low–high slider by default. Show the hint allowance explicitly. |
| Attempt editor | `Textarea`, `Label` | White surface, 16 px text, 26 px line height, 280 px suggested minimum height, visible control edge, top-aligned label. Resize vertically. No placeholder-only label. |
| Sample attachment | `Button` outline, `Dialog` | “Use sample handwritten attempt” opens a labeled sample preview with Use sample / Cancel. File upload is not required. |
| Exercise context | `Collapsible`, `Separator` | Task and notation remain easy to reopen. Collapsible on small screens; preserve expansion state within session. |
| Help / contribution switch | `Tabs` | Two tabs, explicit active underline and text weight; native arrow-key behavior. Hide neither essential agreement nor current budget behind a tooltip. |
| Tutor turn | `Card`, `Textarea`, `Button` | Compact guidance label, one short question, student response field. Use a quiet inset or a single leading rule for a revealed hint, not another large rounded card. Prefer 1–3 sentences; use a disclosure for optional detail. No huge chat bubbles or fake typing stream. |
| Hint ladder | Custom ordered list, `Button`, `Collapsible` | Named stages: Hint → Your reasoning → Recall. Each stage has textual status; future gates explain the required contribution. No mastery progress bar. |
| Assistance agreement | `Badge`, `Button` ghost | “Questions + hints · 2 of 3 remaining” and “Final answers stay hidden.” Change is an explicit action. |
| Assistance change | `Dialog`, `RadioGroup`, `Button` | Current versus proposed values, consequence text, cancelable pause for increases, explicit Apply. Initial focus on heading/content or safe control. Never apply on selection. |
| Feedback issue | `Alert`, `Card`, `Button` | Ochre reasoning-gap treatment with icon, step reference, snapshot number, precise issue and Explain action. Invalid input uses red separately. |
| Mistake explanation | `Textarea`, `Label`, `Button` | Inline detail beside the selected issue where room allows. Explain before guided revision; close/back preserves draft. |
| Contribution evidence | `Badge`, `Collapsible`, `Button` ghost | Explicit origin, step title, evidence link/disclosure, “Flag attribution” action. No percentages, ranking, or inferred thinking-time chart. |
| Inline feedback | `Alert`, `Label` | Error near the related input, `aria-describedby`, `aria-invalid`; preserve entered text. Focus a linked summary on multi-field submit errors. |
| Destructive leave/reset | `AlertDialog` | Describe what is discarded; Stay is safe and initially focused. Discard and leave is destructive red. Ordinary Back never needs this dialog. |
| Minor completion notice | `Sonner` or inline `role=status` | Local confirmation, e.g. “Attribution flagged.” Essential errors and budget limits persist inline. |

No library `Sidebar` is required for global navigation: this app has a task journey, not a permanent admin navigation tree. `Progress` is appropriate only for known setup steps or a labeled wait; it must not imply measured understanding. No active course map, account, rewards, speech input, or quiz controls in the core design.

### Button and field states

| State | Button | Field / selection |
| --- | --- | --- |
| Rest | Canonical fill and readable text | Control edge; persistent visible label |
| Hover | Semantic hover fill; unchanged bounds | Edge strengthens; no instruction available only on hover |
| Pressed | Active fill; no bounce or geometry shift | Selection indicator updates immediately |
| Focus-visible | 3 px guidance-colored outline, 3 px paper offset | Same ring, never clipped by parent overflow |
| Disabled | Explicit disabled fill/text, no reduced opacity on the whole component | Explain the prerequisite next to the field/control |
| Busy | Short label (“Preparing review…”), reserved spinner space, prevent duplicate submission | Keep the attempt visible; status announced once |
| Error | Persistent inline explanation; Retry where applicable | Red outline, error text and icon; text retained |

A truly disabled action is inert. A locked hint whose explanation can be inspected remains an operable “Why locked?” control; do not style it as a normal reveal button or falsely mark an operable explanation control disabled. The answer lock is an informational boundary, not an “Unlock answer” affordance.

## 8. Journey and interaction patterns

Page specifications: [entry](pages/entry.md), [setup](pages/setup.md), [workspace](pages/workspace.md), [review](pages/review.md), [reflection](pages/reflection.md).

Use a small task header with exercise identity and the current destination. Entry, Setup, Work, Review, Reflection form a journey indicator, not a global menu of independently available screens. Completed steps can return to their preserved context; future steps are labeled and noninteractive until available. Review and revision form a loop, so do not imply a fixed percentage complete.

**Working:** Blank start is selected; help is closed initially. A scaffold uses the same editor and the existing hint policy. Reopening help preserves the attempt, caret when possible, prior exchanges, and remaining hints.

**Hint gates:** A newly revealed hint costs one. Reopening it costs none. Text contribution gates check presence in the prototype, not correctness. Name the specific prerequisite beside a gated stage. Zero remaining hints offers independent work, permitted questions, rereading, or a deliberate settings change.

**More help:** Proposed demo pause is 5 seconds. Explain “A short pause keeps increases in help deliberate.” Keep Cancel and Return to attempt available throughout. Use a static timer label updated at whole seconds without live announcements every second. When ready, announce once that Apply is available. No auto-apply, no repeated pause for reductions, and no reset of used hints. The applied agreement remains visible until confirmation. Respect browser tab suspension by comparing elapsed time rather than counting interval callbacks.

**Review:** Submission creates a named snapshot. Editing afterward shows “Edited since review · recheck needed.” A prepared review is explicitly labeled; arbitrary typed work must never appear meaningfully graded. “No issues found in this sample review” is different from “you understand this.”

**Mistake recovery:** Explain → return to the relevant step → student edits → explicit recheck. Repeated issues reference this task's earlier feedback without blame. “Finish with gaps” remains available and records unresolved points in reflection.

**Attribution:** Show an evidence list rather than a donut or a “you vs AI” score. Origins: You introduced, AI prompted, AI supplied, Mixed, Unclear. “AI prompted” means the student contributed after an AI question; it does not mean AI authored the response. Flagging an entry adds a visible local correction note without silently rewriting historical evidence.

### Proposed demo parameters, not research findings

| Parameter | Proposed default | Why |
| --- | --- | --- |
| Assistance options | Questions only; questions + up to 3 hints | Two understandable choices; no pseudo-precise slider |
| Initial assistance | Questions only selected; student can change during setup | Makes the boundary explicit without diagnosing ability |
| Starting approach | Blank attempt selected; scaffold available | Preserves the own-attempt-first goal |
| Assistance increase pause | 5 seconds, cancelable | Short enough to demonstrate; team should test acceptability |
| Sample exercise | A small recurrence proof using induction | Exposes steps, an induction-hypothesis error, and evidence links |
| Optional extensions | Absent | Core journey remains complete |

The recurrence specimen in the visual board is illustrative content. It is not the finalized exercise set or a source of automatic feedback. If the team picks another exercise, replace the problem, attempt, hints, review, and contribution evidence together.

## 9. Accessibility, motion, and recovery

Target WCAG 2.2 AA in the app. Default normal text pairs should reach 4.5:1; meaningful control edges and state indicators should reach 3:1 against adjacent colors. Large text has a lower formal threshold, but this system targets 4.5:1 for its text pairs. Decorative card borders are not control boundaries.

Use 44×44 CSS px as the project's comfortable target size for actions, including icon buttons. This is a project design choice above the WCAG AA minimum, not a claim that AA always requires 44 px. Keep 8 px between adjacent small actions. Use Lucide Vue icons at 20 px, 1.75 px stroke; 16 px for metadata, 24 px for emphasized symbols. Decorative icons beside text are `aria-hidden`; standalone controls have explicit accessible names.

Provide a skip link; landmarks; one H1; logical DOM order matching exercise → attempt → help; visible labels; keyboard alternatives to any future drag interaction. Link feedback to stable attempt-step IDs. Return from a Sheet/dialog to its trigger, then allow the student to continue typing. When navigation changes the destination, focus its H1. Preserve drafts while moving between views.

Prefer fully visible keyboard focus even though WCAG AA's Focus Not Obscured (Minimum) requires at least partial visibility. Test at 200% zoom and with long labels, long user input, and 320 CSS px reflow. A focus trap belongs only in modal help on narrow screens, never in the persistent desktop rail.

Motion tokens: 120 ms press/hover, 180 ms local disclosure, 240 ms modal/Sheet entrance, 160 ms exit. Use `cubic-bezier(.2, .8, .2, 1)` for entry and `cubic-bezier(.4, 0, 1, 1)` for exit. Animate opacity and up to 8 px translation; no staggered tutor prose, parallax, pulsing hint counts, or celebratory confetti. Motion must never control whether state is committed. With reduced motion, remove translation and use immediate changes or a very brief fade. The deliberate assistance pause is a choice boundary, independent of animation preferences.

### Required recovery states

| State | Required copy / response |
| --- | --- |
| Empty attempt submitted | “Add a first step or use the sample attempt before requesting a review.” Return focus to the attempt. |
| Help requested before starting | “Tell me what feels unclear, or start with a question.” Offer a starter question without a correctness gate. |
| Scaffold conflicts with questions only | Explain that hints are off; offer question-only starter guidance or return to preferences. |
| Hint gate locked | Name the reasoning or recall contribution needed; preserve revealed hints. |
| Budget exhausted | “No hints remaining. You can keep working, ask a question, or review earlier guidance.” Provide Change assistance. |
| Assistance canceled | Applied policy and hint count unchanged; return focus to Change assistance. |
| Feedback is stale | “This feedback refers to attempt 1. Recheck your revision.” |
| Repeated issue | “This step still has the same gap. View your earlier explanation.” |
| Leave with gaps | Explicit unresolved list in reflection; no green resolved status. |
| Start another task / reset | Discard explanation plus Stay / Discard and leave. No silent reset. |
| Real async failure in eventual app | Preserve work, explain failure inline, offer Retry. Do not imply an error occurred in a purely scripted delay. |

## 10. Implementation handoff and acceptance

Before building a destination, read this file, its page specification, and the architecture. Apply `tokens.css` through the shadcn-vue semantic pairs. The Tailwind bridge targets v4; if the team chooses v3, map the same full CSS color variables in its config without wrapping them in `hsl()`. No app package versions were selected or installed by this handoff.

Domain components should share one task session state. Names such as `AttemptEditor`, `AssistanceAgreement`, `HintLadder`, `FeedbackIssue`, and `ContributionEntry` express responsibilities. Keep actual Nuxt implementation choices for the build phase. No backend is required for this milestone.

Acceptance for later implementation:

- Demonstrate all eight architecture walkthroughs, including canceling escalation, repeated mistakes, no-issue review, and finishing with gaps.
- Confirm every active control has a result; omit optional-extension controls without a complete path.
- Confirm hints are charged once, budgets survive navigation/revision, and canceling a proposed change cannot mutate applied settings.
- Confirm keyboard navigation, modal focus/return, reduced motion, 320 px reflow, 200% zoom, and unobscured focus.
- Check the 375, 768, 1024, 1280, and 1440 px compositions with short and long content.
- Confirm review/version/evidence consistency. Never reference a hint, contribution, or mistake absent from the selected fixture.
- User-test whether warmth feels appropriate for technical study, whether attempt/help priority is clear, and whether the pause feels useful. These remain hypotheses.

## 11. Sources and skill decisions

- [Needfinding report](../../../../../Milestone%201%20-%20Needfinding/Needfinding_Report_Final.pdf): interview synthesis p. 1; persona images pp. 2–4; five needs pp. 5–7; autonomy, concise critique, and reflection pp. 7–9. Relative links are supplemented by the architecture's absolute source links.
- [Architecture](../../PROTOTYPE_ARCHITECTURE.md): product intent, F1–F7, interaction completeness, and G01–G17. Its linked flow/component diagrams were inspected.
- Supplied Headspace inspiration image: mood reference supplied in chat; no Headspace artwork, logo, or proprietary typeface reused.
- Local `ui-ux-pro-max` skill: `university tutoring calm warm --design-system` returned a portfolio/academic-site direction; a narrower `educational learning app` retry returned child-oriented clay styling. Neither is a verified whole-product fit, so neither raw system was persisted. This document is the curated master replacing those unsuitable templates.
- Verified focused guidance: `minimal productivity workspace --domain style` returned Minimalism & Swiss Style, supporting functional grids, restrained geometry, clear hierarchy, and minimal decoration. This informs the v0.2 structural refinement. The initial rounded font recommendation was superseded by the user's feedback; Inter and JetBrains Mono replace Nunito Sans. `focus not obscured --domain ux` correctly distinguished WCAG AA from AAA. React examples from the shadcn stack search remain excluded.
- `progressive disclosure --domain ux` returned an unrelated heading-wrap result, and the narrower `disclosure` retry found no match. No verified database match was found for that concern; the disclosure recommendations above are general design judgment grounded in this architecture and the skill's quick reference.
- [shadcn-vue theming](https://www.shadcn-vue.com/docs/theming): semantic CSS-variable pairs and Tailwind mapping. [Dialog documentation](https://www.shadcn-vue.com/docs/components/dialog): Vue dialog composition. [W3C contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html): contrast thresholds. [Inter](https://fonts.google.com/specimen/Inter) and [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono): selected interface and code families. [KaTeX API](https://katex.org/docs/api.html), [KaTeX options](https://katex.org/docs/options.html), and [Shiki usage](https://shiki.style/guide/install): technical-content rendering.
