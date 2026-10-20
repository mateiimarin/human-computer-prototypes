<script setup lang="ts">
import type { Confidence } from '~/data/types'

const open = defineModel<boolean>('open', { default: false })
defineProps<{ title: string; consequence: string; confirm?: string }>()
const emit = defineEmits<{ confirm: [confidence: Confidence | null, later: boolean] }>()
const confidence = ref<Confidence | null>(null)
watch(open, (o) => { if (o) confidence.value = null })
</script>

<template>
  <UiAlertDialog v-model:open="open">
    <UiAlertDialogContent class="max-w-md">
      <UiAlertDialogHeader>
        <UiAlertDialogTitle>{{ title }}</UiAlertDialogTitle>
        <UiAlertDialogDescription class="space-y-2 leading-6">
          <span class="block">{{ consequence }}</span>
          <span class="block">Choose “Do this later” if you plan to come back to it. Either way you can return from the summary or Review.</span>
        </UiAlertDialogDescription>
      </UiAlertDialogHeader>
      <ConfidencePicker v-model="confidence" label="How confident are you in this material?" />
      <UiAlertDialogFooter class="gap-2 sm:flex-wrap">
        <UiAlertDialogCancel as-child><UiButton autofocus>Keep going</UiButton></UiAlertDialogCancel>
        <UiAlertDialogAction as-child><UiButton variant="ghost" @click="emit('confirm', confidence, true)">Do this later</UiButton></UiAlertDialogAction>
        <UiAlertDialogAction as-child><UiButton variant="ghost" @click="emit('confirm', confidence, false)">{{ confirm ?? 'Skip' }}</UiButton></UiAlertDialogAction>
      </UiAlertDialogFooter>
    </UiAlertDialogContent>
  </UiAlertDialog>
</template>
