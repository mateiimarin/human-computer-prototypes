<script setup lang="ts">
import { ArrowRight, Info, Lock, MessageCircleQuestion, Sprout, Waypoints } from "@lucide/vue";
import type { StartApproach } from "~/data/types";
import { defaults, MAX_HINTS } from "~/data/exercises";
import { hintsLabel } from "~/domain/session";
import { phasePath } from "~/lib/journey";

definePageMeta({ layout: "session" });
const app = useApp();
const id = useTaskId();
const s = useSession();
const task = computed(() => app.task(id.value)!);
const assist = useAssistDialog();
useHead({ title: computed(() => `Set up · ${task.value.title}`) });

const answers = reactive<{ hints: number; starter: string; start: string }>({
  hints: s.value.started ? s.value.budget : defaults.budget,
  starter: s.value.starterGuidance ? "offer" : "wait",
  start: s.value.start,
});
const hintsModel = computed({
  get: () => [answers.hints],
  set: (v: number[] | undefined) => (answers.hints = v?.[0] ?? 0),
});
const conflict = computed(() => answers.hints === 0 && answers.start === "scaffold");

const questions = [
  {
    key: "starter",
    title: "When you don't know how to start",
    options: [
      { value: "offer", label: "Show me a starter question", text: "The tutor opens with one question." },
      { value: "wait", label: "Wait until I ask", text: "The tutor stays closed until you open it." },
    ],
  },
  {
    key: "start",
    title: "How do you want to begin?",
    options: [
      { value: "blank", label: "A blank page", text: "You write step 1 yourself." },
      { value: "scaffold", label: "Guided steps", text: "Each step has a short prompt to write against." },
    ],
  },
] as const;

// Before the first start this follows the choices live; afterwards it shows what was applied.
const summary = computed(() => {
  const live = s.value.started;
  const hints = live ? s.value.budget : answers.hints;
  const scaffold = (live ? s.value.start : answers.start) === "scaffold";
  return [
    {
      icon: MessageCircleQuestion,
      title: hints === 0 ? "No hints" : `Up to ${hintsLabel(hints)}`,
      text: hints === 0 ? "The tutor only asks questions." : "You get one hint at a time. Before each hint you answer two short questions. The tutor can also ask you questions.",
    },
    {
      icon: Sprout,
      title: scaffold ? "Guided steps" : "A blank page",
      text: scaffold ? "Each step has a short prompt to write against." : "You write step 1 yourself.",
    },
    { icon: Lock, title: "No full answers", text: "The tutor never gives the full solution, whatever you choose. You can change the number of hints later." },
  ];
});

function fixWithStarter() {
  answers.start = "blank";
  answers.starter = "offer";
}
function begin() {
  if (!s.value.started) {
    s.value.budget = answers.hints;
    s.value.start = answers.start as StartApproach;
    s.value.starterGuidance = answers.starter === "offer";
    s.value.started = true;
    if (answers.start === "blank" && answers.starter === "offer" && app.content(id.value)) {
      const q = app.content(id.value)!.starterQuestion;
      s.value.exchanges.push({ question: "", reply: q, step: 0 });
      s.value.chat.push({ role: "tutor", kind: "question", text: q, step: 0 });
    }
  }
  s.value.phase = "work";
  navigateTo(phasePath(id.value, "work"));
}
</script>

<template>
  <div class="mx-auto w-full max-w-[680px] px-5 pt-8 pb-24 sm:pt-14">
    <header class="space-y-3">
      <p class="text-muted-foreground text-sm font-semibold">{{ task.title }}</p>
      <h1 class="font-display text-[2.2rem] leading-[1.05] font-bold text-balance sm:text-5xl">{{ s.started ? "Help settings" : "How the tutor helps" }}</h1>
      <p class="text-muted-foreground text-lg">
        {{ s.started ? "These apply to this exercise only." : "Choose how you want help on this exercise. There are no right or wrong choices." }}
      </p>
    </header>

    <!-- Questions (before the first start) -->
    <div v-if="!s.started" class="mt-10 space-y-9">
      <fieldset class="space-y-3">
        <legend class="font-display text-xl font-bold">1. How many hints do you want?</legend>
        <div class="space-y-3 rounded-2xl border-2 border-foreground/10 p-5">
          <div class="flex items-baseline justify-between gap-3">
            <span class="font-display text-3xl font-bold" aria-live="polite">{{ hintsLabel(answers.hints) }}</span>
                      </div>
          <UiSlider v-model="hintsModel" :min="0" :max="MAX_HINTS" :step="1" label="Number of hints" class="py-2" />
          <div class="text-muted-foreground flex justify-between text-sm font-semibold" aria-hidden="true">
            <span v-for="n in MAX_HINTS + 1" :key="n">{{ n - 1 }}</span>
          </div>
        </div>
      </fieldset>

      <fieldset v-for="(q, qi) in questions" :key="q.key" class="space-y-3">
        <legend class="font-display text-xl font-bold">{{ qi + 2 }}. {{ q.title }}</legend>
        <UiRadioGroup v-model="answers[q.key]" class="gap-3" :aria-label="q.title">
          <label
            v-for="o in q.options"
            :key="o.value"
            :for="`${q.key}-${o.value}`"
            class="border-foreground/10 hover:border-foreground/30 has-[[data-state=checked]]:border-foreground has-[[data-state=checked]]:bg-card flex cursor-pointer items-start gap-4 rounded-2xl border-2 p-4 transition-all"
          >
            <UiRadioGroupItem :id="`${q.key}-${o.value}`" :value="o.value" class="mt-1" />
            <span>
              <span class="font-display block text-lg font-bold">{{ o.label }}</span>
              <span class="text-muted-foreground block text-[15px] leading-snug">{{ o.text }}</span>
            </span>
          </label>
        </UiRadioGroup>

        <UiAlert v-if="q.key === 'start' && conflict" class="bg-guidance text-guidance-foreground rounded-3xl border-0 p-5">
          <Info />
          <UiAlertTitle class="font-display text-lg font-bold">Guided steps need hints</UiAlertTitle>
          <UiAlertDescription class="text-guidance-foreground/90">
            <p>You chose no hints, but guided steps use them. Change one of the two:</p>
            <div class="mt-4 flex flex-wrap gap-2">
              <UiButton type="button" size="sm" variant="dark" @click="fixWithStarter">Use a blank page instead</UiButton>
              <UiButton type="button" size="sm" variant="outline" @click="answers.hints = defaults.budget">Allow {{ defaults.budget }} hints</UiButton>
            </div>
          </UiAlertDescription>
        </UiAlert>
      </fieldset>
    </div>

    <!-- What it means -->
    <section class="mt-10 border-t pt-8" aria-labelledby="summary">
      <h2 id="summary" class="font-display text-2xl font-bold">What this means</h2>
      <ul class="mt-5 space-y-5">
        <li v-for="line in summary" :key="line.title" class="flex items-start gap-4">
          <span class="bg-primary grid size-10 shrink-0 place-items-center rounded-2xl"><component :is="line.icon" class="size-5" /></span>
          <span>
            <span class="font-display block text-lg font-bold">{{ line.title }}</span>
            <span class="text-muted-foreground block text-[15px] leading-snug">{{ line.text }}</span>
          </span>
        </li>
      </ul>
    </section>

    <div class="mt-10 flex flex-wrap items-center justify-between gap-3">
      <UiButton v-if="s.started" variant="outline" size="lg" @click="assist.open.value = true"><Waypoints /> Change hints</UiButton>
      <span v-else />
      <UiButton size="xl" :disabled="conflict" @click="begin">{{ s.started ? "Back to my attempt" : "Start working" }} <ArrowRight /></UiButton>
    </div>
  </div>
</template>
