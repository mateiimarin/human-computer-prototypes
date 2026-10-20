<script setup lang="ts">
import { Check, CircleDashed, LifeBuoy, SkipForward, Clock4 } from '@lucide/vue'
import { packOf } from '~/lib/session'
import { topicById } from '~/data/catalog'
import type { CheckId } from '~/data/session'

const { ws } = useWorkspace()
const { open } = useLeave()
const s = computed(() => ws.value.active!)
const pack = computed(() => packOf(s.value))

type Row = { id: CheckId; label: string; state: 'done' | 'skipped' | 'later' | 'assisted' | 'todo' }
const checks = computed(() => {
  const x = s.value
  const skip = (id: CheckId): 'skipped' | 'later' => (x.deferred.includes(id) ? 'later' : 'skipped')
  const rows: Row[] = []
  rows.push({ id: 'pre', label: 'Baseline', state: x.pre.skipped ? skip('pre') : x.pre.submitted ? 'done' : 'todo' })
  rows.push({ id: 'explain', label: 'Explain it back', state: x.skipped.includes('explain') ? skip('explain') : x.assisted.includes('explain') ? 'assisted' : x.explain.submitted ? 'done' : 'todo' })
  if (x.deeper.defend) rows.push({ id: 'defend', label: 'Defend your solution', state: x.skipped.includes('defend') ? skip('defend') : x.assisted.includes('defend') ? 'assisted' : x.defend.done ? 'done' : 'todo' })
  if (x.deeper.mistakes) rows.push({ id: 'mistakes', label: 'Spot the mistake', state: x.skipped.includes('mistakes') ? skip('mistakes') : x.assisted.includes('mistakes') ? 'assisted' : x.mistakes.done ? 'done' : 'todo' })
  rows.push({ id: 'post', label: 'Post-quiz and claims', state: x.post.skipped ? skip('post') : x.assisted.includes('post') ? 'assisted' : x.post.submitted ? 'done' : 'todo' })
  return rows
})
const icon = { done: Check, skipped: SkipForward, later: Clock4, assisted: LifeBuoy, todo: CircleDashed }
const tone = { done: 'text-demonstrated-foreground', skipped: 'text-muted-foreground', later: 'text-muted-foreground', assisted: 'text-assist-foreground', todo: 'text-muted-foreground' }
const word = { done: 'Done', skipped: 'Skipped', later: 'Later', assisted: 'Assisted', todo: 'To do' }
</script>

<template>
  <div class="space-y-6" aria-label="Session details" role="region">
    <div class="space-y-1">
      <h2 class="text-base leading-6 font-semibold">{{ pack.title }}</h2>
      <p class="text-muted-foreground text-sm">{{ topicById(pack.topicId).name }} · Exercise {{ pack.sheetNo }}</p>
    </div>
    <div class="space-y-3">
      <p class="text-muted-foreground text-sm font-medium">Checks in this session</p>
      <ul class="space-y-2.5">
        <li v-for="c in checks" :key="c.id" class="flex items-center gap-3 text-sm">
          <component :is="icon[c.state]" class="size-4 shrink-0" :class="tone[c.state]" />
          <span class="flex-1">{{ c.label }}</span>
          <span class="text-xs" :class="tone[c.state]">{{ word[c.state] }}</span>
        </li>
      </ul>
    </div>
    <UiButton variant="outline" class="w-full" @click="open = true">Leave and resume later</UiButton>
  </div>
</template>
