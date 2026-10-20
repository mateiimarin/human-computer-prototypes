<script setup lang="ts">
const props = defineProps<{ done: number; started?: number; total: number; tone?: "ink" | "light" }>();
</script>

<template>
  <div class="flex gap-1.5" role="img" :aria-label="`${done} of ${total} tasks finished`">
    <span
      v-for="i in total"
      :key="i"
      class="h-2 flex-1 rounded-full transition-colors duration-700"
      :class="
        i <= done
          ? 'bg-forest'
          : i <= done + (started ?? 0)
            ? 'bg-tangerine'
            : tone === 'light'
              ? 'bg-white/45'
              : 'bg-foreground/12'
      "
    />
  </div>
</template>
