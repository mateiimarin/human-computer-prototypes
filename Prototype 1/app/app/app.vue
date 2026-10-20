<script setup lang="ts">
const app = useApp();

watchEffect(() => {
  if (import.meta.client) {
    document.documentElement.classList.toggle("large-text", app.state.value.settings.largeText);
    document.documentElement.classList.toggle("reduce-motion", app.state.value.settings.reduceMotion);
  }
});
const reduced = computed(() => (app.state.value.settings.reduceMotion ? "always" : "user"));
</script>

<template>
  <MotionConfig :reduced-motion="reduced">
    <UiTooltipProvider :delay-duration="250">
      <a
        href="#main"
        class="bg-card sr-only rounded-full px-4 py-2 font-semibold focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:shadow-lg"
        >Skip to content</a
      >
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
      <CommandMenu />
      <UiToaster position="bottom-center" :toast-options="{ class: 'font-sans' }" />
    </UiTooltipProvider>
  </MotionConfig>
</template>
