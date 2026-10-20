<script setup lang="ts">
import type { Confidence } from '~/data/types'

const model = defineModel<Confidence | null>({ default: null })
withDefaults(defineProps<{ label?: string }>(), { label: 'How sure are you?' })
const opts = [
  { v: 'low' as const, label: 'Low' },
  { v: 'medium' as const, label: 'Medium' },
  { v: 'high' as const, label: 'High' },
]
</script>

<template>
  <div class="flex flex-wrap items-center gap-x-4 gap-y-2" role="group" :aria-label="label">
    <span class="text-muted-foreground text-sm">{{ label }}</span>
    <UiToggleGroup type="single" :model-value="model ?? undefined" class="bg-muted gap-0.5 rounded-lg p-1" @update:model-value="(v) => (model = (v as Confidence) || null)">
      <UiToggleGroupItem v-for="o in opts" :key="o.v" :value="o.v" :aria-label="`${o.label} confidence`" class="h-8 rounded-md px-3.5 text-[13px]">{{ o.label }}</UiToggleGroupItem>
    </UiToggleGroup>
  </div>
</template>
