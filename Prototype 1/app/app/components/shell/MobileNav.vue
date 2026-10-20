<script setup lang="ts">
import { BookOpen, History, Home, Settings } from "@lucide/vue";

const route = useRoute();
const nav = [
  { to: "/", label: "Today", icon: Home, match: (p: string) => p === "/" },
  { to: "/library", label: "Library", icon: BookOpen, match: (p: string) => p.startsWith("/library") || p.startsWith("/task") },
  { to: "/history", label: "History", icon: History, match: (p: string) => p.startsWith("/history") },
  { to: "/settings", label: "Settings", icon: Settings, match: (p: string) => p.startsWith("/settings") },
];
</script>

<template>
  <nav
    aria-label="Main"
    class="bg-card/92 fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
  >
    <ul class="mx-auto grid max-w-md grid-cols-4">
      <li v-for="item in nav" :key="item.to">
        <NuxtLink
          :to="item.to"
          :aria-current="item.match(route.path) ? 'page' : undefined"
          class="relative flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors"
          :class="item.match(route.path) ? 'text-foreground' : 'text-muted-foreground'"
        >
          <Motion
            v-if="item.match(route.path)"
            layout-id="tab-dot"
            class="bg-primary absolute top-0 h-1 w-10 rounded-b-full"
            :transition="{ type: 'spring', stiffness: 420, damping: 34 }"
          />
          <component :is="item.icon" class="size-6" :stroke-width="item.match(route.path) ? 2.4 : 1.8" />
          {{ item.label }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
