<script setup lang="ts">
import { useEventListener } from "@vueuse/core";
import { CornerDownLeft, FileText } from "@lucide/vue";
import { scenarioLabels } from "~/domain/session";
import type { Scenario } from "~/data/types";

/** Facilitator tool, ⌘K only: jump to an exercise or choose which prepared review outcome comes next. */
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
</script>

<template>
  <UiCommandDialog v-model:open="open" title="Jump to" description="Open an exercise or choose the next review outcome">
    <UiCommandInput placeholder="Search exercises…" />
    <UiCommandList class="max-h-[min(420px,60dvh)] p-1.5">
      <UiCommandEmpty>Nothing matches.</UiCommandEmpty>
      <UiCommandGroup heading="Exercises">
        <UiCommandItem v-for="t in app.tasks" :key="t.id" :value="`${t.title} ${t.course} ${t.topic}`" class="rounded-xl py-2.5" @select="go(`/task/${t.id}`)">
          <FileText />
          <span class="flex-1">{{ t.title }}</span>
          <span class="text-muted-foreground text-xs">{{ t.course }}</span>
        </UiCommandItem>
      </UiCommandGroup>
      <UiCommandGroup heading="Review outcome for the next check">
        <UiCommandItem v-for="(label, key) in scenarioLabels" :key="key" :value="`outcome ${label}`" class="rounded-xl py-2.5" @select="setScenario(key as Scenario)">
          <CornerDownLeft />
          <span class="flex-1">{{ label }}</span>
          <span v-if="app.state.value.scenario === key" class="text-muted-foreground text-xs">Selected</span>
        </UiCommandItem>
      </UiCommandGroup>
    </UiCommandList>
  </UiCommandDialog>
</template>
