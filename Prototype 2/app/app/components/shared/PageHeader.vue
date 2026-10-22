<script setup lang="ts">
defineProps<{ title: string; description?: string }>()
</script>

<template>
  <Reveal as="header" class="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 pb-6 sm:pb-8">
    <div class="min-w-0 space-y-2">
      <h1 class="text-[28px] leading-9 font-semibold sm:text-[32px] sm:leading-10" tabindex="-1"><slot name="title">{{ title }}</slot></h1>
      <p v-if="description" class="text-muted-foreground max-w-xl text-base leading-7">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="flex flex-wrap items-center gap-2"><slot name="actions" /></div>
  </Reveal>
</template>
