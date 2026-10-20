<script setup lang="ts">
const props = withDefaults(defineProps<{ to: number; duration?: number; delay?: number }>(), { duration: 900, delay: 150 });
const shown = ref(0);
onMounted(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || props.to === 0) {
    shown.value = props.to;
    return;
  }
  const start = performance.now() + props.delay;
  const tick = (now: number) => {
    const t = Math.min(1, Math.max(0, (now - start) / props.duration));
    shown.value = Math.round(props.to * (1 - Math.pow(1 - t, 3)));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
</script>

<template>
  <span class="tabular-nums">{{ shown }}</span>
</template>
