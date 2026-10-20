<script setup lang="ts">
import { Check, ChevronRight, Info, NotebookPen, ExternalLink, FastForward } from '@lucide/vue'
import { packOf } from '~/lib/session'

definePageMeta({ layout: 'session', middleware: 'session' })
useStep('route')
const { ws } = useWorkspace()
const { go } = useSession()
const s = computed(() => ws.value.active!)
const pack = computed(() => packOf(s.value))
const bypass = ref(false)

function work() { s.value.route = 'work'; go(pack.value.recall && !s.value.recall.done ? 'recall' : 'work') }
function away() { s.value.route = 'elsewhere'; go('elsewhere') }
function doBypass() { s.value.route = 'bypass'; bypass.value = false; go('explain') }

const options = computed(() => [
  { key: 'work', icon: NotebookPen, tint: 'bg-assist text-assist-foreground', title: 'Work on it here', text: 'Questions, hints and an outline from the companion. You choose how much help.', act: work },
  { key: 'away', icon: ExternalLink, tint: 'bg-check text-check-foreground', title: 'I’m working on it elsewhere', text: 'Take the exercise with you, then come back with your solution.', act: away },
  { key: 'bypass', icon: FastForward, tint: 'bg-partial text-partial-foreground', title: 'I’ve already done it', text: 'Go straight to the check. We’ll confirm what that skips.', act: () => (bypass.value = true) },
])
</script>

<template>
  <div>
    <StageHeader title="How do you want to work on this?" description="Whichever you choose, you finish with the same check, with your references hidden." />

    <p v-if="s.pre.submitted" class="text-muted-foreground mb-6 flex items-center gap-2 text-sm"><Check class="text-demonstrated-foreground size-4" :stroke-width="2.6" /> Baseline saved. Your answers stay hidden until the check.</p>
    <p v-else-if="s.pre.skipped" class="text-muted-foreground mb-6 flex items-center gap-2 text-sm"><Info class="size-4" /> {{ s.deferred.includes('pre') ? 'You postponed the baseline' : 'You skipped the baseline' }}, so results will say a baseline comparison is unavailable.</p>

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
          <UiAlertDialogDescription class="space-y-3 leading-6">
            <span class="block">This skips the Work stage: the conversation, hints and sheet feedback. The check still runs with every reference hidden, and skipping Work doesn’t count as understanding.</span>
            <span class="block">Because you finished the exercise before your baseline, that baseline is a starting snapshot, not a measure of what this session taught you.</span>
          </UiAlertDialogDescription>
        </UiAlertDialogHeader>
        <UiAlertDialogFooter class="gap-2">
          <UiAlertDialogCancel as-child><UiButton variant="ghost">Back</UiButton></UiAlertDialogCancel>
          <UiAlertDialogAction as-child><UiButton @click="doBypass">Continue to the check</UiButton></UiAlertDialogAction>
        </UiAlertDialogFooter>
      </UiAlertDialogContent>
    </UiAlertDialog>
  </div>
</template>
