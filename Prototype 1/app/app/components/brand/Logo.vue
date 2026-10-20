<script setup lang="ts">
defineProps<{ compact?: boolean; light?: boolean }>();
</script>

<template>
  <span class="inline-flex items-center gap-2.5">
    <svg viewBox="0 0 40 40" class="size-9 shrink-0" aria-hidden="true">
      <rect width="40" height="40" rx="13" fill="var(--sun)" />
      <path
        d="M9 29 V23 H17 V17 H25 V11 H31"
        fill="none"
        stroke="var(--ink)"
        stroke-width="3.6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle cx="31" cy="29" r="3.2" fill="var(--coral)" />
    </svg>
    <span
      v-if="!compact"
      :class="[
        'font-display text-[19px] leading-none font-bold tracking-tight',
        light ? 'text-white' : 'text-foreground',
      ]"
      >Attempt First</span
    >
  </span>
</template>
