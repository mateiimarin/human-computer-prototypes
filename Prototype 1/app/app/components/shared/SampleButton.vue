<script setup lang="ts">
import { FlaskConical } from "@lucide/vue";

/** Fills an open-ended input with prepared text, so a tester can move through the flow without writing. */
</script>

<template>
  <button
    type="button"
    class="border-iris/60 bg-card text-iris focus-visible:ring-iris/30 inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border-2 border-dashed pr-3 pl-1.5 text-xs font-semibold whitespace-nowrap shadow-sm transition-transform duration-150 hover:scale-110 outline-none focus-visible:ring-4"
  >
    <span class="bg-iris inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase"><FlaskConical class="size-3" /> Test</span>
    <slot>Fill sample</slot>
  </button>
</template>
