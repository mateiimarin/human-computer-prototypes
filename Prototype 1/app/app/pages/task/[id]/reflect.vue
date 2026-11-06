<script setup lang="ts">
import { ArrowRight } from "@lucide/vue";
import { toast } from "vue-sonner";
import { contributionEntries, hasOpenGap } from "~/domain/session";

definePageMeta({ layout: "session" });
const app = useApp();
const id = useTaskId();
const s = useSession();
const content = useTaskContent();
const task = computed(() => app.task(id.value)!);
useHead({ title: computed(() => `Reflect · ${task.value.title}`) });

const entries = computed(() => contributionEntries(s.value, content.value));
const gaps = computed(() => (hasOpenGap(s.value) ? [content.value.gap.revisit] : []));

async function showStep(i: number) {
  s.value.focusStep = i;
  s.value.phase = "work";
  await navigateTo(`/task/${id.value}/work`);
}
async function showTutor() {
  s.value.openTutor = true;
  s.value.phase = "work";
  await navigateTo(`/task/${id.value}/work`);
}
async function reopen() {
  s.value.phase = "work";
  await navigateTo(`/task/${id.value}/work`);
}
async function finish() {
  app.finishSession(id.value);
  toast.success("Finished", { description: "Open it from the list to view the reflection or reopen it." });
  await navigateTo("/");
}
</script>

<template>
  <div v-if="s && content" class="mx-auto w-full max-w-[820px] px-5 pt-6 pb-24 sm:px-6 sm:pt-10">
    <header class="mb-12 space-y-2">
      <Reveal as="p" :y="8" class="text-muted-foreground text-sm font-semibold">{{ task.title }}</Reveal>
      <Reveal as="h1" :delay="0.05" class="font-display text-[2.3rem] leading-[1.02] font-bold text-balance sm:text-5xl">Who thought it?</Reveal>
      <Reveal as="p" :delay="0.1" class="text-muted-foreground text-lg">Each step, hint and tutor question from this exercise, and who it came from.</Reveal>
    </header>

    <ReflectionView
      :contributions="entries"
      :gaps="gaps"
      :flags="s.flags"
      :attempts="s.reviews.length"
      :hints-used="s.revealedHints.length"
      @show="showStep"
      @show-tutor="showTutor"
      @reopen="reopen"
    />

    <footer class="mt-14 flex flex-wrap items-center justify-between gap-3 border-t pt-8">
      <UiButton variant="outline" size="lg" @click="reopen">Reopen exercise</UiButton>
      <UiButton v-if="app.status(id) === 'finished'" size="xl" @click="navigateTo('/')">Back to exercises <ArrowRight /></UiButton>
      <UiButton v-else size="xl" @click="finish">Finish <ArrowRight /></UiButton>
    </footer>
  </div>
</template>
