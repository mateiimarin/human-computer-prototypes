<script setup lang="ts">
import { EyeOff, LifeBuoy } from '@lucide/vue'
defineProps<{ assisted?: boolean }>()
const { confirmRefs, refs } = useLeave()
</script>

<template>
  <div role="status" class="sticky top-14 z-20 px-3 sm:px-5">
    <div class="mx-auto flex max-w-3xl items-center gap-3 rounded-xl py-2 pr-2 pl-4 text-sm backdrop-blur-xl" :class="assisted ? 'bg-assist/90 text-assist-foreground' : 'bg-check/90 text-check-foreground'">
      <component :is="assisted ? LifeBuoy : EyeOff" class="size-4 shrink-0" aria-hidden="true" />
      <p class="min-w-0 flex-1 leading-5">
        <template v-if="assisted"><strong class="font-semibold">Assisted.</strong> This check no longer counts as independent evidence.</template>
        <template v-else><strong class="font-semibold">Independent check.</strong> Your chat and solutions are hidden.</template>
      </p>
      <UiButton variant="ghost" size="sm" class="h-8 shrink-0 text-inherit hover:bg-black/10 dark:hover:bg-white/10" @click="assisted ? (refs = true) : (confirmRefs = true)">
        {{ assisted ? 'Open references' : 'Show references' }}
      </UiButton>
    </div>
  </div>
</template>
