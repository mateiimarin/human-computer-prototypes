<script setup lang="ts">
import { Clock, EllipsisVertical, ExternalLink, FolderOpen, History } from "@lucide/vue";
import type { Sheet, Task } from "~/data/types";
import { dueLabel, dueTone } from "~/lib/format";

const props = defineProps<{ task: Task; sheet?: Sheet; timeline?: boolean; last?: boolean; index?: number }>();
const app = useApp();
const status = computed(() => app.status(props.task.id));
const course = computed(() => app.course(props.task.courseId)!);
const history = computed(() => app.historyFor(props.task.id)[0]);
const cta = computed(() =>
  status.value === "inprogress" ? "Continue" : status.value === "new" ? "Start" : "Review",
);
const meta: Record<string, string> = {
  new: "Not started",
  inprogress: "In progress",
  resolved: "Finished",
  gaps: "Finished · one point to revisit",
};
</script>

<template>
  <Reveal as="li" :index="index ?? 0" :delay="0.12" :y="14" :class="['group relative grid gap-x-4', timeline ? 'grid-cols-[28px_minmax(0,1fr)]' : 'grid-cols-1']">
    <div v-if="timeline" class="relative flex flex-col items-center pt-6">
      <StatusDot :status="status" />
      <span v-if="!last" class="border-foreground/20 mt-2 w-px flex-1 border-l-2 border-dashed" aria-hidden="true" />
    </div>
    <div class="relative pb-4">
      <NuxtLink
        :to="`/task/${task.id}`"
        class="hover:bg-card/80 flex items-center gap-4 rounded-[1.75rem] p-3 pr-4 transition-all duration-300 hover:shadow-md sm:gap-5"
      >
        <span class="min-w-0 flex-1 space-y-1.5 py-1 pl-2 sm:pl-3">
          <span class="text-muted-foreground flex items-center gap-2 text-sm font-semibold">
            {{ course.name }}
            <template v-if="sheet"><span aria-hidden="true">·</span> Sheet {{ sheet.number }}</template>
          </span>
          <span class="font-display block text-[1.35rem] leading-tight font-bold text-balance sm:text-2xl">
            {{ task.number }}. {{ task.title }}
          </span>
          <span class="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span class="inline-flex items-center gap-1.5"><Clock class="size-3.5" /> {{ task.minutes }} min</span>
            <span>{{ meta[status] }}</span>
            <span v-if="sheet && status !== 'resolved' && status !== 'gaps'" :class="dueTone(sheet.due) === 'soon' ? 'text-warning-foreground font-semibold' : ''">
              {{ dueLabel(sheet.due) }}
            </span>
          </span>
        </span>
        <span class="relative hidden h-[108px] w-[148px] shrink-0 overflow-hidden rounded-[1.4rem] sm:block">
          <span class="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110"><CourseArt :tone="course.tone" :illo="course.illo" :animated="false" /></span>
        </span>
      </NuxtLink>
      <UiDropdownMenu>
        <UiDropdownMenuTrigger as-child>
          <UiButton variant="ghost" size="icon-sm" class="bg-card/90 absolute top-5 right-5 hidden shadow-sm sm:inline-flex" :aria-label="`Actions for ${task.title}`">
            <EllipsisVertical />
          </UiButton>
        </UiDropdownMenuTrigger>
        <UiDropdownMenuContent align="end" class="w-52 rounded-2xl p-1.5">
          <UiDropdownMenuItem class="rounded-xl py-2.5" @select="navigateTo(`/task/${task.id}`)"><ExternalLink /> {{ cta }} task</UiDropdownMenuItem>
          <UiDropdownMenuItem v-if="sheet" class="rounded-xl py-2.5" @select="navigateTo(`/library/${sheet.id}`)"><FolderOpen /> Open sheet</UiDropdownMenuItem>
          <UiDropdownMenuItem v-if="history" class="rounded-xl py-2.5" @select="navigateTo(`/history/${history.id}`)"><History /> Last reflection</UiDropdownMenuItem>
        </UiDropdownMenuContent>
      </UiDropdownMenu>
    </div>
  </Reveal>
</template>
