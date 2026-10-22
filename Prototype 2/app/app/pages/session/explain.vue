<script setup lang="ts">
import { RotateCcw, Loader2 } from '@lucide/vue'
import { packOf } from '~/lib/session'
import type { SampleKey, Confidence } from '~/data/types'
import { repeatedMistake } from '~/lib/evidence'

definePageMeta({ layout: 'session', middleware: 'session' })
useStep('explain')
const { ws } = useWorkspace()
const { go, markSkipped } = useSession()
const { pick } = useSampleOutcome()
const s = computed(() => ws.value.active!)
const pack = computed(() => packOf(s.value))
const ex = computed(() => s.value.explain)
const loading = ref(false)
const skipOpen = ref(false)
const error = ref('')

const minChars = 24
const samples = computed(() => pack.value.sampleAnswers.explain)
/** The prepared text decides the prepared feedback. Anything else gets the incomplete outcome. */
const sampleOf = (text: string): SampleKey => (Object.entries(samples.value).find(([, v]) => v.trim() === text.trim())?.[0] as SampleKey) ?? 'partial'
const isKnown = computed(() => Object.values(samples.value).some(v => v.trim() === ex.value.text.trim()))
const feedback = computed(() => pack.value.explain.feedback[ex.value.sample ?? 'partial'])
const repeat = computed(() => (feedback.value.gap ? repeatedMistake(ws.value.entries, feedback.value.gap.sub, s.value.id, pack.value.echoes) : null))

function fill() { ex.value.text = samples.value[pick(ex.value.attempts.length)]; error.value = '' }
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

function deeper(which: 'defend' | 'mistakes') {
  s.value.deeper.defend = which === 'defend'
  s.value.deeper.mistakes = which === 'mistakes'
  go(which)
}
function finalQuiz() {
  s.value.deeper.defend = false
  s.value.deeper.mistakes = false
  go('post-quiz')
}
</script>

<template>
  <div>
    <StageHeader
      :title="ex.submitted ? 'Feedback on your explanation' : 'Explain it in your own words'"
      :description="ex.submitted ? undefined : 'Your chat and solutions are hidden.'"
    />
    <ProblemCard :pack="pack" :start-open="false" class="mb-8" />

    <!-- input -->
    <div v-if="!ex.submitted" class="space-y-6">
      <p class="text-lg leading-8"><RichText :text="pack.explain.prompt" /></p>

      <div class="space-y-3">
        <UiLabel for="explanation" class="sr-only">Your explanation</UiLabel>
        <SampleInput label="Your explanation" @fill="fill">
          <UiTextarea id="explanation" v-model="ex.text" rows="8" class="min-h-48 rounded-xl p-5 text-lg leading-8" placeholder="Start with the main idea, then the key steps, and why they hold…" :aria-invalid="!!error" />
        </SampleInput>
        <span class="text-muted-foreground block text-sm tabular-nums">{{ ex.text.trim().length }} characters</span>
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
        <p v-if="ex.confidence" class="text-muted-foreground text-sm"><ConfidenceTag :confidence="ex.confidence" /></p>
        <div class="space-y-1.5">
          <h2 class="text-muted-foreground text-sm font-medium">Your explanation</h2>
          <p class="border-border rounded-xl border p-5 text-base leading-7">{{ ex.text }}</p>
        </div>
      </Reveal>
      <FeedbackBlock :feedback="feedback" :pack="pack" :repeat="repeat" />
      <p v-if="!isKnown" class="text-muted-foreground -mt-4 text-sm leading-6">This feedback is not based on your exact wording.</p>
      <div><UiButton variant="outline" @click="revise"><RotateCcw /> Edit and submit again</UiButton></div>
      <UiSeparator />
      <DeeperChooser @continue="finalQuiz" @deeper="deeper" />
    </div>

    <SkipDialog v-model:open="skipOpen" title="Skip explain-it-back?" :consequence="`${pack.subs.map(x => x.name).join(', ')} will not be shown.`" confirm="Skip this check" @confirm="skip" />
  </div>
</template>
