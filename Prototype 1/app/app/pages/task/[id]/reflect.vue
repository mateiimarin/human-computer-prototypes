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
const course = computed(() => app.course(task.value.courseId)!);
useHead({ title: computed(() => `Reflect · ${task.value.title}`) });

const finishOpen = ref(false);
const entries = computed(() => contributionEntries(s.value, content.value));
const open = computed(() => hasOpenGap(s.value));
const gaps = computed(() => (open.value ? [content.value.gap.revisit] : []));

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
async function finish(next: "today" | "library") {
  const taskId = id.value;
  const sheetId = task.value.sheetId;
  finishOpen.value = false;
  const entry = app.finishSession(taskId);
  toast.success("Session saved to History", {
    description: entry?.outcome === "gaps" ? "The open point is on your Today page." : "Nicely done.",
    action: entry ? { label: "View", onClick: () => navigateTo(`/history/${entry.id}`) } : undefined,
  });
  await navigateTo(next === "today" ? "/" : `/library/${sheetId}`);
}
</script>

<template>
  <div v-if="s && content" class="mx-auto w-full max-w-[820px] px-5 pt-6 pb-24 sm:px-6 sm:pt-10">
    <header class="relative isolate mb-12 overflow-hidden rounded-[2.25rem] p-7 text-white sm:p-10" style="background: var(--grad-dusk)">
      <div class="absolute inset-y-0 right-0 -z-10 hidden w-[42%] opacity-90 sm:block" style="mask-image: linear-gradient(to right, transparent, black 40%); -webkit-mask-image: linear-gradient(to right, transparent, black 40%)">
        <CourseArt tone="dusk" illo="orbit" bare />
      </div>
      <div class="flex min-h-[170px] flex-col justify-end gap-2 sm:max-w-[62%]">
        <Reveal as="p" :y="8" class="text-sm font-semibold text-white/80">{{ course.name }} · Task {{ task.number }}</Reveal>
        <Reveal as="h1" :delay="0.05" class="font-display text-[2.3rem] leading-[1.02] font-bold text-balance sm:text-5xl">Who thought it?</Reveal>
        <Reveal as="p" :delay="0.1" class="text-lg font-medium text-white/85">{{ task.title }}</Reveal>
      </div>
    </header>

    <ReflectionView
      :contributions="entries"
      :gaps="gaps"
      :flags="s.flags"
      :attempts="s.reviews.length"
      :hints-used="s.revealedHints.length"
      can-show
      editable
      @show="showStep"
      @show-tutor="showTutor"
      @reopen="reopen"
    />

    <footer class="mt-14 flex flex-wrap items-center justify-between gap-3 border-t pt-8">
      <UiButton variant="outline" size="lg" @click="reopen">Reopen task</UiButton>
      <UiButton size="xl" @click="finishOpen = true">Finish session <ArrowRight /></UiButton>
    </footer>

    <UiAlertDialog v-model:open="finishOpen">
      <UiAlertDialogContent>
        <UiAlertDialogHeader>
          <UiAlertDialogTitle>Finish this session?</UiAlertDialogTitle>
          <UiAlertDialogDescription>
            It's saved to History with this reflection. {{ open ? "The open point stays on your Today page." : "" }} You can reopen the task from there at any time.
          </UiAlertDialogDescription>
        </UiAlertDialogHeader>
        <UiAlertDialogFooter class="sm:flex-wrap">
          <UiAlertDialogCancel>Stay</UiAlertDialogCancel>
          <UiButton variant="outline" @click="finish('library')">Finish, choose another task</UiButton>
          <UiAlertDialogAction @click="finish('today')">Finish session</UiAlertDialogAction>
        </UiAlertDialogFooter>
      </UiAlertDialogContent>
    </UiAlertDialog>
  </div>
</template>
