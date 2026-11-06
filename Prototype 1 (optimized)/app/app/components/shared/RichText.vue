<script setup lang="ts">
import katex from "katex";

/** Renders plain text with $math$, $$display math$$ and `inline code`. */
const props = defineProps<{ text: string }>();

type Part =
  | { kind: "text"; text: string }
  | { kind: "math"; html: string }
  | { kind: "code"; text: string }
  | { kind: "error"; text: string };

const parts = computed<Part[]>(() =>
  props.text
    .split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+\$|`[^`\n]+`)/g)
    .filter(Boolean)
    .map((part): Part => {
      if (/^`[^`\n]+`$/.test(part)) return { kind: "code", text: part.slice(1, -1) };
      if (!/^\$\$[\s\S]+\$\$$|^\$[^$\n]+\$$/.test(part)) return { kind: "text", text: part };
      const display = part.startsWith("$$");
      const source = part.slice(display ? 2 : 1, display ? -2 : -1);
      try {
        return {
          kind: "math",
          html: katex.renderToString(source, {
            displayMode: display,
            output: "htmlAndMathml",
            trust: false,
            strict: "ignore",
            throwOnError: true,
            maxExpand: 100,
            maxSize: 20,
          }),
        };
      } catch {
        return { kind: "error", text: part };
      }
    }),
);
</script>

<template>
  <span class="whitespace-pre-wrap">
    <template v-for="(part, i) in parts" :key="i">
      <span v-if="part.kind === 'math'" v-html="part.html" />
      <code
        v-else-if="part.kind === 'code'"
        class="bg-foreground/7 rounded-md px-1.5 py-0.5 font-mono text-[0.88em]"
        >{{ part.text }}</code
      >
      <span
        v-else-if="part.kind === 'error'"
        class="bg-danger-surface text-destructive rounded px-1 font-mono text-sm"
        >{{ part.text }}</span
      >
      <template v-else>{{ part.text }}</template>
    </template>
  </span>
</template>
