<template>
  <UiSidebarProvider class="min-h-dvh">
    <AppSidebar />
    <UiSidebarInset class="min-w-0 bg-transparent">
      <TopBar />
      <main id="main" tabindex="-1" class="mx-auto w-full max-w-[960px] flex-1 px-4 pt-4 pb-24 outline-none sm:px-8 sm:pt-6">
        <slot />
      </main>
    </UiSidebarInset>
    <AddCourseDialog />
  </UiSidebarProvider>
</template>
