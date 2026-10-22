<script setup lang="ts">
import { ArrowRight, RotateCcw } from '@lucide/vue'
import type { Pack } from '~/data/types'

const props = defineProps<{ pack: Pack; states: ('demonstrated' | 'partial' | 'gap' | 'unverified')[]; status: { label: string; tone: string }; inProgress: boolean }>()
const emit = defineEmits<{ open: []; startOver: [] }>()
</script>

<template>
  <div class="flex flex-wrap items-center gap-x-4 gap-y-3 py-4">
    <EvidenceRing :states="states" :size="44" :stroke="5" :label="`${pack.title}: results for its concepts`" />
    <div class="min-w-0 flex-1 basis-56 space-y-0.5">
      <p class="text-[17px] leading-6 font-medium"><RichText :text="pack.title" /></p>
      <p class="text-sm" :class="status.tone === 'assisted' ? 'text-assist-foreground' : status.tone === 'active' ? 'text-check-foreground' : 'text-muted-foreground'">Exercise {{ pack.sheetNo }} · {{ status.label }}</p>
      <p class="text-muted-foreground text-sm">Concepts: {{ props.pack.subs.map(s => s.name).join(' · ') }}</p>
    </div>
    <div class="flex items-center gap-1">
      <UiButton v-if="inProgress" variant="ghost" size="sm" :aria-label="`Start over: ${pack.title}`" @click="emit('startOver')"><RotateCcw /> Start over</UiButton>
      <UiButton :aria-label="`${inProgress ? 'Resume' : 'Start'}: ${pack.title}`" @click="emit('open')">{{ inProgress ? 'Resume' : 'Start' }} <ArrowRight /></UiButton>
    </div>
  </div>
</template>
