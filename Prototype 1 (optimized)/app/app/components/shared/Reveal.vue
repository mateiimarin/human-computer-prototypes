<script setup lang="ts">
/** Fade-and-rise entrance. `index` staggers siblings. */
const props = withDefaults(
  defineProps<{
    as?: string;
    index?: number;
    delay?: number;
    y?: number;
    scale?: number;
    duration?: number;
  }>(),
  { as: "div", index: 0, delay: 0, y: 18, scale: 1, duration: 0.6 },
);

// Motion's generic prop types don't accept a dynamic tag, so the bindings are built untyped.
// A page opened in a hidden tab never gets animation frames, so it renders in its final state instead.
const hiddenAtMount = import.meta.client && document.visibilityState === "hidden";
const motionProps = computed<Record<string, unknown>>(() => ({
  as: props.as,
  initial: hiddenAtMount ? false : { opacity: 0, y: props.y, scale: props.scale === 1 ? 1 : props.scale - 0.04 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: props.duration, delay: props.delay + props.index * 0.06, ease: [0.16, 1, 0.3, 1] },
}));
</script>

<template>
  <Motion v-bind="motionProps">
    <slot />
  </Motion>
</template>
