<script setup lang="ts">
import { ChevronLeft, Clock } from "@lucide/vue";
import { dayLabel } from "~/lib/format";

const app = useApp();
const route = useRoute();
const entry = computed(() => app.state.value.history.find((h) => h.id === String(route.params.id)));
if (!entry.value) await navigateTo("/history", { replace: true });
const task = computed(() => (entry.value ? app.task(entry.value.taskId) : undefined));
const course = computed(() => (task.value ? app.course(task.value.courseId) : undefined));
useHead({ title: computed(() => `${task.value?.title ?? "Reflection"} · Attempt First`) });

const flags = computed(() => {
  if (entry.value && !entry.value.flags) entry.value.flags = {};
  return entry.value?.flags ?? {};
});
function reopen() {
  if (entry.value && app.reopen(entry.value.taskId)) navigateTo(`/task/${entry.value.taskId}/work`);
}
</script>

<template>
  <div v-if="entry && task && course" class="space-y-10">
    <NuxtLink to="/history" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-semibold"><ChevronLeft class="size-4" /> History</NuxtLink>
    <header class="max-w-3xl space-y-3">
      <Reveal as="p" :y="8" class="text-muted-foreground flex items-center gap-3 text-sm font-semibold">
        {{ course.name }} · Task {{ task.number }}
        <span class="inline-flex items-center gap-1.5"><Clock class="size-3.5" /> {{ dayLabel(entry.finishedAt) }}</span>
      </Reveal>
      <Reveal as="h1" :delay="0.05" class="font-display text-[2.4rem] leading-[1.03] font-bold text-balance sm:text-5xl">Who thought it? {{ task.title }}</Reveal>
      <Reveal :delay="0.1" class="flex flex-wrap items-center gap-2">
        <Tag :kind="entry.outcome === 'resolved' ? 'ok' : 'gap'">{{ entry.outcome === "resolved" ? "Finished" : "Finished with a point to revisit" }}</Tag>
        <UiButton v-if="entry.session" size="sm" variant="outline" @click="reopen">Reopen task</UiButton>
      </Reveal>
    </header>
    <ReflectionView
      :contributions="entry.entries"
      :gaps="entry.gaps"
      :flags="flags"
      :attempts="entry.attempts"
      :hints-used="entry.hintsUsed"
      :editable="!!entry.session"
      @reopen="reopen"
    />
  </div>
</template>
