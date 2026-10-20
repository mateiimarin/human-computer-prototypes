<script setup lang="ts">
import {
  ArrowRight,
  Camera,
  Check,
  FileText,
  Loader2,
  Plus,
  ScanLine,
  Sparkles,
  Type,
  Upload,
  X,
} from "@lucide/vue";
import { scannedSheet, daysFromNow } from "~/data/seed";
import { toast } from "vue-sonner";

definePageMeta({ layout: "flow" });
useHead({ title: "Add exercise sheet · Attempt First" });

const app = useApp();
type Step = "source" | "scan" | "review" | "done";
const step = ref<Step>("source");

/* Source */
const mode = ref("upload");
const file = ref<{ name: string; size: string } | null>(null);
const uploading = ref(false);
const progress = ref(0);
const pasted = ref("");
const dragging = ref(false);
const picker = ref<HTMLInputElement>();
const cameraPicker = ref<HTMLInputElement>();
const sourceError = ref("");

function fmtSize(b: number) {
  return b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`;
}
async function take(f: File | { name: string; size: number }) {
  sourceError.value = "";
  file.value = { name: f.name, size: fmtSize(f.size) };
  uploading.value = true;
  progress.value = 0;
  for (let i = 1; i <= 10; i++) {
    await new Promise((r) => setTimeout(r, 90));
    progress.value = i * 10;
  }
  uploading.value = false;
}
function onPick(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (f) take(f);
}
function onDrop(e: DragEvent) {
  dragging.value = false;
  const f = e.dataTransfer?.files?.[0];
  if (f) take(f);
}
function useSample() {
  take({ name: "Algorithms_Sheet_5.pdf", size: 412_000 });
}
function clearFile() {
  file.value = null;
  progress.value = 0;
}
const canScan = computed(() => (mode.value === "upload" ? !!file.value && !uploading.value : pasted.value.trim().length > 20));

/* Scan */
const stages = [
  { label: "Reading the pages", detail: "2 pages" },
  { label: "Finding where each task starts", detail: "2 tasks" },
  { label: "Matching notation to your course", detail: "Algorithms" },
];
const stage = ref(0);
async function scan() {
  if (!canScan.value) {
    sourceError.value = mode.value === "upload" ? "Choose a PDF or a photo of your sheet first." : "Paste at least a sentence of the sheet.";
    return;
  }
  step.value = "scan";
  stage.value = 0;
  for (let i = 0; i < stages.length; i++) {
    stage.value = i;
    await new Promise((r) => setTimeout(r, 1000));
  }
  stage.value = stages.length;
  await new Promise((r) => setTimeout(r, 500));
  step.value = "review";
}

/* Review */
const sheetTitle = ref(scannedSheet.sheet.title);
const courseId = ref("alg");
const newCourse = ref("");
const due = ref(scannedSheet.sheet.due);
const picked = ref<Record<string, boolean>>(Object.fromEntries(scannedSheet.tasks.map((t) => [t.id, true])));
const titles = ref<Record<string, string>>(Object.fromEntries(scannedSheet.tasks.map((t) => [t.id, t.title])));
const NEW = "__new";
const chosenCount = computed(() => Object.values(picked.value).filter(Boolean).length);
const reviewError = ref("");
const added = ref<ReturnType<typeof app.addScannedSheet>>();
const sheetNumber = scannedSheet.sheet.number;

function add() {
  reviewError.value = "";
  if (!sheetTitle.value.trim()) return (reviewError.value = "Give the sheet a title.");
  if (courseId.value === NEW && !newCourse.value.trim()) return (reviewError.value = "Name the new course.");
  if (!chosenCount.value) return (reviewError.value = "Keep at least one task to add the sheet.");
  const cid = courseId.value === NEW ? app.addCourse(newCourse.value.trim()).id : courseId.value;
  added.value = app.addScannedSheet({
    title: sheetTitle.value.trim(),
    courseId: cid,
    due: due.value,
    taskIds: scannedSheet.tasks.filter((t) => picked.value[t.id]).map((t) => t.id),
    titles: titles.value,
  });
  step.value = "done";
}
const order: Step[] = ["source", "scan", "review", "done"];
const labels = ["Upload", "Scan", "Check", "Done"];
function leave() {
  navigateTo("/library");
}
</script>

<template>
  <div class="relative min-h-dvh overflow-hidden">
    <div class="pointer-events-none absolute -top-48 -left-32 size-[460px] rounded-full opacity-50 blur-3xl" style="background: var(--lilac)" />
    <div class="pointer-events-none absolute top-1/2 -right-48 size-[440px] rounded-full opacity-60 blur-3xl" style="background: var(--sun)" />

    <header class="relative flex items-center justify-between px-5 py-5 sm:px-10">
      <button class="bg-card grid size-11 place-items-center rounded-full shadow-sm transition-transform hover:scale-105" aria-label="Close and return to the library" @click="leave">
        <X class="size-5" />
      </button>
      <ol class="flex items-center gap-1.5 text-sm font-semibold" aria-label="Progress">
        <li v-for="(l, i) in labels" :key="l" class="flex items-center gap-1.5" :aria-current="order[i] === step ? 'step' : undefined">
          <span
            class="grid h-8 place-items-center rounded-full px-3 text-xs transition-all duration-500"
            :class="order[i] === step ? 'bg-foreground text-background' : order.indexOf(step) > i ? 'bg-forest text-white' : 'bg-foreground/8 text-muted-foreground'"
          >
            <Check v-if="order.indexOf(step) > i" class="size-3.5" :stroke-width="3" />
            <template v-else>{{ l }}</template>
          </span>
        </li>
      </ol>
      <span class="size-11" />
    </header>

    <main id="main" class="relative mx-auto w-full max-w-[720px] px-5 pt-6 pb-24 sm:pt-10">
      <AnimatePresence mode="wait" :initial="false">
        <!-- SOURCE -->
        <Motion v-if="step === 'source'" key="source" :initial="{ opacity: 0, y: 24 }" :animate="{ opacity: 1, y: 0 }" :exit="{ opacity: 0, y: -16 }" :transition="{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }">
          <h1 class="font-display text-[2.3rem] leading-[1.04] font-bold text-balance sm:text-5xl">Add an exercise sheet</h1>
          <p class="text-muted-foreground mt-3 text-lg">We'll find the tasks for you. You can check them before anything is added.</p>

          <UiTabs v-model="mode" class="mt-8 gap-5">
            <UiTabsList class="h-12">
              <UiTabsTrigger value="upload" class="px-5"><Upload /> Upload</UiTabsTrigger>
              <UiTabsTrigger value="paste" class="px-5"><Type /> Paste text</UiTabsTrigger>
            </UiTabsList>

            <UiTabsContent value="upload" class="space-y-4">
              <div
                class="relative grid min-h-[260px] place-items-center rounded-[2rem] border-2 border-dashed p-8 text-center transition-all duration-300"
                :class="dragging ? 'border-iris bg-guidance scale-[1.01]' : 'border-foreground/20 bg-card/60'"
                @dragover.prevent="dragging = true"
                @dragleave.prevent="dragging = false"
                @drop.prevent="onDrop"
              >
                <div v-if="!file" class="space-y-5">
                  <span class="bg-primary mx-auto grid size-16 place-items-center rounded-3xl shadow-glow"><ScanLine class="size-8" /></span>
                  <div>
                    <p class="font-display text-xl font-bold">Drop your sheet here</p>
                    <p class="text-muted-foreground text-sm">PDF or a photo, up to 20 MB</p>
                  </div>
                  <div class="flex flex-wrap items-center justify-center gap-3">
                    <UiButton variant="dark" @click="picker?.click()"><Upload /> Choose a file</UiButton>
                    <UiButton variant="outline" @click="cameraPicker?.click()"><Camera /> Take a photo</UiButton>
                  </div>
                  <button class="text-muted-foreground hover:text-foreground text-sm font-semibold underline underline-offset-4" @click="useSample">Use a sample sheet instead</button>
                </div>
                <div v-else class="w-full max-w-md space-y-4 text-left">
                  <UiAttachment :state="uploading ? 'uploading' : 'done'" class="w-full rounded-2xl p-1">
                    <UiAttachmentMedia><FileText /></UiAttachmentMedia>
                    <UiAttachmentContent>
                      <UiAttachmentTitle>{{ file.name }}</UiAttachmentTitle>
                      <UiAttachmentDescription>{{ uploading ? `Uploading… ${progress}%` : `${file.size} · ready to scan` }}</UiAttachmentDescription>
                    </UiAttachmentContent>
                    <UiAttachmentActions>
                      <UiAttachmentAction aria-label="Remove file" @click="clearFile"><X /></UiAttachmentAction>
                    </UiAttachmentActions>
                  </UiAttachment>
                  <UiProgress v-if="uploading" :model-value="progress" class="h-1.5" />
                </div>
              </div>
              <input ref="picker" type="file" accept="application/pdf,image/*" class="sr-only" tabindex="-1" aria-hidden="true" @change="onPick" />
              <input ref="cameraPicker" type="file" accept="image/*" capture="environment" class="sr-only" tabindex="-1" aria-hidden="true" @change="onPick" />
            </UiTabsContent>

            <UiTabsContent value="paste" class="space-y-2">
              <UiLabel for="paste" class="font-semibold">Sheet text</UiLabel>
              <UiTextarea id="paste" v-model="pasted" class="min-h-[240px]" placeholder="Paste the tasks from your sheet, including numbering…" />
            </UiTabsContent>
          </UiTabs>

          <p v-if="sourceError" role="alert" class="text-destructive mt-4 text-sm font-medium">{{ sourceError }}</p>
          <div class="mt-8 flex items-center gap-3">
            <UiButton size="lg" :disabled="mode === 'upload' && uploading" @click="scan"><Sparkles /> Scan sheet</UiButton>
            <UiButton variant="ghost" size="lg" @click="leave">Cancel</UiButton>
          </div>
        </Motion>

        <!-- SCAN -->
        <Motion v-else-if="step === 'scan'" key="scan" :initial="{ opacity: 0, y: 24 }" :animate="{ opacity: 1, y: 0 }" :exit="{ opacity: 0, y: -16 }" :transition="{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }" class="pt-10 sm:pt-20">
          <div class="mx-auto grid size-24 place-items-center rounded-[2rem]" style="background: var(--grad-dusk)">
            <ScanLine class="size-11 text-white" />
          </div>
          <h1 class="font-display mt-8 text-center text-4xl leading-tight font-bold">Reading your sheet</h1>
          <p class="text-muted-foreground mt-2 text-center">This takes a few seconds.</p>
          <UiTrace class="mx-auto mt-10 max-w-sm gap-4">
            <div v-for="(s, i) in stages" :key="s.label" class="flex">
              <UiTraceLine :status="i === stage ? 'running' : i > stage ? 'pending' : undefined" class="text-base">
                <UiTraceIcon>
                  <Check v-if="i < stage" class="text-forest" :stroke-width="3" />
                  <Loader2 v-else-if="i === stage" class="animate-spin" />
                  <span v-else class="bg-foreground/25 size-1.5 rounded-full" />
                </UiTraceIcon>
                <UiTraceTitle :class="i < stage ? 'text-foreground font-medium' : ''">{{ s.label }}</UiTraceTitle>
                <UiTraceDescription v-if="i < stage">{{ s.detail }}</UiTraceDescription>
              </UiTraceLine>
            </div>
          </UiTrace>
        </Motion>

        <!-- REVIEW -->
        <Motion v-else-if="step === 'review'" key="review" :initial="{ opacity: 0, y: 24 }" :animate="{ opacity: 1, y: 0 }" :exit="{ opacity: 0, y: -16 }" :transition="{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }">
          <p class="text-forest flex items-center gap-2 text-sm font-semibold"><Check class="size-4" :stroke-width="3" /> Found {{ scannedSheet.tasks.length }} tasks</p>
          <h1 class="font-display mt-2 text-[2.3rem] leading-[1.04] font-bold text-balance sm:text-5xl">Does this look right?</h1>

          <form class="mt-8 space-y-8" novalidate @submit.prevent="add">
            <div class="grid gap-5 sm:grid-cols-2">
              <div class="space-y-2 sm:col-span-2">
                <UiLabel for="sheet-title" class="font-semibold">Sheet title</UiLabel>
                <UiInput id="sheet-title" v-model="sheetTitle" />
                <p class="text-muted-foreground text-sm">Shown as “Sheet {{ sheetNumber }} · {{ sheetTitle || "Untitled" }}”.</p>
              </div>
              <div class="space-y-2">
                <UiLabel for="course" class="font-semibold">Course</UiLabel>
                <UiSelect v-model="courseId">
                  <UiSelectTrigger id="course" class="!h-12 w-full rounded-2xl border-2 px-4 text-base"><UiSelectValue /></UiSelectTrigger>
                  <UiSelectContent class="rounded-2xl">
                    <UiSelectItem v-for="c in app.state.value.courses" :key="c.id" :value="c.id" class="rounded-xl py-2.5">{{ c.name }}</UiSelectItem>
                    <UiSelectSeparator />
                    <UiSelectItem :value="NEW" class="rounded-xl py-2.5"><Plus class="size-4" /> New course…</UiSelectItem>
                  </UiSelectContent>
                </UiSelect>
                <p class="text-muted-foreground text-sm">Detected from the sheet header.</p>
              </div>
              <div class="space-y-2">
                <UiLabel class="font-semibold">Deadline</UiLabel>
                <div><DatePopover v-model="due" class="h-12" /></div>
              </div>
              <Transition enter-active-class="transition-all duration-300" enter-from-class="-translate-y-2 opacity-0">
                <div v-if="courseId === NEW" class="space-y-2 sm:col-span-2">
                  <UiLabel for="new-course" class="font-semibold">New course name</UiLabel>
                  <UiInput id="new-course" v-model="newCourse" placeholder="e.g. Probability" />
                </div>
              </Transition>
            </div>

            <fieldset class="space-y-3">
              <legend class="font-display text-2xl font-bold">Tasks</legend>
              <p class="text-muted-foreground text-sm">Untick anything that isn't a task. You can rename them.</p>
              <ul class="divide-y">
                <li v-for="(t, i) in scannedSheet.tasks" :key="t.id" class="py-5">
                  <Reveal :index="i" :delay="0.1" class="flex items-start gap-4">
                    <UiCheckbox :id="`pick-${t.id}`" v-model="picked[t.id]" class="mt-3 size-6 rounded-lg" :aria-label="`Include task ${t.number}`" />
                    <div class="min-w-0 flex-1 space-y-2" :class="picked[t.id] ? '' : 'opacity-50'">
                      <div class="flex items-center gap-3">
                        <span class="bg-foreground text-background grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold">{{ t.number }}</span>
                        <UiInput v-model="titles[t.id]" :disabled="!picked[t.id]" class="h-11" :aria-label="`Title of task ${t.number}`" />
                      </div>
                      <p class="text-muted-foreground pl-11 text-sm leading-snug">“{{ scannedSheet.excerpts[t.id] }}”</p>
                    </div>
                  </Reveal>
                </li>
              </ul>
            </fieldset>

            <p v-if="reviewError" role="alert" class="text-destructive text-sm font-medium">{{ reviewError }}</p>
            <div class="flex items-center gap-3">
              <UiButton type="submit" size="lg">Add {{ chosenCount === 1 ? "1 task" : `${chosenCount} tasks` }} <ArrowRight /></UiButton>
              <UiButton type="button" variant="ghost" size="lg" @click="step = 'source'">Back</UiButton>
            </div>
          </form>
        </Motion>

        <!-- DONE -->
        <Motion v-else key="done" :initial="{ opacity: 0, scale: 0.96 }" :animate="{ opacity: 1, scale: 1 }" :transition="{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }" class="pt-10 text-center sm:pt-20">
          <Motion :initial="{ scale: 0, rotate: -30 }" :animate="{ scale: 1, rotate: 0 }" :transition="{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }" class="bg-forest mx-auto grid size-24 place-items-center rounded-[2rem] text-white shadow-lg">
            <Check class="size-12" :stroke-width="3" />
          </Motion>
          <h1 class="font-display mt-8 text-4xl leading-tight font-bold sm:text-5xl">Sheet {{ added?.number }} is in your library</h1>
          <p class="text-muted-foreground mx-auto mt-3 max-w-md text-lg">
            {{ added?.taskIds.length === 1 ? "1 task is" : `${added?.taskIds.length} tasks are` }} ready, due {{ new Date(added?.due ?? due).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) }}.
          </p>
          <div class="mt-9 flex flex-wrap items-center justify-center gap-3">
            <UiButton size="xl" @click="navigateTo(`/task/${added?.taskIds[0]}`)">Start task 1 <ArrowRight /></UiButton>
            <UiButton variant="outline" size="xl" @click="navigateTo(`/library/${added?.id}`)">View sheet</UiButton>
          </div>
        </Motion>
      </AnimatePresence>
    </main>
  </div>
</template>
