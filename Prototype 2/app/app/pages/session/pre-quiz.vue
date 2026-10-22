<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'
import { packOf } from '~/lib/session'
import type { Confidence } from '~/data/types'

definePageMeta({ layout: 'session', middleware: 'session' })
useStep('pre-quiz')
const { ws } = useWorkspace()
const { go, markSkipped } = useSession()
const s = computed(() => ws.value.active!)
const pack = computed(() => packOf(s.value))
const skipOpen = ref(false)

function submit() {
  s.value.pre.submitted = true
  s.value.pre.skipped = false
  s.value.pre.at = new Date().toISOString()
  go('route')
}
function skip(_: Confidence | null, later: boolean) {
  s.value.pre.skipped = true
  s.value.pre.submitted = false
  markSkipped('pre', later)
  go('route')
}
</script>

<template>
  <div>
    <template v-if="!s.pre.submitted">
      <StageHeader
        title="Three questions before you start" description="Answer from memory. You see the results at the end."
      />
      <QuestionRunner
        :questions="pack.quiz" :answers="s.pre.answers" submit-label="Save baseline" skip-label="Skip the baseline"
        recap-title="Save your baseline?" recap-note="You can still change any answer. Once saved, it is recorded as your first attempt."
        @submit="submit" @skip="skipOpen = true" @exit="navigateTo('/')"
      />
    </template>

    <!-- Only reachable by going back after saving: the baseline is a recorded attempt. -->
    <div v-else class="max-w-md space-y-6">
      <StageHeader title="Baseline saved" />
      <UiButton size="xl" @click="go('route')">Choose how to continue <ArrowRight /></UiButton>
    </div>

    <SkipDialog v-model:open="skipOpen" title="Skip the baseline?" consequence="You will not get a before-and-after comparison." confirm="Skip baseline" @confirm="skip" />
  </div>
</template>
