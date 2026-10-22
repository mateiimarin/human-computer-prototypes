<script setup lang="ts">
/**
 * Wraps a free-text input. While the input has focus, a “Fill sample” chip hangs on its top edge and sends the prepared
 * text to the parent. The chip appears and goes away instantly. It keeps focus in the input, so a click does not hide it.
 */
withDefaults(defineProps<{ label: string; inline?: boolean }>(), { inline: false })
const emit = defineEmits<{ fill: [] }>()
</script>

<template>
  <div class="group relative" :class="inline ? 'inline-block' : 'block'">
    <slot />
    <SampleChip
      class="invisible absolute -top-3.5 right-3 z-10 group-focus-within:visible"
      :aria-label="`Fill sample text: ${label}`"
      @mousedown.prevent
      @click="emit('fill')"
    />
  </div>
</template>
