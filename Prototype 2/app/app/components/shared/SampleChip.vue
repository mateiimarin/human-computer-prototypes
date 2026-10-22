<script setup lang="ts">
import { FlaskConical } from '@lucide/vue'

/**
 * The testing aid: a dashed chip with a purple TEST tag. It reads as a tool for testers, not as part of the product.
 * No fade, and no colour change on hover; the only animation is a small scale-up.
 */
</script>

<template>
  <button
    type="button"
    class="border-assist-foreground/60 bg-background text-assist-foreground inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border-2 border-dashed pr-3 pl-1.5 text-xs font-semibold whitespace-nowrap shadow-sm transition-transform duration-150 outline-none hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-assist-foreground"
  >
    <span class="bg-assist-foreground text-background inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase"><FlaskConical class="size-3" aria-hidden="true" /> Test</span>
    <slot>Fill sample</slot>
  </button>
</template>
