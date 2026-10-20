<script setup lang="ts">
import { Search, Bookmark, Download, Play, EyeOff, Eye, Trash2 } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { relative } from '~/lib/format'
import { topicById, conceptById } from '~/data/catalog'
import { packs } from '~/data/packs'

const { savedForCourse, findQuestion, setExcluded, removeSaved } = useWorkspace()
const { begin } = useReviewRun()
const q = ref('')
const view = ref<'all' | 'due' | 'excluded'>('all')
const picked = ref<string[]>([])
const exportOpen = ref(false)
const removeOpen = ref(false)

const rows = computed(() => savedForCourse.value
  .map(s => ({ s, f: findQuestion(s.qid)! }))
  .filter(({ s, f }) => (view.value === 'all' ? !s.excluded : view.value === 'due' ? !s.excluded && s.dueAt && new Date(s.dueAt) <= new Date() : s.excluded)
    && (!q.value || f.q.prompt.toLowerCase().includes(q.value.toLowerCase()) || s.sessionTitle.toLowerCase().includes(q.value.toLowerCase()))))
const allPicked = computed(() => rows.value.length > 0 && rows.value.every(r => picked.value.includes(r.s.qid)))
const toggle = (id: string) => (picked.value = picked.value.includes(id) ? picked.value.filter(x => x !== id) : [...picked.value, id])
const toggleAll = () => (picked.value = allPicked.value ? [] : rows.value.map(r => r.s.qid))
watch([view, q], () => (picked.value = []))
const sel = computed(() => rows.value.filter(r => picked.value.includes(r.s.qid)))
const dueLabel = (d: string | null, ex: boolean) => (ex ? 'Excluded' : !d ? 'Not scheduled' : new Date(d) <= new Date() ? 'Due now' : `Due ${relative(d).toLowerCase()}`)

function exclude() { setExcluded(picked.value, view.value !== 'excluded'); toast(view.value === 'excluded' ? 'Restored to your review plan' : 'Excluded from review', { description: `${picked.value.length} ${picked.value.length === 1 ? 'question' : 'questions'}.`, action: { label: 'Undo', onClick: () => setExcluded(sel.value.map(r => r.s.qid), view.value === 'excluded') } }); picked.value = [] }
function remove() { removeSaved(picked.value); picked.value = []; removeOpen.value = false; toast('Removed from your library') }
</script>

<template>
  <div class="space-y-6">
    <div v-if="savedForCourse.length" class="flex flex-wrap items-center gap-3">
      <div class="relative min-w-52 flex-1"><Search class="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2" /><UiInput v-model="q" class="h-11 rounded-lg pl-11" placeholder="Search saved questions" aria-label="Search saved questions" /></div>
      <UiToggleGroup type="single" :model-value="view" class="bg-muted gap-1 rounded-lg p-1" aria-label="Show" @update:model-value="(v) => v && (view = v as any)">
        <UiToggleGroupItem value="all" class="h-9 rounded-md px-4">In plan</UiToggleGroupItem><UiToggleGroupItem value="due" class="h-9 rounded-md px-4">Due</UiToggleGroupItem><UiToggleGroupItem value="excluded" class="h-9 rounded-md px-4">Excluded</UiToggleGroupItem>
      </UiToggleGroup>
    </div>

    <EmptyState v-if="!savedForCourse.length" title="No saved questions yet" text="Save questions from a session summary and they show up here, linked to their concept and the session they came from.">
      <template #icon><Bookmark class="size-5" /></template>
      <UiButton as-child><NuxtLink to="/study">Start a session</NuxtLink></UiButton>
    </EmptyState>
    <template v-else>
      <div class="text-muted-foreground flex items-center gap-4 px-1 text-sm">
        <label class="flex cursor-pointer items-center gap-3"><UiCheckbox :model-value="allPicked" aria-label="Select all" @update:model-value="toggleAll" /> {{ picked.length ? `${picked.length} selected` : `${rows.length} ${rows.length === 1 ? 'question' : 'questions'}` }}</label>
      </div>
      <TransitionGroup tag="ul" name="rowlist" class="divide-border relative divide-y">
        <li v-for="{ s, f } in rows" :key="s.qid">
          <label class="hover:bg-accent/40 -mx-3 flex cursor-pointer items-start gap-4 rounded-lg px-3 py-4 transition-colors">
            <UiCheckbox class="mt-1" :model-value="picked.includes(s.qid)" :aria-label="f.q.prompt" @update:model-value="toggle(s.qid)" />
            <span class="min-w-0 flex-1 space-y-1.5">
              <span class="block text-base leading-7" :class="s.excluded && 'text-muted-foreground'"><RichText :text="f.q.prompt" /></span>
              <span class="text-muted-foreground block text-sm">{{ conceptById(f.pack.conceptId).name }} · from {{ s.sessionTitle }}</span>
            </span>
            <UiBadge :variant="!s.excluded && s.dueAt && new Date(s.dueAt) <= new Date() ? 'partial' : 'neutral'" class="mt-1">{{ dueLabel(s.dueAt, s.excluded) }}</UiBadge>
          </label>
        </li>
      </TransitionGroup>
      <EmptyState v-if="!rows.length" :title="view === 'due' ? 'Nothing due' : view === 'excluded' ? 'Nothing excluded' : 'No questions match'" :text="view === 'excluded' ? 'Questions you exclude rest here until you restore them.' : 'Try a different filter or search.'"><template #icon><Bookmark class="size-5" /></template><UiButton variant="outline" @click="view = 'all'; q = ''">Show all</UiButton></EmptyState>
    </template>

    <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="translate-y-6 opacity-0" leave-active-class="transition duration-200" leave-to-class="translate-y-4 opacity-0">
      <div v-if="picked.length" class="fixed inset-x-0 bottom-6 z-30 flex justify-center px-4" role="toolbar" aria-label="Selection actions">
        <div class="bg-popover flex flex-wrap items-center gap-1 rounded-xl p-2 pl-5 shadow-popover">
          <span class="mr-2 text-sm font-medium tabular-nums">{{ picked.length }} selected</span>
          <UiButton v-if="view !== 'excluded'" size="sm" @click="begin('selected', picked)"><Play /> Start review ({{ picked.length }})</UiButton>
          <UiButton variant="ghost" size="sm" @click="exportOpen = true"><Download /> Export</UiButton>
          <UiButton variant="ghost" size="sm" @click="exclude"><component :is="view === 'excluded' ? Eye : EyeOff" /> {{ view === 'excluded' ? 'Restore' : 'Exclude' }}</UiButton>
          <UiButton variant="ghost" size="icon-sm" class="rounded-lg" aria-label="Remove from library" @click="removeOpen = true"><Trash2 /></UiButton>
        </div>
      </div>
    </Transition>

    <ExportDialog v-model:open="exportOpen" :items="sel.map(r => ({ q: r.f.q, title: r.s.sessionTitle }))" />
    <UiAlertDialog v-model:open="removeOpen">
      <UiAlertDialogContent class="max-w-md">
        <UiAlertDialogHeader><UiAlertDialogTitle>Remove {{ picked.length }} from your library?</UiAlertDialogTitle><UiAlertDialogDescription>They leave your review plan for good. Evidence from the sessions they came from stays. To keep a question but pause it, exclude it instead.</UiAlertDialogDescription></UiAlertDialogHeader>
        <UiAlertDialogFooter class="gap-2"><UiAlertDialogCancel as-child><UiButton variant="ghost">Cancel</UiButton></UiAlertDialogCancel><UiAlertDialogAction as-child><UiButton variant="destructive" @click="remove">Remove</UiButton></UiAlertDialogAction></UiAlertDialogFooter>
      </UiAlertDialogContent>
    </UiAlertDialog>
  </div>
</template>
