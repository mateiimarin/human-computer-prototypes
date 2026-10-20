<script setup lang="ts">
const props = defineProps<{ blocks: string[] }>();

function plain(s: string) {
  return s
    .replace(/\\geq/g, "≥")
    .replace(/\\leq/g, "≤")
    .replace(/\\cdot/g, "·")
    .replace(/\\dots/g, "…")
    .replace(/\\mid/g, "|")
    .replace(/\\max/g, "max")
    .replace(/\\mathcal\{P\}/g, "P")
    .replace(/\\subseteq/g, "⊆")
    .replace(/\\sum/g, "Σ")
    .replace(/\\Theta/g, "Θ")
    .replace(/\\log/g, "log")
    .replace(/[_^]\{([^}]*)\}/g, "$1")
    .replace(/\$/g, "")
    .replace(/\\/g, "");
}
function wrap(text: string, n = 44) {
  const out: string[] = [];
  text.split("\n").forEach((para) => {
    let line = "";
    para.split(" ").forEach((w) => {
      if ((line + " " + w).trim().length > n) {
        out.push(line.trim());
        line = w;
      } else line = `${line} ${w}`;
    });
    if (line.trim()) out.push(line.trim());
  });
  return out;
}
const lines = computed(() => {
  const all: { t: string; y: number; x: number; r: number }[] = [];
  let y = 62;
  props.blocks.forEach((b, bi) => {
    wrap(`${bi + 1}) ${plain(b)}`).forEach((t, i) => {
      all.push({ t, y, x: 44 + (i ? 14 : 0) + ((y * 7) % 5), r: ((y * 13) % 7) / 10 - 0.3 });
      y += 31;
    });
    y += 10;
  });
  return all;
});
const height = computed(() => Math.max(300, (lines.value.at(-1)?.y ?? 200) + 60));
</script>

<template>
  <svg :viewBox="`0 0 520 ${height}`" class="w-full" role="img" aria-label="Photo of handwritten work on lined paper">
    <rect width="520" :height="height" fill="#fffdf6" />
    <g stroke="#cfd9ee" stroke-width="1.2">
      <line v-for="n in Math.floor(height / 31)" :key="n" x1="0" :y1="n * 31 + 10" x2="520" :y2="n * 31 + 10" />
    </g>
    <line x1="32" y1="0" x2="32" :y2="height" stroke="#f3a7a0" stroke-width="1.6" />
    <text
      v-for="(l, i) in lines"
      :key="i"
      :x="l.x"
      :y="l.y"
      :transform="`rotate(${l.r} ${l.x} ${l.y})`"
      font-family="Caveat, cursive"
      font-size="24"
      fill="#1d3a8a"
    >{{ l.t }}</text>
  </svg>
</template>
