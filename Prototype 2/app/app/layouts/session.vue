<script setup lang="ts">
import { ArrowLeft } from '@lucide/vue'
import { packOf, stageOf, type Stage } from '~/lib/session'
import { course } from '~/data/catalog'

const { ws } = useWorkspace()
const { finish } = useSession()
const s = computed(() => ws.value.active)
const pack = computed(() => (s.value ? packOf(s.value) : null))
const stage = computed<Stage>(() => (s.value ? stageOf(s.value.step) : 'prepare'))
const checking = computed(() => !!s.value && ['explain', 'defend', 'mistakes', 'post-quiz'].includes(s.value.step))
const assisted = computed(() => {
  const x = s.value
  if (!x) return false
  const map: Record<string, string> = { explain: 'explain', defend: 'defend', mistakes: 'mistakes', 'post-quiz': 'post' }
  return x.assisted.includes(map[x.step] as any)
})
const skippedStages = computed<Stage[]>(() => (s.value && (s.value.skipped.length || s.value.assisted.length) ? ['check'] : []))
const chat = computed(() => !!s.value && s.value.step === 'work')
/** From the summary the session is over, so leaving closes it; anywhere else the progress is kept for Resume. */
async function back() {
  const done = s.value?.step === 'summary'
  await navigateTo('/')
  if (done) finish()
}
const wide = computed(() => !!s.value && s.value.step === 'summary')
</script>

<template>
  <div :class="[chat ? 'flex h-dvh flex-col overflow-hidden' : 'min-h-dvh', { 'check-vignette': checking }]">
    <header class="bg-background/80 sticky top-0 z-30 grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-3 px-3 backdrop-blur-xl sm:px-5">
      <div class="flex min-w-0 items-center gap-2">
        <UiTooltip>
          <UiTooltipTrigger as-child>
            <UiButton variant="ghost" size="icon" class="rounded-lg" aria-label="Back to exercises" @click="back"><ArrowLeft /></UiButton>
          </UiTooltipTrigger>
          <UiTooltipContent>Back to exercises. Your progress is kept.</UiTooltipContent>
        </UiTooltip>
        <div class="text-muted-foreground hidden min-w-0 items-center gap-2 text-sm lg:flex">
          <span class="max-w-40 truncate">{{ course.name }}</span><span aria-hidden="true">/</span>
          <span class="text-foreground max-w-56 truncate font-medium">{{ pack?.title }}</span>
        </div>
      </div>
      <SessionStepper :current="stage" :skipped="skippedStages" />
      <div class="flex items-center justify-end gap-1"><AboutButton /></div>
    </header>

    <CheckBanner v-if="checking" :assisted="assisted" class="mt-1" />

    <div class="mx-auto flex w-full max-w-[1180px] justify-center gap-10 px-4 pt-6 sm:px-8" :class="chat ? 'min-h-0 flex-1 pb-0' : 'pb-40 xl:pt-10'">
      <main id="main" tabindex="-1" class="mx-auto w-full min-w-0 outline-none" :class="[chat && 'h-full', wide ? 'max-w-[56rem]' : 'max-w-[44rem]']">
        <slot />
      </main>
    </div>

    <ReferencesDialogs />
  </div>
</template>
