<script setup lang="ts">
import type { EvidenceState } from '~/data/types'

/** One arc per concept, each with its own state. Unverified arcs are dashed, never filled. */
const props = withDefaults(defineProps<{ states: EvidenceState[]; size?: number; stroke?: number; label?: string }>(), { size: 96, stroke: 9 })
const r = computed(() => (props.size - props.stroke) / 2)
const cx = computed(() => props.size / 2)

const arcs = computed(() => {
  const n = Math.max(props.states.length, 1)
  const gapDeg = props.states.length > 1 ? 360 * (props.stroke * 0.9) / (2 * Math.PI * r.value) + 2 : 0
  const span = 360 / n - gapDeg
  const pt = (deg: number) => {
    const a = ((deg - 90) * Math.PI) / 180
    return [cx.value + r.value * Math.cos(a), cx.value + r.value * Math.sin(a)]
  }
  return props.states.map((state, i) => {
    const start = i * (360 / n) + gapDeg / 2
    const end = start + span
    const [x1, y1] = pt(start)
    const [x2, y2] = pt(end)
    const large = span > 180 ? 1 : 0
    return { state, d: `M ${x1} ${y1} A ${r.value} ${r.value} 0 ${large} 1 ${x2} ${y2}` }
  })
})
const colors: Record<EvidenceState, string> = {
  demonstrated: 'var(--evidence-demonstrated-dot)', partial: 'var(--evidence-partial-dot)',
  gap: 'var(--evidence-gap-dot)', unverified: 'var(--evidence-unverified-dot)',
}
</script>

<template>
  <div class="relative grid shrink-0 place-items-center" :style="{ width: `${size}px`, height: `${size}px` }" role="img" :aria-label="label">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
      <path
        v-for="(a, i) in arcs" :key="i" :d="a.d" fill="none" :stroke="colors[a.state]"
        :stroke-width="a.state === 'unverified' ? Math.max(stroke - 4, 2.5) : stroke"
        :stroke-linecap="a.state === 'unverified' ? 'butt' : 'round'"
        :stroke-dasharray="a.state === 'unverified' ? '2.5 4' : undefined"
        pathLength="100" class="ring-seg" :style="{ animationDelay: `${120 + i * 90}ms` }"
      />
    </svg>
    <div class="absolute inset-0 grid place-content-center text-center"><slot /></div>
  </div>
</template>

<style scoped>
.ring-seg { animation: ring-in 650ms var(--ease-out) both; }
@keyframes ring-in { from { opacity: 0; transform: scale(.94); transform-origin: center; } }
</style>
