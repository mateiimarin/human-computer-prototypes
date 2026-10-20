<script setup lang="ts">
import { useMediaQuery } from "@vueuse/core";
import { ArrowRight, ChevronDown, MessageCircle } from "@lucide/vue";
import { hasWork, submitReview } from "~/domain/session";

definePageMeta({ layout: "session" });
const app = useApp();
const id = useTaskId();
const s = useSession();
const content = useTaskContent();
const task = computed(() => app.task(id.value)!);
useHead({ title: computed(() => `Work · ${task.value.title}`) });

const mid = useMediaQuery("(min-width: 1024px)");
const helpOpen = ref(false);
const taskOpen = ref(!hasWork(s.value));
const error = ref("");
const editor = ref<{ focusStep: (i: number) => void }>();
const sheetOpen = computed({
  get: () => helpOpen.value && !mid.value,
  set: (v) => (helpOpen.value = v),
});
const inlineRail = computed(() => helpOpen.value && mid.value);
watch(
  () => s.value?.blocks,
  () => (error.value = ""),
  { deep: true },
);

onMounted(() => {
  // The tutor is open on arrival when it already has something to show: a starter question,
  // a scaffold start (hints are part of that path) or a "Show in tutor" link from the reflection.
  const hasHistory = s.value.exchanges.length > 0 || s.value.revealedHints.length > 0;
  helpOpen.value = !!s.value.openTutor || ((hasHistory || s.value.start === "scaffold") && mid.value);
  s.value.openTutor = false;
  if (s.value.focusStep !== null) {
    const i = s.value.focusStep;
    s.value.focusStep = null;
    nextTick(() => editor.value?.focusStep(i));
  }
});
function focusStep(i: number) {
  if (!mid.value) helpOpen.value = false;
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
    error.value = "Add a first step, or use a photo of your handwritten work, before asking for a review.";
    focusStep(0);
  } else error.value = "Nothing has changed since your last review. Revise a step first, then check again.";
}
</script>

<template>
  <div v-if="s && content" class="mx-auto w-full max-w-[1480px] px-4 pt-2 sm:px-6">
    <div
      class="grid items-start gap-x-8 gap-y-6"
      :class="inlineRail ? 'lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[290px_minmax(0,1fr)_390px]' : 'xl:grid-cols-[290px_minmax(0,1fr)]'"
    >
      <!-- Task: sticky column at xl, collapsible above that -->
      <aside class="hidden xl:sticky xl:top-[96px] xl:block xl:max-h-[calc(100dvh-112px)] xl:overflow-y-auto xl:pr-2" aria-label="Task">
        <TaskContext :content="content" :title="task.title" :number="task.number" />
      </aside>

      <div class="min-w-0" :class="!inlineRail ? 'xl:mx-auto xl:w-full xl:max-w-[820px]' : ''">
        <UiCollapsible v-model:open="taskOpen" class="mb-6 xl:hidden">
          <UiCollapsibleTrigger class="flex w-full items-center justify-between border-b py-3 text-left">
            <span class="font-display text-lg font-bold">Task {{ task.number }} · {{ task.title }}</span>
            <ChevronDown class="size-5 transition-transform duration-300" :class="taskOpen ? 'rotate-180' : ''" />
          </UiCollapsibleTrigger>
          <UiCollapsibleContent class="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
            <div class="pt-5"><TaskContext :content="content" :title="task.title" :number="task.number" hide-title /></div>
          </UiCollapsibleContent>
        </UiCollapsible>

        <Reveal :y="22"><AttemptEditor ref="editor" :content="content" :error="error" /></Reveal>

        <!-- Same place and shape on every screen of the session: back/secondary on the left, the next step on the right -->
        <div class="bg-background/85 max-xl:-mx-4 max-xl:px-4 sm:max-xl:-mx-6 sm:max-xl:px-6 sticky bottom-0 z-20 mt-6 border-t py-3 backdrop-blur-xl">
          <div class="flex items-center justify-between gap-3">
            <UiButton variant="outline" size="lg" class="max-sm:h-11 max-sm:px-3.5 max-sm:has-[>svg]:px-3.5 max-sm:gap-1.5" :aria-expanded="helpOpen" @click="helpOpen = !helpOpen">
              <MessageCircle /> {{ helpOpen ? "Hide the tutor" : "Ask the tutor" }}
            </UiButton>
            <UiButton size="lg" class="max-sm:h-11 max-sm:px-3.5 max-sm:has-[>svg]:px-3.5 max-sm:gap-1.5" @click="review">Review my attempt <ArrowRight /></UiButton>
          </div>
        </div>
      </div>

      <!-- Tutor rail (wide) -->
      <AnimatePresence>
        <Motion
          v-if="inlineRail"
          key="rail"
          :initial="{ opacity: 0, x: 48, scale: 0.98 }"
          :animate="{ opacity: 1, x: 0, scale: 1 }"
          :exit="{ opacity: 0, x: 48 }"
          :transition="{ type: 'spring', stiffness: 320, damping: 32 }"
          class="bg-guidance text-foreground sticky top-[88px] h-[calc(100dvh-104px)] min-h-[520px] overflow-hidden rounded-[2rem]"
          as="aside"
          aria-label="Tutor"
        >
          <TutorRail :content="content" @focus-step="focusStep" />
        </Motion>
      </AnimatePresence>
    </div>

    <!-- Tutor sheet (narrow) -->
    <UiSheet v-model:open="sheetOpen">
      <UiSheetContent side="right" class="bg-guidance text-foreground w-full gap-0 border-0 p-0 sm:max-w-[440px]">
        <UiSheetHeader class="sr-only"><UiSheetTitle>Tutor</UiSheetTitle><UiSheetDescription>Ask questions and use hints for this task.</UiSheetDescription></UiSheetHeader>
        <TutorRail v-if="sheetOpen" :content="content" sheet @focus-step="focusStep" />
      </UiSheetContent>
    </UiSheet>
  </div>
</template>
