<script setup lang="ts">
import { useHighlightedCode } from "~/components/ui/code-block/useHighlightedCode";

const props = withDefaults(defineProps<{ code: string; lang?: string; title?: string; numbered?: boolean }>(), {
  lang: "python",
  numbered: true,
});
const lines = useHighlightedCode(
  () => props.code,
  () => props.lang,
);
</script>

<template>
  <UiCodeBlock class="bg-foreground/[0.04] rounded-2xl border-0 text-[13.5px]">
    <UiCodeBlockHeader v-if="title" class="pt-3.5 pr-3 pl-4">
      <UiCodeBlockTitle class="text-muted-foreground font-mono text-xs">{{ title }}</UiCodeBlockTitle>
      <UiCodeBlockActions class="ml-auto"><UiCodeBlockCopyButton :value="code" aria-label="Copy code" /></UiCodeBlockActions>
    </UiCodeBlockHeader>
    <UiCodeBlockContent :line-numbers="false" class="px-4 py-3.5 leading-7" :style="{ counterReset: 'line 0' }">
      <UiCodeBlockLine v-for="(line, i) in lines" :key="i">
        <UiCodeBlockToken v-for="(token, j) in line" :key="j" :token="token" />
      </UiCodeBlockLine>
    </UiCodeBlockContent>
  </UiCodeBlock>
</template>
