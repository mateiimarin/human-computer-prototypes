<script setup lang="ts">
import { ArrowLeft, ArrowRight, Check, Info, Lock, MessageCircleQuestion, Sprout, Waypoints } from "@lucide/vue";
import type { Mode, StartApproach } from "~/data/types";
import { agreementLabel } from "~/domain/session";
import { phasePath } from "~/lib/journey";

definePageMeta({ layout: "session" });
const app = useApp();
const id = useTaskId();
const s = useSession();
const task = computed(() => app.task(id.value)!);
const assist = useAssistDialog();
useHead({ title: computed(() => `Set up · ${task.value.title}`) });

const help = ref<Mode>(s.value.mode);
const starter = ref<"offer" | "wait">(s.value.starterGuidance ? "offer" : "wait");
const start = ref<StartApproach>(s.value.start);
const item = ref("help");
const stage = ref<"quiz" | "summary">(s.value.started ? "summary" : "quiz");
const defs = [
  { name: "help", choices: [{ value: "questions" }, { value: "hints" }] },
  { name: "starter", choices: [{ value: "offer" }, { value: "wait" }] },
  { name: "start", choices: [{ value: "blank" }, { value: "scaffold" }] },
];
const current = computed(() => defs.findIndex((d) => d.name === item.value) + 1);
const conflict = computed(() => help.value === "questions" && start.value === "scaffold");

const agreement = computed(() => {
  const live = s.value.started;
  const mode = live ? s.value.mode : help.value;
  return {
    mode,
    lines: [
      {
        icon: Sprout,
        title: (live ? s.value.start : start.value) === "scaffold" ? "You'll start with a scaffold" : "You'll start on a blank page",
        text:
          (live ? s.value.start : start.value) === "scaffold"
            ? "Each step comes with a short prompt to write against."
            : "Your own first step comes before any help.",
      },
      {
        icon: MessageCircleQuestion,
        title: mode === "questions" ? "Questions only" : `Questions and up to ${live ? s.value.budget : 3} hints`,
        text: mode === "questions" ? "The tutor asks questions that point to your next step." : "One hint at a time, each after some thinking of your own.",
      },
      {
        icon: Lock,
        title: "Final answers stay hidden",
        text: "That holds whichever help you choose. You can change it later, deliberately.",
      },
    ],
  };
});

function fixWithStarter() {
  start.value = "blank";
  starter.value = "offer";
}
function begin() {
  if (!s.value.started) {
    s.value.mode = help.value;
    s.value.budget = 3;
    s.value.start = start.value;
    s.value.starterGuidance = starter.value === "offer";
    s.value.started = true;
    if (start.value === "blank" && starter.value === "offer" && app.content(id.value))
      s.value.exchanges.push({ question: "", reply: app.content(id.value)!.starterQuestion, step: 0 });
  }
  s.value.phase = "work";
  navigateTo(phasePath(id.value, "work"));
}
const choiceClass =
  "rounded-3xl border-2 border-transparent bg-card px-5 py-5 text-base shadow-sm hover:bg-card hover:border-foreground/25 data-checked:border-foreground data-checked:bg-card data-checked:shadow-md";
</script>

<template>
  <div class="relative min-h-[calc(100dvh-72px)] overflow-hidden">
    <div class="pointer-events-none absolute -top-40 -right-32 size-[480px] rounded-full opacity-60 blur-3xl" style="background: var(--lilac)" />
    <div class="pointer-events-none absolute -bottom-52 -left-40 size-[480px] rounded-full opacity-45 blur-3xl" style="background: var(--sun)" />

    <div class="relative mx-auto w-full max-w-[680px] px-5 pt-8 pb-24 sm:pt-16">
      <Transition mode="out-in" enter-active-class="transition duration-400 ease-out" enter-from-class="translate-y-5 opacity-0" leave-active-class="transition duration-200 ease-in" leave-to-class="-translate-y-3 opacity-0">
        <!-- QUIZ -->
        <div v-if="stage === 'quiz'" key="quiz">
          <UiQuestionnaire v-model:item="item" :items="defs" shortcuts="numbers" class="gap-9" @submit.prevent="stage = 'summary'">
            <div class="space-y-3">
              <p class="text-muted-foreground text-sm font-semibold">Before you start · {{ current }} of 3</p>
              <div class="flex gap-1.5" aria-hidden="true">
                <span v-for="i in 3" :key="i" class="bg-foreground/12 relative h-1.5 flex-1 overflow-hidden rounded-full">
                  <span class="bg-foreground absolute inset-y-0 left-0 rounded-full transition-all duration-500" :style="{ width: i <= current ? '100%' : '0%' }" />
                </span>
              </div>
            </div>

            <UiQuestionnaireItem name="help" class="gap-7">
              <div class="space-y-7">
                <UiQuestionnaireTitle class="font-display text-[2.2rem] leading-[1.05] font-bold text-balance sm:text-5xl">How should the tutor help you with this task?</UiQuestionnaireTitle>
                <UiQuestionnaireChoices>
                  <UiQuestionnaireChoice value="questions" :checked="help === 'questions'" :class="choiceClass" @update:checked="(v: boolean) => v && (help = 'questions')">
                    <span class="font-display text-xl font-bold">Questions only</span>
                    <UiQuestionnaireChoiceDescription class="text-[15px]">The tutor asks, you work it out. Hints stay off.</UiQuestionnaireChoiceDescription>
                  </UiQuestionnaireChoice>
                  <UiQuestionnaireChoice value="hints" :checked="help === 'hints'" :class="choiceClass" @update:checked="(v: boolean) => v && (help = 'hints')">
                    <span class="font-display text-xl font-bold">Questions and hints</span>
                    <UiQuestionnaireChoiceDescription class="text-[15px]">Up to 3 small hints, one at a time, each after you add some thinking.</UiQuestionnaireChoiceDescription>
                  </UiQuestionnaireChoice>
                </UiQuestionnaireChoices>
                <p class="text-muted-foreground text-sm">There's no right answer. This describes the help you want, not how well you're doing.</p>
              </div>
            </UiQuestionnaireItem>

            <UiQuestionnaireItem name="starter" class="gap-7">
              <div class="space-y-7">
                <UiQuestionnaireTitle class="font-display text-[2.2rem] leading-[1.05] font-bold text-balance sm:text-5xl">If you freeze at the very start, what should happen?</UiQuestionnaireTitle>
                <UiQuestionnaireChoices>
                  <UiQuestionnaireChoice value="offer" :checked="starter === 'offer'" :class="choiceClass" @update:checked="(v: boolean) => v && (starter = 'offer')">
                    <span class="font-display text-xl font-bold">Offer me a starter question</span>
                    <UiQuestionnaireChoiceDescription class="text-[15px]">A gentle first question waits in the tutor panel. Your page stays empty.</UiQuestionnaireChoiceDescription>
                  </UiQuestionnaireChoice>
                  <UiQuestionnaireChoice value="wait" :checked="starter === 'wait'" :class="choiceClass" @update:checked="(v: boolean) => v && (starter = 'wait')">
                    <span class="font-display text-xl font-bold">Wait until I ask</span>
                    <UiQuestionnaireChoiceDescription class="text-[15px]">Nothing appears unless I open the tutor myself.</UiQuestionnaireChoiceDescription>
                  </UiQuestionnaireChoice>
                </UiQuestionnaireChoices>
              </div>
            </UiQuestionnaireItem>

            <UiQuestionnaireItem name="start" class="gap-7">
              <div class="space-y-7">
                <UiQuestionnaireTitle class="font-display text-[2.2rem] leading-[1.05] font-bold text-balance sm:text-5xl">How do you want to begin?</UiQuestionnaireTitle>
                <UiQuestionnaireChoices>
                  <UiQuestionnaireChoice value="blank" :checked="start === 'blank'" :class="choiceClass" @update:checked="(v: boolean) => v && (start = 'blank')">
                    <span class="font-display text-xl font-bold">A blank page</span>
                    <UiQuestionnaireChoiceDescription class="text-[15px]">Begin with your own first step.</UiQuestionnaireChoiceDescription>
                  </UiQuestionnaireChoice>
                  <UiQuestionnaireChoice value="scaffold" :checked="start === 'scaffold'" :class="choiceClass" @update:checked="(v: boolean) => v && (start = 'scaffold')">
                    <span class="font-display text-xl font-bold">A guided scaffold</span>
                    <UiQuestionnaireChoiceDescription class="text-[15px]">Each step comes with a short prompt to write against.</UiQuestionnaireChoiceDescription>
                  </UiQuestionnaireChoice>
                </UiQuestionnaireChoices>

                <UiAlert v-if="conflict" class="bg-guidance text-guidance-foreground rounded-3xl border-0 p-5">
                  <Info />
                  <UiAlertTitle class="font-display text-lg font-bold">A scaffold needs hints</UiAlertTitle>
                  <UiAlertDescription class="text-guidance-foreground/90">
                    <p>You chose questions only, so hints are off. Pick one to continue.</p>
                    <div class="mt-4 flex flex-wrap gap-2">
                      <UiButton type="button" size="sm" variant="dark" @click="fixWithStarter">Use a starter question instead</UiButton>
                      <UiButton type="button" size="sm" variant="outline" @click="help = 'hints'">Allow hints</UiButton>
                    </div>
                  </UiAlertDescription>
                </UiAlert>
              </div>
            </UiQuestionnaireItem>

            <UiQuestionnaireActions class="grid-cols-[auto_1fr_auto] gap-3">
              <UiQuestionnairePrevious size="lg" variant="ghost" class="col-start-1 justify-self-start"><ArrowLeft /> Back</UiQuestionnairePrevious>
              <UiQuestionnaireNext size="lg" class="col-start-3">Continue <ArrowRight /></UiQuestionnaireNext>
              <UiQuestionnaireSubmit size="lg" class="col-start-3" :disabled="conflict">See my agreement <ArrowRight /></UiQuestionnaireSubmit>
            </UiQuestionnaireActions>
          </UiQuestionnaire>
        </div>

        <!-- SUMMARY -->
        <div v-else key="summary">
          <p class="text-muted-foreground mb-3 text-sm font-semibold">Task {{ task.number }} · {{ task.title }}</p>
          <h1 class="font-display text-[2.2rem] leading-[1.05] font-bold text-balance sm:text-5xl">{{ s.started ? "Your agreement for this task" : "Here's your agreement" }}</h1>
          <p class="text-muted-foreground mt-3 text-lg">{{ s.started ? "It applies to this task only. Anything you change here is deliberate." : "It applies to this task only. You can change it while you work." }}</p>
          <ul class="mt-9 space-y-6">
            <li v-for="(line, i) in agreement.lines" :key="line.title">
              <Reveal :index="i" :delay="0.1" class="flex items-start gap-4">
                <span class="bg-primary grid size-11 shrink-0 place-items-center rounded-2xl"><component :is="line.icon" class="size-5" /></span>
                <span>
                  <span class="font-display block text-xl font-bold">{{ line.title }}</span>
                  <span class="text-muted-foreground block text-[16px] leading-snug">{{ line.text }}</span>
                </span>
              </Reveal>
            </li>
          </ul>
          <div class="mt-10 flex flex-wrap items-center gap-3">
            <UiButton v-if="!s.started" variant="ghost" size="lg" @click="stage = 'quiz'"><ArrowLeft /> Edit answers</UiButton>
            <UiButton v-else variant="outline" size="lg" @click="assist.open.value = true"><Waypoints /> Change assistance</UiButton>
            <UiButton size="xl" @click="begin">{{ s.started ? "Back to my attempt" : "Start working" }} <ArrowRight /></UiButton>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
