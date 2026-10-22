<script setup lang="ts">
import { Check, X, SkipForward, Clock4, LifeBuoy, HelpCircle, Contrast } from '@lucide/vue'
import { topics } from '~/data/catalog'
import { fmtDate } from '~/lib/format'
import type { EvidenceItem } from '~/lib/evidence'
import { confidenceLabel } from '~/lib/evidence'

/** The answers behind one concept's status: one group per exercise or practice round, newest first. */
const { sub, close } = useEvidenceSheet()
const { ws } = useWorkspace()
const { drill, questionsFor } = useReviewRun()
const info = computed(() => {
  if (!sub.value) return null
  for (const tp of topics) {
    const c = tp.concepts.find(x => x.id === sub.value)
    if (c) return { concept: c, topic: tp }
  }
  return null
})
const history = computed(() => ws.value.entries.filter(e => e.sub === sub.value).sort((a, b) => +new Date(b.at) - +new Date(a.at)))
const latest = computed(() => history.value[0])
const reason = computed(() => {
  const l = latest.value
  if (!l) return 'No check has covered this concept yet.'
  if (l.state !== 'unverified') return ''
  return { assisted: 'You used help, so these answers do not count.', skipped: 'This check was skipped.', deferred: 'This check was postponed.', independent: '' }[l.condition]
})

const icon: Record<EvidenceItem['verdict'], any> = { correct: Check, incorrect: X, partial: Contrast, skipped: SkipForward, deferred: Clock4, assisted: LifeBuoy, idk: HelpCircle }
const tone: Record<EvidenceItem['verdict'], string> = { correct: 'text-demonstrated-foreground', incorrect: 'text-gap-foreground', partial: 'text-partial-foreground', skipped: 'text-muted-foreground', deferred: 'text-muted-foreground', assisted: 'text-assist-foreground', idk: 'text-gap-foreground' }
const word: Record<EvidenceItem['verdict'], string> = { correct: 'Correct', incorrect: 'Wrong', partial: 'Partly right', skipped: 'Skipped', deferred: 'Postponed', assisted: 'Answered with help', idk: 'Not answered' }
const answered = (v: EvidenceItem['verdict']) => v === 'correct' || v === 'incorrect' || v === 'partial'

function practise() { const sid = sub.value!; close(); drill(sid) }
</script>

<template>
  <UiSheet :open="!!sub" @update:open="(o) => !o && close()">
    <UiSheetContent side="right" class="w-full gap-0 sm:max-w-lg">
      <template v-if="info">
        <UiSheetHeader class="space-y-2 p-6 pb-5">
          <p class="text-muted-foreground text-sm">{{ info.topic.name }}</p>
          <UiSheetTitle class="text-2xl leading-8">{{ info.concept.name }}</UiSheetTitle>
          <UiSheetDescription class="sr-only">The answers behind the status of {{ info.concept.name }}.</UiSheetDescription>
          <div class="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <EvidenceBadge v-if="latest" :state="latest.state" />
            <p v-if="reason" class="text-muted-foreground text-sm">{{ reason }}</p>
          </div>
        </UiSheetHeader>

        <div v-if="history.length" class="flex-1 space-y-8 overflow-y-auto px-6 pb-6">
          <section v-for="e in history" :key="e.id" :aria-label="`${e.title}, ${fmtDate(e.at)}`">
            <div class="border-border mb-1 flex items-baseline justify-between gap-3 border-b pb-2">
              <h3 class="text-[15px] font-semibold">{{ e.title }}</h3>
              <span class="text-muted-foreground shrink-0 text-sm">{{ fmtDate(e.at) }}</span>
            </div>
            <ul class="divide-border divide-y">
              <li v-for="(it, j) in e.items" :key="j" class="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-3 py-4">
                <component :is="icon[it.verdict]" class="mt-0.5 size-5" :class="tone[it.verdict]" :aria-label="word[it.verdict]" role="img" />
                <div class="space-y-1.5">
                  <p class="text-[15px] leading-6 font-medium"><RichText :text="it.label" /></p>
                  <p v-if="answered(it.verdict) || it.verdict === 'idk'" class="text-muted-foreground text-sm leading-6">
                    Your answer: <span class="text-foreground"><RichText :text="it.answer" /></span><template v-if="it.confidence"> · Confidence: {{ confidenceLabel[it.confidence].toLowerCase() }}</template>
                  </p>
                  <p v-else class="text-sm" :class="tone[it.verdict]">{{ word[it.verdict] }}</p>
                  <p v-if="it.note && answered(it.verdict)" class="text-muted-foreground text-sm leading-6"><RichText :text="it.note" /></p>
                </div>
              </li>
            </ul>
          </section>
        </div>
        <div v-else class="flex-1" />

        <div v-if="latest && latest.state !== 'demonstrated' && questionsFor(sub!).length" class="border-border border-t p-6">
          <UiButton size="lg" class="w-full" @click="practise">Practise this concept</UiButton>
        </div>
      </template>
    </UiSheetContent>
  </UiSheet>
</template>
