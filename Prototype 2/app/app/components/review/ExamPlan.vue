<script setup lang="ts">
import { CalendarIcon, ArrowRight } from '@lucide/vue'
import { parseDate, type DateValue } from '@internationalized/date'
import { topicById } from '~/data/catalog'
import { packs } from '~/data/packs'
import { daysUntil, fmtLong } from '~/lib/format'
import type { Priority } from '~/data/workspace'

const { course, courseTopics, setExam, setTopicPlan, examQueue } = useWorkspace()
const { begin } = useReviewRun()
const open = ref(false)

const date = computed<DateValue | undefined>({
  get: () => (course.value.exam.date ? parseDate(course.value.exam.date.slice(0, 10)) : undefined),
  set: (v) => { if (v) { setExam({ date: new Date(`${v.toString()}T09:00:00`).toISOString() }); open.value = false } },
})
const days = computed(() => (course.value.exam.date ? daysUntil(course.value.exam.date) : null))
const plan = (id: string) => course.value.exam.topics[id] ?? { on: true, priority: 'normal' as Priority }
const inScope = computed(() => courseTopics.value.filter(t => plan(t.id).on))
const prios: { v: Priority; label: string }[] = [{ v: 'low', label: 'Low' }, { v: 'normal', label: 'Normal' }, { v: 'high', label: 'High' }]
const explanation = computed(() => {
  if (!courseTopics.value.length) return ''
  if (!inScope.value.length) return 'Every topic is switched off, so the plan is empty. Switch one back on to see its questions. Your learning history is untouched.'
  const high = inScope.value.filter(t => plan(t.id).priority === 'high').map(t => t.name)
  const when = days.value === null ? 'Without an exam date, questions are ordered by what is due first.' : `With ${days.value} days to go, ${days.value > 28 ? 'there is time to spread this out' : 'the plan tightens'}.`
  return `${examQueue.value.length} ${examQueue.value.length === 1 ? 'question' : 'questions'} across ${inScope.value.length} ${inScope.value.length === 1 ? 'topic' : 'topics'}${high.length ? `, starting with ${high.join(' and ')}` : ''}. ${when}`
})
</script>

<template>
  <div class="space-y-12">
    <section aria-labelledby="exam-date" class="flex flex-wrap items-end justify-between gap-6">
      <div class="space-y-1.5"><h2 id="exam-date" class="text-xl font-semibold">Exam date</h2><p class="text-muted-foreground text-[15px] leading-6">Shapes how the plan is spread out. It never locks anything.</p></div>
      <UiPopover v-model:open="open">
        <UiPopoverTrigger as-child>
          <UiButton variant="outline" size="lg" class="min-w-60 justify-start"><CalendarIcon /> {{ course.exam.date ? fmtLong(course.exam.date) : 'Set an exam date' }}</UiButton>
        </UiPopoverTrigger>
        <UiPopoverContent class="w-auto p-2" align="end"><UiCalendar v-model="date" :min-value="undefined" initial-focus /></UiPopoverContent>
      </UiPopover>
    </section>

    <section aria-labelledby="scope" class="space-y-2">
      <h2 id="scope" class="text-xl font-semibold">What to include</h2>
      <ul class="divide-border divide-y">
        <li v-for="t in courseTopics" :key="t.id" class="flex flex-wrap items-center gap-x-5 gap-y-3 py-5">
          <UiSwitch :model-value="plan(t.id).on" :aria-label="`Include ${t.name}`" @update:model-value="(v) => setTopicPlan(t.id, { on: !!v })" />
          <div class="min-w-0 flex-1 basis-56"><p class="text-[17px] leading-6 font-medium" :class="!plan(t.id).on && 'text-muted-foreground'">{{ t.name }}</p><p class="text-muted-foreground text-sm">{{ plan(t.id).on ? t.blurb : 'Left out of this plan. Your history stays.' }}</p></div>
          <UiToggleGroup type="single" :model-value="plan(t.id).priority" :disabled="!plan(t.id).on" class="bg-muted gap-0.5 rounded-lg p-1" :aria-label="`Priority for ${t.name}`" @update:model-value="(v) => v && setTopicPlan(t.id, { priority: v as Priority })">
            <UiToggleGroupItem v-for="p in prios" :key="p.v" :value="p.v" class="h-8 rounded-md px-3.5 text-[13px]">{{ p.label }}</UiToggleGroupItem>
          </UiToggleGroup>
        </li>
      </ul>
    </section>

    <section aria-labelledby="queue" class="space-y-4">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div class="space-y-1.5"><h2 id="queue" class="text-xl font-semibold">Your review queue</h2><p class="text-muted-foreground max-w-xl text-[15px] leading-6" aria-live="polite">{{ explanation }}</p></div>
        <UiButton :disabled="!examQueue.length" @click="begin('plan', examQueue.map(x => x.item.qid))">Start this plan <ArrowRight /></UiButton>
      </div>
      <TransitionGroup tag="ol" name="rowlist" class="divide-border relative divide-y">
        <li v-for="(x, i) in examQueue" :key="x.item.qid" class="flex items-start gap-4 py-4">
          <span class="text-muted-foreground mt-0.5 w-5 shrink-0 text-sm tabular-nums">{{ i + 1 }}</span>
          <div class="min-w-0 flex-1 space-y-1"><p class="text-[15px] leading-6"><RichText :text="useWorkspace().findQuestion(x.item.qid)!.q.prompt" /></p><p class="text-muted-foreground text-sm">{{ topicById(packs[x.item.packId]!.topicId).name }}</p></div>
          <UiBadge variant="neutral">{{ x.reason }}</UiBadge>
        </li>
      </TransitionGroup>
    </section>
  </div>
</template>
