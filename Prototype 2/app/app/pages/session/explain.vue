<script setup lang="ts">
import { Mic, Square, Keyboard, RotateCcw, ChevronDown, Loader2 } from '@lucide/vue'
import { packOf } from '~/lib/session'
import type { SampleKey } from '~/data/types'
import type { Confidence } from '~/data/types'
import { repeatedMistake } from '~/lib/evidence'

definePageMeta({ layout: 'session', middleware: 'session' })
useStep('explain')
const { ws } = useWorkspace()
const { go, markSkipped } = useSession()
const s = computed(() => ws.value.active!)
const pack = computed(() => packOf(s.value))
const ex = computed(() => s.value.explain)
const loading = ref(false)
const skipOpen = ref(false)
const error = ref('')
const seconds = ref(0)
let timer: ReturnType<typeof setInterval> | null = null
const showPrev = ref(false)

const minChars = 24
const sampleOf = (text: string): SampleKey => (Object.entries(pack.value.explain.samples).find(([, v]) => v.trim() === text.trim())?.[0] as SampleKey) ?? 'partial'
const isKnown = computed(() => Object.values(pack.value.explain.samples).some(v => v.trim() === ex.value.text.trim()))
const feedback = computed(() => pack.value.explain.feedback[ex.value.sample ?? 'partial'])
const repeat = computed(() => (feedback.value.gap ? repeatedMistake(ws.value.entries, feedback.value.gap.sub, s.value.id, pack.value.echoes) : null))

function useSample(k: SampleKey) { ex.value.text = pack.value.explain.samples[k]; error.value = '' }
async function submit() {
  if (ex.value.text.trim().length < minChars) { error.value = 'Write at least a sentence to submit, or skip this check.'; return }
  error.value = ''
  loading.value = true
  await new Promise(r => setTimeout(r, 800))
  ex.value.sample = sampleOf(ex.value.text)
  ex.value.submitted = true
  ex.value.attempts.push({ text: ex.value.text, sample: ex.value.sample, at: new Date().toISOString(), confidence: ex.value.confidence })
  loading.value = false
  s.value.skipped = s.value.skipped.filter(c => c !== 'explain')
}
function revise() { ex.value.submitted = false; ex.value.sample = null }
function skip(_: Confidence | null, later: boolean) { markSkipped('explain', later); ex.value.submitted = false; skipOpen.value = false; go('post-quiz') }

function record() { ex.value.voice = 'recording'; seconds.value = 0; timer = setInterval(() => seconds.value++, 1000) }
function stop() {
  if (timer) clearInterval(timer)
  ex.value.voice = 'done'
  ex.value.text = pack.value.explain.transcript
}
onBeforeUnmount(() => { if (timer) clearInterval(timer) })
const mmss = computed(() => `${Math.floor(seconds.value / 60)}:${String(seconds.value % 60).padStart(2, '0')}`)

function after() {
  const d = s.value.deeper
  d.chosen = true
  go(d.defend ? 'defend' : d.mistakes ? 'mistakes' : 'post-quiz')
}
</script>

<template>
  <div>
    <StageHeader
      :title="ex.submitted ? 'Feedback on your explanation' : 'Explain it in your own words'"
      :description="ex.submitted ? 'What you covered, and what to add. This follows the points the exercise checks.' : 'Your chat, hints and solutions are hidden. The problem stays here so you can see what you’re explaining.'"
      :next="ex.submitted ? 'Optionally go deeper, then the post-quiz.' : 'You’ll see what you covered and what’s missing.'"
    />
    <ProblemCard :pack="pack" :start-open="false" class="mb-8" />

    <!-- input -->
    <div v-if="!ex.submitted" class="space-y-6">
      <p class="text-lg leading-8"><RichText :text="pack.explain.prompt" /></p>
      <UiToggleGroup type="single" :model-value="ex.mode" class="bg-muted gap-1 rounded-lg p-1" aria-label="How to answer" @update:model-value="(v) => v && (ex.mode = v as 'type' | 'speak')">
        <UiToggleGroupItem value="type" class="h-9 gap-2 rounded-md px-4"><Keyboard class="size-4" /> Type</UiToggleGroupItem>
        <UiToggleGroupItem value="speak" class="h-9 gap-2 rounded-md px-4"><Mic class="size-4" /> Speak</UiToggleGroupItem>
      </UiToggleGroup>

      <div v-if="ex.mode === 'type'" class="space-y-3">
        <UiLabel for="explanation" class="sr-only">Your explanation</UiLabel>
        <UiTextarea id="explanation" v-model="ex.text" rows="8" class="min-h-48 rounded-xl p-5 text-lg leading-8" placeholder="Start with the main idea, then the key steps, and why they hold…" :aria-invalid="!!error" />
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-muted-foreground text-sm tabular-nums">{{ ex.text.trim().length }} characters</span>
        </div>
      </div>

      <div v-else class="space-y-5">
        <div class="border-border flex flex-col items-center gap-5 rounded-xl border px-6 py-10 text-center">
          <button
            class="relative grid size-20 place-items-center rounded-full transition-transform active:scale-95" :class="ex.voice === 'recording' ? 'bg-gap-dot text-white' : 'bg-foreground text-background'"
            :aria-label="ex.voice === 'recording' ? 'Stop recording' : 'Start recording'" @click="ex.voice === 'recording' ? stop() : record()"
          >
            <span v-if="ex.voice === 'recording'" class="bg-gap-dot/40 absolute inset-0 animate-ping rounded-full" aria-hidden="true" />
            <component :is="ex.voice === 'recording' ? Square : Mic" class="relative size-7" />
          </button>
          <div v-if="ex.voice === 'recording'" class="flex h-8 items-center gap-1" aria-hidden="true"><span v-for="i in 18" :key="i" class="bg-gap-dot w-1 rounded-full" :style="{ height: `${8 + ((i * 37) % 22)}px`, animation: `breathe ${0.8 + (i % 5) * 0.15}s ease-in-out infinite` }" /></div>
          <p class="text-base font-medium tabular-nums" role="status">
            <template v-if="ex.voice === 'idle'">Press the microphone and explain it out loud</template>
            <template v-else-if="ex.voice === 'recording'">Listening… {{ mmss }}</template>
            <template v-else>Transcript ready. Edit it before you submit.</template>
          </p>
        </div>
        <div v-if="ex.voice === 'done'" class="space-y-2">
          <UiLabel for="transcript">Transcript</UiLabel>
          <UiTextarea id="transcript" v-model="ex.text" rows="5" class="rounded-xl p-4 text-base leading-7" />
        </div>
      </div>

      <ConfidencePicker v-model="ex.confidence" />
      <p v-if="error" class="text-gap-foreground text-sm" role="alert">{{ error }}</p>

      <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
        <UiButton variant="ghost" size="lg" class="text-muted-foreground -ml-4" @click="skipOpen = true">Skip this check</UiButton>
        <div class="flex items-center gap-3">
          <p v-if="ex.text.trim().length < minChars" class="text-muted-foreground hidden text-sm sm:block">Write a sentence or two to submit.</p>
          <UiButton size="xl" :disabled="loading || ex.text.trim().length < minChars" @click="submit">
            <Loader2 v-if="loading" class="animate-spin" /> {{ loading ? 'Reading your explanation…' : 'Submit explanation' }}
          </UiButton>
        </div>
      </div>
    </div>

    <!-- feedback -->
    <div v-else class="space-y-10">
      <Reveal :index="0" class="space-y-3">
        <p class="text-muted-foreground flex flex-wrap items-center gap-x-3 text-sm">
          <span>{{ s.assisted.includes('explain') ? 'Assisted' : 'Independent' }}</span><ConfidenceTag :confidence="ex.confidence" />
        </p>
        <button class="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm" :aria-expanded="showPrev" @click="showPrev = !showPrev">Your explanation <ChevronDown class="size-4 transition-transform" :class="showPrev && 'rotate-180'" /></button>
        <p v-if="showPrev" class="border-border rounded-xl border p-5 text-base leading-7">{{ ex.text }}</p>
      </Reveal>
      <FeedbackBlock :feedback="feedback" :pack="pack" :repeat="repeat" />
      <p v-if="!isKnown" class="text-muted-foreground -mt-4 text-sm leading-6">This feedback follows the points the exercise checks. It isn’t a reading of your exact wording.</p>
      <div><UiButton variant="outline" @click="revise"><RotateCcw /> Revise as a new attempt</UiButton></div>
      <UiSeparator />
      <DeeperChooser :session="s" @continue="after" />
    </div>

    <SkipDialog v-model:open="skipOpen" title="Skip explain-it-back?" :consequence="`${pack.subs.map(x => x.name).join(', ')} will stay unverified.`" confirm="Skip this check" @confirm="skip" />
  </div>
</template>
