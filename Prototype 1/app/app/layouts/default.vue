<script setup lang="ts">
import { Search } from "@lucide/vue";
const cmd = useCommandMenu();
</script>

<template>
  <div class="flex min-h-dvh">
    <AppSidebar />
    <div class="min-w-0 flex-1">
      <header class="flex items-center justify-between px-5 pt-5 lg:hidden">
        <NuxtLink to="/" aria-label="Attempt First, home"><Logo /></NuxtLink>
        <button
          class="bg-card grid size-11 place-items-center rounded-full shadow-sm"
          aria-label="Search"
          @click="cmd.open.value = true"
        >
          <Search class="size-5" />
        </button>
      </header>
      <main
        id="main"
        tabindex="-1"
        class="mx-auto w-full max-w-[1120px] px-5 pt-6 pb-28 outline-none sm:px-8 lg:px-10 lg:pt-10 lg:pb-16"
      >
        <slot />
      </main>
    </div>
    <MobileNav />
  </div>
</template>
