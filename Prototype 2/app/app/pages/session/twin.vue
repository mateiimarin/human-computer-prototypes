<script setup lang="ts">
import { ArrowRight, Loader2, ArrowLeft } from '@lucide/vue'
import { packOf } from '~/lib/session'
import type { SampleKey } from '~/data/types'

definePageMeta({ layout: 'session', middleware: 'session' })
useStep('twin')
const { ws } = useWorkspace()
const { commitTwin } = useSession()
const { pick } = useSampleOutcome()
const evidence = useEvidenceSheet()
const s = computed(() => ws.value.active!)
const pack = computed(() => packOf(s.value))
const t = computed(() => s.value.twin)
const tw = computed(() => pack.value.twin)
const loading = ref(false)
const error = ref('')
const phases = ['intro', 'explain', 'check', 'result'] as const
const labels = ['Read the example', 'Solve it and explain it', 'Check']
const idx = computed(() => phases.indexOf(t.value.phase))

const samples = computed(() => pack.value.sampleAnswers.similar)
const sampleOf = (text: string): SampleKey => (Object.entries(samples.value).find(([, v]) => v.trim() === text.trim())?.[0] as SampleKey) ?? 'partial'
function fill() { t.value.text = samples.value[pick(t.value.attempts.length)]; error.value = '' }
function set(p: typeof phases[number]) { t.value.phase = p; window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }) }
async function toCheck() {
  if (t.value.text.trim().length < 24) { error.value = 'Write at least a sentence, in your own words.'; return }
  error.value = ''; loading.value = true
  await new Promise(r => setTimeout(r, 700))
  t.value.sample = sampleOf(t.value.text)
  loading.value = false
  set('check')
}
function submitCheck() {
  t.value.submitted = true
  commitTwin()
  set('result')
}

const resultRows = computed(() => tw.value.target.map((sub) => {
  const all = ws.value.entries.filter(e => e.sub === sub).sort((a, b) => +new Date(a.at) - +new Date(b.at))
  const twinEntry = [...all].reverse().find(e => e.sessionId === s.value.id && e.source === 'twin')
  const before = [...all].reverse().find(e => !(e.sessionId === s.value.id && e.source === 'twin') && e.state !== 'unverified') ?? all.filter(e => !(e.sessionId === s.value.id && e.source === 'twin')).pop()
  return { sub: pack.value.subs.find(x => x.id === sub)!, before, after: twinEntry }
}))
const last = computed(() => t.value.attempts[t.value.attempts.length - 1])

async function back() { s.value.step = 'summary'; await navigateTo('/session/summary') }
function again() { t.value.text = ''; t.value.submitted = false; t.value.sample = null; Object.values(t.value.answers).forEach((a) => { a.choice = null; a.idk = false; a.confidence = null }); set('explain') }
</script>

<template>
  <div>
    <StageHeader
      :title="t.phase === 'result' ? 'What the similar problem showed' : 'A similar problem'"
      :description="t.phase === 'result' ? undefined : 'The same idea in a new setting.'"
    />

    <div v-if="t.phase !== 'result'" class="mb-10 space-y-3">
      <p class="text-muted-foreground text-sm">Step {{ idx + 1 }} of 3 · {{ labels[idx] }}</p>
      <div class="flex gap-1.5" aria-hidden="true"><span v-for="i in 3" :key="i" class="h-1 flex-1 rounded-full transition-colors duration-300" :class="i - 1 === idx ? 'bg-foreground' : i - 1 < idx ? 'bg-foreground/40' : 'bg-border'" /></div>
    </div>

    <Transition name="q-fwd" mode="out-in">
      <!-- 1 · example -->
      <div v-if="t.phase === 'intro'" key="intro" class="space-y-8">
        <div class="space-y-3"><h2 class="text-2xl font-semibold"><RichText :text="tw.title" /></h2><p class="text-lg leading-8"><RichText :text="tw.statement" /></p></div>
        <div class="space-y-4"><h3 class="text-sm font-medium">The idea, worked through</h3><div class="bg-assist/50 rounded-xl p-5 text-base leading-7"><RichText :text="tw.worked" block /></div><CodeSnippet :code="tw.code" title="similar.py" /></div>
        <UiButton size="xl" @click="set('explain')">I have got it, let me try <ArrowRight /></UiButton>
      </div>

      <!-- 2 · solve and explain -->
      <div v-else-if="t.phase === 'explain'" key="explain" class="space-y-6">
        <div class="border-border rounded-xl border p-5"><p class="text-lg leading-8"><RichText :text="tw.statement" /></p></div>
        <p class="text-lg leading-8">Solve it on your own, then explain how your solution works and why it is correct.</p>
        <SampleInput label="Your explanation" @fill="fill">
          <UiTextarea v-model="t.text" rows="7" class="min-h-44 rounded-xl p-5 text-lg leading-8" aria-label="Your explanation" placeholder="Start with the main idea…" :aria-invalid="!!error" />
        </SampleInput>
        <ConfidencePicker v-model="t.confidence" />
        <p v-if="error" class="text-gap-foreground text-sm" role="alert">{{ error }}</p>
        <div class="flex flex-wrap items-center justify-between gap-3"><UiButton variant="ghost" size="lg" @click="set('intro')"><ArrowLeft /> Back</UiButton><UiButton size="lg" :disabled="loading" @click="toCheck"><Loader2 v-if="loading" class="animate-spin" /> {{ loading ? 'Reading your explanation…' : 'Continue to the check' }}</UiButton></div>
      </div>

      <!-- 3 · targeted check -->
      <div v-else-if="t.phase === 'check'" key="check" class="space-y-6">
        <QuestionRunner :questions="tw.task" :answers="t.answers" submit-label="Submit the check" :can-skip="false" recap-title="Submit your answers?" @submit="submitCheck" @exit="set('explain')" />
      </div>

      <!-- result -->
      <div v-else key="result" class="space-y-10">
        <ul class="divide-border divide-y">
          <Reveal v-for="(r, i) in resultRows" :key="r.sub.id" as="li" :index="i" class="space-y-3 py-6">
            <div class="flex flex-wrap items-baseline justify-between gap-2"><h3 class="text-lg font-medium">{{ r.sub.name }}</h3><span class="text-muted-foreground text-sm">{{ last?.label }}</span></div>
            <div class="flex flex-wrap items-center gap-3">
              <div class="space-y-1"><p class="text-muted-foreground text-sm">First attempt</p><EvidenceBadge :state="r.before?.state ?? 'unverified'" /></div>
              <ArrowRight class="text-muted-foreground mt-5 size-4" />
              <div class="space-y-1"><p class="text-muted-foreground text-sm">Retry</p><EvidenceBadge :state="r.after?.state ?? 'unverified'" /></div>
              <UiButton v-if="r.after" variant="ghost" size="sm" class="mt-5 ml-auto" @click="evidence.open(r.sub.id)">See answers</UiButton>
            </div>
            <p class="text-muted-foreground max-w-xl text-[15px] leading-6">
              <template v-if="r.after?.state === 'demonstrated'">Shown without help.</template>
              <template v-else-if="r.after?.state === 'partial'">Partly there.</template>
              <template v-else>Still a gap.</template>
            </p>
          </Reveal>
        </ul>
        <div class="flex flex-wrap items-center gap-3">
          <UiButton size="xl" @click="back">Back to summary <ArrowRight /></UiButton>
          <UiButton variant="outline" size="lg" @click="again">Try again</UiButton>
        </div>
      </div>
    </Transition>
  </div>
</template>
