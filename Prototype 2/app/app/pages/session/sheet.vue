<script setup lang="ts">
import { ArrowRight, ArrowLeft, CircleCheck, CircleAlert, Contrast } from '@lucide/vue'
import { packOf } from '~/lib/session'

definePageMeta({ layout: 'session', middleware: 'session' })
useStep('sheet')
const { ws } = useWorkspace()
const { go } = useSession()
const s = computed(() => ws.value.active!)
const pack = computed(() => packOf(s.value))
const code = computed(() => s.value.work.attempt || pack.value.sheet.solution)
const marks = computed(() => Object.fromEntries(pack.value.sheet.annotations.map(a => [a.line, a.kind])) as Record<number, 'ok' | 'note' | 'issue'>)
const icons = { ok: CircleCheck, note: Contrast, issue: CircleAlert }
const tone = { ok: 'text-demonstrated-foreground bg-demonstrated', note: 'text-partial-foreground bg-partial', issue: 'text-gap-foreground bg-gap' }
const label = { ok: 'Looks right', note: 'Worth a look', issue: 'Needs a fix' }
onMounted(() => { s.value.sheetViewed = true })
</script>

<template>
  <div>
    <StageHeader title="Notes on your solution" description="Line-by-line notes on what you submitted. They’re for orientation and don’t count as evidence." next="Check your understanding when you’re ready." />
    <div class="space-y-8">
      <Reveal :index="2"><CodeSnippet :code="code" title="your_solution.py" :marks="marks" /></Reveal>
      <ul class="space-y-3">
        <Reveal v-for="(a, i) in pack.sheet.annotations" :key="a.line" as="li" :index="i + 3" class="flex items-start gap-4 rounded-xl p-4" :class="tone[a.kind]">
          <component :is="icons[a.kind]" class="mt-0.5 size-5 shrink-0" />
          <div class="space-y-0.5"><p class="text-sm font-medium">Line {{ a.line }} · {{ label[a.kind] }}</p><p class="text-foreground text-base leading-7"><RichText :text="a.text" /></p></div>
        </Reveal>
      </ul>
      <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
        <UiButton variant="ghost" size="lg" @click="go('work')"><ArrowLeft /> Back to work</UiButton>
        <UiButton size="lg" @click="go('explain')">Check my understanding <ArrowRight /></UiButton>
      </div>
    </div>
  </div>
</template>
