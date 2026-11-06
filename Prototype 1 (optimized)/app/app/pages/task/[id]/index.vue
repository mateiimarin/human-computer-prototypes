<script setup lang="ts">
import { ArrowRight, ChevronLeft, RotateCcw } from "@lucide/vue";
import { phasePath } from "~/lib/journey";

const app = useApp();
const id = useTaskId();
const task = computed(() => app.task(id.value)!);
const content = computed(() => app.content(id.value)!);
const status = computed(() => app.status(id.value));
const session = computed(() => app.session(id.value));
useHead({ title: computed(() => `${task.value.title} · Attempt First`) });

function reopen() {
  if (app.reopen(id.value)) navigateTo(`/task/${id.value}/work`);
}
</script>

<template>
  <div class="space-y-9">
    <NuxtLink to="/" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-semibold">
      <ChevronLeft class="size-4" /> Exercises
    </NuxtLink>

    <header class="space-y-2">
      <Reveal as="p" :y="8" class="text-muted-foreground text-sm font-semibold">{{ task.course }} · {{ task.topic }}</Reveal>
      <Reveal as="h1" :delay="0.05" class="font-display text-4xl leading-[1.05] font-bold text-balance sm:text-5xl">{{ task.title }}</Reveal>
    </header>

    <Reveal :delay="0.1" as="section" aria-label="The exercise" class="bg-card space-y-5 rounded-[2rem] p-7 shadow-md sm:p-9">
      <p class="text-xl leading-9"><RichText :text="content.statement" /></p>
      <div v-if="content.givens.length" class="bg-foreground/[0.04] space-y-2 rounded-2xl px-5 py-4 text-lg">
        <p v-for="g in content.givens" :key="g"><RichText :text="g" /></p>
      </div>
      <CodeSnippet v-if="content.code" :code="content.code.source" :lang="content.code.lang" :title="`${content.code.lang} · read-only`" />
    </Reveal>

    <Reveal :delay="0.16" class="flex flex-wrap items-center gap-3">
      <UiButton v-if="status === 'finished'" size="xl" @click="navigateTo(phasePath(id, 'reflect'))">View reflection <ArrowRight /></UiButton>
      <UiButton v-else size="xl" @click="navigateTo(status === 'inprogress' && session ? phasePath(id, session.phase) : `/task/${id}/setup`)">
        {{ status === "inprogress" ? "Continue" : "Start" }} <ArrowRight />
      </UiButton>
      <UiButton v-if="status === 'finished'" variant="outline" size="xl" @click="reopen"><RotateCcw /> Reopen</UiButton>
    </Reveal>
  </div>
</template>
