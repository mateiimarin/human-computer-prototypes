<script setup lang="ts">
const { open } = useIntro();

// Opens on every page load, since a reload also resets the prototype.
onMounted(() => (open.value = true));

const expect = [
  "No AI is connected. Tutor replies and feedback are written in advance for one fixed flow.",
  "They don't react to what you type, so they can be off or not fit your answer. That is expected.",
  "Judge the flow, not the answers: questions and hints, a mistake, feedback, a revision.",
];

const needs = [
  {
    id: "N1",
    name: "Friction during problem-solving",
    how: "The tutor asks a question first. A hint unlocks only after two short answers from you, and adding hints needs a short wait.",
  },
  {
    id: "N2",
    name: "Telling what you understood from what you followed",
    how: "“Who thought it?” lets you trace how the exercise went and who did what: every step, hint and tutor question, and whether it came from you or the tutor. You can correct a label.",
  },
  {
    id: "N3",
    name: "Your own attempt first",
    how: "You start on your own page. Help is optional, and the tutor sends you back to your step.",
  },
  {
    id: "N4",
    name: "Staged hints, no full solutions",
    how: "You choose 0–5 hints, unlocked one at a time. The tutor never gives the full answer.",
  },
];
</script>

<template>
  <UiDialog v-model:open="open">
    <UiDialogContent class="max-h-[92dvh] gap-0 overflow-y-auto p-0 sm:max-w-3xl">
      <div class="space-y-5 p-6 sm:px-8 sm:py-7">
        <UiDialogHeader class="space-y-2 text-left">
          <UiDialogTitle class="font-display text-3xl font-bold">About this prototype</UiDialogTitle>
          <UiDialogDescription class="text-base leading-relaxed">
            A low-fidelity prototype of one learning flow: you try an exercise, get questions and hints that make you reason, make a mistake, and revise.
          </UiDialogDescription>
        </UiDialogHeader>

        <section aria-labelledby="intro-expect" class="space-y-2">
          <h3 id="intro-expect" class="font-display text-xl font-bold">What to expect</h3>
          <ul class="text-muted-foreground list-disc space-y-1 pl-5 text-[15px] leading-snug">
            <li v-for="e in expect" :key="e">{{ e }}</li>
          </ul>
        </section>

        <section aria-labelledby="intro-test" class="space-y-3">
          <h3 id="intro-test" class="font-display text-xl font-bold">Fill in answers with the test button</h3>
          <div class="grid items-center gap-x-6 gap-y-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <div class="bg-card text-muted-foreground relative mt-3 rounded-2xl border-2 px-4 pt-3 pb-6 text-[15px] sm:mt-0" aria-hidden="true">
              Write what you assume…
              <SampleButton tabindex="-1" class="pointer-events-none absolute -top-3.5 right-3" />
            </div>
            <p class="text-muted-foreground text-[15px] leading-snug">
              Click into any text box and this button appears on its top edge. It fills the box with text that fits the flow, so replies and feedback make sense. It is only for testing.
            </p>
          </div>
        </section>

        <section aria-labelledby="intro-needs" class="space-y-2">
          <h3 id="intro-needs" class="font-display text-xl font-bold">Needs from our interviews that this prototype addresses</h3>
          <ol class="divide-y">
            <li v-for="n in needs" :key="n.id" class="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3 py-2.5 first:pt-1">
              <span class="bg-secondary mt-0.5 grid h-6 place-items-center rounded-full text-xs font-bold">{{ n.id }}</span>
              <span>
                <span class="block text-[15px] leading-snug font-bold">{{ n.name }}</span>
                <span class="text-muted-foreground mt-0.5 block text-[15px] leading-snug">{{ n.how }}</span>
              </span>
            </li>
          </ol>
        </section>
      </div>

      <div class="bg-background/95 sticky bottom-0 flex items-center justify-between gap-3 border-t px-6 py-4 backdrop-blur sm:px-8">
        <p class="text-muted-foreground text-sm">You can reopen this with “About this prototype”.</p>
        <UiButton size="lg" @click="open = false">Start</UiButton>
      </div>
    </UiDialogContent>
  </UiDialog>
</template>
