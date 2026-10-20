<script setup lang="ts">
import { ArrowRight, Bookmark, Download, Check, X, Minus, HelpCircle, Info, RotateCcw, ChevronRight, Target, Clock4 } from '@lucide/vue'
import { packOf, comparison, isAnswered, quizCount } from '~/lib/session'
import { fmtDate } from '~/lib/format'
import { repeatedMistake } from '~/lib/evidence'
import type { EvidenceState } from '~/data/types'

definePageMeta({ layout: 'session', middleware: 'session' })
useStep('summary')
const { ws, saveQuestions } = useWorkspace()
const { go, finish } = useSession()
const evidence = useEvidenceSheet()
const s = computed(() => ws.value.active!)
const pack = computed(() => packOf(s.value))
const saveOpen = ref(false)
const exportOpen = ref(false)

const latestEntries = computed(() => {
  const mine = ws.value.entries.filter(e => e.sessionId === s.value.id && e.source === 'session')
  const maxAttempt = Math.max(0, ...mine.map(e => e.attempt))
  return mine.filter(e => e.attempt === maxAttempt)
})
const rows = computed(() => pack.value.subs.map((sub) => {
  const twin = [...ws.value.entries].filter(e => e.sessionId === s.value.id && e.source === 'twin' && e.sub === sub.id).sort((a, b) => +new Date(b.at) - +new Date(a.at))[0]
  const base = latestEntries.value.find(e => e.sub === sub.id)
  const entry = twin && (!base || +new Date(twin.at) > +new Date(base.at)) ? twin : base
  return { sub, entry, state: (entry?.state ?? 'unverified') as EvidenceState, original: base }
}))
const states = computed(() => rows.value.map(r => r.state))
const demonstrated = computed(() => rows.value.filter(r => r.state === 'demonstrated'))
const gap = computed(() => rows.value.find(r => r.state === 'gap'))
const weak = computed(() => rows.value.find(r => r.state === 'partial'))
const { drill } = useReviewRun()
function practiseWeak() { if (weak.value && !drill(weak.value.sub.id)) go('twin') }
// A baseline can't be redone afterwards, so only the explanation and the post-quiz can be picked up again.
const returnTo = computed<'explain' | 'post' | null>(() => (['explain', 'post'] as const).find(c => s.value.skipped.includes(c)) ?? null)
const postponed = computed(() => !!returnTo.value && s.value.deferred.includes(returnTo.value))
const repeats = computed(() => Object.fromEntries(rows.value.filter(r => r.state === 'gap').map(r => [r.sub.id, repeatedMistake(ws.value.entries, r.sub.id, s.value.id, pack.value.echoes)])))

const headline = computed(() => {
  const n = demonstrated.value.length, t = rows.value.length
  if (rows.value.every(r => r.state === 'unverified')) return 'Nothing was verified independently this time.'
  return `You demonstrated ${n} of ${t} points independently.`
})
const subline = computed(() => {
  const parts: string[] = []
  if (gap.value) parts.push(`A gap showed up in “${gap.value.sub.name}”.`)
  const partial = rows.value.filter(r => r.state === 'partial').length
  if (partial) parts.push(`${partial} ${partial === 1 ? 'is' : 'are'} partial.`)
  const un = rows.value.filter(r => r.state === 'unverified').length
  if (un) parts.push(`${un} ${un === 1 ? 'remains' : 'remain'} unverified${s.value.assisted.length ? ', because you opened references' : s.value.skipped.length ? `, because a check was ${s.value.deferred.length ? 'postponed' : 'skipped'}` : ''}.`)
  return parts.join(' ') || 'No gaps observed on these checks. Come back to them in Review to keep it that way.'
})

const cmp = computed(() => comparison(pack.value, s.value))
const note = computed(() => {
  if (s.value.pre.skipped) return { icon: Info, text: 'No baseline: you skipped it, so a before and after comparison isn’t available.' }
  if (s.value.post.skipped) return { icon: Info, text: 'The post-quiz was skipped, so there is nothing to compare with your baseline yet.' }
  if (s.value.route !== 'work') return { icon: Info, text: 'This is a starting snapshot. You finished the exercise before the baseline, so the difference isn’t a learning gain from this session.' }
  return { icon: Info, text: 'This is the change on the same three questions, right after working. It shows this check, not lasting retention.' }
})
const overconfident = computed(() => cmp.value.filter(r => r.afterOk === false && r.after?.confidence === 'high').length
  + pack.value.claims.filter(q => { const a = s.value.post.claims[q.id]; return a && isAnswered(a) && (a.idk || a.choice !== q.correct) && a.confidence === 'high' }).length)

const cell = (a: any, ok: boolean | null, col: 'before' | 'after') => {
  if (!a) return { icon: Minus, text: col === 'before' && s.value.pre.skipped ? 'No baseline' : s.value.deferred.includes('post') ? 'Postponed' : 'Skipped', tone: 'text-muted-foreground' }
  if (a.idk) return { icon: HelpCircle, text: 'I don’t know', tone: 'text-gap-foreground' }
  if (!isAnswered(a)) return { icon: Minus, text: 'Skipped', tone: 'text-muted-foreground' }
  return ok ? { icon: Check, text: 'Correct', tone: 'text-demonstrated-foreground' } : { icon: X, text: 'Incorrect', tone: 'text-gap-foreground' }
}
const confWord = { low: 'Low', medium: 'Medium', high: 'High' } as const

const claimRows = computed(() => pack.value.claims.map((q) => {
  const a = s.value.post.claims[q.id]
  const answered = !!a && isAnswered(a) && s.value.post.submitted
  return { q, a, answered, ok: answered ? !a!.idk && a!.choice === q.correct : null }
}))

// Questions behind gaps always have a route back through Review.
const autoSaved = ref(0)
onMounted(() => {
  const need = [...pack.value.quiz, ...pack.value.claims].filter((q) => {
    const st = rows.value.find(r => r.sub.id === q.sub)?.state
    return st === 'gap'
  }).filter(q => !ws.value.saved.some(x => x.qid === q.id))
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
const canSave = computed(() => !!gap.value || !!weak.value || !!returnTo.value)
</script>

<template>
  <div class="space-y-14">
    <!-- 1 · what did I demonstrate -->
    <Reveal as="header" class="flex flex-wrap items-center justify-between gap-8">
      <div class="min-w-0 flex-1 basis-80 space-y-3">
        <h1 id="screen-title" tabindex="-1" class="text-[30px] leading-[1.15] font-semibold outline-none sm:text-[40px]">{{ headline }}</h1>
        <p class="text-muted-foreground max-w-xl text-lg leading-8">{{ subline }}</p>
        <p v-if="autoSaved" class="text-muted-foreground flex items-center gap-2 text-sm"><Bookmark class="size-4" /> {{ autoSaved }} {{ autoSaved === 1 ? 'question' : 'questions' }} from your gap {{ autoSaved === 1 ? 'was' : 'were' }} saved to Review.</p>
      </div>
      <EvidenceRing :states="states" :size="132" :stroke="13" label="Sub-concept evidence">
        <span class="text-3xl leading-none font-semibold tabular-nums">{{ demonstrated.length }}/{{ rows.length }}</span><span class="text-muted-foreground mt-1 text-xs">demonstrated</span>
      </EvidenceRing>
    </Reveal>

    <!-- 2 · where the gaps are -->
    <section aria-labelledby="ev-title">
      <Reveal :index="1" class="mb-1"><h2 id="ev-title" class="text-xl font-semibold">Evidence by sub-concept</h2></Reveal>
      <ul class="divide-border divide-y">
        <Reveal v-for="(r, i) in rows" :key="r.sub.id" as="li" :index="i + 2">
          <button class="hover:bg-accent/40 group -mx-3 flex w-[calc(100%+1.5rem)] flex-wrap items-center gap-x-4 gap-y-2 rounded-lg px-3 py-4 text-left transition-colors" @click="evidence.open(r.sub.id)">
            <span class="min-w-0 flex-1 basis-56 space-y-0.5">
              <span class="block text-[17px] leading-6 font-medium">{{ r.sub.name }}</span>
              <span class="text-muted-foreground block text-sm"><RichText :text="r.sub.blurb" /></span>
              <span v-if="repeats[r.sub.id]" class="text-muted-foreground block text-sm">Seen before, on {{ fmtDate(repeats[r.sub.id]!.entry.at) }}.</span>
            </span>
            <EvidenceBadge :state="r.state" />
            <ConditionTag v-if="r.state === 'unverified' && r.entry" :condition="r.entry.condition" />
            <ChevronRight class="text-muted-foreground size-5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </Reveal>
      </ul>
      <p class="text-muted-foreground pt-2 text-sm">Select a row to see the answers and feedback behind its status.</p>
    </section>

    <!-- 3 · what to do next -->
    <section aria-labelledby="next-title" class="space-y-5">
      <Reveal><h2 id="next-title" class="text-xl font-semibold">What to do next</h2></Reveal>
      <Reveal :index="1" class="border-border flex flex-col gap-5 rounded-2xl border p-6 sm:flex-row sm:gap-6">
        <span class="grid size-12 shrink-0 place-items-center rounded-xl" :class="gap ? 'bg-gap text-gap-foreground' : weak ? 'bg-partial text-partial-foreground' : returnTo ? 'bg-muted' : 'bg-check text-check-foreground'"><Target v-if="gap || weak" class="size-6" /><Clock4 v-else-if="returnTo" class="size-6" /><Bookmark v-else class="size-6" /></span>
        <div class="min-w-0 flex-1 space-y-5">
        <template v-if="gap">
          <div class="space-y-2"><p class="max-w-lg text-xl leading-8 font-medium">Try a twin problem for “{{ gap.sub.name }}”.</p><p class="text-muted-foreground max-w-lg text-base leading-7">A similar problem, <RichText :text="pack.twin.title" />. Solve it on your own, explain it, and see if the gap closes. Your first attempt stays as recorded.</p></div>
          <div class="flex flex-wrap items-center gap-3"><UiButton size="xl" @click="go('twin')">Start the twin problem <ArrowRight /></UiButton><UiButton variant="ghost" size="lg" @click="done">Practise later</UiButton></div>
        </template>
        <template v-else-if="weak">
          <div class="space-y-2"><p class="max-w-lg text-xl leading-8 font-medium">Practise “{{ weak.sub.name }}”.</p><p class="text-muted-foreground max-w-lg text-base leading-7">This point was only partly there. A few short questions on just this point, with solutions hidden, will show whether it firms up.</p></div>
          <div class="flex flex-wrap items-center gap-3"><UiButton size="xl" @click="practiseWeak">Practise this point <ArrowRight /></UiButton><UiButton variant="ghost" size="lg" @click="done">Practise later</UiButton></div>
        </template>
        <template v-else-if="returnTo">
          <div class="space-y-2"><p class="max-w-lg text-xl leading-8 font-medium">{{ postponed ? 'Pick up the check you postponed.' : 'Return to the check you skipped.' }}</p><p class="text-muted-foreground max-w-lg text-base leading-7">{{ returnTo === 'post' ? 'The post-quiz' : 'Explain it back' }} is still unverified. It takes a few minutes and creates a new attempt.</p></div>
          <div class="flex flex-wrap items-center gap-3"><UiButton size="xl" @click="again(returnTo)"><RotateCcw /> Do it now</UiButton><UiButton variant="ghost" size="lg" @click="done">Do it later</UiButton></div>
        </template>
        <template v-else>
          <div class="space-y-2"><p class="max-w-lg text-xl leading-8 font-medium">Keep it fresh with a short review later.</p><p class="text-muted-foreground max-w-lg text-base leading-7">Save the questions you want to see again. They come back when they’re due, with solutions hidden.</p></div>
          <div class="flex flex-wrap items-center gap-3"><UiButton size="xl" @click="saveOpen = true"><Bookmark /> Save questions</UiButton><UiButton variant="ghost" size="lg" @click="done">Back to overview</UiButton></div>
        </template>
        </div>
      </Reveal>
      <div class="flex flex-wrap gap-2">
        <UiButton v-if="canSave" variant="outline" @click="saveOpen = true"><Bookmark /> Save questions to Review</UiButton>
        <UiButton variant="outline" @click="exportOpen = true"><Download /> Export questions</UiButton>
        <UiButton v-if="canSave" variant="ghost" @click="done">Back to overview</UiButton>
      </div>
    </section>

    <!-- 4 · before and after -->
    <section aria-labelledby="cmp-title" class="space-y-5">
      <Reveal><h2 id="cmp-title" class="text-xl font-semibold">Before and after</h2></Reveal>
      <Reveal class="text-muted-foreground flex items-start gap-3 text-[15px] leading-6"><component :is="note.icon" class="mt-1 size-4 shrink-0" /><p>{{ note.text }}</p></Reveal>
      <div class="overflow-x-auto">
        <UiTable>
          <UiTableHeader><UiTableRow class="hover:bg-transparent"><UiTableHead class="min-w-56">Question</UiTableHead><UiTableHead>Before</UiTableHead><UiTableHead>After</UiTableHead><UiTableHead>Confidence</UiTableHead></UiTableRow></UiTableHeader>
          <UiTableBody>
            <UiTableRow v-for="r in cmp" :key="r.q.id" class="hover:bg-accent/30">
              <UiTableCell class="py-4 whitespace-normal"><span class="block text-[15px] leading-6"><RichText :text="r.q.prompt" /></span><span class="text-muted-foreground text-xs">{{ pack.subs.find(x => x.id === r.q.sub)?.name }}</span></UiTableCell>
              <UiTableCell class="py-4"><span class="flex items-center gap-1.5 text-sm" :class="cell(r.before, r.beforeOk, 'before').tone"><component :is="cell(r.before, r.beforeOk, 'before').icon" class="size-4" /> {{ cell(r.before, r.beforeOk, 'before').text }}</span></UiTableCell>
              <UiTableCell class="py-4"><span class="flex items-center gap-1.5 text-sm" :class="cell(r.after, r.afterOk, 'after').tone"><component :is="cell(r.after, r.afterOk, 'after').icon" class="size-4" /> {{ cell(r.after, r.afterOk, 'after').text }}</span></UiTableCell>
              <UiTableCell class="text-muted-foreground py-4 text-sm tabular-nums">{{ r.before?.confidence ? confWord[r.before.confidence] : '—' }} → {{ r.after?.confidence ? confWord[r.after.confidence] : '—' }}</UiTableCell>
            </UiTableRow>
          </UiTableBody>
        </UiTable>
      </div>
      <p v-if="s.post.submitted && !s.pre.skipped" class="text-[15px] tabular-nums">Baseline <strong class="font-semibold">{{ quizCount(s, pack, 'pre') }} of {{ pack.quiz.length }}</strong> · After <strong class="font-semibold">{{ quizCount(s, pack, 'post') }} of {{ pack.quiz.length }}</strong></p>
      <p v-if="overconfident" class="border-gap-dot border-l-2 pl-4 text-[15px] leading-6">You said “High” on {{ overconfident }} {{ overconfident === 1 ? 'answer' : 'answers' }} that turned out wrong. Confidence isn’t evidence, so those are the best ones to revisit.</p>

      <div class="space-y-3 pt-4">
        <h3 class="text-base font-medium">Claims <span class="text-muted-foreground font-normal">· reported separately, not part of the comparison</span></h3>
        <ul class="divide-border divide-y">
          <li v-for="c in claimRows" :key="c.q.id" class="flex flex-wrap items-center gap-x-4 gap-y-1 py-3.5">
            <p class="min-w-0 flex-1 basis-64 text-[15px] leading-6"><RichText :text="c.q.prompt" /></p>
            <span v-if="c.answered" class="flex items-center gap-1.5 text-sm font-medium" :class="c.ok ? 'text-demonstrated-foreground' : 'text-gap-foreground'"><component :is="c.ok ? Check : X" class="size-4" /> {{ c.ok ? 'Correct' : 'Incorrect' }}</span>
            <span v-else class="text-muted-foreground flex items-center gap-1.5 text-sm"><Minus class="size-4" /> {{ s.deferred.includes('post') ? 'Postponed' : 'Skipped' }}</span>
            <ConfidenceTag :confidence="c.a?.confidence ?? null" />
          </li>
        </ul>
      </div>
    </section>

    <!-- attempts -->
    <section v-if="twinAttempts.length" aria-labelledby="att-title" class="space-y-3">
      <h2 id="att-title" class="text-xl font-semibold">Attempts</h2>
      <ul class="divide-border divide-y">
        <li class="flex flex-wrap items-center gap-3 py-3.5 text-[15px]"><span class="font-medium">First attempt</span><span class="text-muted-foreground">Kept as recorded</span></li>
        <li v-for="t in twinAttempts" :key="t.at" class="flex flex-wrap items-center gap-3 py-3.5 text-[15px]"><span class="font-medium">{{ t.label }}</span><EvidenceBadge v-for="(st, k) in t.states" :key="k" :state="st" short /></li>
      </ul>
    </section>

    <SaveQuestionsSheet v-model:open="saveOpen" :session="s" :pack="pack" />
    <ExportDialog v-model:open="exportOpen" :items="[...pack.quiz, ...pack.claims].map(q => ({ q, title: pack.title }))" />
  </div>
</template>
