<script setup lang="ts">
import { ArrowRight, ChevronLeft, Clock, EllipsisVertical, Eraser, MessagesSquare, PenLine, RotateCcw, ScrollText, SearchCheck, Sprout } from "@lucide/vue";
import { toast } from "vue-sonner";
import { dayLabel } from "~/lib/format";
import { phasePath } from "~/lib/journey";

const app = useApp();
const id = useTaskId();
const task = computed(() => app.task(id.value)!);
const sheet = computed(() => app.sheet(task.value.sheetId));
const course = computed(() => app.course(task.value.courseId)!);
const content = computed(() => app.content(id.value));
const status = computed(() => app.status(id.value));
const session = computed(() => app.session(id.value));
const past = computed(() => app.historyFor(id.value));
const discardOpen = ref(false);
useHead({ title: computed(() => `${task.value.title} · Attempt First`) });

const primary = computed(() => {
  if (status.value === "inprogress" && session.value) return { label: "Continue", go: phasePath(id.value, session.value.phase) };
  if (status.value === "new") return { label: "Start working", go: `/task/${id.value}/setup` };
  return undefined;
});
function reopen() {
  if (app.reopen(id.value)) navigateTo(`/task/${id.value}/work`);
}
function discard() {
  app.discardSession(id.value);
  discardOpen.value = false;
  toast.success("Session discarded", { description: "Your attempt and hints for this task were removed." });
}
const steps = [
  { icon: PenLine, tone: "bg-sun", title: "Attempt it", text: "Work on your own page first." },
  { icon: MessagesSquare, tone: "bg-lilac", title: "Ask for a nudge", text: "Questions and small hints, when you want them." },
  { icon: SearchCheck, tone: "bg-mint", title: "Get it reviewed", text: "Specific feedback on what you submitted." },
  { icon: ScrollText, tone: "bg-blush", title: "See who thought it", text: "Which ideas were yours, and which were prompted." },
];
</script>

<template>
  <div class="space-y-10">
    <NuxtLink :to="sheet ? `/library/${sheet.id}` : '/library'" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-semibold">
      <ChevronLeft class="size-4" /> {{ sheet ? `Sheet ${sheet.number} · ${sheet.title}` : "Library" }}
    </NuxtLink>

    <section class="relative isolate overflow-hidden rounded-[2.25rem] p-7 sm:p-10" :style="{ background: `var(--grad-${course.tone})` }">
      <div class="absolute inset-y-0 right-0 -z-10 hidden w-[46%] sm:block" style="mask-image: linear-gradient(to right, transparent, black 35%); -webkit-mask-image: linear-gradient(to right, transparent, black 35%)">
        <CourseArt :tone="course.tone" :illo="course.illo" bare />
      </div>
      <div :class="['flex min-h-[230px] flex-col justify-between gap-8 sm:max-w-[60%]', course.tone === 'dusk' ? 'text-white' : '']">
        <div class="space-y-2">
          <Reveal as="p" :y="8" class="text-sm font-semibold opacity-80">{{ course.name }} · Task {{ task.number }}</Reveal>
          <Reveal as="h1" :delay="0.05" class="font-display text-4xl leading-[1.02] font-bold text-balance sm:text-5xl">{{ task.title }}</Reveal>
          <Reveal as="p" :delay="0.12" class="flex flex-wrap items-center gap-x-4 gap-y-1 font-medium opacity-85">
            <span>{{ task.topic }}</span>
            <span class="inline-flex items-center gap-1.5 whitespace-nowrap"><Clock class="size-4" /> About {{ task.minutes }} min</span>
          </Reveal>
        </div>
        <Reveal :delay="0.18" class="flex flex-wrap items-center gap-3">
          <UiButton v-if="primary" variant="dark" size="xl" @click="navigateTo(primary.go)">{{ primary.label }} <ArrowRight /></UiButton>
          <template v-else-if="past[0]">
            <UiButton variant="dark" size="xl" @click="navigateTo(`/history/${past[0].id}`)">View reflection <ArrowRight /></UiButton>
            <UiButton v-if="past[0].session" variant="secondary" size="xl" class="bg-white/60 hover:bg-white/80" @click="reopen"><RotateCcw /> Reopen task</UiButton>
          </template>
          <UiDropdownMenu v-if="status === 'inprogress'">
            <UiDropdownMenuTrigger as-child><UiButton variant="secondary" size="icon-lg" class="bg-white/60 hover:bg-white/80" aria-label="More actions"><EllipsisVertical /></UiButton></UiDropdownMenuTrigger>
            <UiDropdownMenuContent align="start" class="w-56 rounded-2xl p-1.5">
              <UiDropdownMenuItem variant="destructive" class="rounded-xl py-2.5" @select="discardOpen = true"><Eraser /> Discard this session</UiDropdownMenuItem>
            </UiDropdownMenuContent>
          </UiDropdownMenu>
        </Reveal>
      </div>
    </section>

    <div v-if="content" class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
      <section aria-labelledby="problem">
        <h2 id="problem" class="font-display mb-4 text-3xl font-bold">The task</h2>
        <Reveal :delay="0.1" class="bg-card space-y-5 rounded-[2rem] p-7 shadow-md sm:p-9">
          <p class="text-xl leading-9"><RichText :text="content.statement" /></p>
          <div v-if="content.givens.length" class="bg-foreground/[0.04] space-y-2 rounded-2xl px-5 py-4 text-lg">
            <p v-for="g in content.givens" :key="g"><RichText :text="g" /></p>
          </div>
          <CodeSnippet v-if="content.code" :code="content.code.source" :lang="content.code.lang" :title="`${content.code.lang} · read-only`" />
        </Reveal>
        <p class="text-muted-foreground mt-4 flex items-start gap-2.5 text-[15px]"><Sprout class="mt-0.5 size-4 shrink-0" /> {{ content.reminder }}</p>
      </section>

      <aside aria-labelledby="how">
        <h2 id="how" class="font-display mb-4 text-2xl font-bold">How a session goes</h2>
        <ol class="space-y-5">
          <li v-for="(s, i) in steps" :key="s.title">
            <Reveal :index="i" :delay="0.2" :y="14" class="flex items-start gap-3.5">
              <span :class="['grid size-10 shrink-0 place-items-center rounded-2xl', s.tone]"><component :is="s.icon" class="size-[18px]" /></span>
              <span>
                <span class="block text-[15px] leading-tight font-bold">{{ s.title }}</span>
                <span class="text-muted-foreground block text-sm leading-snug">{{ s.text }}</span>
              </span>
            </Reveal>
          </li>
        </ol>
      </aside>
    </div>

    <section v-else class="bg-card rounded-[2rem] p-8 shadow-md">
      <h2 class="font-display text-2xl font-bold">You finished this task</h2>
      <p class="text-muted-foreground mt-1">Your reflection from {{ past[0] ? dayLabel(past[0].finishedAt) : "an earlier session" }} is kept in History.</p>
    </section>

    <section v-if="past.length" aria-labelledby="past">
      <h2 id="past" class="font-display mb-2 text-2xl font-bold">Earlier sessions</h2>
      <ul class="divide-y">
        <li v-for="h in past" :key="h.id">
          <NuxtLink :to="`/history/${h.id}`" class="-mx-4 flex items-center gap-4 rounded-2xl px-4 py-4 transition-colors hover:bg-card/80">
            <StatusDot :status="h.outcome" />
            <span class="flex-1">
              <span class="block font-semibold">{{ dayLabel(h.finishedAt) }}</span>
              <span class="text-muted-foreground block text-sm">{{ h.outcome === "resolved" ? "Finished" : "Finished with a point to revisit" }} · {{ h.attempts }} {{ h.attempts === 1 ? "attempt" : "attempts" }}</span>
            </span>
            <ArrowRight class="text-muted-foreground size-4" />
          </NuxtLink>
        </li>
      </ul>
    </section>

    <UiAlertDialog v-model:open="discardOpen">
      <UiAlertDialogContent>
        <UiAlertDialogHeader>
          <UiAlertDialogTitle>Discard this session?</UiAlertDialogTitle>
          <UiAlertDialogDescription>Your attempt, revealed hints, tutor conversation and reviews for this task are removed. This can't be undone.</UiAlertDialogDescription>
        </UiAlertDialogHeader>
        <UiAlertDialogFooter>
          <UiAlertDialogCancel>Stay</UiAlertDialogCancel>
          <UiAlertDialogAction class="bg-destructive hover:bg-destructive/90 text-white" @click="discard">Discard session</UiAlertDialogAction>
        </UiAlertDialogFooter>
      </UiAlertDialogContent>
    </UiAlertDialog>
  </div>
</template>
