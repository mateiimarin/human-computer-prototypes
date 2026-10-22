<script setup lang="ts">
const route = useRoute()

const nav = [
  { to: '/', label: 'Exercises', match: (p: string) => p === '/' },
  { to: '/concepts', label: 'Concepts', match: (p: string) => p.startsWith('/concepts') },
]
</script>

<template>
  <header class="bg-background/80 sticky top-0 z-20 flex h-14 items-center gap-1 px-3 backdrop-blur-xl sm:gap-3 sm:px-5">
    <NuxtLink to="/" class="mr-1 flex h-10 shrink-0 items-center rounded-lg px-1.5 sm:mr-4" aria-label="Prove-it, exercises">
      <span class="sm:hidden"><Logo :word="false" /></span>
      <span class="hidden sm:inline-flex"><Logo /></span>
    </NuxtLink>
    <nav aria-label="Main" class="flex items-center gap-0.5">
      <NuxtLink
        v-for="item in nav" :key="item.to" :to="item.to" :aria-current="item.match(route.path) ? 'page' : undefined"
        class="text-muted-foreground hover:bg-accent aria-[current=page]:text-foreground aria-[current=page]:bg-accent flex h-9 items-center rounded-lg px-3 text-sm font-medium transition-colors"
      >{{ item.label }}</NuxtLink>
    </nav>
    <div class="ml-auto"><AboutButton /></div>
  </header>
</template>
