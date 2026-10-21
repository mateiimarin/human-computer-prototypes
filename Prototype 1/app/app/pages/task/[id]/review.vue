<script setup lang="ts">
import { ArrowLeft, ArrowRight, Check, CornerDownRight, Flag, Loader2, PencilLine } from "@lucide/vue";
import { explainIssue, hasOpenGap, isStale, latestReview } from "~/domain/session";

definePageMeta({ layout: "session" });
const app = useApp();
const id = useTaskId();
const s = useSession();
const content = useTaskContent();
const task = computed(() => app.task(id.value)!);
useHead({ title: computed(() => `Review · ${task.value.title}`) });

const r = computed(() => latestReview(s.value)!);
const open = computed(() => hasOpenGap(s.value));
const stale = computed(() => isStale(s.value));
const earlier = computed(() => s.value.reviews.slice(0, -1).filter((x) => x.explained).at(-1));
const finishOpen = ref(false);
const gapStep = computed(() => content.value.gap.step);
const canRevise = computed(() => r.value.explained || !!s.value.explainDraft.trim());

/* Labelled wait while the review is prepared */
const analysing = ref(s.value.seenReview < (r.value?.version ?? 0));
const stage = ref(0);
const stageLabels = computed(() => [
  ...content.value.steps.map((st) => `Checking ${st.label.toLowerCase()}`),
  "Writing the feedback",
]);
onMounted(async () => {
  if (!analysing.value) return;
  for (let i = 0; i < stageLabels.value.length; i++) {
    stage.value = i;
    await new Promise((res) => setTimeout(res, 750));
  }
  stage.value = stageLabels.value.length;
  await new Promise((res) => setTimeout(res, 350));
  s.value.seenReview = r.value.version;
  analysing.value = false;
});

function editExplanation() {
  s.value.explainDraft = r.value.explanation;
  r.value.explained = false;
  nextTick(() => document.getElementById("explanation")?.focus());
}
/** The explanation comes first: saving it is what opens the way back into the attempt. */
async function revise() {
  if (!r.value.explained && !explainIssue(s.value, s.value.explainDraft)) return;
  s.value.explainDraft = "";
  s.value.focusStep = gapStep.value;
  s.value.phase = "work";
  await navigateTo(`/task/${id.value}/work`);
}
async function toReflection() {
  s.value.phase = "reflect";
  await navigateTo(`/task/${id.value}/reflect`);
}
</script>

<template>
  <div v-if="s && r && content" class="mx-auto w-full max-w-[860px] px-5 pt-6 sm:px-6 sm:pt-10">
    <AnimatePresence mode="wait" :initial="false">
      <!-- ANALYSING -->
      <Motion v-if="analysing" key="wait" :initial="{ opacity: 0, y: 20 }" :animate="{ opacity: 1, y: 0 }" :exit="{ opacity: 0, y: -16 }" :transition="{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }" class="mx-auto max-w-md pt-12 pb-24 sm:pt-24">
        <div class="relative mx-auto grid size-24 place-items-center">
          <span class="bg-primary/40 absolute inset-0 animate-ping rounded-[2rem]" />
          <span class="bg-primary relative grid size-24 place-items-center rounded-[2rem] shadow-glow"><PencilLine class="size-10" /></span>
        </div>
        <h1 class="font-display mt-8 text-center text-4xl leading-tight font-bold">Reviewing attempt {{ r.version }}</h1>
        <p class="text-muted-foreground mt-2 text-center">Checking each step you wrote.</p>
        <UiTrace class="mx-auto mt-10 max-w-xs gap-4">
          <div v-for="(label, i) in stageLabels" :key="label" class="flex">
            <UiTraceLine :status="i === stage ? 'running' : i > stage ? 'pending' : undefined" class="text-base">
              <UiTraceIcon>
                <Check v-if="i < stage" class="text-forest" :stroke-width="3" />
                <Loader2 v-else-if="i === stage" class="animate-spin" />
                <span v-else class="bg-foreground/25 size-1.5 rounded-full" />
              </UiTraceIcon>
              <UiTraceTitle :class="i < stage ? 'text-foreground font-medium' : ''">{{ label }}</UiTraceTitle>
            </UiTraceLine>
          </div>
        </UiTrace>
      </Motion>

      <!-- RESULT: the same sheet as the workspace, read-only, with the feedback written against each step -->
      <Motion v-else key="result" :initial="{ opacity: 0, y: 20 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }">
        <header class="mb-7 space-y-2">
          <p class="text-muted-foreground text-sm font-semibold">{{ task.title }} · Review of attempt {{ r.version }}</p>
          <h1 class="font-display text-[2.3rem] leading-[1.03] font-bold text-balance sm:text-5xl">
            {{ open ? (r.outcome === "repeat" ? "The same step still has a problem" : "One step needs another look") : "No issues found" }}
          </h1>
          <p class="text-muted-foreground max-w-xl text-[17px] leading-relaxed">
            {{ open ? "Feedback on the steps you wrote. It is not a grade." : "No issues found in the steps you submitted. This is not a grade." }}
          </p>
          <p v-if="stale" role="status" class="text-warning-foreground border-warning-foreground/50 flex items-start gap-2 border-l-4 py-1 pl-3 text-[15px] font-medium">
            You changed your attempt after this review. Review again to check the changes.
          </p>
        </header>

        <section aria-label="Your submitted steps">
          <ol>
            <li v-for="(step, i) in content.steps" :id="`review-step-${i}`" :key="step.label" tabindex="-1" class="grid grid-cols-[36px_minmax(0,1fr)] gap-x-4 outline-none">
              <div class="flex flex-col items-center">
                <span
                  class="grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold"
                  :class="open && i === gapStep ? 'bg-warning text-warning-foreground' : open && i > gapStep ? 'bg-foreground/8' : 'bg-forest text-white'"
                >
                  <Flag v-if="open && i === gapStep" class="size-4" />
                  <Check v-else-if="!(open && i > gapStep)" class="size-4" :stroke-width="3" />
                  <template v-else>{{ i + 1 }}</template>
                </span>
                <span v-if="i < content.steps.length - 1" class="mt-2 w-0.5 flex-1 rounded-full" :class="open && i >= gapStep ? 'bg-foreground/12' : 'bg-forest/40'" aria-hidden="true" />
              </div>
              <div class="min-w-0 pb-9">
              <h2 class="font-display mb-2 flex min-h-9 items-center text-xl font-bold">{{ step.label }}</h2>

              <div v-if="r.blocks[i]?.trim()" class="text-[17px] leading-8"><RichText :text="r.blocks[i]!" /></div>
              <p v-else class="text-muted-foreground">Nothing written.</p>

              <!-- Feedback for this step -->
              <p v-if="open && i > gapStep" class="text-muted-foreground mt-3 flex items-start gap-2 text-[15px] leading-snug">
                <CornerDownRight class="mt-0.5 size-4 shrink-0" /> Depends on step {{ gapStep + 1 }}. Fix that one first.
              </p>
              <p v-else-if="!(open && i === gapStep)" class="text-forest mt-3 flex items-start gap-2 text-[15px] leading-snug font-medium">
                <Check class="mt-0.5 size-4 shrink-0" :stroke-width="3" /> <span><RichText :text="content.supported[i]!" /></span>
              </p>

              <div v-else class="bg-warning text-warning-foreground mt-4 space-y-4 rounded-2xl p-5 sm:p-6">
                <div class="space-y-2">
                  <p class="font-display text-2xl leading-tight font-bold text-balance">{{ content.gap.title }}</p>
                  <p class="text-[16px] leading-relaxed"><RichText :text="content.gap.detail" /></p>
                  <p v-if="r.outcome === 'repeat'" class="border-warning-foreground/40 border-l-4 pl-3 text-[15px] font-medium">{{ content.repeatNote }}</p>
                  <p class="text-[16px] font-semibold italic"><RichText :text="content.gap.prompt" /></p>
                </div>

                <UiCollapsible v-if="r.outcome === 'repeat' && earlier" class="text-sm">
                  <UiCollapsibleTrigger class="font-semibold underline underline-offset-4">Your earlier explanation</UiCollapsibleTrigger>
                  <UiCollapsibleContent><blockquote class="border-warning-foreground/30 mt-2 border-l-4 pl-3 leading-relaxed">{{ earlier.explanation }}</blockquote></UiCollapsibleContent>
                </UiCollapsible>

                <!-- Explain first, then revise -->
                <div class="border-warning-foreground/20 space-y-2.5 border-t pt-4">
                  <template v-if="r.explained">
                    <p class="flex items-center gap-2 text-sm font-bold"><Check class="size-4" :stroke-width="3" /> Your explanation</p>
                    <p class="text-[16px] leading-relaxed">{{ r.explanation }}</p>
                    <button class="text-sm font-bold underline underline-offset-4" @click="editExplanation">Edit</button>
                  </template>
                  <template v-else>
                    <UiLabel for="explanation" class="font-display text-lg font-bold">Why does this step fail?</UiLabel>
                    <SampleInput label="explanation" class="pt-1" @fill="s.explainDraft = content.sampleAnswers.explanation">
                      <UiTextarea id="explanation" v-model="s.explainDraft" class="bg-card text-foreground min-h-[110px] text-[16px]" placeholder="Write it in your own words. It isn't marked." aria-describedby="explain-help" />
                    </SampleInput>
                  </template>
                  <p id="explain-help" class="text-sm opacity-85">Explain the problem first. Then fix the step yourself; the tutor won't write the fix.</p>
                </div>
                <UiButton variant="link" class="text-warning-foreground h-auto p-0 text-sm" @click="finishOpen = true">Skip: finish with this issue open</UiButton>
              </div>
              </div>
            </li>
          </ol>
        </section>

        <!-- Same bar as the workspace: back on the left, the next step on the right -->
        <div class="bg-background/85 sticky bottom-0 z-20 -mx-5 mt-6 border-t px-5 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
          <div class="flex items-center justify-between gap-3">
            <UiButton variant="outline" size="lg" class="max-sm:h-11 max-sm:px-4 max-sm:has-[>svg]:px-4" @click="navigateTo(`/task/${id}/work`)"><ArrowLeft /> Back<span class="max-sm:sr-only">&nbsp;to my attempt</span></UiButton>
            <UiButton v-if="open" size="lg" class="max-sm:h-11 max-sm:px-4 max-sm:has-[>svg]:px-4" :disabled="!canRevise" @click="revise">Revise step {{ gapStep + 1 }} <ArrowRight /></UiButton>
            <UiButton v-else size="lg" class="max-sm:h-11 max-sm:px-4 max-sm:has-[>svg]:px-4" @click="toReflection">Continue to reflection <ArrowRight /></UiButton>
          </div>
        </div>
      </Motion>
    </AnimatePresence>

    <UiAlertDialog v-model:open="finishOpen">
      <UiAlertDialogContent>
        <UiAlertDialogHeader>
          <UiAlertDialogTitle>Finish with this issue open?</UiAlertDialogTitle>
          <UiAlertDialogDescription>It will be listed in your reflection as still open. You can reopen the exercise later.</UiAlertDialogDescription>
        </UiAlertDialogHeader>
        <UiAlertDialogFooter>
          <UiAlertDialogCancel>Keep working</UiAlertDialogCancel>
          <UiAlertDialogAction @click="toReflection">Continue to reflection</UiAlertDialogAction>
        </UiAlertDialogFooter>
      </UiAlertDialogContent>
    </UiAlertDialog>
  </div>
</template>
