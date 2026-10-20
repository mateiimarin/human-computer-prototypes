<script setup lang="ts">
import { toast } from 'vue-sonner'
const { open } = useLeave()
const { discard } = useSession()
const confirmDiscard = ref(false)

async function leave() {
  open.value = false
  toast('Session saved', { description: 'Resume it from the Overview or the sidebar.' })
  await navigateTo('/')
}
async function doDiscard() {
  confirmDiscard.value = false
  open.value = false
  discard()
  toast('Session discarded')
  await navigateTo('/')
}
</script>

<template>
  <UiDialog v-model:open="open">
    <UiDialogContent class="max-w-md">
      <UiDialogHeader>
        <UiDialogTitle>Leave this session?</UiDialogTitle>
        <UiDialogDescription>Your answers and drafts are saved. You can pick up at this exact screen whenever you like.</UiDialogDescription>
      </UiDialogHeader>
      <div class="flex flex-col gap-2 pt-2">
        <UiButton size="lg" @click="leave">Leave and resume later</UiButton>
        <UiButton variant="ghost" size="lg" @click="open = false">Keep working</UiButton>
        <UiButton variant="ghost" class="text-destructive hover:bg-destructive-surface mt-1" @click="confirmDiscard = true">Discard this session…</UiButton>
      </div>
    </UiDialogContent>
  </UiDialog>
  <UiAlertDialog v-model:open="confirmDiscard">
    <UiAlertDialogContent class="max-w-md">
      <UiAlertDialogHeader>
        <UiAlertDialogTitle>Discard this session?</UiAlertDialogTitle>
        <UiAlertDialogDescription>This removes your baseline answers, conversation and drafts for this exercise. Evidence you already submitted in earlier sessions stays.</UiAlertDialogDescription>
      </UiAlertDialogHeader>
      <UiAlertDialogFooter class="gap-2">
        <UiAlertDialogCancel as-child><UiButton variant="ghost">Cancel</UiButton></UiAlertDialogCancel>
        <UiAlertDialogAction as-child><UiButton variant="destructive" @click="doDiscard">Discard session</UiButton></UiAlertDialogAction>
      </UiAlertDialogFooter>
    </UiAlertDialogContent>
  </UiAlertDialog>
</template>
