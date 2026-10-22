<script setup lang="ts">
import { ArrowRight, Check, X } from '@lucide/vue'
import { packOf } from '~/lib/session'
import type { Confidence } from '~/data/types'

definePageMeta({ layout: 'session', middleware: 'session' })
useStep('mistakes')
const { ws } = useWorkspace()
const { go, markSkipped } = useSession()
const s = computed(() => ws.value.active!)
const pack = computed(() => packOf(s.value))
const m = computed(() => s.value.mistakes)
const mk = computed(() => pack.value.mistakes)
const skipOpen = ref(false)
const lineOk = computed(() => m.value.line === mk.value.faulty)
const whyOk = computed(() => m.value.why === mk.value.correctWhy)

function pickLine(i: number) { if (!m.value.submitted) m.value.line = i }
function submit() { m.value.submitted = true }
function finish() { m.value.done = true; go('post-quiz') }
function skip(_: Confidence | null, later: boolean) { markSkipped('mistakes', later); skipOpen.value = false; go('post-quiz') }
</script>

<template>
  <div>
    <StageHeader title="One of these steps is wrong" description="Pick the wrong step, then say why." />

    <div class="space-y-8">
      <div class="flex items-center justify-between gap-4">
        <p class="text-muted-foreground text-sm">{{ mk.title }}</p>
        <UiButton v-if="!m.submitted" variant="ghost" size="sm" class="text-muted-foreground -mr-3" @click="skipOpen = true">Skip this check</UiButton>
      </div>

      <UiRadioGroup :model-value="m.line === null ? '' : String(m.line)" class="gap-2" aria-label="Solution steps" :disabled="m.submitted" @update:model-value="(v) => pickLine(Number(v))">
        <label
          v-for="(l, i) in mk.lines" :key="i"
          class="relative flex items-start gap-4 rounded-xl border px-4 py-3.5 transition-colors duration-200"
          :class="[m.submitted ? 'cursor-default' : 'hover:bg-accent/50 cursor-pointer', m.line === i && !m.submitted && 'border-foreground bg-accent/60', m.submitted && i === mk.faulty && 'border-gap-dot/60 bg-gap', m.submitted && m.line === i && i !== mk.faulty && 'border-partial-dot/60 bg-partial']"
        >
          <span class="text-muted-foreground mt-0.5 w-5 shrink-0 text-sm tabular-nums">{{ i + 1 }}</span>
          <span class="flex-1 text-base leading-7"><RichText :text="l" /></span>
          <UiRadioGroupItem :value="String(i)" class="mt-1 size-5 shrink-0" :aria-label="`Step ${i + 1} is wrong`" :disabled="m.submitted" />
          <span v-if="m.submitted && i === mk.faulty" class="text-gap-foreground shrink-0 text-xs font-medium">The mistake</span>
        </label>
      </UiRadioGroup>

      <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="translate-y-2 opacity-0">
        <div v-if="m.line !== null" class="space-y-4">
          <UiLabel class="text-base">What’s wrong with step {{ m.line + 1 }}?</UiLabel>
          <UiRadioGroup :model-value="m.why ?? ''" class="gap-2" aria-label="Why it fails" :disabled="m.submitted" @update:model-value="(v) => (m.why = v as string)">
            <label v-for="w in mk.whys" :key="w.id" class="flex items-center gap-4 rounded-xl border px-4 py-3.5 transition-colors" :class="[m.submitted ? '' : 'hover:bg-accent/50 cursor-pointer', m.why === w.id && !m.submitted && 'border-foreground bg-accent/60', m.submitted && w.id === mk.correctWhy && 'border-demonstrated-dot/60 bg-demonstrated']">
              <UiRadioGroupItem :value="w.id" class="size-5 shrink-0" :disabled="m.submitted" />
              <span class="flex-1 text-base leading-7"><RichText :text="w.label" /></span>
            </label>
          </UiRadioGroup>
        </div>
      </Transition>

      <template v-if="!m.submitted">
        <div class="flex items-center justify-between gap-3">
          <p v-if="m.line === null || !m.why" class="text-muted-foreground text-sm">Pick a step and a reason to check.</p><span v-else />
          <UiButton size="lg" :disabled="m.line === null || !m.why" @click="submit">Check my answer</UiButton>
        </div>
      </template>
      <Reveal v-else class="space-y-5">
        <div class="space-y-3 rounded-xl p-5" :class="lineOk && whyOk ? 'bg-demonstrated' : 'bg-gap'">
          <p class="flex items-center gap-2 text-sm font-medium" :class="lineOk && whyOk ? 'text-demonstrated-foreground' : 'text-gap-foreground'">
            <component :is="lineOk && whyOk ? Check : X" class="size-4" />
            {{ lineOk && whyOk ? 'You found it' : lineOk ? 'Right step, different reason' : `The mistake was in step ${mk.faulty + 1}` }}
          </p>
          <p class="text-base leading-7"><RichText :text="mk.explanation" /></p>
        </div>
        <div class="flex justify-end"><UiButton size="lg" @click="finish">Continue to the final quiz <ArrowRight /></UiButton></div>
      </Reveal>
    </div>

    <SkipDialog v-model:open="skipOpen" title="Skip this check?" consequence="This check will not be shown." @confirm="skip" />
  </div>
</template>
