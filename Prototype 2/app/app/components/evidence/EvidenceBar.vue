<script setup lang="ts">
import type { EvidenceState } from '~/data/types'
const props = defineProps<{ states: EvidenceState[] }>()
const bg: Record<EvidenceState, string> = {
  demonstrated: 'bg-demonstrated-dot', partial: 'bg-partial-dot', gap: 'bg-gap-dot',
  unverified: 'border border-dashed border-unverified-dot bg-transparent',
}
</script>

<template>
  <div class="flex h-2 w-full gap-1" aria-hidden="true">
    <span v-for="(s, i) in props.states" :key="i" class="flex-1 rounded-full transition-colors duration-500" :class="bg[s]" />
  </div>
</template>
