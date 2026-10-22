# Instructions: simplify Prototype 2 (Prove-it) and add the testing aids

For a fresh session. Read this whole file first.

## The direction, and its limits

Prototype 2 keeps **its own design and its own components**. Prototype 1 went through a similar round, but it is only a reference for the *kind* of change, never a template for how things look or are built. Do not copy Prototype 1's layouts, components, colours or interaction patterns.

The changes are only these four:

1. **Simplify.** Remove what is not needed to judge the main flow.
2. **Make it more intuitive.** Clearer labels, plain text, nothing vague.
3. **Add autofills for testing** (a "Fill sample" button on free-text inputs).
4. **Add an "About this prototype" popup** that explains the limits, the autofill and the needs this prototype addresses.

### Do not change (the user likes these as they are)

- **The pre-exercise quiz** (baseline check): its screens, interaction and look stay exactly as they are.
- **The chat / help interaction in Work**: how it looks and behaves stays exactly as it is.
- The overall look: design system, colours, evidence ring, icons, motion, the existing components. If a screen is simplified, it keeps looking like Prototype 2.

If a simplification would touch one of these, leave it alone and mention it in the final summary.

## 0. Before touching anything

1. **Find out the real state.** The memory notes claim a lo-fi simplification already happened on 21 Oct, but on disk the app still has `sign-in.vue`, `settings.vue`, `UserMenu`, `CourseSwitcher`, `UploadFlow`, `ExamPlan`, a README for the full build, and an architecture doc that stops at section 12. A folder `_backup-full-version/` exists too. Check `git status`, the architecture doc, README and pages, and work from what is really there. If files change while you look, another session may be working on it: stop and tell the user.
2. **Back up** `app/` and `PROTOTYPE_ARCHITECTURE.md` (a `.tgz` in your scratchpad). Git has one commit and earlier work is uncommitted. Do not delete `_backup-full-version/`.
3. Read `PROTOTYPE_ARCHITECTURE.md` (flows, rules, needs) and `app/README.md`. For the kind of audit table to write, glance at `../Prototype 1/app/docs/SIMPLIFICATION.md`.
4. Do not commit. Verify in a real browser as you go.

## 1. Simplify

Why: reviewers got lost in too many destinations, options and blocks. They judge whether the **flow** answers our research needs; it is not a real app.

Audit every screen, control and text block against: *is it on the core flow in the architecture?* and *does a reviewer need it to judge the flow?* Write the result as a keep / simplify / remove table in `app/docs/SIMPLIFICATION.md`, then implement it.

- Candidates to remove or fold in: sign-in, account menu, settings, course switcher, add-course, upload/scan flow, search, exports, filters, extra tabs, vanity stats, anything decorative. The main path (exercise list → session → summary) is what matters most. Concepts and Review (return later) stay only if the audit says reviewers need them, and then as simple as possible.
- The exercise list should let a tester start or resume an exercise with one click and no intermediate page.
- Nothing is stored: remove `localStorage` persistence so a page refresh resets everything. Keep a per-exercise "Start over" with a confirmation. (The About popup opens on every load for the same reason.)
- Prefer one control over several where that makes a screen easier, but only outside the protected parts above.
- ⌘K, if kept, is a hidden facilitator tool (jump to an exercise, choose the scripted outcome of the next check), not a student feature.

## 2. Make it more intuitive: wording

The user disliked text that sounds "fake, markety and pushy". Rewrite visible copy (outside the protected parts, unless something is plainly wrong, in which case report it instead):

- No taglines, no reassurance or motivational lines, no overline tags. Say what a thing is or does, in plain words.
- The same word for the same thing everywhere. Replace vague names with what they are. If a name needs explaining, add one plain sentence.
- Buttons name the action, not the feeling.
- Keep the architecture's honesty rules: feedback describes the submitted work and does not claim to measure mastery.

## 3. The autofill ("test button")

Every input where the student writes free text gets a testing aid. This button has a specific look and behaviour the user approved:

- A small chip with a dashed border, a purple "TEST" tag with a flask icon, and the text "Fill sample". It must read as a testing tool, not as part of the product.
- It **appears instantly** when the input is focused, hanging on the input's top edge, and goes away when focus leaves. **No fade or opacity transition at all.** The only animation is a small scale-up on hover. No background colour change on hover.
- `mousedown.prevent` on the chip so clicking does not blur the input and hide it. `aria-label="Fill sample text: <input name>"`.
- It fills **that one input** with prepared text. The text lives with the exercise content (`app/data/packs`, for example a `sampleAnswers` field) and must match the scripted feedback, so a tester who clicks through gets the intended path. Prototype 2 has scripted outcomes (for example the partial explanation that triggers the repeat-mistake link). Testers must be able to reach both a good and a flawed outcome; decide how from the packs (for example the chip follows the outcome chosen in ⌘K, or the flawed sample comes first and the corrected one after feedback). Replace the old "⌘K fills the explain box" shortcut with the chips.
- Choice questions (radio lists) need no chip.
- The pre-exercise quiz and the chat are protected: if they contain free-text inputs, add the chip to those inputs only, without changing anything else about them.

## 4. "About this prototype" popup

A dialog that opens **on every page load**, can be reopened with an "About this prototype" button in the header, and has a Start button. Style it like the rest of Prototype 2. It must be scannable, not a text block, and fit about one screen with a sticky footer button. Content, in this order:

1. One sentence: a low-fidelity prototype of one learning flow (here: work on an exercise, then check what you can explain without help).
2. **What to expect**, three short bullets: no AI is connected; feedback, scores and replies are written in advance for one fixed flow and do not react to what you type, so they can be off, which is expected; judge the flow, not the answers.
3. **Fill in answers with the test button**: show the real chip on a mock text box and say in a line or two how it works.
4. **Needs from our interviews that this prototype addresses**: each as ID, short name, and one line on how the prototype answers it. List only needs the prototype really answers, and say "partly" where it is partial. The report's needs are: N1 friction during problem-solving to prevent premature task completion; N2 telling what the learner understood versus merely followed; N3 own-attempt-first interaction by default; N4 multi-stage, adaptive scaffolding instead of full-step execution; N5 post-interaction verification and optional active self-testing. Prototype 2's architecture (section 1 table) maps its flow to these needs; its strongest are probably N5 (core check, optional deeper checks, skip or defer) and N2 (independent recall, pre/post comparison, concept evidence). Check every claim against what the finished prototype actually does before writing it. Describe the "how" in the student's terms.

## 5. Technical notes

- A page template needs **one root element**; a comment before the root breaks route transitions.
- No double quotes inside a double-quoted attribute expression (use a computed).
- Restart the dev server after adding new files so Tailwind sees their classes. Dev server: `preview_start` "prove-it" (port 3002, config in the root `.claude/launch.json`); kill a stale server on that port first.
- Playwright e2e: wait for headings, not URLs. The About popup opens on every load, so in tests auto-dismiss it with `page.addLocatorHandler(page.getByRole("dialog", { name: "About this prototype" }), …click Start)`, except in its own test. No test hooks in the app code.
- Screenshots: Playwright with system Chrome (`channel: "chrome"`), not the preview pane.
- No horizontal overflow at 390 px and 1440 px.

## 6. Verification and documentation

- `npm test`, `npx nuxt typecheck`, `npm run test:e2e` and `nuxt build` all pass. Update the tests to the new flow and add tests for: the popup (opens on load, reopens), the chips (hidden until focus, fill the input, a full path passable using only chips), refresh resets, start over.
- Look at the main path in a real browser at desktop and phone width, and check that the pre-exercise quiz and the chat look and work exactly as before.
- Update `PROTOTYPE_ARCHITECTURE.md` (a new dated section with rules, continuing the numbering after the last existing G number, marking any replaced rule), `app/README.md`, `app/docs/`, and the memory note for Prototype 2.
- Finish with a short summary: what was removed, what was kept and why, what a tester can now do, anything you could not verify, and open questions.
