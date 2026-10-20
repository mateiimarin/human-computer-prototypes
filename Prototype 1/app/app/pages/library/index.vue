<script setup lang="ts">
import { ChevronRight, Plus, Search } from "@lucide/vue";
import { dueLabel, dueTone, plural } from "~/lib/format";

useHead({ title: "Library · Attempt First" });
const app = useApp();
const filter = ref("all");
const q = ref("");

const groups = computed(() =>
  app.state.value.courses
    .map((course) => {
      const sheets = app.state.value.sheets
        .filter((s) => s.courseId === course.id)
        .filter((s) => {
          const p = app.sheetProgress(s.id);
          const finished = p.done === p.total;
          if (filter.value === "open" && finished) return false;
          if (filter.value === "finished" && !finished) return false;
          const needle = q.value.trim().toLowerCase();
          if (!needle) return true;
          const names = [s.title, course.name, ...s.taskIds.map((id) => app.task(id)?.title ?? "")].join(" ").toLowerCase();
          return names.includes(needle);
        })
        .sort((a, b) => b.number - a.number);
      return { course, sheets };
    })
    .filter((g) => g.sheets.length),
);
const total = computed(() => app.state.value.sheets.length);
</script>

<template>
  <div class="space-y-10">
    <PageHeader eyebrow="Your courses" title="Library" text="Every exercise sheet you've added, grouped by course.">
      <UiButton size="lg" @click="navigateTo('/library/new')"><Plus /> Add exercise sheet</UiButton>
    </PageHeader>

    <Reveal :delay="0.2" class="flex flex-wrap items-center justify-between gap-4">
      <UiTabs v-model="filter">
        <UiTabsList class="h-12">
          <UiTabsTrigger value="all" class="px-5">All</UiTabsTrigger>
          <UiTabsTrigger value="open" class="px-5">Open</UiTabsTrigger>
          <UiTabsTrigger value="finished" class="px-5">Finished</UiTabsTrigger>
        </UiTabsList>
      </UiTabs>
      <div class="relative w-full sm:w-72">
        <Search class="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2" />
        <UiInput v-model="q" class="h-12 rounded-full pl-11" placeholder="Search sheets and tasks" aria-label="Search sheets and tasks" />
      </div>
    </Reveal>

    <div v-if="groups.length" class="space-y-14">
      <section v-for="(g, gi) in groups" :key="g.course.id" :aria-labelledby="`course-${g.course.id}`">
        <Reveal :index="gi" :delay="0.25" class="mb-4 flex items-center gap-5">
          <div class="size-[88px] shrink-0 overflow-hidden rounded-[1.6rem] shadow-md"><CourseArt :tone="g.course.tone" :illo="g.course.illo" /></div>
          <div>
            <h2 :id="`course-${g.course.id}`" class="font-display text-3xl leading-tight font-bold">{{ g.course.name }}</h2>
            <p class="text-muted-foreground">{{ g.course.term }} · {{ plural(g.sheets.length, "sheet") }}</p>
          </div>
        </Reveal>
        <ul class="divide-y">
          <Reveal v-for="(s, i) in g.sheets" :key="s.id" as="li" :index="i" :delay="0.32 + gi * 0.05" :y="12">
            <NuxtLink :to="`/library/${s.id}`" class="group -mx-4 grid items-center gap-x-6 gap-y-3 rounded-3xl px-4 py-5 transition-all duration-300 hover:bg-card/90 hover:shadow-md sm:grid-cols-[minmax(0,1fr)_200px_24px]">
              <span class="min-w-0">
                <span class="font-display block text-xl leading-tight font-bold">Sheet {{ s.number }} · {{ s.title }}</span>
                <span class="text-muted-foreground mt-1 block text-sm" :class="dueTone(s.due) === 'soon' && app.sheetProgress(s.id).done < app.sheetProgress(s.id).total ? 'text-warning-foreground font-semibold' : ''">
                  {{ app.sheetProgress(s.id).done === app.sheetProgress(s.id).total ? "Finished" : dueLabel(s.due) }}
                </span>
              </span>
              <span class="space-y-1.5">
                <SegmentBar v-bind="app.sheetProgress(s.id)" />
                <span class="text-muted-foreground block text-xs font-semibold">{{ app.sheetProgress(s.id).done }} of {{ plural(app.sheetProgress(s.id).total, "task") }} finished</span>
              </span>
              <ChevronRight class="text-muted-foreground hidden size-5 transition-transform group-hover:translate-x-1 sm:block" />
            </NuxtLink>
          </Reveal>
        </ul>
      </section>
    </div>

    <UiEmpty v-else class="rounded-[2rem] border-2 border-dashed py-16">
      <UiEmptyHeader>
        <UiEmptyTitle class="font-display text-2xl font-bold">{{ total ? "No sheets match" : "Your library is empty" }}</UiEmptyTitle>
        <UiEmptyDescription>{{ total ? "Try another filter or search term." : "Add an exercise sheet and Attempt First will find its tasks for you." }}</UiEmptyDescription>
      </UiEmptyHeader>
      <UiButton v-if="!total" variant="dark" @click="navigateTo('/library/new')"><Plus /> Add exercise sheet</UiButton>
      <UiButton v-else variant="secondary" @click="(filter = 'all'), (q = '')">Clear filters</UiButton>
    </UiEmpty>
  </div>
</template>
