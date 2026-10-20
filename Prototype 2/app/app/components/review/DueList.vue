<script setup lang="ts">
import { CheckCircle2, ArrowRight, CalendarCheck } from '@lucide/vue'
import { relative } from '~/lib/format'

const { dueNow, savedForCourse, findQuestion, ws } = useWorkspace()
const { begin } = useReviewRun()
const upcoming = computed(() => savedForCourse.value.filter(s => !s.excluded && s.dueAt && new Date(s.dueAt) > new Date()).sort((a, b) => +new Date(a.dueAt!) - +new Date(b.dueAt!)))
const weekly = computed(() => savedForCourse.value.filter(s => !s.excluded).slice(0, 8))
const minutes = (n: number) => Math.max(2, n * 2)
</script>

<template>
  <div class="space-y-12">
    <section aria-labelledby="due-h" class="space-y-4">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div class="space-y-1"><h2 id="due-h" class="text-xl font-semibold">Due now</h2><p class="text-muted-foreground text-[15px]">{{ dueNow.length ? `${dueNow.length} ${dueNow.length === 1 ? 'question' : 'questions'}, about ${minutes(dueNow.length)} minutes. Solutions stay hidden.` : 'Nothing is waiting for you.' }}</p></div>
        <UiButton v-if="dueNow.length" size="lg" @click="begin('due', dueNow.map(d => d.qid))">Start due review <ArrowRight /></UiButton>
      </div>
      <ul v-if="dueNow.length" class="divide-border divide-y">
        <li v-for="d in dueNow" :key="d.qid" class="flex flex-wrap items-center gap-x-4 gap-y-1 py-4"><p class="min-w-0 flex-1 basis-64 text-[15px] leading-6"><RichText :text="findQuestion(d.qid)!.q.prompt" /></p><span class="text-muted-foreground text-sm">{{ d.sessionTitle }}</span><UiBadge variant="partial">{{ relative(d.dueAt!) }}</UiBadge></li>
      </ul>
      <EmptyState v-else title="You’re all caught up" :text="upcoming.length ? `Your next question is due ${relative(upcoming[0]!.dueAt!).toLowerCase()}. You can still run a weekly review whenever you like.` : 'Save questions from a session summary and they will come back here when they are due.'">
        <template #icon><CheckCircle2 class="size-5" /></template>
        <UiButton variant="outline" as-child><NuxtLink to="/study">Start a session</NuxtLink></UiButton>
      </EmptyState>
    </section>

    <section aria-labelledby="week-h" class="border-border flex flex-wrap items-center gap-5 rounded-2xl border p-5 sm:p-6">
      <span class="bg-check text-check-foreground grid size-12 shrink-0 place-items-center rounded-xl"><CalendarCheck class="size-6" /></span>
      <div class="min-w-0 flex-1 basis-64 space-y-1"><h2 id="week-h" class="text-xl font-semibold">Weekly review</h2><p class="text-muted-foreground max-w-xl text-[15px] leading-6">A broader mix from everything you’ve saved: {{ weekly.length }} questions, about {{ minutes(weekly.length) }} minutes. {{ ws.weeklyDoneAt ? 'Done this week.' : '' }}</p></div>
      <UiButton variant="outline" size="lg" :disabled="!weekly.length" @click="begin('weekly', weekly.map(w => w.qid))">Start weekly review</UiButton>
    </section>

    <section v-if="upcoming.length" aria-labelledby="up-h" class="space-y-2">
      <h2 id="up-h" class="text-xl font-semibold">Coming up</h2>
      <ul class="divide-border divide-y">
        <li v-for="d in upcoming" :key="d.qid" class="flex flex-wrap items-center gap-x-4 gap-y-1 py-4"><p class="min-w-0 flex-1 basis-64 text-[15px] leading-6"><RichText :text="findQuestion(d.qid)!.q.prompt" /></p><UiBadge variant="neutral">{{ relative(d.dueAt!) }}</UiBadge></li>
      </ul>
    </section>
  </div>
</template>
