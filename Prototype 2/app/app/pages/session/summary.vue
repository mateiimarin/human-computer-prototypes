<script setup lang="ts">
import { ArrowRight, Bookmark, Check, X, Minus, RotateCcw, ChevronRight, House } from '@lucide/vue'
import { packOf, comparison, isAnswered } from '~/lib/session'
import type { EvidenceState, Question } from '~/data/types'
import type { AnswerState } from '~/data/session'

definePageMeta({ layout: 'session', middleware: 'session' })
useStep('summary')
const { ws, saveQuestions } = useWorkspace()
const { go, finish } = useSession()
const { drill } = useReviewRun()
const evidence = useEvidenceSheet()
const s = computed(() => ws.value.active!)
const pack = computed(() => packOf(s.value))

/** One result per concept this exercise checks: the latest of the session's attempts, or the similar problem if that came later. */
const rows = computed(() => pack.value.subs.map((sub) => {
  const mine = ws.value.entries.filter(e => e.sessionId === s.value.id && e.sub === sub.id).sort((a, b) => +new Date(b.at) - +new Date(a.at))
  return { sub, state: (mine[0]?.state ?? 'unverified') as EvidenceState }
}))
const demonstrated = computed(() => rows.value.filter(r => r.state === 'demonstrated').length)
const gap = computed(() => rows.value.find(r => r.state === 'gap'))
const weak = computed(() => rows.value.find(r => r.state === 'partial'))
// The baseline cannot be redone, so only the explanation and the final quiz can be picked up again.
const returnTo = computed<'explain' | 'post' | null>(() => (['explain', 'post'] as const).find(c => s.value.skipped.includes(c)) ?? null)
const postponed = computed(() => !!returnTo.value && s.value.deferred.includes(returnTo.value))

const headline = computed(() => (rows.value.every(r => r.state === 'unverified') ? 'No concept shown without help' : `${demonstrated.value} of ${rows.value.length} concepts shown without help`))

const cmp = computed(() => comparison(pack.value, s.value))
const caption = computed(() => (s.value.pre.skipped ? 'You skipped the baseline.' : s.value.post.skipped ? 'You skipped the final quiz.' : s.value.route === 'bypass' ? 'You finished the exercise before the baseline.' : ''))

const word = { low: 'Low', medium: 'Medium', high: 'High' } as const
/** Confidence before and after, e.g. “Low → High”. */
const trend = (before?: AnswerState | null, after?: AnswerState | null) => `${before?.confidence ? word[before.confidence] : '—'} → ${after?.confidence ? word[after.confidence] : '—'}`
/** One table cell: what happened to this question in this round. */
function cell(a: AnswerState | null, ok: boolean | null, skippedWord: string) {
  if (!a || !isAnswered(a)) return { icon: Minus, text: skippedWord, tone: 'text-muted-foreground', sub: '' }
  if (a.idk) return { icon: X, text: 'Not answered', tone: 'text-gap-foreground', sub: '' }
  return ok ? { icon: Check, text: 'Correct', tone: 'text-demonstrated-foreground', sub: '' } : { icon: X, text: 'Wrong', tone: 'text-gap-foreground', sub: '' }
}
const baselineWord = computed(() => (s.value.pre.skipped ? 'Skipped' : '—'))
const finalWord = computed(() => (s.value.deferred.includes('post') ? 'Postponed' : 'Skipped'))

const claimRows = computed(() => pack.value.claims.map((q) => {
  const a = s.value.post.claims[q.id] ?? null
  const answered = !!a && isAnswered(a) && s.value.post.submitted
  return { q, a, cell: cell(answered ? a : null, answered ? !a!.idk && a!.choice === q.correct : null, finalWord.value) }
}))

// Missed questions are added to Concepts, so there is always a way back to them.
const autoSaved = ref(0)
onMounted(() => {
  const missed = (q: Question, a?: AnswerState) => !!a && isAnswered(a) && (a.idk || a.choice !== q.correct)
  const need = [
    ...pack.value.quiz.filter(q => missed(q, s.value.post.answers[q.id])),
    ...pack.value.claims.filter(q => missed(q, s.value.post.claims[q.id])),
    ...[...pack.value.quiz, ...pack.value.claims].filter(q => rows.value.find(r => r.sub.id === q.sub)?.state === 'gap'),
  ].filter((q, i, all) => all.findIndex(x => x.id === q.id) === i && !ws.value.saved.some(x => x.qid === q.id))
  if (need.length) { saveQuestions(s.value.id, pack.value.title, need.map(q => ({ qid: q.id, packId: pack.value.id }))); autoSaved.value = need.length }
})

function again(check: 'explain' | 'post') {
  s.value.deferred = s.value.deferred.filter(c => c !== check)
  if (check === 'post') {
    s.value.skipped = s.value.skipped.filter(c => c !== 'post')
    s.value.post.skipped = false; s.value.post.submitted = false
    go('post-quiz')
  } else {
    s.value.skipped = s.value.skipped.filter(c => c !== 'explain')
    s.value.explain.submitted = false
    go('explain')
  }
}
async function done() { await navigateTo('/'); finish() }
const twinAttempts = computed(() => s.value.twin.attempts)
</script>

<template>
  <div class="space-y-12">
    <Reveal as="header" class="flex flex-wrap items-center justify-between gap-6">
      <div class="min-w-0 flex-1 basis-72 space-y-1">
        <p class="text-muted-foreground text-sm"><RichText :text="pack.title" /></p>
        <h1 id="screen-title" tabindex="-1" class="text-[28px] leading-[1.2] font-semibold outline-none sm:text-[34px]">{{ headline }}</h1>
      </div>
      <EvidenceRing :states="rows.map(r => r.state)" :size="96" :stroke="10" label="Concepts shown without help" />
    </Reveal>

    <section aria-labelledby="ev-title">
      <Reveal :index="1" class="mb-1"><h2 id="ev-title" class="text-xl font-semibold">Concepts</h2></Reveal>
      <ul class="divide-border divide-y">
        <Reveal v-for="(r, i) in rows" :key="r.sub.id" as="li" :index="i + 2">
          <button class="hover:bg-accent/40 group -mx-3 flex w-[calc(100%+1.5rem)] items-center gap-4 rounded-lg px-3 py-4 text-left transition-colors" @click="evidence.open(r.sub.id)">
            <span class="flex-1 text-[17px] leading-6 font-medium">{{ r.sub.name }}</span>
            <EvidenceBadge :state="r.state" short />
            <ChevronRight class="text-muted-foreground size-5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </Reveal>
      </ul>
    </section>

    <section aria-labelledby="cmp-title" class="space-y-3">
      <Reveal><h2 id="cmp-title" class="text-xl font-semibold">Baseline and final quiz</h2></Reveal>
      <p v-if="caption" class="text-muted-foreground text-sm">{{ caption }}</p>
      <div class="overflow-x-auto">
      <UiTable>
        <UiTableHeader><UiTableRow class="hover:bg-transparent"><UiTableHead class="min-w-48">Question</UiTableHead><UiTableHead>Baseline</UiTableHead><UiTableHead>Final quiz</UiTableHead><UiTableHead>Confidence</UiTableHead></UiTableRow></UiTableHeader>
        <UiTableBody>
          <UiTableRow v-for="r in cmp" :key="r.q.id" class="hover:bg-accent/30">
            <UiTableCell class="py-4 whitespace-normal"><span class="block text-[15px] leading-6"><RichText :text="r.q.prompt" /></span><span class="text-muted-foreground text-xs">{{ pack.subs.find(x => x.id === r.q.sub)?.name }}</span></UiTableCell>
            <UiTableCell v-for="(col, ci) in [cell(r.before, r.beforeOk, baselineWord), cell(r.after, r.afterOk, finalWord)]" :key="ci" class="py-4 align-top">
              <span class="flex items-center gap-1.5 text-sm whitespace-nowrap" :class="col.tone"><component :is="col.icon" class="size-4" /> {{ col.text }}</span>
            </UiTableCell>
            <UiTableCell class="text-muted-foreground py-4 align-top text-sm whitespace-nowrap">{{ trend(r.before, r.after) }}</UiTableCell>
          </UiTableRow>
        </UiTableBody>
      </UiTable>
      </div>
    </section>

    <section aria-labelledby="tf-title" class="space-y-3">
      <Reveal><h2 id="tf-title" class="text-xl font-semibold">True or false</h2></Reveal>
      <ul class="divide-border divide-y">
        <li v-for="c in claimRows" :key="c.q.id" class="flex flex-wrap items-start justify-between gap-x-6 gap-y-1 py-4">
          <p class="min-w-0 flex-1 basis-64 text-[15px] leading-6"><RichText :text="c.q.prompt" /></p>
          <div class="flex shrink-0 items-center gap-4 text-sm">
            <span class="flex items-center gap-1.5" :class="c.cell.tone"><component :is="c.cell.icon" class="size-4" /> {{ c.cell.text }}</span>
            <span class="text-muted-foreground">{{ c.a?.confidence ? word[c.a.confidence] : '—' }}</span>
          </div>
        </li>
      </ul>
    </section>

    <section v-if="twinAttempts.length" aria-labelledby="att-title" class="space-y-3">
      <h2 id="att-title" class="text-xl font-semibold">Attempts</h2>
      <ul class="divide-border divide-y">
        <li class="flex flex-wrap items-center gap-3 py-3.5 text-[15px]"><span class="font-medium">First attempt</span></li>
        <li v-for="t in twinAttempts" :key="t.at" class="flex flex-wrap items-center gap-3 py-3.5 text-[15px]"><span class="font-medium">{{ t.label }}</span><EvidenceBadge v-for="(st, k) in t.states" :key="k" :state="st" short /></li>
      </ul>
    </section>

    <section aria-labelledby="next-title" class="space-y-4">
      <h2 id="next-title" class="text-xl font-semibold">What to do next</h2>
      <p v-if="autoSaved" class="text-muted-foreground flex items-center gap-2 text-sm"><Bookmark class="size-4 shrink-0" /> <span>Missed questions were added to <NuxtLink to="/concepts" class="text-foreground underline underline-offset-4">Concepts</NuxtLink>.</span></p>
      <template v-if="gap">
        <p class="max-w-xl text-base leading-7">Try a similar problem for “{{ gap.sub.name }}”.</p>
        <div class="flex flex-wrap items-center gap-3"><UiButton size="lg" @click="go('twin')">Start the similar problem <ArrowRight /></UiButton><UiButton variant="ghost" size="lg" @click="done">Back to exercises</UiButton></div>
      </template>
      <template v-else-if="weak">
        <p class="max-w-xl text-base leading-7">Practise “{{ weak.sub.name }}”.</p>
        <div class="flex flex-wrap items-center gap-3"><UiButton size="lg" @click="drill(weak.sub.id)">Practise this concept <ArrowRight /></UiButton><UiButton variant="ghost" size="lg" @click="done">Back to exercises</UiButton></div>
      </template>
      <template v-else-if="returnTo">
        <p class="max-w-xl text-base leading-7">{{ postponed ? 'You postponed' : 'You skipped' }} {{ returnTo === 'post' ? 'the final quiz' : 'explain it back' }}.</p>
        <div class="flex flex-wrap items-center gap-3"><UiButton size="lg" @click="again(returnTo)"><RotateCcw /> Do it now</UiButton><UiButton variant="ghost" size="lg" @click="done">Back to exercises</UiButton></div>
      </template>
      <UiButton v-else size="lg" @click="done"><House /> Back to exercises</UiButton>
    </section>
  </div>
</template>
