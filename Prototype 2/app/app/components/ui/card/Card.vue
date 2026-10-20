<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "cn"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    data-slot="card"
    :class="
      cn(
        'bg-surface-raised text-card-foreground flex flex-col gap-5 rounded-xl py-6',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
