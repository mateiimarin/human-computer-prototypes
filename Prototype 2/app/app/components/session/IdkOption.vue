<script setup lang="ts">
/** “I don’t know” is an answer, not a skip: it records an attempt. */
defineProps<{ selected: boolean }>()
defineEmits<{ select: [] }>()
</script>

<template>
  <button
    class="text-muted-foreground hover:bg-accent/50 flex min-h-12 w-full items-center gap-4 rounded-xl border px-4 text-left text-[15px] transition-colors"
    :class="selected && 'border-foreground bg-accent/60 text-foreground'" role="radio" :aria-checked="selected" @click="$emit('select')"
  >
    <span class="grid size-5 shrink-0 place-items-center rounded-full border" :class="selected ? 'border-foreground' : 'border-input'"><span v-if="selected" class="bg-foreground size-2.5 rounded-full" /></span>
    I don’t know
  </button>
</template>
