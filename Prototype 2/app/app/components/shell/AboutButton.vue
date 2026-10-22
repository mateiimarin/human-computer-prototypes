<script setup lang="ts">
import { Info } from '@lucide/vue'

const { open } = useAbout()
</script>

<template>
  <UiButton variant="ghost" size="sm" class="text-muted-foreground shrink-0 rounded-lg" aria-label="About this prototype" @click="open = true">
    <Info /> <span class="hidden sm:inline">About this prototype</span>
  </UiButton>
</template>
