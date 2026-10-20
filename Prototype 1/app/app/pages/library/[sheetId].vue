<script setup lang="ts">
import { ChevronLeft, EllipsisVertical, Pencil, Plus, Trash2 } from "@lucide/vue";
import { toast } from "vue-sonner";
import { dueLabel, plural } from "~/lib/format";

const app = useApp();
const route = useRoute();
const sheet = computed(() => app.sheet(String(route.params.sheetId)));
if (!sheet.value) await navigateTo("/library", { replace: true });
const course = computed(() => (sheet.value ? app.course(sheet.value.courseId) : undefined));
const progress = computed(() => app.sheetProgress(sheet.value?.id ?? ""));
useHead({ title: computed(() => (sheet.value ? `Sheet ${sheet.value.number} · Attempt First` : "Attempt First")) });

const renameOpen = ref(false);
const deleteOpen = ref(false);
const name = ref("");
function openRename() {
  name.value = sheet.value?.title ?? "";
  renameOpen.value = true;
}
function rename() {
  if (!sheet.value || !name.value.trim()) return;
  sheet.value.title = name.value.trim();
  renameOpen.value = false;
  toast.success("Sheet renamed");
}
async function remove() {
  const id = sheet.value!.id;
  deleteOpen.value = false;
  await navigateTo("/library");
  app.removeSheet(id);
  toast.success("Sheet removed from your library", { description: "Past sessions stay in History." });
}
const tasks = computed(() => (sheet.value?.taskIds ?? []).map((id) => app.task(id)).filter(Boolean));
</script>

<template>
  <div v-if="sheet && course" class="space-y-10">
    <NuxtLink to="/library" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-semibold"><ChevronLeft class="size-4" /> Library</NuxtLink>

    <section class="relative isolate overflow-hidden rounded-[2.25rem] p-7 sm:p-10" :style="{ background: `var(--grad-${course.tone === 'sunrise' ? 'sunrise' : course.tone})` }">
      <div class="absolute inset-y-0 right-0 -z-10 hidden w-[46%] sm:block" style="mask-image: linear-gradient(to right, transparent, black 35%); -webkit-mask-image: linear-gradient(to right, transparent, black 35%)">
        <CourseArt :tone="course.tone" :illo="course.illo" bare />
      </div>
      <div :class="['flex min-h-[220px] flex-col justify-between gap-8 sm:max-w-[58%]', course.tone === 'dusk' ? 'text-white' : '']">
        <div class="space-y-2">
          <Reveal as="p" :y="8" class="text-sm font-semibold opacity-80">{{ course.name }}</Reveal>
          <Reveal as="h1" :delay="0.05" class="font-display text-4xl leading-[1.02] font-bold text-balance sm:text-5xl">Sheet {{ sheet.number }} · {{ sheet.title }}</Reveal>
          <Reveal as="p" :delay="0.12" class="font-medium opacity-85">{{ progress.done === progress.total ? "Finished" : dueLabel(sheet.due) }} · {{ plural(sheet.taskIds.length, "task") }}</Reveal>
        </div>
        <Reveal :delay="0.18" class="space-y-4">
          <div class="max-w-sm"><SegmentBar v-bind="progress" tone="light" /></div>
          <div class="flex flex-wrap items-center gap-2">
            <DatePopover v-model="sheet.due" variant="secondary" />
            <UiDropdownMenu>
              <UiDropdownMenuTrigger as-child>
                <UiButton variant="secondary" size="icon" aria-label="Sheet actions"><EllipsisVertical /></UiButton>
              </UiDropdownMenuTrigger>
              <UiDropdownMenuContent align="start" class="w-52 rounded-2xl p-1.5">
                <UiDropdownMenuItem class="rounded-xl py-2.5" @select="openRename"><Pencil /> Rename sheet</UiDropdownMenuItem>
                <UiDropdownMenuItem class="rounded-xl py-2.5" @select="navigateTo('/library/new')"><Plus /> Add another sheet</UiDropdownMenuItem>
                <UiDropdownMenuSeparator />
                <UiDropdownMenuItem variant="destructive" class="rounded-xl py-2.5" @select="deleteOpen = true"><Trash2 /> Remove sheet</UiDropdownMenuItem>
              </UiDropdownMenuContent>
            </UiDropdownMenu>
          </div>
        </Reveal>
      </div>
    </section>

    <section aria-labelledby="tasks">
      <h2 id="tasks" class="font-display mb-3 text-3xl font-bold">Tasks</h2>
      <ol class="-ml-1">
        <TaskRow v-for="(t, i) in tasks" :key="t!.id" :task="t!" :sheet="sheet" timeline :last="i === tasks.length - 1" :index="i" />
      </ol>
    </section>

    <UiDialog v-model:open="renameOpen">
      <UiDialogContent>
        <UiDialogHeader>
          <UiDialogTitle class="font-display text-2xl font-bold">Rename sheet</UiDialogTitle>
          <UiDialogDescription>The sheet number stays the same.</UiDialogDescription>
        </UiDialogHeader>
        <form class="space-y-5" @submit.prevent="rename">
          <div class="space-y-2">
            <UiLabel for="rename" class="font-semibold">Title</UiLabel>
            <UiInput id="rename" v-model="name" />
          </div>
          <UiDialogFooter>
            <UiButton type="button" variant="ghost" @click="renameOpen = false">Cancel</UiButton>
            <UiButton type="submit" :disabled="!name.trim()">Save</UiButton>
          </UiDialogFooter>
        </form>
      </UiDialogContent>
    </UiDialog>

    <UiAlertDialog v-model:open="deleteOpen">
      <UiAlertDialogContent>
        <UiAlertDialogHeader>
          <UiAlertDialogTitle>Remove this sheet?</UiAlertDialogTitle>
          <UiAlertDialogDescription>
            Its tasks and any unfinished sessions on them are removed from your library. Finished sessions stay in History.
          </UiAlertDialogDescription>
        </UiAlertDialogHeader>
        <UiAlertDialogFooter>
          <UiAlertDialogCancel>Keep sheet</UiAlertDialogCancel>
          <UiAlertDialogAction class="bg-destructive hover:bg-destructive/90 text-white" @click="remove">Remove sheet</UiAlertDialogAction>
        </UiAlertDialogFooter>
      </UiAlertDialogContent>
    </UiAlertDialog>
  </div>
</template>
