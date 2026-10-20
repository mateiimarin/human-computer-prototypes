<script setup lang="ts">
import { Check } from '@lucide/vue'
import { stages, type Stage } from '~/lib/session'

/** Four landmarks, never a percentage. A stage that was only partly verified carries a dashed ring. */
const props = defineProps<{ current: Stage; skipped?: Stage[] }>()
const idx = computed(() => stages.findIndex(s => s.id === props.current))
</script>

<template>
  <nav aria-label="Session stages" class="hidden items-center md:flex">
    <ol class="flex items-center gap-1">
      <li v-for="(s, i) in stages" :key="s.id" :aria-current="i === idx ? 'step' : undefined">
        <span
          class="flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium transition-colors duration-200"
          :class="i === idx ? (s.id === 'verify' ? 'bg-check text-check-foreground' : 'bg-foreground text-background') : i < idx ? 'text-foreground' : 'text-muted-foreground'"
        >
          <Check v-if="i < idx && !skipped?.includes(s.id)" class="size-3.5" :stroke-width="3" />
          <span v-else-if="skipped?.includes(s.id)" class="size-3.5 rounded-full border border-dashed border-current" aria-label="partly unverified" />
          {{ s.label }}
        </span>
      </li>
    </ol>
  </nav>
  <p class="text-muted-foreground text-sm font-medium md:hidden">
    <span class="text-foreground">{{ stages[idx]?.label }}</span> · {{ idx + 1 }} of 4
  </p>
</template>
