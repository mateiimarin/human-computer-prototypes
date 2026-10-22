<script setup lang="ts">
const { open } = useAbout()

const demo = ref('')
const start = ref<{ $el: HTMLElement } | null>(null)

const expectations = [
  'No AI is connected. Replies and feedback are written in advance for one fixed flow.',
  'They don’t react to what you type, so they can be off or not fit your answer. That is expected.',
  'Judge the flow, not the answers: baseline, working with help, the check, the summary.',
]

/** Names follow the needfinding report. A need is only listed for what the prototype really does, and “Partly” says where it stops short. */
const needs = [
  {
    id: 'N1', name: 'Friction during problem-solving', partly: true,
    how: 'You answer a baseline before any help, and the full solution asks for a confirmation first. Otherwise help in Work is not blocked: the friction comes before and after it, not during.',
  },
  {
    id: 'N2', name: 'Telling what you understood from what you followed', partly: false,
    how: 'You explain it back with the chat and solutions hidden, then answer the baseline questions again. Each concept is marked demonstrated, partial, gap or not shown, next to how sure you were. Opening help during a check marks it as assisted, so it cannot count.',
  },
  {
    id: 'N3', name: 'Your own attempt first', partly: true,
    how: 'The baseline asks for your own answers before any help, and every check takes your answer before showing feedback. In Work you can paste your attempt, but help is available straight away.',
  },
  {
    id: 'N4', name: 'Staged help instead of the full solution', partly: true,
    how: 'In Work you pick the help: a question, hints one at a time, an outline with blanks, or the full solution. You choose the stage; it does not adapt by itself, and the full solution stays available.',
  },
  {
    id: 'N5', name: 'Checking afterwards and optional self-testing', partly: false,
    how: 'After working you explain it back and answer a final quiz. Optional: why-questions, finding a planted mistake, a similar problem when a gap shows, and the Concepts page for questions to answer again later. Any check can be skipped or postponed; it then counts as not shown.',
  },
]
</script>

<template>
  <UiDialog v-model:open="open">
    <UiDialogContent class="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 p-0 sm:max-w-3xl" :show-close-button="false" @open-auto-focus.prevent="start?.$el.focus()">
      <div class="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-6 sm:px-8 sm:py-7">
        <UiDialogHeader class="space-y-2 text-left">
          <UiDialogTitle class="text-3xl leading-9 font-semibold">About this prototype</UiDialogTitle>
          <UiDialogDescription class="text-foreground text-base leading-7">
            A low-fidelity prototype of one learning flow: you work on an exercise, then check what you can explain without help.
          </UiDialogDescription>
        </UiDialogHeader>

        <section aria-labelledby="about-expect" class="space-y-2">
          <h3 id="about-expect" class="text-xl font-semibold">What to expect</h3>
          <ul class="text-muted-foreground marker:text-muted-foreground list-disc space-y-1 pl-5 text-[15px] leading-6">
            <li v-for="e in expectations" :key="e">{{ e }}</li>
          </ul>
        </section>

        <section aria-labelledby="about-fill" class="space-y-3">
          <h3 id="about-fill" class="text-xl font-semibold">Fill in answers with the test button</h3>
          <div class="grid items-center gap-x-6 gap-y-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <div class="relative mt-3 sm:mt-0">
              <UiTextarea v-model="demo" rows="2" class="min-h-20 rounded-xl" aria-label="Example text box" placeholder="Write your answer…" />
              <SampleChip class="absolute -top-3.5 right-3 z-10" aria-label="Fill sample text: example text box" @click="demo = 'This is a prepared sample answer.'" />
            </div>
            <p class="text-muted-foreground text-[15px] leading-6">
              Click into any text box and this button appears on its top edge. It fills the box with text that fits the flow, so replies and feedback make sense. It is only for testing.
            </p>
          </div>
        </section>

        <section aria-labelledby="about-needs" class="space-y-2">
          <h3 id="about-needs" class="text-xl font-semibold">Needs from our interviews that this prototype addresses</h3>
          <ol class="divide-border divide-y">
            <li v-for="n in needs" :key="n.id" class="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3 py-3 first:pt-1">
              <span class="bg-secondary mt-0.5 grid h-6 place-items-center rounded-full text-xs font-bold">{{ n.id }}</span>
              <span>
                <span class="flex flex-wrap items-center gap-2 text-[15px] leading-6 font-semibold">{{ n.name }}<UiBadge v-if="n.partly" variant="partial">Partly</UiBadge></span>
                <span class="text-muted-foreground mt-0.5 block text-[15px] leading-6">{{ n.how }}</span>
              </span>
            </li>
          </ol>
        </section>
      </div>

      <div class="bg-background border-border flex shrink-0 flex-wrap items-center justify-between gap-3 border-t px-5 py-4 sm:px-8">
        <p class="text-muted-foreground text-sm">You can reopen this with “About this prototype”.</p>
        <UiButton ref="start" size="lg" class="w-full sm:w-auto" @click="open = false">Start</UiButton>
      </div>
    </UiDialogContent>
  </UiDialog>
</template>
