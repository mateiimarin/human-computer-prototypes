<script setup lang="ts">
defineProps<{ title: string; text?: string }>()
</script>

<template>
  <div class="flex flex-col items-center gap-3 px-6 py-14 text-center">
    <div class="bg-muted text-muted-foreground grid size-12 place-items-center rounded-2xl"><slot name="icon" /></div>
    <div class="max-w-sm space-y-1.5">
      <h3 class="text-[17px] font-semibold">{{ title }}</h3>
      <p v-if="text" class="text-muted-foreground text-[15px] leading-6">{{ text }}</p>
    </div>
    <div v-if="$slots.default" class="mt-2 flex flex-wrap justify-center gap-2"><slot /></div>
  </div>
</template>
