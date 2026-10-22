<script setup lang="ts">
import { packOf } from '~/lib/session'
import type { Confidence } from '~/data/types'

definePageMeta({ layout: 'session', middleware: 'session' })
useStep('post-quiz')
const { ws } = useWorkspace()
const { go, markSkipped, commit } = useSession()
const s = computed(() => ws.value.active!)
const pack = computed(() => packOf(s.value))
const skipOpen = ref(false)
const all = computed(() => [...pack.value.quiz, ...pack.value.claims])
const answers = computed(() => ({ ...s.value.post.answers, ...s.value.post.claims }))
const missing = computed(() => all.value.filter(q => !answers.value[q.id]?.choice && !answers.value[q.id]?.idk).length)

function submit() {
  s.value.post.submitted = true
  s.value.post.skipped = false
  s.value.skipped = s.value.skipped.filter(c => c !== 'post')
  s.value.post.at = new Date().toISOString()
  commit()
  go('summary')
}
function skip(_: Confidence | null, later: boolean) {
  markSkipped('post', later)
  s.value.post.skipped = true
  s.value.post.submitted = false
  commit()
  skipOpen.value = false
  go('summary')
}
</script>

<template>
  <div>
    <StageHeader title="The same questions, once more" :description="`The three baseline questions again, then ${pack.claims.length} true or false statements.`" />
    <QuestionRunner
      :questions="all" :answers="answers" :claim-from="pack.quiz.length" submit-label="Submit and see my summary" skip-label="Skip this check"
      recap-title="Submit your answers?" recap-note="The first three are compared with your baseline."
      @submit="submit" @skip="skipOpen = true" @exit="go('explain')"
    />
    <SkipDialog v-model:open="skipOpen" title="Skip the final quiz?" :consequence="`${missing === all.length ? 'All' : 'The unanswered'} items will not be shown, and nothing can be compared with your baseline.`" confirm="Skip and see summary" @confirm="skip" />
  </div>
</template>
