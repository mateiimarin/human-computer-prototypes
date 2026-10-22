<script setup lang="ts">
import { X } from '@lucide/vue'
const title = useState('focus-title', () => 'Practice')
const exit = useState<string>('focus-exit', () => '/concepts')
</script>

<template>
  <div class="min-h-dvh">
    <header class="bg-background/80 sticky top-0 z-30 flex h-14 items-center gap-3 px-3 backdrop-blur-xl sm:px-5">
      <UiTooltip>
        <UiTooltipTrigger as-child><UiButton variant="ghost" size="icon" class="rounded-lg" aria-label="Close" @click="navigateTo(exit)"><X /></UiButton></UiTooltipTrigger>
        <UiTooltipContent>Close</UiTooltipContent>
      </UiTooltip>
      <p class="text-sm font-medium">{{ title }}</p>
      <div class="ml-auto"><AboutButton /></div>
    </header>
    <main id="main" tabindex="-1" class="mx-auto w-full max-w-[44rem] px-4 pt-8 pb-32 outline-none sm:px-8"><slot /></main>
  </div>
</template>
