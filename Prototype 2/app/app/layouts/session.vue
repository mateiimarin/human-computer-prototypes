<script setup lang="ts">
import { X, PanelRight, MoreHorizontal, LogOut } from '@lucide/vue'
import { packOf, stageOf, type Stage } from '~/lib/session'

const { ws, course } = useWorkspace()
const { open, panel } = useLeave()
const s = computed(() => ws.value.active)
const pack = computed(() => (s.value ? packOf(s.value) : null))
const stage = computed<Stage>(() => (s.value ? stageOf(s.value.step) : 'prepare'))
const checking = computed(() => !!s.value && ['explain', 'deeper', 'defend', 'mistakes', 'post-quiz'].includes(s.value.step))
const assisted = computed(() => {
  const x = s.value
  if (!x) return false
  const map: Record<string, string> = { explain: 'explain', deeper: 'explain', defend: 'defend', mistakes: 'mistakes', 'post-quiz': 'post' }
  return x.assisted.includes(map[x.step] as any)
})
const skippedStages = computed<Stage[]>(() => (s.value && (s.value.skipped.length || s.value.assisted.length) ? ['verify'] : []))
const chat = computed(() => !!s.value && s.value.step === 'work')
const wide = computed(() => !!s.value && s.value.step === 'summary')
const panelOn = computed(() => !!s.value && !['summary'].includes(s.value.step) && !(s.value.step === 'twin' && s.value.twin.phase === 'result'))
</script>

<template>
  <div :class="[chat ? 'flex h-dvh flex-col overflow-hidden' : 'min-h-dvh', { 'check-vignette': checking }]">
    <header class="bg-background/80 sticky top-0 z-30 grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-3 px-3 backdrop-blur-xl sm:px-5">
      <div class="flex min-w-0 items-center gap-2">
        <UiTooltip>
          <UiTooltipTrigger as-child>
            <UiButton variant="ghost" size="icon" class="rounded-lg" aria-label="Leave session" @click="open = true"><X /></UiButton>
          </UiTooltipTrigger>
          <UiTooltipContent>Leave session</UiTooltipContent>
        </UiTooltip>
        <div class="text-muted-foreground hidden min-w-0 items-center gap-2 text-sm lg:flex">
          <span class="max-w-40 truncate">{{ course.name }}</span><span aria-hidden="true">/</span>
          <span class="text-foreground max-w-56 truncate font-medium">{{ pack?.title }}</span>
        </div>
      </div>
      <SessionStepper :current="stage" :skipped="skippedStages" />
      <div class="flex items-center justify-end gap-1">
        <UiTooltip>
          <UiTooltipTrigger as-child>
            <UiButton variant="ghost" size="icon" class="rounded-lg xl:hidden" aria-label="Session details" @click="panel = true"><PanelRight /></UiButton>
          </UiTooltipTrigger>
          <UiTooltipContent>Session details</UiTooltipContent>
        </UiTooltip>
        <UiDropdownMenu>
          <UiDropdownMenuTrigger as-child><UiButton variant="ghost" size="icon" class="rounded-lg" aria-label="More"><MoreHorizontal /></UiButton></UiDropdownMenuTrigger>
          <UiDropdownMenuContent align="end" class="w-56 p-1.5">
            <UiDropdownMenuItem class="h-10 gap-2" @select="open = true"><LogOut class="size-4" /> Leave and resume later</UiDropdownMenuItem>
            <UiDropdownMenuItem class="h-10 gap-2" @select="navigateTo('/study')">Choose a different exercise</UiDropdownMenuItem>
          </UiDropdownMenuContent>
        </UiDropdownMenu>
      </div>
    </header>

    <CheckBanner v-if="checking" :assisted="assisted" class="mt-1" />

    <div class="mx-auto flex w-full max-w-[1180px] justify-center gap-10 px-4 pt-6 sm:px-8" :class="chat ? 'min-h-0 flex-1 pb-0' : 'pb-40 xl:pt-10'">
      <main id="main" tabindex="-1" class="mx-auto w-full min-w-0 outline-none" :class="[chat && 'h-full', wide ? 'max-w-[56rem]' : 'max-w-[44rem]']">
        <slot />
      </main>
      <aside v-if="s && panelOn" class="sticky top-24 hidden h-fit w-72 shrink-0 xl:block"><SessionPanel /></aside>
    </div>

    <UiSheet v-model:open="panel">
      <UiSheetContent side="right" class="w-full max-w-sm p-6"><UiSheetHeader class="sr-only"><UiSheetTitle>Session details</UiSheetTitle><UiSheetDescription>Stage, checks and help level</UiSheetDescription></UiSheetHeader><div class="pt-8"><SessionPanel v-if="s" /></div></UiSheetContent>
    </UiSheet>
    <LeaveDialog />
    <ReferencesDialogs />
  </div>
</template>
