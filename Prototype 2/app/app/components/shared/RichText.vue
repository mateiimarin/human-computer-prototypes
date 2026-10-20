<script setup lang="ts">
import katex from 'katex'

/** Renders plain text with $math$, $$display math$$, `inline code`, **bold** and *italic*. */
const props = defineProps<{ text: string; block?: boolean }>()

type Part =
  | { kind: 'text'; text: string }
  | { kind: 'math'; html: string; display: boolean }
  | { kind: 'code'; text: string }
  | { kind: 'bold'; text: string }
  | { kind: 'em'; text: string }
  | { kind: 'error'; text: string }

const parts = computed<Part[]>(() =>
  props.text
    .split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+\$|`[^`\n]+`|\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g)
    .filter(Boolean)
    .map((part): Part => {
      if (/^`[^`\n]+`$/.test(part)) return { kind: 'code', text: part.slice(1, -1) }
      if (/^\*\*[^*\n]+\*\*$/.test(part)) return { kind: 'bold', text: part.slice(2, -2) }
      if (/^\*[^*\n]+\*$/.test(part)) return { kind: 'em', text: part.slice(1, -1) }
      if (!/^\$\$[\s\S]+\$\$$|^\$[^$\n]+\$$/.test(part)) return { kind: 'text', text: part }
      const display = part.startsWith('$$')
      const source = part.slice(display ? 2 : 1, display ? -2 : -1)
      try {
        return {
          kind: 'math', display,
          html: katex.renderToString(source, { displayMode: display, output: 'htmlAndMathml', trust: false, strict: 'ignore', throwOnError: true, maxExpand: 100, maxSize: 20 }),
        }
      } catch {
        return { kind: 'error', text: part }
      }
    }),
)
</script>

<template>
  <component :is="block ? 'div' : 'span'" class="whitespace-pre-wrap">
    <template v-for="(part, i) in parts" :key="i">
      <span v-if="part.kind === 'math'" :class="part.display ? 'block overflow-x-auto' : ''" v-html="part.html" />
      <code v-else-if="part.kind === 'code'" class="bg-foreground/[0.08] rounded-md px-1.5 py-0.5 font-mono text-[0.86em]">{{ part.text }}</code>
      <strong v-else-if="part.kind === 'bold'" class="font-semibold">{{ part.text }}</strong>
      <em v-else-if="part.kind === 'em'" class="italic">{{ part.text }}</em>
      <span v-else-if="part.kind === 'error'" class="bg-gap text-gap-foreground rounded px-1 font-mono text-sm">{{ part.text }}</span>
      <template v-else>{{ part.text }}</template>
    </template>
  </component>
</template>
