<script setup lang="ts">
import { ArrowRight, Check, X } from '@lucide/vue'
import { toast } from 'vue-sonner'
import type { Confidence } from '~/data/types'
import { aggregate, currentEvidence, type EvidenceEntry, type Signal } from '~/lib/evidence'
import { daysFrom, uid, relative } from '~/lib/format'
import { isAnswered, answerText } from '~/lib/session'
import { packs } from '~/data/packs'
import type { EvidenceState } from '~/data/types'

definePageMeta({ layout: 'focus' })
const { ws, findQuestion } = useWorkspace()
const { start } = useSession()
const { run } = useReviewRun()
const title = useState('focus-title')
const exit = useState('focus-exit')
const drillPack = computed(() => (run.value?.sub ? Object.values(packs).find(p => p.subs.some(s => s.id === run.value!.sub)) : undefined))
const back = computed(() => (drillPack.value ? { to: `/concepts/${drillPack.value.conceptId}`, label: 'Back to the concept' } : { to: '/review', label: 'Back to the library' }))
title.value = run.value?.kind === 'drill' ? 'Practice' : 'Review'; exit.value = run.value?.kind === 'drill' ? `/concepts/${Object.values(packs).find(p => p.subs.some(s => s.id === run.value!.sub))?.conceptId}` : '/review'
if (!run.value) navigateTo('/review')

const kindLabel = { due: 'Due questions', weekly: 'Weekly review', selected: 'Your selection', plan: 'Exam plan', drill: 'Practice' } as const
const items = computed(() => (run.value?.qids ?? []).map(id => findQuestion(id)!).filter(Boolean))
const qs = computed(() => items.value.map(i => i.q))
const skipOpen = ref(false)
const idx = ref(0)

function submit() {
  const r = run.value!
  const signals: Record<string, Signal[]> = {}
  const rows: { qid: string; ok: boolean }[] = []
  const priorBySub: Record<string, EvidenceState> = {}
  for (const { q, pack } of items.value) {
    const a = r.answers[q.id]!
    const ok = !a.idk && a.choice === q.correct
    rows.push({ qid: q.id, ok })
    ;(signals[q.sub] ??= []).push({ sub: q.sub, result: ok ? 'correct' : 'incorrect', condition: 'independent' })
    priorBySub[q.sub] ??= currentEvidence(ws.value.entries, q.sub).state
    const s = ws.value.saved.find(x => x.qid === q.id && x.courseId === ws.value.courseId)
    if (s) { s.last = ok ? 'correct' : 'incorrect'; s.times++; s.dueAt = daysFrom(ok ? (s.times > 1 ? 14 : 7) : 1) }
  }
  const at = new Date().toISOString()
  const sessionId = uid('r')
  const entries: EvidenceEntry[] = Object.entries(signals).map(([sub, sg]) => {
    const { state, condition } = aggregate(sg)
    const its = items.value.filter(i => i.q.sub === sub).map(({ q }) => {
      const a = r.answers[q.id]!
      return { label: q.prompt, answer: answerText(q, a), verdict: (!a.idk && a.choice === q.correct ? 'correct' : a.idk ? 'idk' : 'incorrect') as any, confidence: a.confidence, note: q.why }
    })
    return { id: uid('e'), sub, at, state, condition, source: 'review' as const, sessionId, title: `Review · ${kindLabel[r.kind]}`, attempt: 1, items: its }
  })
  ws.value.entries.push(...entries)
  r.result = rows.map(x => ({ qid: x.qid, ok: x.ok }))
  r.evidence = entries.map(e => ({ sub: e.sub, before: priorBySub[e.sub]!, after: e.state }))
  if (r.kind === 'weekly') ws.value.weeklyDoneAt = at
  r.phase = 'feedback'
  window.scrollTo({ top: 0 })
}
function toSummary() { run.value!.phase = 'summary'; window.scrollTo({ top: 0 }) }
function skip(_: Confidence | null, _later?: boolean) { skipOpen.value = false; toast('Skipped', { description: 'The questions stay where they were.' }); navigateTo(back.value.to) }
const subName = (id: string) => Object.values(packs).flatMap(p => p.subs).find(s => s.id === id)?.name ?? id
const stillOpen = computed(() => run.value?.kind === 'drill' && run.value.evidence.some(e => e.after === 'gap' || e.after === 'partial'))
function twin() { if (drillPack.value) start(drillPack.value.id, 'twin') }
const correct = computed(() => run.value?.result.filter(r => r.ok).length ?? 0)
const nextDue = computed(() => ws.value.saved.filter(s => run.value?.qids.includes(s.qid) && s.dueAt).sort((a, b) => +new Date(a.dueAt!) - +new Date(b.dueAt!)))
</script>

<template>
  <div v-if="run">
    <template v-if="run.phase === 'answer'">
      <StageHeader :title="run.kind === 'drill' ? subName(run.sub!) : kindLabel[run.kind]" :description="run.kind === 'drill' ? 'A few questions on this one point. Answer from memory.' : 'Answer from memory. There are no hints and no solutions this time.'" next="Feedback on each question, then what changed in your evidence." />
      <QuestionRunner :questions="qs" :answers="run.answers" submit-label="Submit review" skip-label="Skip this review" recap-title="Ready to submit?" :confidence="ws.settings.askConfidence" @submit="submit" @skip="skipOpen = true" @exit="navigateTo('/review')" />
    </template>

    <template v-else-if="run.phase === 'feedback'">
      <StageHeader :title="`${correct} of ${run.result.length} correct`" description="Each question, with the right answer and the reasoning." next="What changed in your evidence." />
      <ol class="space-y-12">
        <Reveal v-for="(it, i) in items" :key="it.q.id" as="li" :index="i" class="space-y-4">
          <p class="flex items-start gap-3 text-lg leading-8 font-medium"><component :is="run.result[i]?.ok ? Check : X" class="mt-2 size-5 shrink-0" :class="run.result[i]?.ok ? 'text-demonstrated-foreground' : 'text-gap-foreground'" :stroke-width="2.6" /><RichText :text="it.q.prompt" /></p>
          <ChoiceList :q="it.q" :a="run.answers[it.q.id]!" reveal locked />
          <p class="border-border rounded-xl border p-4 text-[15px] leading-7"><RichText :text="it.q.why" /></p>
        </Reveal>
      </ol>
      <div class="pt-10"><UiButton size="xl" @click="toSummary()">See what changed <ArrowRight /></UiButton></div>
    </template>

    <template v-else>
      <StageHeader :title="`${correct} of ${run.result.length} answered correctly`" description="Your evidence and next review dates are updated." />
      <section class="space-y-3">
        <h2 class="text-xl font-semibold">Evidence updated</h2>
        <ul class="divide-border divide-y">
          <Reveal v-for="(e, i) in run.evidence" :key="e.sub" as="li" :index="i" class="flex flex-wrap items-center gap-x-4 gap-y-2 py-4">
            <p class="min-w-0 flex-1 basis-48 text-[15px] font-medium">{{ subName(e.sub) }}</p>
            <EvidenceBadge :state="e.before as any" short /><ArrowRight class="text-muted-foreground size-4" /><EvidenceBadge :state="e.after as any" short />
          </Reveal>
        </ul>
        <p class="text-muted-foreground text-sm leading-6">One review adds evidence. It doesn’t prove lasting retention.</p>
      </section>
      <section class="mt-12 space-y-3">
        <h2 class="text-xl font-semibold">Next review</h2>
        <ul class="divide-border divide-y">
          <li v-for="s in nextDue" :key="s.qid" class="flex flex-wrap items-center gap-x-4 py-3.5"><p class="min-w-0 flex-1 basis-64 text-[15px] leading-6"><RichText :text="findQuestion(s.qid)!.q.prompt" /></p><UiBadge variant="neutral">{{ relative(s.dueAt!) }}</UiBadge></li>
        </ul>
      </section>
      <div class="flex flex-wrap items-center gap-3 pt-12"><UiButton v-if="stillOpen && drillPack" size="xl" @click="twin">Try a twin problem <ArrowRight /></UiButton><UiButton :size="stillOpen && drillPack ? 'lg' : 'xl'" :variant="stillOpen && drillPack ? 'ghost' : 'default'" @click="navigateTo(back.to)">{{ back.label }}</UiButton><UiButton variant="ghost" size="lg" @click="navigateTo('/')">Overview</UiButton></div>
    </template>

    <SkipDialog v-model:open="skipOpen" title="Skip this review?" consequence="The questions stay due, and nothing is recorded." confirm="Skip review" @confirm="skip" />
  </div>
</template>
