<script setup lang="ts">
import { Search } from '@lucide/vue'

const { course } = useWorkspace()
const cmd = useCommandMenu()
</script>

<template>
  <header class="bg-background/80 sticky top-0 z-20 flex h-14 items-center gap-2 px-3 backdrop-blur-xl sm:px-5">
    <UiSidebarTrigger class="size-9 rounded-lg" aria-label="Toggle sidebar" />
    <p class="text-muted-foreground ml-1 hidden min-w-0 truncate text-sm sm:block">{{ course.name }}</p>
    <button
      class="text-muted-foreground hover:bg-accent hover:text-foreground ml-auto flex h-9 items-center gap-2 rounded-lg px-3 text-sm transition-colors"
      aria-label="Search" @click="cmd.open.value = true"
    >
      <Search class="size-4" />
      <span class="hidden sm:inline">Search</span>
      <UiKbd class="hidden sm:inline-flex">⌘K</UiKbd>
    </button>
  </header>
</template>
