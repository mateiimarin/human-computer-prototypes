<script setup lang="ts">
import { Search, BookOpen, Upload, MoreHorizontal, Pencil, Trash2, Plus, ChevronDown, X, ArrowRight } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { packs } from '~/data/packs'
import { conceptById } from '~/data/catalog'
import { daysUntil, fmtDate } from '~/lib/format'
import { resumePath } from '~/lib/session'

definePageMeta({ title: 'Study' })
const route = useRoute()
const router = useRouter()
const { ws, course, sheets, courseTopics, concepts, renameSheet, removeSheet, isFirstUse } = useWorkspace()
const { start } = useSession()
const statusOf = useExerciseStatus()

const tab = computed({
  get: () => (['topics', 'sheets', 'upload'].includes(route.query.tab as string) ? (route.query.tab as string) : 'topics'),
  set: (v) => router.replace({ query: { ...route.query, tab: v, resume: undefined } }),
})
const query = ref('')
const picked = useState<string | null>('study-picked', () => null)
const expanded = ref<string[]>([])
const confirmNew = ref(false)
const notice = ref(route.query.resume === 'none')

const active = computed(() => ws.value.active)
const pack = computed(() => (picked.value ? packs[picked.value]! : null))
const resuming = computed(() => !!pack.value && active.value?.packId === pack.value.id)

const q = computed(() => query.value.trim().toLowerCase())
const topicRows = computed(() =>
  courseTopics.value
    .map(t => ({
      topic: t,
      concept: concepts.value.find(c => c.id === t.conceptId),
      exercises: sheets.value.filter(s => s.topicId === t.id).flatMap(s => s.packIds.map(id => packs[id]!)),
    }))
    .filter(r => !q.value || r.topic.name.toLowerCase().includes(q.value) || r.exercises.some(e => e.title.toLowerCase().includes(q.value))))
const sheetRows = computed(() => sheets.value.filter(s => !q.value || s.title.toLowerCase().includes(q.value) || s.packIds.some(id => packs[id]!.title.toLowerCase().includes(q.value))))

watch(topicRows, (rows) => { if (!expanded.value.length && rows[0]) expanded.value = [rows[0].topic.id] }, { immediate: true })

function toggleTopic(id: string) { expanded.value = expanded.value.includes(id) ? expanded.value.filter(x => x !== id) : [...expanded.value, id] }
function begin() {
  if (!pack.value) return
  if (resuming.value) return navigateTo(resumePath(active.value!))
  if (active.value) { confirmNew.value = true; return }
  start(pack.value.id)
}
function startNew() { confirmNew.value = false; start(pack.value!.id) }

const renaming = ref<{ id: string; title: string } | null>(null)
const removing = ref<string | null>(null)
function saveName() {
  if (!renaming.value) return
  if (renaming.value.title.trim().length < 2) return
  renameSheet(renaming.value.id, renaming.value.title.trim())
  renaming.value = null
  toast.success('Sheet renamed')
}
function doRemove() {
  const s = ws.value.sheets.find(x => x.id === removing.value)
  if (!s) return
  if (picked.value && s.packIds.includes(picked.value)) picked.value = null
  removeSheet(s.id)
  removing.value = null
  toast('Sheet removed', { description: 'Your evidence and review questions stay in the workspace.' })
}
function onAdded(packId: string) { picked.value = packId; tab.value = 'sheets' }

const dueLabel = (d?: string | null) => {
  if (!d) return null
  const n = daysUntil(d)
  return n < 0 ? 'Handed in' : n === 0 ? 'Due today' : n === 1 ? 'Due tomorrow' : `Due in ${n} days`
}
</script>

<template>
  <div>
    <PageHeader title="Study" description="Choose an exercise to start a session. It keeps your place if you leave." />

    <Transition leave-active-class="transition duration-200" leave-to-class="opacity-0 -translate-y-1">
      <div v-if="notice" class="bg-muted mb-6 flex items-start gap-3 rounded-xl p-4 text-sm leading-6" role="status">
        <p class="flex-1">There’s no open session right now. Pick an exercise below to start one.</p>
        <button class="hover:bg-accent -m-1 rounded-md p-1" aria-label="Dismiss" @click="notice = false"><X class="size-4" /></button>
      </div>
    </Transition>

    <div class="grid gap-x-14 gap-y-10" :class="tab !== 'upload' && 'lg:grid-cols-[minmax(0,1fr)_19rem]'">
      <div class="min-w-0 space-y-6">
        <Reveal :index="1" class="flex flex-wrap items-center gap-3">
          <UiTabs v-model="tab" class="gap-0">
            <UiTabsList aria-label="How to choose">
              <UiTabsTrigger value="topics" class="px-5">Topics</UiTabsTrigger>
              <UiTabsTrigger value="sheets" class="px-5">Sheets</UiTabsTrigger>
              <UiTabsTrigger value="upload" class="px-5">Add a sheet</UiTabsTrigger>
            </UiTabsList>
          </UiTabs>
          <div v-if="tab !== 'upload'" class="relative min-w-52 flex-1">
            <Search class="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2" />
            <UiInput v-model="query" class="h-11 rounded-lg pl-11" placeholder="Search exercises" aria-label="Search topics and exercises" />
          </div>
        </Reveal>

        <!-- First use -->
        <EmptyState v-if="isFirstUse && tab !== 'upload'" title="No sheets in this course yet" text="Add an exercise sheet and its exercises appear here, grouped by topic.">
          <template #icon><BookOpen class="size-5" /></template>
          <UiButton @click="tab = 'upload'"><Upload /> Add an exercise sheet</UiButton>
        </EmptyState>

        <!-- Topics -->
        <ul v-else-if="tab === 'topics'" class="divide-border divide-y">
          <Reveal v-for="(r, i) in topicRows" :key="r.topic.id" as="li" :index="i + 2">
            <button
              class="hover:bg-accent/40 flex w-full items-center gap-4 rounded-2xl px-3 py-4 text-left transition-colors" :aria-expanded="expanded.includes(r.topic.id)"
              @click="toggleTopic(r.topic.id)"
            >
              <EvidenceRing v-if="r.concept" :states="r.concept.subs.map(s => s.state)" :size="44" :stroke="5" :label="`${r.topic.name} evidence`" />
              <span class="min-w-0 flex-1"><span class="block text-[17px] leading-6 font-medium">{{ r.topic.name }}</span><span class="text-muted-foreground block text-sm">{{ r.topic.blurb }} · {{ r.exercises.length }} {{ r.exercises.length === 1 ? 'exercise' : 'exercises' }}</span></span>
              <ChevronDown class="text-muted-foreground size-5 transition-transform duration-200" :class="expanded.includes(r.topic.id) && 'rotate-180'" />
            </button>
            <Transition
              enter-active-class="transition-all duration-300 ease-out overflow-hidden" enter-from-class="max-h-0 opacity-0" enter-to-class="max-h-96 opacity-100"
              leave-active-class="transition-all duration-200 ease-in overflow-hidden" leave-from-class="max-h-96 opacity-100" leave-to-class="max-h-0 opacity-0"
            >
              <div v-show="expanded.includes(r.topic.id)" role="radiogroup" :aria-label="`${r.topic.name} exercises`" class="space-y-1.5 pr-1 pb-4 pl-[3.75rem]">
                <ExerciseRow v-for="e in r.exercises" :key="e.id" :pack="e" :selected="picked === e.id" :status="statusOf(e.id)" @select="picked = e.id" />
              </div>
            </Transition>
          </Reveal>
          <p v-if="!topicRows.length && !isFirstUse" class="text-muted-foreground px-3 py-10 text-center text-[15px]">No topics match “{{ query }}”.</p>
        </ul>

        <!-- Sheets -->
        <div v-else-if="tab === 'sheets'" class="space-y-8">
          <Reveal v-for="(s, i) in sheetRows" :key="s.id" :index="i + 2" as="section" :aria-label="`Sheet ${s.no}`">
            <div class="mb-2 flex items-center gap-3 px-3">
              <div class="min-w-0 flex-1">
                <h2 class="text-[17px] leading-6 font-medium">Sheet {{ s.no }} · {{ s.title }}</h2>
                <p class="text-muted-foreground text-sm">
                  {{ s.packIds.length }} {{ s.packIds.length === 1 ? 'exercise' : 'exercises' }}<template v-if="dueLabel(s.due)"> · {{ dueLabel(s.due) }}</template>
                  <template v-if="s.source === 'upload'"> · Added {{ fmtDate(s.addedAt) }}</template>
                </p>
              </div>
              <UiDropdownMenu>
                <UiDropdownMenuTrigger as-child><UiButton variant="ghost" size="icon" class="rounded-lg" :aria-label="`Sheet ${s.no} options`"><MoreHorizontal /></UiButton></UiDropdownMenuTrigger>
                <UiDropdownMenuContent align="end" class="w-48 p-1.5">
                  <UiDropdownMenuItem class="h-10 gap-2" @select="renaming = { id: s.id, title: s.title }"><Pencil class="size-4" /> Rename</UiDropdownMenuItem>
                  <UiDropdownMenuItem class="text-destructive h-10 gap-2" @select="removing = s.id"><Trash2 class="size-4" /> Remove sheet</UiDropdownMenuItem>
                </UiDropdownMenuContent>
              </UiDropdownMenu>
            </div>
            <div role="radiogroup" :aria-label="`Sheet ${s.no} exercises`" class="space-y-1.5">
              <ExerciseRow v-for="id in s.packIds" :key="id" :pack="packs[id]!" :selected="picked === id" :status="statusOf(id)" @select="picked = id" />
            </div>
          </Reveal>
          <div class="px-3"><UiButton variant="outline" @click="tab = 'upload'"><Plus /> Add a sheet</UiButton></div>
        </div>

        <!-- Upload -->
        <UploadFlow v-else-if="tab === 'upload'" @added="onAdded" />
      </div>

      <div v-if="tab !== 'upload'" class="lg:sticky lg:top-24 lg:self-start">
        <Reveal :index="3"><SessionAside :pack="pack" :resuming="resuming" @start="begin" /></Reveal>
      </div>
    </div>

    <!-- Small screens: the start action stays in reach -->
    <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="translate-y-6 opacity-0" leave-active-class="transition duration-200" leave-to-class="translate-y-4 opacity-0">
      <div v-if="pack && tab !== 'upload'" class="fixed inset-x-0 bottom-0 z-30 p-3 lg:hidden">
        <div class="bg-popover flex items-center gap-3 rounded-xl p-2 pl-5 shadow-popover">
          <p class="min-w-0 flex-1 truncate text-sm font-medium">{{ pack.title }}</p>
          <UiButton @click="begin">{{ resuming ? 'Resume' : 'Start' }} <ArrowRight /></UiButton>
        </div>
      </div>
    </Transition>

    <!-- Start a new session while one is open -->
    <UiAlertDialog v-model:open="confirmNew">
      <UiAlertDialogContent class="max-w-md">
        <UiAlertDialogHeader>
          <UiAlertDialogTitle>Start a new session?</UiAlertDialogTitle>
          <UiAlertDialogDescription>
            You have an open session on {{ active ? packs[active.packId]!.title : '' }}. Starting {{ pack?.title }} replaces it. Evidence you already submitted stays in your concepts.
          </UiAlertDialogDescription>
        </UiAlertDialogHeader>
        <UiAlertDialogFooter class="gap-2">
          <UiAlertDialogCancel as-child><UiButton variant="ghost">Keep current</UiButton></UiAlertDialogCancel>
          <UiAlertDialogAction as-child><UiButton @click="startNew">Start new session</UiButton></UiAlertDialogAction>
        </UiAlertDialogFooter>
      </UiAlertDialogContent>
    </UiAlertDialog>

    <UiDialog :open="!!renaming" @update:open="(o) => { if (!o) renaming = null }">
      <UiDialogContent class="max-w-md">
        <UiDialogHeader><UiDialogTitle>Rename sheet</UiDialogTitle><UiDialogDescription>The name only changes how it appears in this workspace.</UiDialogDescription></UiDialogHeader>
        <form v-if="renaming" class="space-y-4" @submit.prevent="saveName">
          <UiInput v-model="renaming.title" aria-label="Sheet name" :aria-invalid="renaming.title.trim().length < 2" />
          <UiDialogFooter class="gap-2"><UiButton type="button" variant="ghost" @click="renaming = null">Cancel</UiButton><UiButton type="submit" :disabled="renaming.title.trim().length < 2">Save</UiButton></UiDialogFooter>
        </form>
      </UiDialogContent>
    </UiDialog>

    <UiAlertDialog :open="!!removing" @update:open="(o) => { if (!o) removing = null }">
      <UiAlertDialogContent class="max-w-md">
        <UiAlertDialogHeader>
          <UiAlertDialogTitle>Remove this sheet?</UiAlertDialogTitle>
          <UiAlertDialogDescription>Its exercises disappear from Study. Evidence from earlier sessions and saved review questions are kept.</UiAlertDialogDescription>
        </UiAlertDialogHeader>
        <UiAlertDialogFooter class="gap-2">
          <UiAlertDialogCancel as-child><UiButton variant="ghost">Cancel</UiButton></UiAlertDialogCancel>
          <UiAlertDialogAction as-child><UiButton variant="destructive" @click="doRemove">Remove sheet</UiButton></UiAlertDialogAction>
        </UiAlertDialogFooter>
      </UiAlertDialogContent>
    </UiAlertDialog>
  </div>
</template>
