<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Download, Check, Loader2, TriangleAlert, RotateCcw } from '@lucide/vue'
import type { Question } from '~/data/types'

const open = defineModel<boolean>('open', { default: false })
const props = defineProps<{ items: { q: Question; title: string }[] }>()
const format = ref<'anki' | 'csv'>('anki')
const phase = ref<'preview' | 'working' | 'done' | 'error'>('preview')
const failedOnce = ref(false)

watch(open, (o) => { if (o) { phase.value = 'preview' } })
const strip = (t: string) => t.replace(/\$\$?/g, '').replace(/\\(?:max|min|dots|infty|ge|le)\b/g, m => ({ '\\max': 'max', '\\min': 'min', '\\dots': '…', '\\infty': '∞', '\\ge': '≥', '\\le': '≤' }[m] ?? m)).replace(/[{}\\`]/g, '').replace(/\*\*/g, '')
const rows = computed(() => props.items.map(({ q }) => ({ front: strip(q.prompt), back: strip(q.choices.find(c => c.id === q.correct)!.label) + ' — ' + strip(q.why) })))

async function run() {
  phase.value = 'working'
  await new Promise(r => setTimeout(r, 1100))
  if (!failedOnce.value && props.items.length > 3) { failedOnce.value = true; phase.value = 'error'; return }
  phase.value = 'done'
}
function download() {
  const sep = format.value === 'anki' ? '\t' : ','
  const esc = (t: string) => (format.value === 'csv' ? `"${t.replace(/"/g, '""')}"` : t.replace(/\t/g, ' '))
  const body = rows.value.map(r => `${esc(r.front)}${sep}${esc(r.back)}`).join('\n')
  const url = URL.createObjectURL(new Blob([body], { type: 'text/plain' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: format.value === 'anki' ? 'prove-it-questions.txt' : 'prove-it-questions.csv' })
  a.click(); URL.revokeObjectURL(url)
  toast.success('Export downloaded')
  open.value = false
}
</script>

<template>
  <UiDialog v-model:open="open">
    <UiDialogContent class="max-w-xl">
      <UiDialogHeader>
        <UiDialogTitle>Export {{ items.length }} {{ items.length === 1 ? 'question' : 'questions' }}</UiDialogTitle>
        <UiDialogDescription>Take your questions to another tool. Each becomes a card with the answer on the back.</UiDialogDescription>
      </UiDialogHeader>

      <template v-if="phase === 'preview'">
        <UiToggleGroup type="single" :model-value="format" class="bg-muted w-fit gap-1 rounded-lg p-1" aria-label="Format" @update:model-value="(v) => v && (format = v as 'anki' | 'csv')">
          <UiToggleGroupItem value="anki" class="h-9 rounded-md px-4">Anki import (.txt)</UiToggleGroupItem>
          <UiToggleGroupItem value="csv" class="h-9 rounded-md px-4">CSV</UiToggleGroupItem>
        </UiToggleGroup>
        <div class="border-border max-h-72 divide-border divide-y overflow-y-auto rounded-xl border" role="region" aria-label="Preview" tabindex="0">
          <div v-for="(r, i) in rows.slice(0, 5)" :key="i" class="grid gap-1 p-4 text-sm leading-6 sm:grid-cols-2 sm:gap-6">
            <p class="font-medium">{{ r.front }}</p><p class="text-muted-foreground">{{ r.back }}</p>
          </div>
          <p v-if="rows.length > 5" class="text-muted-foreground p-4 text-sm">+ {{ rows.length - 5 }} more</p>
        </div>
        <UiDialogFooter class="gap-2"><UiButton variant="ghost" @click="open = false">Cancel</UiButton><UiButton :disabled="!rows.length" @click="run"><Download /> Export</UiButton></UiDialogFooter>
      </template>
      <div v-else-if="phase === 'working'" class="grid place-items-center gap-3 py-12" role="status"><Loader2 class="size-8 animate-spin" /><p class="text-muted-foreground animate-pulse text-base">Preparing your export…</p></div>
      <div v-else-if="phase === 'error'" class="space-y-5 py-4 text-center">
        <TriangleAlert class="text-gap-foreground mx-auto size-7" />
        <div><p class="text-lg font-medium">The export didn’t finish</p><p class="text-muted-foreground mt-1 text-[15px] leading-6">Nothing was lost. Your selection is unchanged.</p></div>
        <div class="flex justify-center gap-2"><UiButton @click="run"><RotateCcw /> Try again</UiButton><UiButton variant="ghost" @click="open = false">Cancel</UiButton></div>
      </div>
      <div v-else class="space-y-5 py-4 text-center">
        <Check class="text-demonstrated-foreground mx-auto size-7" />
        <div><p class="text-lg font-medium">Your export is ready</p><p class="text-muted-foreground mt-1 text-[15px] leading-6">{{ items.length }} cards, {{ format === 'anki' ? 'tab-separated for Anki’s import dialog' : 'as comma-separated values' }}.</p></div>
        <UiButton size="lg" @click="download"><Download /> Download file</UiButton>
      </div>
    </UiDialogContent>
  </UiDialog>
</template>
