<script setup lang="ts">
type Kind = "you" | "prompted" | "supplied" | "setting" | "mixed" | "unclear" | "gap" | "ok" | "neutral" | "sun" | "ink";
withDefaults(defineProps<{ kind?: Kind }>(), { kind: "neutral" });
const styles: Record<Kind, string> = {
  you: "bg-student text-student-foreground",
  prompted: "bg-guidance text-guidance-foreground",
  supplied: "bg-ai-supplied text-ai-supplied-foreground",
  setting: "bg-unclear text-unclear-foreground",
  mixed: "bg-mixed text-mixed-foreground",
  unclear: "bg-unclear text-unclear-foreground",
  gap: "bg-warning text-warning-foreground",
  ok: "bg-success text-success-foreground",
  neutral: "bg-secondary text-foreground/80",
  sun: "bg-primary text-primary-foreground",
  ink: "bg-foreground text-background",
};
</script>

<template>
  <span
    :class="[
      'inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap [&>svg]:size-3.5',
      styles[kind],
    ]"
  >
    <slot />
  </span>
</template>
