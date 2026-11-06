<script setup lang="ts">
import { Flag, Sparkles } from "@lucide/vue";
import type { TaskContent } from "~/data/types";
import { hasOpenGap, isStale, latestReview, nextOutcome } from "~/domain/session";

const props = defineProps<{ content: TaskContent; error?: string }>();
const s = useSession();
const id = useTaskId();
const flash = ref<number | null>(null);

const review = computed(() => latestReview(s.value));
const stale = computed(() => isStale(s.value));
const open = computed(() => hasOpenGap(s.value));
const gapStep = computed(() => props.content.gap.step);
const attempt = computed(() => (review.value?.version ?? 0) + (stale.value || !review.value ? 1 : 0));
const filled = computed(() => s.value.blocks.map((b) => !!b.trim()));

/** One line under the title: what to do, or where the last review left things. */
const status = computed(() => {
  const v = review.value?.version;
  if (!v) return { gap: false, text: "Write your answer step by step. Put maths between $ signs." };
  if (open.value)
    return {
      gap: true,
      text: stale.value
        ? `Revising after review ${v}. Review again when you're ready.`
        : `Review ${v} found a problem in step ${gapStep.value + 1}. Fix it, then review again.`,
    };
  return { gap: false, text: stale.value ? `Changed since review ${v}. Review again to check the changes.` : `Review ${v} found no issues.` };
});

function focusStep(i: number) {
  nextTick(() => {
    const el = document.getElementById(`attempt-${i}`);
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
    el?.focus({ preventScroll: true });
    flash.value = i;
    setTimeout(() => (flash.value = null), 1600);
  });
}
defineExpose({ focusStep });

/** Test aid: the prepared text for this step. The first review gets the version with the mistake, later ones the corrected one. */
function fillStep(i: number) {
  s.value.blocks[i] = props.content.samples[nextOutcome(s.value)][i]!;
}
function setBlock(i: number, v: string | number) {
  s.value.blocks[i] = String(v);
}
const hasMath = (b: string | undefined) => !!b && /\$[^$\n]+\$/.test(b);
</script>

<template>
  <section aria-labelledby="attempt-title">
    <header class="space-y-1">
      <p class="text-muted-foreground text-sm font-semibold">Attempt {{ attempt }}</p>
      <h1 id="attempt-title" class="font-display text-[2rem] leading-tight font-bold sm:text-4xl">Your attempt</h1>
    </header>

    <p
      class="mt-2 flex items-start gap-2 text-[15px] leading-snug"
      :class="status.gap ? 'text-warning-foreground font-medium' : 'text-muted-foreground'"
      role="status"
    >
      <Flag v-if="status.gap" class="mt-0.5 size-4 shrink-0" />
      <span>
        {{ status.text }}
        <NuxtLink v-if="status.gap" :to="`/task/${id}/review`" class="ml-1 font-semibold underline underline-offset-4">See the feedback</NuxtLink>
      </span>
    </p>

    <Transition enter-active-class="transition duration-300" enter-from-class="-translate-y-2 opacity-0">
      <p v-if="error" role="alert" class="bg-warning text-warning-foreground mt-5 rounded-2xl px-4 py-3.5 text-[15px] font-medium">{{ error }}</p>
    </Transition>

    <!-- Steps hang on one line, so they read as a single piece of work -->
    <ol class="mt-8">
      <li v-for="(step, i) in content.steps" :key="step.label" class="grid grid-cols-[36px_minmax(0,1fr)] gap-x-4">
        <div class="flex flex-col items-center">
          <span class="grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors duration-500" :class="filled[i] ? 'bg-forest text-white' : 'bg-foreground/8'">{{ i + 1 }}</span>
          <span v-if="i < content.steps.length - 1" class="mt-2 w-0.5 flex-1 rounded-full transition-colors duration-500" :class="filled[i] ? 'bg-forest/40' : 'bg-foreground/12'" aria-hidden="true" />
        </div>
        <div class="min-w-0 pb-9">
          <UiLabel :for="`attempt-${i}`" class="font-display flex min-h-9 items-center text-xl font-bold">{{ step.label }}</UiLabel>

          <p v-if="s.start === 'scaffold'" class="text-guidance-foreground mt-1 mb-3 flex items-start gap-2 text-[15px] font-medium"><Sparkles class="mt-0.5 size-4 shrink-0" /> {{ step.scaffold }}</p>

          <!-- What the last review said about this step, kept next to the text being revised -->
          <div v-if="open && i === gapStep" class="border-warning-foreground/50 bg-warning/60 mt-1 mb-3 space-y-1.5 rounded-r-2xl border-l-4 py-3 pr-4 pl-4 text-[15px] leading-snug">
            <p class="text-warning-foreground font-bold">{{ content.gap.title }}</p>
            <p v-if="review?.explained" class="text-warning-foreground/90">You explained: “{{ review.explanation }}”</p>
          </div>

          <SampleInput :label="step.label" class="mt-3" @fill="fillStep(i)">
            <UiTextarea
              :id="`attempt-${i}`"
              class="min-h-[112px] text-[17px] transition-shadow duration-500"
              :class="flash === i ? 'ring-ring/40 border-ring ring-4' : ''"
              :model-value="s.blocks[i]"
              :placeholder="step.placeholder"
              @update:model-value="setBlock(i, $event)"
            />
          </SampleInput>
          <p v-if="hasMath(s.blocks[i])" class="text-muted-foreground mt-2.5 overflow-x-auto px-1 text-[17px] leading-8" aria-label="Preview of your step"><RichText :text="s.blocks[i]!" /></p>
        </div>
      </li>
    </ol>
  </section>
</template>
