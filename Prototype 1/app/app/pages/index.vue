<script setup lang="ts">
import { ArrowRight, BookOpen, Plus } from "@lucide/vue";
import { dayLabel, dueLabel, greeting, plural, todayLabel } from "~/lib/format";

useHead({ title: "Today · Attempt First" });
const app = useApp();

const active = computed(() => app.activeSessions.value[0]);
const next = computed(() => {
  if (active.value) {
    const t = app.task(active.value.taskId);
    if (t) return { task: t, sheet: app.sheet(t.sheetId), resume: true };
  }
  const o = app.openTasks.value.find((x) => app.hasContent(x.task.id)) ?? app.openTasks.value[0];
  return o ? { ...o, resume: false } : undefined;
});
const upNext = computed(() => app.openTasks.value.slice(0, 5));
const recent = computed(() => [...app.state.value.history].sort((a, b) => b.finishedAt.localeCompare(a.finishedAt)).slice(0, 4));
const sheetLeft = computed(() => (next.value?.sheet ? app.sheetProgress(next.value.sheet.id) : undefined));

function resumePath() {
  const s = active.value;
  if (!s) return `/task/${next.value?.task.id}`;
  return `/task/${s.taskId}/${s.phase === "done" ? "reflect" : s.phase}`;
}
function historyTitle(taskId: string) {
  return app.task(taskId)?.title ?? "Task";
}
</script>

<template>
  <div class="space-y-12 lg:space-y-14">
    <!-- Hero -->
    <section class="relative isolate overflow-hidden rounded-[2.25rem] p-7 sm:p-10" style="background: var(--grad-sunrise)" aria-labelledby="hello">
      <div class="absolute inset-y-0 right-0 -z-10 hidden w-[48%] sm:block" style="mask-image: linear-gradient(to right, transparent, black 38%); -webkit-mask-image: linear-gradient(to right, transparent, black 38%)">
        <CourseArt tone="sunrise" illo="stairs" bare />
      </div>
      <div class="flex min-h-[250px] flex-col justify-between gap-10 sm:max-w-[58%] xl:max-w-xl">
        <div class="space-y-3">
          <Reveal as="p" :y="8" class="text-sm font-semibold text-foreground/70">{{ todayLabel() }}</Reveal>
          <Reveal as="h1" id="hello" :delay="0.06" class="font-display text-[2.4rem] leading-[1.02] font-bold text-balance sm:text-5xl xl:text-6xl">
            {{ greeting() }}, {{ app.state.value.user.name }}.
          </Reveal>
          <Reveal v-if="next" as="p" :delay="0.14" class="max-w-md text-lg leading-snug font-medium text-foreground/80">
            <template v-if="next.resume">You were partway through <strong>{{ next.task.title }}</strong>. Your attempt is right where you left it.</template>
            <template v-else-if="next.sheet">{{ app.course(next.task.courseId)?.name }}, sheet {{ next.sheet.number }}: {{ plural((sheetLeft?.total ?? 0) - (sheetLeft?.done ?? 0), 'task') }} to go. {{ dueLabel(next.sheet.due) }}.</template>
          </Reveal>
          <Reveal v-else as="p" :delay="0.14" class="max-w-md text-lg leading-snug font-medium text-foreground/80">You're all caught up. Add a new exercise sheet when the next one arrives.</Reveal>
        </div>
        <Reveal :delay="0.22" class="flex flex-wrap items-center gap-3">
          <UiButton v-if="next" variant="dark" size="xl" @click="navigateTo(next.resume ? resumePath() : `/task/${next.task.id}`)">
            {{ next.resume ? "Continue" : "Start" }} task {{ next.task.number }} <ArrowRight />
          </UiButton>
          <UiButton :variant="next ? 'secondary' : 'dark'" size="xl" :class="next ? 'bg-white/55 hover:bg-white/75' : ''" @click="navigateTo('/library/new')"><Plus /> Add a sheet</UiButton>
        </Reveal>
      </div>
    </section>

    <div class="grid gap-12 xl:grid-cols-[minmax(0,1fr)_330px] xl:gap-14">
      <!-- Up next -->
      <section aria-labelledby="upnext">
        <div class="mb-3 flex items-end justify-between gap-4">
          <h2 id="upnext" class="font-display text-3xl font-bold">Up next</h2>
          <NuxtLink to="/library" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm font-semibold">
            <BookOpen class="size-4" /> Library
          </NuxtLink>
        </div>
        <ol v-if="upNext.length" class="-ml-1">
          <TaskRow v-for="(x, i) in upNext" :key="x.task.id" :task="x.task" :sheet="x.sheet" timeline :last="i === upNext.length - 1" :index="i" />
        </ol>
        <UiEmpty v-else class="rounded-[2rem] border-2 border-dashed py-14">
          <UiEmptyHeader>
            <UiEmptyTitle class="font-display text-2xl font-bold">Nothing due. Enjoy it.</UiEmptyTitle>
            <UiEmptyDescription>New sheets you add will show up here, ordered by deadline.</UiEmptyDescription>
          </UiEmptyHeader>
          <UiButton variant="dark" @click="navigateTo('/library/new')"><Plus /> Add a sheet</UiButton>
        </UiEmpty>
      </section>

      <aside class="space-y-12">
        <section v-if="app.revisit.value.length" aria-labelledby="revisit">
          <h2 id="revisit" class="font-display mb-1 text-2xl font-bold">Worth another look</h2>
          <p class="text-muted-foreground mb-4 text-sm">Points you left open in earlier sessions.</p>
          <ul class="divide-y">
            <li v-for="r in app.revisit.value.slice(0, 3)" :key="r.entry.id + r.gap">
              <NuxtLink :to="r.entry.live ? `/task/${r.entry.taskId}` : `/history/${r.entry.id}`" class="group -mx-3 block rounded-2xl px-3 py-3.5 transition-colors hover:bg-card/80">
                <RichText :text="r.gap" class="block text-[15px] leading-snug font-semibold" />
                <span class="text-muted-foreground mt-1 flex items-center justify-between gap-2 text-sm">
                  {{ historyTitle(r.entry.taskId) }}
                  <ArrowRight class="size-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </span>
              </NuxtLink>
            </li>
          </ul>
        </section>

        <section v-if="recent.length" aria-labelledby="recent">
          <div class="mb-3 flex items-end justify-between">
            <h2 id="recent" class="font-display text-2xl font-bold">Recent sessions</h2>
            <NuxtLink to="/history" class="text-muted-foreground hover:text-foreground text-sm font-semibold">All</NuxtLink>
          </div>
          <ul class="divide-y">
            <li v-for="h in recent" :key="h.id">
              <NuxtLink :to="`/history/${h.id}`" class="-mx-3 flex items-center gap-3 rounded-2xl px-3 py-3.5 transition-colors hover:bg-card/80">
                <StatusDot :status="h.outcome" />
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-[15px] font-semibold">{{ historyTitle(h.taskId) }}</span>
                  <span class="text-muted-foreground block text-sm">{{ dayLabel(h.finishedAt) }}</span>
                </span>
              </NuxtLink>
            </li>
          </ul>
        </section>
      </aside>
    </div>
  </div>
</template>
