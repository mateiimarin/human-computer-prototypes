<script setup lang="ts">
import { Check, ChevronUp, MessageCircleQuestion, Lightbulb, ListChecks, LifeBuoy } from '@lucide/vue'
import type { HelpLevel } from '~/data/types'

const model = defineModel<HelpLevel>({ required: true })
const emit = defineEmits<{ solution: [] }>()
const levels = [
  { v: 'questions' as const, label: 'Questions only', text: 'I ask, you reason', icon: MessageCircleQuestion, tint: 'bg-check text-check-foreground' },
  { v: 'hints' as const, label: 'Hints', text: 'Small nudges, one at a time', icon: Lightbulb, tint: 'bg-partial text-partial-foreground' },
  { v: 'steps' as const, label: 'Step by step', text: 'An outline with blanks', icon: ListChecks, tint: 'bg-demonstrated text-demonstrated-foreground' },
  { v: 'solution' as const, label: 'Show solution', text: 'The full worked answer', icon: LifeBuoy, tint: 'bg-assist text-assist-foreground' },
]
const current = computed(() => levels.find(l => l.v === model.value)!)
function pick(v: HelpLevel) { v === 'solution' ? emit('solution') : (model.value = v) }
</script>

<template>
  <UiDropdownMenu>
    <UiDropdownMenuTrigger as-child>
      <button class="hover:bg-accent flex h-9 items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-sm font-medium transition-colors" aria-label="Help level">
        <span class="grid size-7 place-items-center rounded-full" :class="current.tint"><component :is="current.icon" class="size-4" /></span>
        {{ current.label }} <ChevronUp class="text-muted-foreground size-3.5" />
      </button>
    </UiDropdownMenuTrigger>
    <UiDropdownMenuContent align="end" side="top" class="w-72 p-1.5">
      <UiDropdownMenuLabel class="text-muted-foreground px-2 text-xs">How much help?</UiDropdownMenuLabel>
      <UiDropdownMenuItem v-for="l in levels" :key="l.v" class="h-14 gap-3" @select="pick(l.v)">
        <span class="grid size-9 shrink-0 place-items-center rounded-lg" :class="l.tint"><component :is="l.icon" class="size-4" /></span>
        <span class="min-w-0 flex-1"><span class="block text-sm font-medium">{{ l.label }}</span><span class="text-muted-foreground block text-xs">{{ l.text }}</span></span>
        <Check v-if="model === l.v" class="size-4" />
      </UiDropdownMenuItem>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>
