# Task workspace

Read `../MASTER.md` first. This is the primary product surface.

**Student's question:** What can I try next?

## Desktop composition

At 1280 px and above, exercise context sits left, the white attempt surface occupies the center and most of the available width, and an optional 320–360 px rail sits right. Help is initially closed. When closed, the attempt expands but prose retains a readable measure. A small task header shows the task and “Work”; it does not contain global dashboard navigation.

Exercise context: sheet identity, task title, problem statement, definitions/notation, and any explicitly chosen sample attachment. No decorative yellow background behind long technical content.

Attempt: H1 “Your attempt,” a brief first-step prompt, visible editor label, editable work, optional sample attachment action, and a normal-flow footer. Main action: “Review my attempt.” “Ask the tutor” is secondary. Do not make every tutor reply another yellow CTA.

Help rail: tabs “Tutor” and “Contributions,” a shared assistance agreement, final-answer boundary, remaining hints, and Change assistance. The rail must never imply its own independent budget. A tutor turn is concise and ends by returning attention to the attempt. The hint ladder is a numbered semantic list, not a learning-progress score.

## Responsive behavior

At 1024–1279 px, move exercise context above the attempt in a collapsible region; help can remain beside the attempt. Below 1024 px, help/contributions opens in a modal Sheet with explicit close and preserved state. Under 768 px, use the full width for the Sheet and stack the attempt actions. If text zoom breaks the minimum column widths, simplify earlier.

The persistent desktop rail is nonmodal. Do not trap focus there. Narrow-screen Sheet focus is trapped and returned to its opener on close. Keep the current draft and caret available after the Sheet closes.

## Assistance states

Available hint: show cost before reveal. Revealed hint: “Already revealed · no additional hint used.” Gated reasoning/recall stage: show the specific prerequisite. Exhausted budget: explain alternatives inline. Contribution gates check presence only; the demonstration does not assess response correctness.

In the change dialog show Applied and Proposed settings side by side where space allows. Proposed selection is visually distinct and never updates the applied label behind the dialog. An increase starts the explained 5-second proposed pause, then enables Apply. Cancel, Escape, and Return to attempt leave the policy untouched. A reduction applies without a pause. Previous consumption and evidence remain intact.

Closing the tutor, switching to Contributions, revising, or revisiting setup cannot replenish hints. Keep final answers hidden throughout. No “Unlock full solution” control is part of this prototype.

## Check

Run independent, supported, stuck-before-starting, escalation-cancel, budget-exhaustion, and empty-review walkthroughs. The learner's work is visible and editable throughout ordinary help use; modal help is explicitly dismissible on small screens.
