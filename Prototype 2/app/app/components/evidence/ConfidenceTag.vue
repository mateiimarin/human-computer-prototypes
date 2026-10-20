<script setup lang="ts">
import type { Confidence } from '~/data/types'
import { confidenceLabel } from '~/lib/evidence'
const props = defineProps<{ confidence: Confidence | null }>()
</script>
<template>
  <span v-if="props.confidence" class="text-muted-foreground text-sm">Confidence: {{ confidenceLabel[props.confidence].toLowerCase() }}</span>
</template>
