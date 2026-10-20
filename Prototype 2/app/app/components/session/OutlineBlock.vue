<script setup lang="ts">
import { Check, X } from '@lucide/vue'
import type { Pack } from '~/data/types'
import type { ActiveSession } from '~/data/session'

const props = defineProps<{ pack: Pack; session: ActiveSession }>()
const w = computed(() => props.session.work)

const norm = (t: string) => t.toLowerCase().replace(/[\s$\\]/g, '').replace(/ending|ofthe/g, '')
function ok(blank: string, answer: string) {
  const v = norm(w.value.blanks[blank] ?? '')
  return v.length > 0 && (norm(answer).includes(v) || v.includes(norm(answer)))
}
</script>

<template>
  <div class="bg-assist/50 space-y-4 rounded-xl p-5">
    <p class="text-assist-foreground text-sm font-medium">Outline. Fill in the blanks yourself.</p>
    <ol class="space-y-3">
      <li v-for="(item, i) in pack.work.outline" :key="i" class="flex flex-wrap items-center gap-x-3 gap-y-2 text-base leading-7">
        <span class="text-muted-foreground w-4 shrink-0 text-sm tabular-nums">{{ i + 1 }}</span>
        <RichText :text="item.text" />
        <template v-if="item.blank">
          <UiInput
            v-model="w.blanks[item.blank]" :aria-label="`Blank for step ${i + 1}`" class="bg-background h-9 w-48 rounded-lg"
            :class="w.blanksChecked && (ok(item.blank, item.answer!) ? 'ring-2 ring-demonstrated-dot' : 'ring-2 ring-partial-dot')"
          />
          <span v-if="w.blanksChecked" class="flex items-center gap-1.5 text-sm" :class="ok(item.blank, item.answer!) ? 'text-demonstrated-foreground' : 'text-partial-foreground'">
            <component :is="ok(item.blank, item.answer!) ? Check : X" class="size-4" />
            <template v-if="!ok(item.blank, item.answer!)">One way to write it: <code class="bg-background rounded px-1.5 font-mono">{{ item.answer }}</code></template><template v-else>That works</template>
          </span>
        </template>
      </li>
    </ol>
    <UiButton variant="outline" size="sm" class="bg-background" @click="w.blanksChecked = true">Check my blanks</UiButton>
  </div>
</template>
