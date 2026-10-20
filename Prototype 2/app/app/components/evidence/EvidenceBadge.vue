<script setup lang="ts">
import { CircleCheck, Contrast, CircleAlert, CircleDashed } from '@lucide/vue'
import type { EvidenceState } from '~/data/types'
import { stateLabel, stateShort } from '~/lib/evidence'

const props = defineProps<{ state: EvidenceState; short?: boolean }>()
const icons = { demonstrated: CircleCheck, partial: Contrast, gap: CircleAlert, unverified: CircleDashed }
</script>

<template>
  <UiBadge :variant="props.state">
    <component :is="icons[props.state]" aria-hidden="true" />
    {{ props.short ? stateShort[props.state] : stateLabel[props.state] }}
  </UiBadge>
</template>
