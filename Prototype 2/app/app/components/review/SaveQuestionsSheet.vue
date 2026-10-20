<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Bookmark } from '@lucide/vue'
import type { Pack, Question } from '~/data/types'
import { isAnswered } from '~/lib/session'
import type { ActiveSession } from '~/data/session'

const open = defineModel<boolean>('open', { default: false })
const props = defineProps<{ session: ActiveSession; pack: Pack }>()
const { ws, saveQuestions } = useWorkspace()

const candidates = computed(() => {
  const s = props.session
  const items: { q: Question; mark: string; wrong: boolean }[] = []
  for (const q of props.pack.quiz) { const a = s.post.answers[q.id]; items.push({ q, mark: 'Quiz', wrong: !!a && isAnswered(a) && (a.idk || a.choice !== q.correct) }) }
  for (const q of props.pack.claims) { const a = s.post.claims[q.id]; items.push({ q, mark: 'Claim', wrong: !!a && isAnswered(a) && (a.idk || a.choice !== q.correct) }) }
  if (s.deeper.defend) for (const q of props.pack.defend) { const a = s.defend.answers[q.id]; items.push({ q, mark: 'Defend', wrong: !!a && isAnswered(a) && (a.idk || a.choice !== q.correct) }) }
  return items
})
const picked = ref<string[]>([])
watch(open, (o) => { if (o) picked.value = candidates.value.filter(c => c.wrong || !ws.value.saved.some(x => x.qid === c.q.id)).map(c => c.q.id).slice(0, 4) }, { immediate: true })
const already = (id: string) => ws.value.saved.some(x => x.qid === id && !x.excluded)
const toggle = (id: string) => (picked.value = picked.value.includes(id) ? picked.value.filter(x => x !== id) : [...picked.value, id])

function save() {
  const items = picked.value.map(qid => ({ qid, packId: props.pack.id }))
  saveQuestions(props.session.id, props.pack.title, items)
  props.session.savedNow.push(...picked.value)
  toast.success(`${items.length} ${items.length === 1 ? 'question' : 'questions'} saved to Review`, { action: { label: 'Open Review', onClick: () => navigateTo('/review') } })
  open.value = false
}
</script>

<template>
  <UiSheet v-model:open="open">
    <UiSheetContent side="right" class="w-full gap-0 sm:max-w-lg">
      <UiSheetHeader class="space-y-1.5 p-6 pb-4"><UiSheetTitle class="text-2xl">Save questions to Review</UiSheetTitle><UiSheetDescription class="text-base leading-7">Pick the ones worth coming back to. We’ve ticked those you missed.</UiSheetDescription></UiSheetHeader>
      <ul class="flex-1 divide-y divide-border overflow-y-auto px-6">
        <li v-for="c in candidates" :key="c.q.id">
          <label class="flex cursor-pointer items-start gap-4 py-4">
            <UiCheckbox class="mt-1" :model-value="picked.includes(c.q.id)" :aria-label="c.q.prompt" @update:model-value="toggle(c.q.id)" />
            <span class="min-w-0 flex-1 space-y-1.5">
              <span class="block text-[15px] leading-6"><RichText :text="c.q.prompt" /></span>
              <span class="flex flex-wrap gap-2"><UiBadge variant="neutral">{{ c.mark }}</UiBadge><UiBadge v-if="c.wrong" variant="gap">Missed</UiBadge><UiBadge v-if="already(c.q.id)" variant="outline">Already in Review</UiBadge></span>
            </span>
          </label>
        </li>
      </ul>
      <div class="flex items-center justify-between gap-3 p-6">
        <p class="text-muted-foreground text-sm tabular-nums">{{ picked.length }} selected</p>
        <div class="flex gap-2"><UiButton variant="ghost" @click="open = false">Cancel</UiButton><UiButton :disabled="!picked.length" @click="save"><Bookmark /> Save {{ picked.length || '' }}</UiButton></div>
      </div>
    </UiSheetContent>
  </UiSheet>
</template>
