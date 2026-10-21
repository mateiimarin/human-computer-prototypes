<template>
  <MotionConfig reduced-motion="user">
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
      <IntroDialog />
      <UiToaster position="bottom-center" :toast-options="{ class: 'font-sans' }" />
    </UiTooltipProvider>
  </MotionConfig>
</template>
