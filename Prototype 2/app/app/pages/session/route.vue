<script setup lang="ts">
import { Check, ChevronRight, Info, NotebookPen, ExternalLink, FastForward } from '@lucide/vue'

definePageMeta({ layout: 'session', middleware: 'session' })
useStep('route')
const { ws } = useWorkspace()
const { go } = useSession()
const s = computed(() => ws.value.active!)
const bypass = ref(false)

function work() { s.value.route = 'work'; go('work') }
function away() { s.value.route = 'elsewhere'; go('elsewhere') }
function doBypass() { s.value.route = 'bypass'; bypass.value = false; go('explain') }

const options = computed(() => [
  { key: 'work', icon: NotebookPen, tint: 'bg-assist text-assist-foreground', title: 'Work on it here', text: 'Get a question, hint, outline or solution.', act: work },
  { key: 'away', icon: ExternalLink, tint: 'bg-check text-check-foreground', title: 'I’m working on it elsewhere', text: 'Come back with your solution.', act: away },
  { key: 'bypass', icon: FastForward, tint: 'bg-partial text-partial-foreground', title: 'I’ve already done it', text: 'Go straight to the check.', act: () => (bypass.value = true) },
])
</script>

<template>
  <div>
    <StageHeader title="How do you want to work on this?" />

    <p v-if="s.pre.submitted" class="text-muted-foreground mb-6 flex items-center gap-2 text-sm"><Check class="text-demonstrated-foreground size-4" :stroke-width="2.6" /> Baseline saved.</p>
    <p v-else-if="s.pre.skipped" class="text-muted-foreground mb-6 flex items-center gap-2 text-sm"><Info class="size-4" /> {{ s.deferred.includes('pre') ? 'Baseline postponed.' : 'Baseline skipped.' }}</p>

    <ul class="divide-border border-border divide-y border-y">
      <Reveal v-for="(o, i) in options" :key="o.key" as="li" :index="i">
        <button class="hover:bg-accent/40 group -mx-3 flex w-[calc(100%+1.5rem)] items-center gap-5 rounded-2xl px-3 py-5 text-left transition-colors" @click="o.act()">
          <span class="grid size-11 shrink-0 place-items-center rounded-xl transition-transform duration-200 group-hover:scale-105" :class="o.tint"><component :is="o.icon" class="size-5" /></span>
          <span class="min-w-0 flex-1 space-y-1"><span class="block text-[17px] leading-6 font-medium">{{ o.title }}</span><span class="text-muted-foreground block text-[15px] leading-6">{{ o.text }}</span></span>
          <ChevronRight class="text-muted-foreground size-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </button>
      </Reveal>
    </ul>

    <UiAlertDialog v-model:open="bypass">
      <UiAlertDialogContent class="max-w-md">
        <UiAlertDialogHeader>
          <UiAlertDialogTitle>Go straight to the check?</UiAlertDialogTitle>
          <UiAlertDialogDescription>This skips working here. The check still hides your references.</UiAlertDialogDescription>
        </UiAlertDialogHeader>
        <UiAlertDialogFooter class="gap-2">
          <UiAlertDialogCancel as-child><UiButton variant="ghost">Back</UiButton></UiAlertDialogCancel>
          <UiAlertDialogAction as-child><UiButton @click="doBypass">Continue to the check</UiButton></UiAlertDialogAction>
        </UiAlertDialogFooter>
      </UiAlertDialogContent>
    </UiAlertDialog>
  </div>
</template>
