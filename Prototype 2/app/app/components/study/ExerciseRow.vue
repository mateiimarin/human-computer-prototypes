<script setup lang="ts">
import type { Pack } from '~/data/types'

defineProps<{ pack: Pack; selected: boolean; status: { label: string; tone: string } }>()
const emit = defineEmits<{ select: [] }>()
</script>

<template>
  <button
    role="radio" :aria-checked="selected"
    class="group flex min-h-16 w-full items-center gap-4 rounded-xl border px-4 py-3 text-left transition-colors duration-150"
    :class="selected ? 'border-foreground bg-accent/50' : 'hover:bg-accent/40'"
    @click="emit('select')"
  >
    <span class="grid size-5 shrink-0 place-items-center rounded-full border" :class="selected ? 'border-foreground' : 'border-input'"><span v-if="selected" class="bg-foreground size-2.5 rounded-full" /></span>
    <span class="min-w-0 flex-1">
      <span class="block text-[15px] leading-6 font-medium"><RichText :text="pack.title" /></span>
      <span class="text-muted-foreground block text-sm">Exercise {{ pack.sheetNo }}</span>
    </span>
    <span class="hidden text-sm sm:block" :class="status.tone === 'assisted' ? 'text-assist-foreground' : status.tone === 'active' ? 'text-check-foreground' : 'text-muted-foreground'">{{ status.label }}</span>
  </button>
</template>
