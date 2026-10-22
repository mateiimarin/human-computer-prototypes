<script setup lang="ts">
import { ArrowRight, Check, X } from '@lucide/vue'
import { packOf, isAnswered } from '~/lib/session'
import type { Confidence } from '~/data/types'

definePageMeta({ layout: 'session', middleware: 'session' })
useStep('defend')
const { ws } = useWorkspace()
const { go, markSkipped } = useSession()
const s = computed(() => ws.value.active!)
const pack = computed(() => packOf(s.value))
const d = computed(() => s.value.defend)
const q = computed(() => pack.value.defend[d.value.idx]!)
const a = computed(() => d.value.answers[q.value.id]!)
const checked = computed(() => d.value.checked.includes(q.value.id))
const ok = computed(() => !a.value.idk && a.value.choice === q.value.correct)
const skipOpen = ref(false)
const last = computed(() => d.value.idx === pack.value.defend.length - 1)

function check() { if (!d.value.checked.includes(q.value.id)) d.value.checked.push(q.value.id) }
function idk() { a.value.idk = true; a.value.choice = null }
function next() { last.value ? finish() : d.value.idx++ }
function finish() {
  d.value.done = true
  go('post-quiz')
}
function skip(_: Confidence | null, later: boolean) { markSkipped('defend', later); skipOpen.value = false; go('post-quiz') }
</script>

<template>
  <div>
    <StageHeader
      title="Why does it work?" description="Three short questions about your solution."
    />

    <div class="space-y-8">
      <div class="flex items-center justify-between gap-4">
        <p class="text-muted-foreground text-sm tabular-nums" aria-live="polite">Question {{ d.idx + 1 }} of {{ pack.defend.length }}</p>
        <UiButton variant="ghost" size="sm" class="text-muted-foreground -mr-3" @click="skipOpen = true">Skip this check</UiButton>
      </div>

      <Transition name="q-fwd" mode="out-in">
        <div :key="q.id" class="space-y-6">
          <h2 class="text-[22px] leading-9 font-medium sm:text-2xl sm:leading-10"><RichText :text="q.prompt" /></h2>
          <div class="space-y-2">
            <ChoiceList :q="q" :a="a" :reveal="checked" :locked="checked" />
            <IdkOption v-if="!checked" :selected="a.idk" @select="idk" />
          </div>

          <template v-if="!checked">
            <ConfidencePicker v-if="isAnswered(a)" v-model="a.confidence" />
            <UiButton size="lg" :disabled="!isAnswered(a)" @click="check">Check my answer</UiButton>
          </template>

          <Reveal v-else class="space-y-5">
            <div class="flex items-start gap-3 rounded-xl p-5" :class="ok ? 'bg-demonstrated' : 'bg-gap'">
              <component :is="ok ? Check : X" class="mt-0.5 size-5 shrink-0" :class="ok ? 'text-demonstrated-foreground' : 'text-gap-foreground'" />
              <div class="space-y-1"><p class="text-sm font-medium" :class="ok ? 'text-demonstrated-foreground' : 'text-gap-foreground'">{{ ok ? 'That holds' : a.idk ? 'You were not sure' : 'That does not hold' }}</p><p class="text-base leading-7"><RichText :text="q.why" /></p></div>
            </div>
            <div v-if="!ok" class="space-y-2">
              <UiLabel :for="`mistake-${q.id}`">Explain your mistake <span class="text-muted-foreground font-normal">Why does that reasoning not work? Optional</span></UiLabel>
              <SampleInput label="Explain your mistake" @fill="d.own[q.id] = pack.sampleAnswers.why[q.id] ?? ''">
                <UiTextarea :id="`mistake-${q.id}`" :model-value="d.own[q.id] ?? ''" rows="3" placeholder="It does not work because…" @update:model-value="(v) => (d.own[q.id] = String(v))" />
              </SampleInput>
            </div>
            <div class="flex items-center justify-between gap-3">
              <ConfidenceTag :confidence="a.confidence" />
              <UiButton size="lg" @click="next">{{ last ? 'Continue to the final quiz' : 'Next question' }} <ArrowRight /></UiButton>
            </div>
          </Reveal>
        </div>
      </Transition>
    </div>

    <SkipDialog v-model:open="skipOpen" title="Skip these questions?" consequence="These questions will not be shown." @confirm="skip" />
  </div>
</template>
