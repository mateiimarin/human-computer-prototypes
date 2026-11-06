<script setup lang="ts">
import { ArrowRight, MessageSquareQuote } from "@lucide/vue";
import { toast } from "vue-sonner";
import { conceptChips, contributionEntries, hasOpenGap } from "~/domain/session";

definePageMeta({ layout: "session" });
const app = useApp();
const id = useTaskId();
const s = useSession();
const content = useTaskContent();
const task = computed(() => app.task(id.value)!);
useHead({ title: computed(() => `Reflect · ${task.value.title}`) });

const entries = computed(() => contributionEntries(s.value, content.value));
const gaps = computed(() => (hasOpenGap(s.value) ? [content.value.gap.revisit] : []));
const concepts = computed(() => conceptChips(s.value, content.value));
const conceptStyle = {
  "not-attempted": { dot: "bg-foreground/20", text: "Not attempted" },
  assisted: { dot: "bg-sun-deep", text: "Shown with help" },
  demonstrated: { dot: "bg-forest", text: "Shown without help" },
} as const;

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

    <!-- Concepts: reuses each step's own label, so nothing is invented beyond what the exercise already names -->
    <section aria-labelledby="concepts" class="mt-12 border-t pt-8">
      <h2 id="concepts" class="font-display mb-1 text-2xl font-bold">Concepts</h2>
      <p class="text-muted-foreground mb-5 max-w-xl text-[15px] leading-relaxed">Whether each step was shown without help. This doesn't measure what you understand.</p>
      <ul class="space-y-2.5">
        <li v-for="c in concepts" :key="c.label" class="flex items-center gap-2.5 text-[15px] font-medium">
          <span class="size-2.5 rounded-full" :class="conceptStyle[c.status].dot" aria-hidden="true" />
          <span class="font-semibold">{{ c.label }}</span>
          <span class="text-muted-foreground">{{ conceptStyle[c.status].text }}</span>
        </li>
      </ul>
      <UiButton v-if="!s.explainedBack" variant="outline" class="mt-6" @click="navigateTo(`/task/${id}/explain`)"><MessageSquareQuote /> Explain it back (optional)</UiButton>
      <p v-else class="text-forest mt-6 flex items-center gap-2 text-sm font-semibold"><MessageSquareQuote class="size-4" /> You explained this exercise back on {{ new Date(s.explainBackSubmittedAt!).toLocaleDateString() }}.</p>
    </section>

    <footer class="mt-14 flex flex-wrap items-center justify-between gap-3 border-t pt-8">
      <UiButton variant="outline" size="lg" @click="reopen">Reopen exercise</UiButton>
      <UiButton v-if="app.status(id) === 'finished'" size="xl" @click="navigateTo('/')">Back to exercises <ArrowRight /></UiButton>
      <UiButton v-else size="xl" @click="finish">Finish <ArrowRight /></UiButton>
    </footer>
  </div>
</template>
