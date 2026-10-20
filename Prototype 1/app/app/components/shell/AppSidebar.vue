<script setup lang="ts">
import { BookOpen, History, Home, Plus, Search, Settings } from "@lucide/vue";

const route = useRoute();
const app = useApp();
const cmd = useCommandMenu();

const nav = [
  { to: "/", label: "Today", icon: Home, match: (p: string) => p === "/" },
  { to: "/library", label: "Library", icon: BookOpen, match: (p: string) => p.startsWith("/library") || p.startsWith("/task") },
  { to: "/history", label: "History", icon: History, match: (p: string) => p.startsWith("/history") },
  { to: "/settings", label: "Settings", icon: Settings, match: (p: string) => p.startsWith("/settings") },
];
const active = computed(() => app.activeSessions.value[0]);
const activeTask = computed(() => (active.value ? app.task(active.value.taskId) : undefined));
</script>

<template>
  <aside class="sticky top-0 hidden h-dvh w-[272px] shrink-0 flex-col gap-5 px-4 py-6 lg:flex">
    <NuxtLink to="/" class="px-2" aria-label="Attempt First, home"><Logo /></NuxtLink>

    <button
      class="bg-foreground/6 text-muted-foreground hover:bg-foreground/9 flex h-11 items-center gap-2.5 rounded-full px-4 text-sm transition-colors"
      @click="cmd.open.value = true"
    >
      <Search class="size-4" />
      <span class="flex-1 text-left">Search</span>
      <UiKbd>⌘K</UiKbd>
    </button>

    <nav aria-label="Main" class="flex flex-col gap-1">
      <NuxtLink
        v-for="item in nav"
        :key="item.to"
        :to="item.to"
        :aria-current="item.match(route.path) ? 'page' : undefined"
        class="group relative flex h-12 items-center gap-3 rounded-full px-4 text-[15px] font-semibold transition-colors"
        :class="item.match(route.path) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'"
      >
        <Motion
          v-if="item.match(route.path)"
          layout-id="nav-pill"
          class="bg-card absolute inset-0 rounded-full shadow-md"
          :transition="{ type: 'spring', stiffness: 420, damping: 34 }"
        />
        <component :is="item.icon" class="relative size-5" :stroke-width="item.match(route.path) ? 2.4 : 1.9" />
        <span class="relative">{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <UiButton size="lg" class="w-full" @click="navigateTo('/library/new')"><Plus /> Add exercise sheet</UiButton>

    <div class="mt-auto space-y-3">
      <Transition
        enter-active-class="transition duration-500 ease-out"
        enter-from-class="translate-y-3 opacity-0"
      >
        <NuxtLink
          v-if="active && activeTask"
          :to="`/task/${active.taskId}/${active.phase === 'setup' ? 'setup' : active.phase === 'done' ? 'reflect' : active.phase}`"
          class="group block rounded-3xl p-4 text-white transition-transform hover:-translate-y-0.5"
          style="background: var(--grad-dusk)"
        >
          <span class="text-xs font-semibold text-white/80">Pick up where you left off</span>
          <span class="font-display mt-1 block text-lg leading-tight font-bold">{{ activeTask.title }}</span>
          <span class="mt-2 inline-flex items-center gap-1 text-sm font-semibold">Continue →</span>
        </NuxtLink>
      </Transition>
      <UserMenu />
    </div>
  </aside>
</template>
