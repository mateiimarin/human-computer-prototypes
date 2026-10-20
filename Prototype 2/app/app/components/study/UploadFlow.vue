<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Upload, FileText, ClipboardPaste, TriangleAlert, Check, RotateCcw, Loader2 } from '@lucide/vue'
import { packs } from '~/data/packs'
import { sampleSheet, topicById } from '~/data/catalog'

const emit = defineEmits<{ added: [packId: string] }>()
const { ws, course, sheets, addSheet } = useWorkspace()

type Phase = 'choose' | 'reading' | 'review' | 'error'
const phase = ref<Phase>('choose')
const source = ref<{ kind: 'sample' | 'file' | 'paste'; name: string }>({ kind: 'sample', name: sampleSheet.fileName })
const error = ref('')
const pasteOpen = ref(false)
const pasted = ref('')
const dragging = ref(false)
const fileInput = ref<HTMLInputElement>()

const title = ref(sampleSheet.title)
const courseId = ref(course.value.id)
const included = ref<string[]>([...sampleSheet.packIds])
const nextNo = computed(() => Math.max(sampleSheet.no, ...sheets.value.map(s => s.no + 1)))
const exists = computed(() => ws.value.sheets.some(s => s.courseId === courseId.value && s.topicId === sampleSheet.topicId))

const ok = ['pdf', 'png', 'jpg', 'jpeg', 'heic', 'txt', 'md']
function read(kind: 'sample' | 'file' | 'paste', name: string) {
  source.value = { kind, name }
  phase.value = 'reading'
  setTimeout(() => {
    title.value = sampleSheet.title
    included.value = [...sampleSheet.packIds]
    courseId.value = course.value.id
    phase.value = 'review'
  }, 1300)
}
function pick(file?: File | null) {
  if (!file) return
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!ok.includes(ext)) { error.value = `“${file.name}” isn’t something we can read. Use a PDF, a photo or a text file.`; phase.value = 'error'; return }
  if (file.size > 20 * 1024 * 1024) { error.value = `“${file.name}” is larger than 20 MB. Try a smaller file or fewer pages.`; phase.value = 'error'; return }
  read('file', file.name)
}
function onDrop(e: DragEvent) { dragging.value = false; pick(e.dataTransfer?.files?.[0]) }
function readPasted() {
  if (pasted.value.trim().length < 20) { error.value = 'Paste at least a sentence of the sheet.'; return }
  error.value = ''
  read('paste', 'Pasted text')
}
function reset() { phase.value = 'choose'; error.value = ''; pasteOpen.value = false; pasted.value = '' }

function add() {
  const s = addSheet({ no: nextNo.value, title: title.value.trim() || sampleSheet.title, topicId: sampleSheet.topicId, packIds: included.value, fileName: source.value.name, courseId: courseId.value })
  toast.success(`${s.title} added`, { description: `${included.value.length} ${included.value.length === 1 ? 'exercise is' : 'exercises are'} ready to study.` })
  emit('added', included.value[0]!)
  reset()
}
const titleOf = (id: string) => packs[id]!.title
function toggle(id: string) { included.value = included.value.includes(id) ? included.value.filter(x => x !== id) : [...included.value, id] }
</script>

<template>
  <div>
    <!-- 1. Choose -->
    <Transition mode="out-in" enter-active-class="transition duration-300 ease-out" enter-from-class="translate-y-2 opacity-0" leave-active-class="transition duration-150" leave-to-class="opacity-0">
      <div v-if="phase === 'choose'" key="choose" class="space-y-5">
        <div
          class="grid place-items-center rounded-xl border border-dashed px-6 py-14 text-center transition-colors duration-200"
          :class="dragging ? 'border-foreground bg-accent/50' : 'border-input/60'"
          @dragover.prevent="dragging = true" @dragleave="dragging = false" @drop.prevent="onDrop"
        >
          <div class="mx-auto max-w-sm space-y-5">
            <span class="bg-muted mx-auto grid size-14 place-items-center rounded-2xl"><Upload class="size-6" /></span>
            <div class="space-y-1.5">
              <h3 class="text-lg font-semibold">Add an exercise sheet</h3>
              <p class="text-muted-foreground text-[15px] leading-6">Drop a PDF or photo here, or paste the text. We’ll find the exercises.</p>
            </div>
            <div class="flex flex-wrap justify-center gap-2">
              <UiButton size="lg" @click="fileInput?.click()"><FileText /> Choose a file</UiButton>
              <UiButton variant="outline" size="lg" @click="pasteOpen = !pasteOpen"><ClipboardPaste /> Paste text</UiButton>
            </div>
            <input ref="fileInput" type="file" class="sr-only" accept=".pdf,.png,.jpg,.jpeg,.heic,.txt,.md" aria-label="Choose an exercise sheet" @change="pick(($event.target as HTMLInputElement).files?.[0])">
          </div>
        </div>
        <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="-translate-y-2 opacity-0">
          <div v-if="pasteOpen" class="space-y-3">
            <UiLabel for="paste-sheet">Sheet text</UiLabel>
            <UiTextarea id="paste-sheet" v-model="pasted" rows="6" placeholder="Paste the exercises here…" :aria-invalid="!!error" />
            <p v-if="error" class="text-gap-foreground text-sm" role="alert">{{ error }}</p>
            <div class="flex justify-end gap-2"><UiButton variant="ghost" @click="pasteOpen = false">Cancel</UiButton><UiButton @click="readPasted">Read this text</UiButton></div>
          </div>
        </Transition>
      </div>

      <!-- 2. Reading -->
      <div v-else-if="phase === 'reading'" key="reading" class="grid place-items-center gap-4 py-20 text-center" role="status">
        <Loader2 class="text-muted-foreground size-7 animate-spin" />
        <div class="space-y-1">
          <p class="text-lg font-medium">Reading {{ source.name }}…</p>
          <p class="text-muted-foreground text-sm">Finding the exercises and the topic they belong to.</p>
        </div>
      </div>

      <!-- error -->
      <div v-else-if="phase === 'error'" key="error" class="space-y-6 py-16 text-center">
        <TriangleAlert class="text-gap-foreground mx-auto size-7" />
        <div class="mx-auto max-w-md space-y-1.5">
          <h3 class="text-lg font-semibold">We couldn’t read that file</h3>
          <p class="text-muted-foreground text-[15px] leading-6" role="alert">{{ error }}</p>
        </div>
        <div class="flex flex-wrap justify-center gap-2">
          <UiButton size="lg" @click="reset(); fileInput?.click()"><RotateCcw /> Try another file</UiButton>
          <UiButton variant="ghost" size="lg" @click="reset">Cancel</UiButton>
        </div>
      </div>

      <!-- 3. Review -->
      <div v-else key="review" class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div class="space-y-8">
          <div class="space-y-1">
            <p class="text-muted-foreground flex items-center gap-1.5 text-sm"><Check class="text-demonstrated-foreground size-4" /> We found {{ sampleSheet.packIds.length }} {{ sampleSheet.packIds.length === 1 ? 'exercise' : 'exercises' }}</p>
            <h3 class="text-2xl font-semibold">Check what we found</h3>
          </div>
          <div class="space-y-5">
            <div class="space-y-2"><UiLabel for="sheet-title">Sheet title</UiLabel><UiInput id="sheet-title" v-model="title" /></div>
            <div class="grid gap-5 sm:grid-cols-2">
              <div class="space-y-2">
                <UiLabel>Course</UiLabel>
                <UiSelect v-model="courseId">
                  <UiSelectTrigger class="bg-composer h-11 w-full rounded-xl border-0" aria-label="Course"><UiSelectValue /></UiSelectTrigger>
                  <UiSelectContent><UiSelectItem v-for="c in ws.courses" :key="c.id" :value="c.id">{{ c.name }}</UiSelectItem></UiSelectContent>
                </UiSelect>
              </div>
              <div class="space-y-2"><UiLabel>Topic</UiLabel><div class="bg-composer flex h-11 items-center rounded-xl px-4 text-[15px]">{{ topicById(sampleSheet.topicId).name }}</div></div>
            </div>
          </div>
          <fieldset class="space-y-2">
            <legend class="mb-2 text-sm font-medium">Exercises to add</legend>
            <label v-for="id in sampleSheet.packIds" :key="id" class="hover:bg-accent/40 flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors">
              <UiCheckbox :model-value="included.includes(id)" :aria-label="packs[id]!.title" @update:model-value="toggle(id)" />
              <span class="min-w-0 flex-1"><span class="block text-[15px] font-medium">{{ packs[id]!.title }}</span><span class="text-muted-foreground block text-sm">Exercise {{ sampleSheet.no }}.{{ sampleSheet.packIds.indexOf(id) + 1 }} · about {{ packs[id]!.work.minutes + 6 }} minutes</span></span>
            </label>
          </fieldset>
          <div v-if="exists" class="bg-partial text-partial-foreground flex items-start gap-3 rounded-xl p-4 text-sm leading-6" role="status">
            <TriangleAlert class="mt-0.5 size-4 shrink-0" />
            <p>This course already has a sheet on {{ topicById(sampleSheet.topicId).name }}. You can find its exercises under Study → Sheets.</p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <UiButton size="lg" :disabled="!included.length || exists" @click="add">Add to course</UiButton>
            <UiButton variant="ghost" size="lg" @click="reset">Choose a different file</UiButton>
            <p v-if="!included.length" class="text-muted-foreground text-sm">Select at least one exercise to add.</p>
          </div>
        </div>
        <SheetPreview :title="`Sheet ${nextNo} · ${title || sampleSheet.title}`" :exercises="included.map(titleOf)" :file-name="source.name" :pages="source.kind === 'sample' ? sampleSheet.pages : undefined" class="lg:sticky lg:top-24 lg:self-start" />
      </div>
    </Transition>
  </div>
</template>
