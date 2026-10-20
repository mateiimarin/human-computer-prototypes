<script setup lang="ts">
const { ws } = useWorkspace()
const colorMode = useColorMode()

watchEffect(() => {
  colorMode.preference = ws.value.settings.theme
  if (import.meta.client) {
    document.documentElement.classList.toggle('large-text', ws.value.settings.largeText)
    document.documentElement.classList.toggle('reduce-motion', ws.value.settings.reduceMotion)
  }
})
</script>

<template>
  <UiTooltipProvider :delay-duration="200">
    <MotionConfig :reduced-motion="ws.settings.reduceMotion ? 'always' : 'user'">
      <NuxtLayout><NuxtPage /></NuxtLayout>
    </MotionConfig>
    <UiToaster position="bottom-center" :toast-options="{ class: 'rounded-xl' }" />
    <CommandMenu />
    <EvidenceSheet v-if="ws.signedIn" />
  </UiTooltipProvider>
</template>
