<script setup lang="ts">
import { useEventListener } from "@vueuse/core";
import { BookOpen, CornerDownLeft, FileText, History, Home, Plus, Settings, SlidersHorizontal } from "@lucide/vue";
import { scenarioLabels } from "~/domain/session";
import type { Scenario } from "~/data/types";

const { open } = useCommandMenu();
const app = useApp();
const route = useRoute();

useEventListener("keydown", (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    open.value = !open.value;
  }
});

function go(to: string) {
  open.value = false;
  navigateTo(to);
}
function setScenario(s: Scenario) {
  app.state.value.scenario = s;
  const id = route.params.id as string | undefined;
  const sess = id ? app.session(id) : undefined;
  if (sess) sess.scenario = s;
  open.value = false;
}
const pages = [
  { label: "Today", to: "/", icon: Home },
  { label: "Library", to: "/library", icon: BookOpen },
  { label: "History", to: "/history", icon: History },
  { label: "Settings", to: "/settings", icon: Settings },
  { label: "Assistance defaults", to: "/settings?tab=assistance", icon: SlidersHorizontal },
];
</script>

<template>
  <UiCommandDialog v-model:open="open" title="Search" description="Jump to a task, sheet, or page">
    <UiCommandInput placeholder="Search tasks, sheets and pages…" />
    <UiCommandList class="max-h-[min(420px,60dvh)] p-1.5">
      <UiCommandEmpty>Nothing matches. Try a task name or a page.</UiCommandEmpty>
      <UiCommandGroup heading="Go to">
        <UiCommandItem v-for="p in pages" :key="p.to" :value="p.label" class="rounded-xl py-2.5" @select="go(p.to)">
          <component :is="p.icon" /> {{ p.label }}
        </UiCommandItem>
        <UiCommandItem value="Add exercise sheet upload" class="rounded-xl py-2.5" @select="go('/library/new')">
          <Plus /> Add exercise sheet
        </UiCommandItem>
      </UiCommandGroup>
      <UiCommandGroup heading="Tasks">
        <UiCommandItem
          v-for="t in app.state.value.tasks"
          :key="t.id"
          :value="`${t.title} ${app.course(t.courseId)?.name} ${t.topic}`"
          class="rounded-xl py-2.5"
          @select="go(`/task/${t.id}`)"
        >
          <FileText />
          <span class="flex-1">{{ t.title }}</span>
          <span class="text-muted-foreground text-xs">{{ app.course(t.courseId)?.name }}</span>
        </UiCommandItem>
      </UiCommandGroup>
      <UiCommandGroup heading="Review outcome for the next check">
        <UiCommandItem
          v-for="(label, key) in scenarioLabels"
          :key="key"
          :value="`outcome ${label}`"
          class="rounded-xl py-2.5"
          @select="setScenario(key as Scenario)"
        >
          <CornerDownLeft />
          <span class="flex-1">{{ label }}</span>
          <span v-if="app.state.value.scenario === key" class="text-muted-foreground text-xs">Selected</span>
        </UiCommandItem>
      </UiCommandGroup>
    </UiCommandList>
  </UiCommandDialog>
</template>
