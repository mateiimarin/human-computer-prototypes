<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { Check } from '@lucide/vue'
import { exercises } from '~/data/packs'
import type { SampleOutcome } from '~/lib/samples'

/**
 * Facilitator tool, opened with ⌘K or Ctrl+K and not linked from anywhere in the interface.
 * It jumps to an exercise and fixes which scripted outcome the “Fill sample” chips produce.
 */
const open = useState('facilitator-menu', () => false)
const { open: openExercise } = useSession()
const { outcome } = useSampleOutcome()

useEventListener('keydown', (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    open.value = !open.value
  }
})

const outcomes: { v: SampleOutcome; label: string }[] = [
  { v: 'auto', label: 'Incomplete first, then complete' },
  { v: 'partial', label: 'Always incomplete (shows a gap)' },
  { v: 'complete', label: 'Always complete (no gap)' },
  { v: 'offtrack', label: 'Always off track' },
]
function pick(v: SampleOutcome) { outcome.value = v; open.value = false }
function jump(id: string) { open.value = false; openExercise(id) }
function go(to: string) { open.value = false; navigateTo(to) }
</script>

<template>
  <UiCommandDialog v-model:open="open" title="Facilitator tools" description="Jump to an exercise or choose what the sample text produces">
    <UiCommandInput placeholder="Jump to an exercise or choose an outcome…" />
    <UiCommandList class="max-h-[min(440px,60dvh)] p-1.5">
      <UiCommandEmpty>Nothing matches.</UiCommandEmpty>
      <UiCommandGroup heading="Sample text produces">
        <UiCommandItem v-for="o in outcomes" :key="o.v" :value="`sample ${o.label}`" class="rounded-xl py-2.5" @select="pick(o.v)">
          {{ o.label }} <Check v-if="outcome === o.v" class="ml-auto" />
        </UiCommandItem>
      </UiCommandGroup>
      <UiCommandGroup heading="Open exercise">
        <UiCommandItem v-for="p in exercises" :key="p.id" :value="`exercise ${p.title}`" class="rounded-xl py-2.5" @select="jump(p.id)">
          {{ p.title }}
        </UiCommandItem>
      </UiCommandGroup>
      <UiCommandGroup heading="Go to">
        <UiCommandItem value="Exercises" class="rounded-xl py-2.5" @select="go('/')">Exercises</UiCommandItem>
        <UiCommandItem value="Concepts" class="rounded-xl py-2.5" @select="go('/concepts')">Concepts</UiCommandItem>
      </UiCommandGroup>
    </UiCommandList>
  </UiCommandDialog>
</template>
