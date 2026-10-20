<script setup lang="ts">
import { Sprout } from "@lucide/vue";
import type { TaskContent } from "~/data/types";

defineProps<{ content: TaskContent; title: string; number: number; hideTitle?: boolean }>();
</script>

<template>
  <div class="space-y-5">
    <div v-if="!hideTitle" class="space-y-1">
      <p class="text-muted-foreground text-xs font-bold tracking-wide uppercase">Task {{ number }}</p>
      <h2 class="font-display text-2xl leading-tight font-bold">{{ title }}</h2>
    </div>
    <p class="text-[17px] leading-8"><RichText :text="content.statement" /></p>
    <div v-if="content.givens.length" class="border-foreground/15 space-y-1.5 border-l-2 pl-4 text-[17px] leading-8">
      <p v-for="g in content.givens" :key="g"><RichText :text="g" /></p>
    </div>
    <CodeSnippet v-if="content.code" :code="content.code.source" :lang="content.code.lang" />
    <p class="text-muted-foreground flex items-start gap-2.5 text-sm leading-relaxed"><Sprout class="text-forest mt-0.5 size-4 shrink-0" /> {{ content.reminder }}</p>
  </div>
</template>
