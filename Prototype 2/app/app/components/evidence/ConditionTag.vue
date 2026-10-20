<script setup lang="ts">
import { User, LifeBuoy, SkipForward, Clock } from '@lucide/vue'
import type { Condition } from '~/data/types'
import { conditionLabel } from '~/lib/evidence'

const props = defineProps<{ condition: Condition | 'none' }>()
const icons = { independent: User, assisted: LifeBuoy, skipped: SkipForward, deferred: Clock }
</script>

<template>
  <UiBadge v-if="props.condition !== 'none'" :variant="props.condition === 'assisted' ? 'assist' : 'neutral'">
    <component :is="icons[props.condition]" aria-hidden="true" />
    {{ conditionLabel[props.condition] }}
  </UiBadge>
  <UiBadge v-else variant="neutral">Not attempted</UiBadge>
</template>
