<script setup lang="ts">
import { ArrowRight, ChevronDown, Loader2, ArrowLeft } from '@lucide/vue'
import { packOf } from '~/lib/session'
import type { SampleKey } from '~/data/types'

definePageMeta({ layout: 'session', middleware: 'session' })
useStep('twin')
const { ws, saveQuestions } = useWorkspace()
const { go, commitTwin, finish } = useSession()
const evidence = useEvidenceSheet()
const s = computed(() => ws.value.active!)
const pack = computed(() => packOf(s.value))
const t = computed(() => s.value.twin)
const tw = computed(() => pack.value.twin)
const attempt = ref('')
const loading = ref(false)
const error = ref('')
const phases = ['intro', 'task', 'explain', 'check', 'result'] as const
const labels = ['Study the example', 'Solve it', 'Explain it', 'Check', 'Result']
const idx = computed(() => phases.indexOf(t.value.phase))

const sampleOf = (text: string): SampleKey => (Object.entries(tw.value.sample).find(([, v]) => v.trim() === text.trim())?.[0] as SampleKey) ?? 'partial'
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

async function back() {
  const full = s.value.mode === 'full'
  if (full) { s.value.step = 'summary'; await navigateTo('/session/summary') }
  else { const c = pack.value.conceptId; await navigateTo(`/concepts/${c}`); finish() }
}
function again() { t.value.text = ''; t.value.submitted = false; t.value.sample = null; Object.values(t.value.answers).forEach((a) => { a.choice = null; a.idk = false; a.confidence = null }); set('task') }
</script>

<template>
  <div>
    <StageHeader
      :title="t.phase === 'result' ? 'What the twin showed' : 'A twin of this problem'"
      :description="t.phase === 'result' ? 'Your first attempt stays as recorded. This retry is added next to it.' : 'The same idea in a new setting, a good way to find out whether the gap closes.'"
      :next="t.phase === 'result' ? undefined : t.phase === 'intro' ? 'Solve it without the example.' : t.phase === 'task' ? 'Explain how it works.' : t.phase === 'explain' ? 'Two questions on the point you’re practising.' : 'Your result, next to your first attempt.'"
    />

    <div v-if="t.phase !== 'result'" class="mb-10 space-y-3">
      <p class="text-muted-foreground text-sm">Step {{ idx + 1 }} of 4 · {{ labels[idx] }}</p>
      <div class="flex gap-1.5" aria-hidden="true"><span v-for="i in 4" :key="i" class="h-1 flex-1 rounded-full transition-colors duration-300" :class="i - 1 === idx ? 'bg-foreground' : i - 1 < idx ? 'bg-foreground/40' : 'bg-border'" /></div>
    </div>

    <Transition name="q-fwd" mode="out-in">
      <!-- 1 · example -->
      <div v-if="t.phase === 'intro'" key="intro" class="space-y-8">
        <div class="space-y-3"><h2 class="text-2xl font-semibold"><RichText :text="tw.title" /></h2><p class="text-lg leading-8"><RichText :text="tw.statement" /></p></div>
        <div class="space-y-4"><h3 class="text-sm font-medium">The idea, worked through</h3><div class="bg-assist/50 rounded-xl p-5 text-base leading-7"><RichText :text="tw.worked" block /></div><CodeSnippet :code="tw.code" title="twin.py" /></div>
        <UiButton size="xl" @click="set('task')">I’ve got it, let me try <ArrowRight /></UiButton>
      </div>

      <!-- 2 · solve -->
      <div v-else-if="t.phase === 'task'" key="task" class="space-y-6">
        <div class="border-border space-y-2 rounded-xl border p-5"><p class="text-muted-foreground text-sm">The example is now hidden.</p><p class="text-lg leading-8"><RichText :text="tw.statement" /></p></div>
        <div class="space-y-2"><UiLabel for="twin-attempt">Sketch your solution <span class="text-muted-foreground font-normal">Optional, only for you</span></UiLabel><UiTextarea id="twin-attempt" v-model="attempt" rows="7" class="font-mono text-sm" placeholder="Write code or the steps in words…" /></div>
        <div class="flex items-center justify-between"><UiButton variant="ghost" size="lg" @click="set('intro')"><ArrowLeft /> Back to the example</UiButton><UiButton size="lg" @click="set('explain')">Next: explain it <ArrowRight /></UiButton></div>
      </div>

      <!-- 3 · explain -->
      <div v-else-if="t.phase === 'explain'" key="explain" class="space-y-6">
        <p class="text-lg leading-8">Explain how your solution works and why it is correct. Mention the state, the choice at each step, and how you get the final answer.</p>
        <UiTextarea v-model="t.text" rows="7" class="min-h-44 rounded-xl p-5 text-lg leading-8" aria-label="Your explanation" placeholder="Start with the main idea…" :aria-invalid="!!error" />
        <div class="flex flex-wrap items-center justify-between gap-2">
        </div>
        <ConfidencePicker v-model="t.confidence" />
        <p v-if="error" class="text-gap-foreground text-sm" role="alert">{{ error }}</p>
        <div class="flex items-center justify-between"><UiButton variant="ghost" size="lg" @click="set('task')"><ArrowLeft /> Back</UiButton><UiButton size="lg" :disabled="loading" @click="toCheck"><Loader2 v-if="loading" class="animate-spin" /> {{ loading ? 'Reading your explanation…' : 'Continue to the check' }}</UiButton></div>
      </div>

      <!-- 4 · targeted check -->
      <div v-else-if="t.phase === 'check'" key="check" class="space-y-6">
        
        <QuestionRunner :questions="tw.task" :answers="t.answers" submit-label="Submit the check" :can-skip="false" recap-title="Ready to submit?" :confidence="ws.settings.askConfidence" @submit="submitCheck" @exit="set('explain')" />
      </div>

      <!-- 5 · result -->
      <div v-else key="result" class="space-y-10">
        <ul class="divide-border divide-y">
          <Reveal v-for="(r, i) in resultRows" :key="r.sub.id" as="li" :index="i" class="space-y-3 py-6">
            <div class="flex flex-wrap items-baseline justify-between gap-2"><h3 class="text-lg font-medium">{{ r.sub.name }}</h3><span class="text-muted-foreground text-sm">{{ last?.label }}</span></div>
            <div class="flex flex-wrap items-center gap-3">
              <div class="space-y-1"><p class="text-muted-foreground text-sm">First attempt</p><EvidenceBadge :state="r.before?.state ?? 'unverified'" /></div>
              <ArrowRight class="text-muted-foreground mt-5 size-4" />
              <div class="space-y-1"><p class="text-muted-foreground text-sm">Retry</p><EvidenceBadge :state="r.after?.state ?? 'unverified'" /></div>
              <UiButton v-if="r.after" variant="ghost" size="sm" class="mt-5 ml-auto" @click="evidence.open(r.sub.id)">See evidence</UiButton>
            </div>
            <p class="text-muted-foreground max-w-xl text-[15px] leading-6">
              <template v-if="r.after?.state === 'demonstrated'">Shown independently on the twin. The earlier attempt is kept next to it, and a later review will tell whether it lasts.</template>
              <template v-else-if="r.after?.state === 'partial'">Partly there. Some answers held and some didn’t. Open the evidence to see which.</template>
              <template v-else>Still a gap. That’s information, not a failure. Try a short review or one more twin later.</template>
            </p>
          </Reveal>
        </ul>
        <div class="flex flex-wrap items-center gap-3">
          <UiButton size="xl" @click="back">{{ s.mode === 'full' ? 'Back to summary' : 'Back to the concept' }} <ArrowRight /></UiButton>
          <UiButton variant="outline" size="lg" @click="again">Try again</UiButton>
        </div>
      </div>
    </Transition>
  </div>
</template>
