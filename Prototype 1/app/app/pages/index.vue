<script setup lang="ts">
import { ArrowRight, Check } from "@lucide/vue";
import { phasePath } from "~/lib/journey";

useHead({ title: "Exercises · Attempt First" });
const app = useApp();

const label = { new: "Start", inprogress: "Continue", finished: "View reflection" } as const;

/** New exercises open on their description; the others go straight to where the student left off. */
function target(id: string) {
  const status = app.status(id);
  const s = app.session(id);
  if (status === "finished") return phasePath(id, "reflect");
  if (status === "inprogress" && s) return phasePath(id, s.phase);
  return `/task/${id}`;
}
</script>

<template>
  <div class="space-y-9">
    <header class="space-y-2">
      <Reveal as="h1" class="font-display text-[2.4rem] leading-[1.05] font-bold sm:text-5xl">Exercises</Reveal>
      <Reveal as="p" :delay="0.06" class="text-muted-foreground text-lg">Choose one to work on.</Reveal>
    </header>

    <ol class="divide-y border-y">
      <li v-for="(t, i) in app.tasks" :key="t.id">
        <Reveal :index="i" :delay="0.1" :y="12">
          <NuxtLink :to="target(t.id)" class="hover:bg-card/80 group -mx-4 flex items-center gap-4 rounded-2xl px-4 py-5 transition-colors">
            <span class="min-w-0 flex-1">
              <span class="font-display block text-xl leading-tight font-bold text-balance sm:text-2xl">{{ t.title }}</span>
              <span class="text-muted-foreground mt-1 block text-[15px]">{{ t.course }} · {{ t.topic }}</span>
            </span>
            <span
              class="inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-transform group-hover:translate-x-0.5"
              :class="app.status(t.id) === 'finished' ? 'bg-foreground/8' : 'bg-primary text-primary-foreground'"
            >
              <Check v-if="app.status(t.id) === 'finished'" class="size-4" :stroke-width="3" />
              {{ label[app.status(t.id)] }}
              <ArrowRight v-if="app.status(t.id) !== 'finished'" class="size-4" />
            </span>
          </NuxtLink>
        </Reveal>
      </li>
    </ol>
  </div>
</template>
