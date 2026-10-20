<script setup lang="ts">
import { LifeBuoy } from '@lucide/vue'
import { packOf } from '~/lib/session'
import type { CheckId } from '~/data/session'

const { confirmRefs, refs } = useLeave()
const { ws } = useWorkspace()
const { markAssisted } = useSession()
const s = computed(() => ws.value.active)
const pack = computed(() => (s.value ? packOf(s.value) : null))
const checkFor: Record<string, CheckId> = { explain: 'explain', deeper: 'explain', defend: 'defend', mistakes: 'mistakes', 'post-quiz': 'post' }

function reveal() {
  const c = checkFor[s.value?.step ?? '']
  if (c) markAssisted(c)
  confirmRefs.value = false
  refs.value = true
}
</script>

<template>
  <UiAlertDialog v-model:open="confirmRefs">
    <UiAlertDialogContent class="max-w-md">
      <UiAlertDialogHeader>
        <div class="bg-assist text-assist-foreground mb-2 grid size-11 place-items-center rounded-xl"><LifeBuoy class="size-5" /></div>
        <UiAlertDialogTitle>Open your references?</UiAlertDialogTitle>
        <UiAlertDialogDescription>This check becomes <strong>assisted</strong> and will not count as independent evidence. What you have written is kept, and you can start a fresh independent attempt afterwards.</UiAlertDialogDescription>
      </UiAlertDialogHeader>
      <UiAlertDialogFooter class="gap-2">
        <UiAlertDialogCancel as-child><UiButton variant="ghost" autofocus>Stay independent</UiButton></UiAlertDialogCancel>
        <UiAlertDialogAction as-child><UiButton variant="assist" @click="reveal">Open references</UiButton></UiAlertDialogAction>
      </UiAlertDialogFooter>
    </UiAlertDialogContent>
  </UiAlertDialog>

  <UiSheet v-model:open="refs">
    <UiSheetContent side="right" class="w-full gap-0 sm:max-w-lg">
      <UiSheetHeader class="space-y-1.5 p-6 pb-4">
        <UiBadge variant="assist" class="w-fit"><LifeBuoy /> Assisted</UiBadge>
        <UiSheetTitle class="text-xl">Your references</UiSheetTitle>
        <UiSheetDescription>Everything you had during Work. Close this to go back to your draft.</UiSheetDescription>
      </UiSheetHeader>
      <div v-if="s && pack" class="space-y-8 overflow-y-auto p-6 pt-2">
        <section class="space-y-3">
          <h3 class="text-sm font-medium">Conversation</h3>
          <div class="space-y-3">
            <p v-for="m in s.work.messages" :key="m.id" class="text-[15px] leading-7" :class="m.role === 'student' ? 'bg-muted ml-8 rounded-2xl px-4 py-2.5' : 'text-muted-foreground'"><RichText :text="m.text" /></p>
          </div>
        </section>
        <section class="space-y-3">
          <h3 class="text-sm font-medium">Worked solution</h3>
          <ol class="space-y-2.5">
            <li v-for="(t, i) in pack.work.solution.steps" :key="i" class="bg-assist/60 text-[15px] leading-7 rounded-xl px-4 py-3"><RichText :text="t" /></li>
          </ol>
          <CodeSnippet :code="pack.work.solution.code" title="solution.py" />
        </section>
      </div>
    </UiSheetContent>
  </UiSheet>
</template>
