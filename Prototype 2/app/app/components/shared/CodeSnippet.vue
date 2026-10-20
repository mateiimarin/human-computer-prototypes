<script setup lang="ts">
import { useHighlightedCode } from '~/components/ui/code-block/useHighlightedCode'

const props = withDefaults(defineProps<{ code: string; lang?: string; title?: string; marks?: Record<number, 'ok' | 'note' | 'issue'> }>(), { lang: 'python' })
const lines = useHighlightedCode(() => props.code, () => props.lang)
const markClass = { ok: 'bg-demonstrated/60 border-demonstrated-dot', note: 'bg-partial/60 border-partial-dot', issue: 'bg-gap/60 border-gap-dot' } as const
</script>

<template>
  <UiCodeBlock class="bg-muted/50 overflow-hidden rounded-xl border-0 text-[13.5px]">
    <UiCodeBlockHeader v-if="title" class="px-4 pt-3.5">
      <UiCodeBlockTitle class="text-muted-foreground font-mono text-xs">{{ title }}</UiCodeBlockTitle>
      <UiCodeBlockActions class="ml-auto"><UiCodeBlockCopyButton :value="code" aria-label="Copy code" /></UiCodeBlockActions>
    </UiCodeBlockHeader>
    <UiCodeBlockContent :line-numbers="false" class="py-3.5 leading-7">
      <UiCodeBlockLine
        v-for="(line, i) in lines" :key="i"
        class="border-l-2 px-4"
        :class="marks?.[i + 1] ? markClass[marks[i + 1]!] : 'border-transparent'"
      >
        <span class="text-muted-foreground/60 mr-4 inline-block w-4 text-right text-xs select-none" aria-hidden="true">{{ i + 1 }}</span>
        <UiCodeBlockToken v-for="(token, j) in line" :key="j" :token="token" />
      </UiCodeBlockLine>
    </UiCodeBlockContent>
  </UiCodeBlock>
</template>
