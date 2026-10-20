<script setup lang="ts">
defineProps<{ eyebrow?: string; title: string; text?: string }>();
</script>

<template>
  <header class="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
    <div class="max-w-2xl space-y-2">
      <Reveal v-if="eyebrow" as="p" :y="8" class="text-muted-foreground text-sm font-semibold">
        {{ eyebrow }}
      </Reveal>
      <Reveal as="h1" :delay="0.04" class="font-display text-[2.1rem] leading-[1.05] font-bold text-balance sm:text-[2.6rem]">
        {{ title }}
      </Reveal>
      <Reveal v-if="text" as="p" :delay="0.1" class="text-muted-foreground text-pretty text-[17px] leading-relaxed">
        {{ text }}
      </Reveal>
    </div>
    <Reveal v-if="$slots.default" :delay="0.16" class="flex items-center gap-2">
      <slot />
    </Reveal>
  </header>
</template>
