<script setup lang="ts">
/** Fade-and-rise entrance. `index` staggers siblings. */
const props = withDefaults(defineProps<{ as?: string; index?: number; delay?: number; y?: number; duration?: number }>(), {
  as: 'div', index: 0, delay: 0, y: 8, duration: 0.35,
})
// A page opened in a hidden tab never gets animation frames, so it renders in its final state instead.
const hiddenAtMount = import.meta.client && document.visibilityState === 'hidden'
const motionProps = computed<Record<string, unknown>>(() => ({
  as: props.as,
  initial: hiddenAtMount ? false : { opacity: 0, y: props.y },
  animate: { opacity: 1, y: 0 },
  transition: { duration: props.duration, delay: props.delay + Math.min(props.index, 6) * 0.04, ease: [0.16, 1, 0.3, 1] },
}))
</script>

<template>
  <Motion v-bind="motionProps"><slot /></Motion>
</template>
