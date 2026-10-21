<script setup lang="ts">
import type { TaskContent } from "~/data/types";

defineProps<{ content: TaskContent; hideLabel?: boolean }>();
</script>

<template>
  <div class="space-y-5">
    <p v-if="!hideLabel" class="text-muted-foreground text-xs font-bold tracking-wide uppercase">Exercise</p>
    <p class="text-[17px] leading-8"><RichText :text="content.statement" /></p>
    <div v-if="content.givens.length" class="border-foreground/15 space-y-1.5 border-l-2 pl-4 text-[17px] leading-8">
      <p v-for="g in content.givens" :key="g"><RichText :text="g" /></p>
    </div>
    <CodeSnippet v-if="content.code" :code="content.code.source" :lang="content.code.lang" />
  </div>
</template>
