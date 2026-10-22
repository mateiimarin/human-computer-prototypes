<script setup lang="ts">
import { ArrowRight, ShieldQuestion, Bug } from '@lucide/vue'

const emit = defineEmits<{ continue: []; deeper: ['defend' | 'mistakes'] }>()
</script>

<template>
  <section aria-labelledby="next-title" class="space-y-6">
    <UiButton size="xl" class="w-full sm:w-auto" @click="emit('continue')">Continue to the final quiz <ArrowRight /></UiButton>

    <div class="space-y-3">
      <h2 id="next-title" class="text-muted-foreground text-sm font-medium">Optional extra check</h2>
      <ul class="divide-border border-border divide-y border-y">
        <li>
          <button class="hover:bg-accent/40 group -mx-3 flex w-[calc(100%+1.5rem)] items-center gap-4 rounded-lg px-3 py-4 text-left transition-colors" @click="emit('deeper', 'defend')">
            <span class="bg-check text-check-foreground grid size-10 shrink-0 place-items-center rounded-xl"><ShieldQuestion class="size-5" /></span>
            <span class="min-w-0 flex-1"><span class="block text-[15px] font-medium">Why does it work?</span><span class="text-muted-foreground block text-sm">Three short questions</span></span>
            <ArrowRight class="text-muted-foreground size-5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </li>
        <li>
          <button class="hover:bg-accent/40 group -mx-3 flex w-[calc(100%+1.5rem)] items-center gap-4 rounded-lg px-3 py-4 text-left transition-colors" @click="emit('deeper', 'mistakes')">
            <span class="bg-check text-check-foreground grid size-10 shrink-0 place-items-center rounded-xl"><Bug class="size-5" /></span>
            <span class="min-w-0 flex-1"><span class="block text-[15px] font-medium">Find the mistake</span><span class="text-muted-foreground block text-sm">Spot the wrong step</span></span>
            <ArrowRight class="text-muted-foreground size-5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </li>
      </ul>
    </div>
  </section>
</template>
