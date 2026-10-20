<script setup lang="ts">
import { ChevronRight } from "@lucide/vue";
import { dayLabel, monthLabel, plural } from "~/lib/format";

useHead({ title: "History · Attempt First" });
const app = useApp();
const filter = ref("all");

const rows = computed(() =>
  [...app.state.value.history]
    .filter((h) => (filter.value === "gaps" ? h.outcome === "gaps" : true))
    .sort((a, b) => b.finishedAt.localeCompare(a.finishedAt)),
);
const groups = computed(() => {
  const map = new Map<string, typeof rows.value>();
  rows.value.forEach((h) => {
    const k = monthLabel(h.finishedAt);
    map.set(k, [...(map.get(k) ?? []), h]);
  });
  return [...map.entries()];
});
const count = (h: (typeof rows.value)[number], o: string) => h.entries.filter((e) => e.origin === o).length;
</script>

<template>
  <div class="space-y-10">
    <PageHeader eyebrow="Your sessions" title="History" text="Every finished session, with a record of who did the thinking.">
      <UiTabs v-model="filter">
        <UiTabsList class="h-12">
          <UiTabsTrigger value="all" class="px-5">All</UiTabsTrigger>
          <UiTabsTrigger value="gaps" class="px-5">To revisit</UiTabsTrigger>
        </UiTabsList>
      </UiTabs>
    </PageHeader>

    <section v-for="[month, items] in groups" :key="month" :aria-label="month">
      <h2 class="text-muted-foreground mb-2 text-sm font-semibold tracking-wide uppercase">{{ month }}</h2>
      <ul class="divide-y">
        <Reveal v-for="(h, i) in items" :key="h.id" as="li" :index="i" :delay="0.1" :y="12">
          <NuxtLink :to="`/history/${h.id}`" class="group -mx-4 grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-x-4 rounded-3xl px-4 py-5 transition-all duration-300 hover:bg-card/90 hover:shadow-md sm:grid-cols-[28px_minmax(0,1fr)_260px_24px]">
            <StatusDot :status="h.outcome" />
            <span class="min-w-0">
              <span class="font-display block truncate text-xl leading-tight font-bold">{{ app.task(h.taskId)?.title }}</span>
              <span class="text-muted-foreground block text-sm">
                {{ app.course(app.task(h.taskId)?.courseId ?? "")?.name }} · {{ dayLabel(h.finishedAt) }}
              </span>
            </span>
            <span class="hidden flex-wrap items-center gap-1.5 sm:flex">
              <Tag kind="you">{{ count(h, "you") }} yours</Tag>
              <Tag v-if="count(h, 'prompted')" kind="prompted">{{ count(h, "prompted") }} prompted</Tag>
              <Tag v-if="count(h, 'supplied')" kind="supplied">{{ plural(count(h, "supplied"), "hint") }}</Tag>
            </span>
            <ChevronRight class="text-muted-foreground size-5 transition-transform group-hover:translate-x-1" />
          </NuxtLink>
        </Reveal>
      </ul>
    </section>

    <UiEmpty v-if="!groups.length" class="rounded-[2rem] border-2 border-dashed py-16">
      <UiEmptyHeader>
        <UiEmptyTitle class="font-display text-2xl font-bold">{{ filter === "gaps" ? "Nothing to revisit" : "No sessions yet" }}</UiEmptyTitle>
        <UiEmptyDescription>{{ filter === "gaps" ? "Sessions you finish with an open point will show up here." : "Finish a task and its reflection is kept here." }}</UiEmptyDescription>
      </UiEmptyHeader>
    </UiEmpty>
  </div>
</template>
