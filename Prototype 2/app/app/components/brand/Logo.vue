<script setup lang="ts">
withDefaults(defineProps<{ size?: number; word?: boolean }>(), { size: 28, word: true })
</script>

<template>
  <span class="inline-flex items-center gap-2.5">
    <svg :width="size" :height="size" viewBox="0 0 28 28" fill="none" aria-hidden="true" class="shrink-0">
      <rect width="28" height="28" rx="8" fill="var(--primary)" />
      <path d="M8 14.5l4 4 8-9" stroke="var(--primary-foreground)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <span v-if="word" class="text-[17px] leading-none font-semibold tracking-tight">Prove-it</span>
  </span>
</template>
