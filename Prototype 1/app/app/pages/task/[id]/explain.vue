<script setup lang="ts">
import { ArrowRight, Check, EyeOff, Flag } from "@lucide/vue";
import { explainBackFeedback, markExplainedBack } from "~/domain/session";

definePageMeta({ layout: "session" });
const app = useApp();
const id = useTaskId();
const s = useSession();
const content = useTaskContent();
const task = computed(() => app.task(id.value)!);
useHead({ title: computed(() => `Explain it back · ${task.value.title}`) });

const submitted = ref(s.value.explainedBack);
const feedback = computed(() => explainBackFeedback(s.value, content.value));

function submit() {
  if (!s.value.explainBackDraft.trim()) return;
  markExplainedBack(s.value);
  submitted.value = true;
}
</script>

<template>
  <div v-if="s && content" class="mx-auto w-full max-w-[680px] px-5 pt-8 pb-24 sm:pt-14">
    <header class="space-y-3">
      <p class="text-muted-foreground text-sm font-semibold">{{ task.title }} · Explain it back</p>
      <h1 class="font-display text-[2.2rem] leading-[1.05] font-bold text-balance sm:text-5xl">Explain your approach</h1>
      <p class="text-muted-foreground flex items-start gap-2 text-lg leading-snug">
        <EyeOff class="mt-1 size-5 shrink-0" />
        <span>This is optional. Your attempt, the tutor chat and hints are hidden here. Write the approach in your own words, without looking back.</span>
      </p>
    </header>

    <div v-if="!submitted" class="mt-9 space-y-4">
      <UiLabel for="explain-back" class="font-display text-lg font-bold">What is the approach, and why does it work?</UiLabel>
      <SampleInput label="explanation" @fill="s.explainBackDraft = content.sampleAnswers.explanation">
        <UiTextarea id="explain-back" v-model="s.explainBackDraft" class="bg-card min-h-[160px] text-[16px]" placeholder="Describe the steps and why each one holds, from memory." />
      </SampleInput>
      <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
        <UiButton variant="link" class="h-auto p-0 text-sm" @click="navigateTo(`/task/${id}/reflect`)">Skip this check</UiButton>
        <UiButton size="lg" :disabled="!s.explainBackDraft.trim()" @click="submit">Submit explanation <ArrowRight /></UiButton>
      </div>
    </div>

    <div v-else class="mt-9 space-y-7">
      <section class="space-y-3">
        <h2 class="font-display text-xl font-bold">Your explanation</h2>
        <p class="bg-card rounded-2xl p-5 text-[16px] leading-relaxed">{{ s.explainBackDraft }}</p>
      </section>

      <section v-if="feedback.covered.length" class="space-y-2.5">
        <h2 class="font-display text-xl font-bold">What this covers</h2>
        <ul class="space-y-2">
          <li v-for="c in feedback.covered" :key="c" class="text-forest flex items-start gap-2 text-[15px] leading-snug font-medium"><Check class="mt-0.5 size-4 shrink-0" :stroke-width="3" /> <RichText :text="c" /></li>
        </ul>
      </section>

      <section v-if="feedback.gap" class="bg-warning text-warning-foreground space-y-2 rounded-2xl p-6">
        <p class="flex items-center gap-2 font-display text-lg font-bold"><Flag class="size-4" /> Still not covered: {{ feedback.gap.title }}</p>
        <p class="text-[15px] leading-relaxed"><RichText :text="feedback.gap.detail" /></p>
      </section>

      <p class="text-muted-foreground text-sm leading-relaxed">This records whether you could restate the approach on your own. It isn't a grade, and the concepts above are now marked "shown without help".</p>

      <UiButton size="xl" @click="navigateTo(`/task/${id}/reflect`)">Back to reflection <ArrowRight /></UiButton>
    </div>
  </div>
</template>
