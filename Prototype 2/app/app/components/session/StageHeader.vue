<script setup lang="ts">
/** What to do on this screen, and what follows. No overline: the stage is already in the stepper. */
defineProps<{ title: string; description?: string; next?: string }>()
</script>

<template>
  <Reveal as="header" class="space-y-2 pb-8">
    <h1 id="screen-title" tabindex="-1" class="text-[28px] leading-[1.2] font-semibold outline-none sm:text-[32px]"><slot name="title">{{ title }}</slot></h1>
    <p v-if="description" class="text-muted-foreground max-w-xl text-base leading-7">{{ description }}</p>
    <p v-if="next" class="text-muted-foreground max-w-xl text-sm leading-6"><span class="text-foreground font-medium">Next:</span> {{ next }}</p>
  </Reveal>
</template>
