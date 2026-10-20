# Exercise entry

Read `../MASTER.md` first. This page specializes layout and hierarchy only.

**Student's question:** What am I working on?

## Composition

Use a simple brand/task header and a centered content area up to 1040 px. Begin with a short heading such as “Make space for your own thinking.” Use a compact exercise preview where useful. Favor course context and typeset technical content over decorative illustration; task choices should remain visible near the top.

Below the introduction, show one sample sheet with its course context and a vertical radio group of task choices. Task title, topic, and a one-sentence objective are enough; omit invented difficulty scores and estimated completion times. Use an explicit selected radio and a 8 px corner selection, then one yellow “Open selected task” action. Selecting a row does not navigate automatically.

Explain the prototype boundary once, in readable supporting copy: “This prototype uses a sample exercise and prepared tutor responses and feedback. Your work stays in this task while you navigate. Refreshing may reset it.” Place this before the start action; do not require a modal onboarding tour.

## States and navigation

- Initial: first sample task selected, primary action enabled.
- Task details: expand the problem in place; preserve selection.
- Continue: enter setup with the selected task.
- Returning from setup: preserve the task and preference choices.
- Opening another task with active work: Stay / Discard and open task confirmation. Starting a fresh task cannot silently erase the current attempt.

No account CTA, course dashboard, search, notifications, recommendation feed, or unsupported upload control.

## Check

A student can identify the sample boundary, selected task, and start action without needing a tooltip. At 375 px, the introduction, task choices, and action stack; no fixed-height hero.
