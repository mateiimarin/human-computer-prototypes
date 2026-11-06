<script setup lang="ts">
import { useMediaQuery } from "@vueuse/core";
import { ArrowRight, MessageCircle } from "@lucide/vue";
import { submitReview } from "~/domain/session";

definePageMeta({ layout: "session" });
const app = useApp();
const id = useTaskId();
const s = useSession();
const content = useTaskContent();
const task = computed(() => app.task(id.value)!);
useHead({ title: computed(() => `Work · ${task.value.title}`) });

const wide = useMediaQuery("(min-width: 1024px)");
const helpOpen = ref(false);
const error = ref("");
const editor = ref<{ focusStep: (i: number) => void }>();
const sheetOpen = computed({
  get: () => helpOpen.value && !wide.value,
  set: (v) => (helpOpen.value = v),
});
const inlineRail = computed(() => helpOpen.value && wide.value);
watch(
  () => s.value?.blocks,
  () => (error.value = ""),
  { deep: true },
);

onMounted(() => {
  // The tutor is open on arrival when it already has something to show: a starter question,
  // a scaffold start (hints are part of that path) or a "Show in tutor" link from the reflection.
  const hasHistory = s.value.exchanges.length > 0 || s.value.revealedHints.length > 0;
  helpOpen.value = !!s.value.openTutor || ((hasHistory || s.value.start === "scaffold") && wide.value);
  s.value.openTutor = false;
  if (s.value.focusStep !== null) {
    const i = s.value.focusStep;
    s.value.focusStep = null;
    nextTick(() => editor.value?.focusStep(i));
  }
});
function focusStep(i: number) {
  if (!wide.value) helpOpen.value = false;
  nextTick(() => editor.value?.focusStep(i));
}
function review() {
  error.value = "";
  const r = submitReview(s.value);
  if (r === "ok") {
    s.value.phase = "review";
    return navigateTo(`/task/${id.value}/review`);
  }
  if (r === "empty") {
    error.value = "Write at least one step before you review.";
    focusStep(0);
  } else error.value = "Nothing has changed since the last review. Change a step first.";
}
</script>

<template>
  <div v-if="s && content" class="grid items-start" :class="inlineRail ? 'lg:grid-cols-[minmax(0,1fr)_400px]' : ''">
    <!-- One workspace: the exercise and the attempt read as one page, the tutor docks beside it -->
    <div class="min-w-0">
      <div class="mx-auto w-full max-w-[760px] px-5 pt-8 pb-10 sm:px-8">
        <section aria-label="Exercise" class="bg-card rounded-[2rem] p-6 shadow-md sm:p-8">
          <TaskContext :content="content" />
        </section>
        <Reveal :y="22" class="pt-10"><AttemptEditor ref="editor" :content="content" :error="error" /></Reveal>
      </div>

      <!-- Same place and shape on every screen of the session: back/secondary on the left, the next step on the right -->
      <div class="bg-background/90 sticky bottom-0 z-20 border-t backdrop-blur-xl">
        <div class="mx-auto flex w-full max-w-[760px] items-center justify-between gap-3 px-5 py-3 sm:px-8">
          <UiButton variant="outline" size="lg" class="max-sm:h-11 max-sm:px-3.5 max-sm:has-[>svg]:px-3.5 max-sm:gap-1.5" :aria-expanded="helpOpen" @click="helpOpen = !helpOpen">
            <MessageCircle /> {{ helpOpen ? "Hide the tutor" : "Ask the tutor" }}
          </UiButton>
          <UiButton size="lg" class="max-sm:h-11 max-sm:px-3.5 max-sm:has-[>svg]:px-3.5 max-sm:gap-1.5" @click="review">Review my attempt <ArrowRight /></UiButton>
        </div>
      </div>
    </div>

    <!-- Tutor, docked to the right edge (wide screens) -->
    <AnimatePresence>
      <Motion
        v-if="inlineRail"
        key="rail"
        :initial="{ opacity: 0, x: 40 }"
        :animate="{ opacity: 1, x: 0 }"
        :exit="{ opacity: 0, x: 40 }"
        :transition="{ type: 'spring', stiffness: 320, damping: 32 }"
        class="bg-card text-foreground sticky top-[72px] h-[calc(100dvh-72px)] min-h-[480px] overflow-hidden border-l"
        as="aside"
        aria-label="Tutor"
      >
        <TutorRail :content="content" @focus-step="focusStep" />
      </Motion>
    </AnimatePresence>

    <!-- Tutor sheet (narrow) -->
    <UiSheet v-model:open="sheetOpen">
      <UiSheetContent side="right" class="bg-card text-foreground w-full gap-0 border-0 p-0 sm:max-w-[440px]">
        <UiSheetHeader class="sr-only"><UiSheetTitle>Tutor</UiSheetTitle><UiSheetDescription>Ask the tutor questions and use hints.</UiSheetDescription></UiSheetHeader>
        <TutorRail v-if="sheetOpen" :content="content" sheet @focus-step="focusStep" />
      </UiSheetContent>
    </UiSheet>
  </div>
</template>
