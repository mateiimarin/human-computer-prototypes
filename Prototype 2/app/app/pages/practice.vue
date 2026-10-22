<script setup lang="ts">
import { ArrowRight, Check, X } from '@lucide/vue'
import { aggregate, currentEvidence, type EvidenceEntry, type Signal } from '~/lib/evidence'
import { daysFrom, uid } from '~/lib/format'
import { answerText } from '~/lib/session'
import { allConcepts } from '~/data/catalog'
import type { EvidenceState } from '~/data/types'

definePageMeta({ layout: 'focus' })
const { ws, findQuestion } = useWorkspace()
const { run } = useReviewRun()
const title = useState('focus-title')
const exit = useState('focus-exit')

title.value = 'Practice'
exit.value = '/concepts'
if (!run.value) navigateTo('/concepts')

const items = computed(() => (run.value?.qids ?? []).map(id => findQuestion(id)!).filter(Boolean))
const qs = computed(() => items.value.map(i => i.q))

function submit() {
  const r = run.value!
  const signals: Record<string, Signal[]> = {}
  const rows: { qid: string; ok: boolean }[] = []
  const priorBySub: Record<string, EvidenceState> = {}
  for (const { q } of items.value) {
    const a = r.answers[q.id]!
    const ok = !a.idk && a.choice === q.correct
    rows.push({ qid: q.id, ok })
    ;(signals[q.sub] ??= []).push({ sub: q.sub, result: ok ? 'correct' : 'incorrect', condition: 'independent' })
    priorBySub[q.sub] ??= currentEvidence(ws.value.entries, q.sub).state
    const s = ws.value.saved.find(x => x.qid === q.id)
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
    return { id: uid('e'), sub, at, state, condition, source: 'review' as const, sessionId, title: 'Practice', attempt: 1, items: its }
  })
  ws.value.entries.push(...entries)
  r.result = rows
  r.evidence = entries.map(e => ({ sub: e.sub, before: priorBySub[e.sub]!, after: e.state }))
  r.phase = 'results'
  window.scrollTo({ top: 0 })
}
const subName = (id: string) => allConcepts.find(s => s.id === id)?.name ?? id
const correct = computed(() => run.value?.result.filter(r => r.ok).length ?? 0)
</script>

<template>
  <div v-if="run">
    <template v-if="run.phase === 'answer'">
      <StageHeader
        :title="run.kind === 'drill' ? subName(run.sub!) : run.kind === 'due' ? 'Due questions' : 'All questions'"
        description="Answer from memory, without hints."
      />
      <QuestionRunner :questions="qs" :answers="run.answers" submit-label="Submit answers" :can-skip="false" recap-title="Submit your answers?" @submit="submit" @exit="navigateTo('/concepts')" />
    </template>

    <template v-else>
      <StageHeader :title="`${correct} of ${run.result.length} correct`" />
      <ol class="space-y-12">
        <Reveal v-for="(it, i) in items" :key="it.q.id" as="li" :index="i" class="space-y-4">
          <p class="flex items-start gap-3 text-lg leading-8 font-medium"><component :is="run.result[i]?.ok ? Check : X" class="mt-2 size-5 shrink-0" :class="run.result[i]?.ok ? 'text-demonstrated-foreground' : 'text-gap-foreground'" :stroke-width="2.6" /><RichText :text="it.q.prompt" /></p>
          <ChoiceList :q="it.q" :a="run.answers[it.q.id]!" reveal locked />
          <p class="border-border rounded-xl border p-4 text-[15px] leading-7"><RichText :text="it.q.why" /></p>
        </Reveal>
      </ol>
      <section class="mt-14 space-y-3" aria-labelledby="changed-title">
        <h2 id="changed-title" class="text-xl font-semibold">What changed</h2>
        <ul class="divide-border divide-y">
          <Reveal v-for="(e, i) in run.evidence" :key="e.sub" as="li" :index="i" class="flex flex-wrap items-center gap-x-4 gap-y-2 py-4">
            <p class="min-w-0 flex-1 basis-48 text-[15px] font-medium">{{ subName(e.sub) }}</p>
            <EvidenceBadge :state="e.before as any" short /><ArrowRight class="text-muted-foreground size-4" /><EvidenceBadge :state="e.after as any" short />
          </Reveal>
        </ul>
              </section>
      <div class="pt-10"><UiButton size="xl" @click="navigateTo('/concepts')">Back to concepts</UiButton></div>
    </template>
  </div>
</template>
