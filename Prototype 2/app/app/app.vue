<template>
  <UiTooltipProvider :delay-duration="200">
    <MotionConfig reduced-motion="user">
      <NuxtLayout><NuxtPage /></NuxtLayout>
    </MotionConfig>
    <UiToaster position="bottom-center" :toast-options="{ class: 'rounded-xl' }" />
    <CommandMenu />
    <EvidenceSheet />
    <AboutDialog />
  </UiTooltipProvider>
</template>
