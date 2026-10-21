<script setup lang="ts">
import { Info } from "@lucide/vue";

const intro = useIntro();
</script>

<template>
  <div class="min-h-dvh">
    <header class="mx-auto flex w-full max-w-[860px] items-center justify-between gap-4 px-5 pt-6 sm:px-8">
      <NuxtLink to="/" aria-label="Attempt First, all exercises"><Logo /></NuxtLink>
      <UiButton variant="ghost" size="sm" @click="intro.open.value = true"><Info /> About this prototype</UiButton>
    </header>
    <main id="main" tabindex="-1" class="mx-auto w-full max-w-[860px] px-5 pt-10 pb-20 outline-none sm:px-8 sm:pt-14">
      <slot />
    </main>
  </div>
</template>
