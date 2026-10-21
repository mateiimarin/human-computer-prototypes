<script setup lang="ts">
/**
 * Wraps an open-ended input. While the input is focused, a "Test · Fill sample" chip appears instantly on its top edge
 * and sends the prepared text to the parent. The chip keeps focus in the input so it doesn't vanish on click.
 */
defineProps<{ label: string }>();
const emit = defineEmits<{ fill: [] }>();
</script>

<template>
  <div class="group relative">
    <slot />
    <SampleButton
      class="invisible absolute -top-3.5 right-3 z-10 group-focus-within:visible"
      :aria-label="`Fill sample text: ${label}`"
      @mousedown.prevent
      @click="emit('fill')"
    />
  </div>
</template>
