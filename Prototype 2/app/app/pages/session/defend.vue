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
  go(s.value.deeper.mistakes ? 'mistakes' : 'post-quiz')
}
function skip(_: Confidence | null, later: boolean) { markSkipped('defend', later); skipOpen.value = false; go(s.value.deeper.mistakes ? 'mistakes' : 'post-quiz') }
</script>

<template>
  <div>
    <StageHeader
      title="Why does it hold?" description="Short questions about the steps behind your solution. Finish whenever you like."
      :next="s.deeper.mistakes ? 'Spot the planted mistake.' : 'The post-quiz.'"
    />

    <div class="space-y-8">
      <div class="flex items-center justify-between gap-4">
        <p class="text-muted-foreground text-sm tabular-nums" aria-live="polite">Question {{ d.idx + 1 }} of {{ pack.defend.length }}</p>
        <div class="flex items-center gap-1">
          <UiButton variant="ghost" size="sm" class="text-muted-foreground" @click="skipOpen = true">Skip this check</UiButton>
          <UiButton variant="outline" size="sm" @click="finish">Finish</UiButton>
        </div>
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
              <div class="space-y-1"><p class="text-sm font-medium" :class="ok ? 'text-demonstrated-foreground' : 'text-gap-foreground'">{{ ok ? 'That holds' : a.idk ? 'You weren’t sure' : 'That doesn’t hold' }}</p><p class="text-base leading-7"><RichText :text="q.why" /></p></div>
            </div>
            <div v-if="!ok" class="space-y-2">
              <UiLabel :for="`mistake-${q.id}`">Explain your mistake <span class="text-muted-foreground font-normal">Why doesn’t that reasoning work? Optional</span></UiLabel>
              <UiTextarea :id="`mistake-${q.id}`" :model-value="d.own[q.id] ?? ''" rows="3" placeholder="It doesn’t work because…" @update:model-value="(v) => (d.own[q.id] = String(v))" />
            </div>
            <div class="flex items-center justify-between gap-3">
              <ConfidenceTag :confidence="a.confidence" />
              <UiButton size="lg" @click="next">{{ last ? 'Finish defence' : 'Next question' }} <ArrowRight /></UiButton>
            </div>
          </Reveal>
        </div>
      </Transition>
    </div>

    <SkipDialog v-model:open="skipOpen" title="Skip defend your solution?" consequence="Your answers to these questions will stay unverified." @confirm="skip" />
  </div>
</template>
