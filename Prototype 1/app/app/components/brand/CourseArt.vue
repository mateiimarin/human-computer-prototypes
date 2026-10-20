<script setup lang="ts">
import type { IlloName, Tone } from "~/data/types";

const props = withDefaults(
  defineProps<{ tone: Tone; illo: IlloName; animated?: boolean; bare?: boolean }>(),
  { animated: true },
);

const palettes: Record<Tone, { a: string; b: string; c1: string; c2: string; c3: string; c4: string }> = {
  sunrise: { a: "#ffd84d", b: "#ffb347", c1: "#ff8a3d", c2: "#ff6b5e", c3: "#fff1cc", c4: "#d9531e" },
  dusk: { a: "#6c4bd8", b: "#b45bd0", c1: "#ff7a6b", c2: "#ffc2b5", c3: "#3f2b96", c4: "#cbbcff" },
  sky: { a: "#bfe0ff", b: "#86b7ff", c1: "#2f5bea", c2: "#ffffff", c3: "#9ccaff", c4: "#ffc93c" },
  meadow: { a: "#bdf0cf", b: "#7fd6a6", c1: "#1f7a53", c2: "#3fae7c", c3: "#fff1cc", c4: "#ffc93c" },
  coral: { a: "#ffd1c2", b: "#ff9f8a", c1: "#ff6b5e", c2: "#fff1cc", c3: "#6c4bd8", c4: "#ffc93c" },
};
const p = computed(() => palettes[props.tone]);
const gid = useId();
</script>

<template>
  <svg
    viewBox="0 0 400 300"
    preserveAspectRatio="xMidYMid slice"
    class="size-full"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <linearGradient :id="`g-${gid}`" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" :stop-color="p.a" />
        <stop offset="1" :stop-color="p.b" />
      </linearGradient>
    </defs>
    <rect v-if="!bare" width="400" height="300" :fill="`url(#g-${gid})`" />

    <!-- stairs -->
    <g v-if="illo === 'stairs'">
      <circle cx="318" cy="84" r="46" :fill="p.c3" :class="animated ? 'animate-float' : ''" />
      <path d="M0 300 V236 H110 V190 H210 V144 H310 V98 H400 V300 Z" :fill="p.c2" opacity=".55" />
      <path d="M0 300 V262 H110 V222 H210 V182 H310 V142 H400 V300 Z" :fill="p.c1" />
      <path d="M0 300 V288 H110 V262 H210 V236 H310 V210 H400 V300 Z" :fill="p.c4" opacity=".9" />
      <circle cx="60" cy="70" r="10" :fill="p.c3" opacity=".8" />
      <circle cx="108" cy="110" r="5" :fill="p.c3" opacity=".6" />
    </g>

    <!-- hills -->
    <g v-else-if="illo === 'hills'">
      <circle cx="82" cy="78" r="38" :fill="p.c4" :class="animated ? 'animate-float' : ''" />
      <path d="M-20 240 C60 150 150 160 220 220 C280 270 340 120 430 170 V310 H-20 Z" :fill="p.c2" />
      <path d="M-20 270 C80 200 170 230 250 262 C310 286 360 230 430 250 V310 H-20 Z" :fill="p.c1" />
      <circle cx="290" cy="170" r="22" :fill="p.c3" />
      <rect x="287" y="186" width="6" height="30" rx="3" :fill="p.c1" />
    </g>

    <!-- orbit -->
    <g v-else-if="illo === 'orbit'">
      <g :class="animated ? 'animate-drift origin-[300px_150px]' : ''" style="transform-box: fill-box">
        <circle cx="300" cy="150" r="110" fill="none" :stroke="p.c4" stroke-width="2.5" opacity=".55" stroke-dasharray="2 10" stroke-linecap="round" />
        <circle cx="410" cy="150" r="12" :fill="p.c2" />
      </g>
      <circle cx="300" cy="150" r="78" fill="none" :stroke="p.c4" stroke-width="2.5" opacity=".7" />
      <circle cx="300" cy="150" r="52" :fill="p.c1" />
      <circle cx="300" cy="150" r="26" :fill="p.c2" />
      <circle cx="96" cy="232" r="34" :fill="p.c3" opacity=".7" />
      <circle cx="60" cy="86" r="9" :fill="p.c4" />
    </g>

    <!-- blocks -->
    <g v-else-if="illo === 'blocks'">
      <rect x="226" y="132" width="96" height="96" rx="26" :fill="p.c1" transform="rotate(-8 274 180)" />
      <rect x="150" y="176" width="84" height="84" rx="42" :fill="p.c2" />
      <path d="M296 120 L340 56 L384 120 Z" :fill="p.c3" :class="animated ? 'animate-float-slow' : ''" />
      <rect x="40" y="206" width="90" height="54" rx="27" :fill="p.c4" />
      <circle cx="90" cy="80" r="18" :fill="p.c3" opacity=".8" />
    </g>

    <!-- waves -->
    <g v-else-if="illo === 'waves'">
      <circle cx="310" cy="84" r="42" :fill="p.c4" :class="animated ? 'animate-float' : ''" />
      <path d="M0 170 C60 130 110 210 180 170 S300 130 400 180 V300 H0 Z" :fill="p.c3" opacity=".8" />
      <path d="M0 210 C70 170 120 250 200 210 S320 180 400 224 V300 H0 Z" :fill="p.c1" />
      <path d="M0 256 C80 226 140 286 220 252 S340 236 400 262 V300 H0 Z" :fill="p.c2" />
    </g>

    <!-- sun -->
    <g v-else>
      <circle cx="200" cy="262" r="132" :fill="p.c3" opacity=".6" />
      <circle cx="200" cy="262" r="96" :fill="p.c1" />
      <circle cx="200" cy="262" r="58" :fill="p.c2" />
      <circle cx="70" cy="70" r="12" :fill="p.c4" />
      <circle cx="338" cy="96" r="8" :fill="p.c4" />
    </g>
  </svg>
</template>
