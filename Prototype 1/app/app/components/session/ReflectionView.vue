<script setup lang="ts">
import { ArrowRight, Flag, Info, RotateCcw } from "@lucide/vue";
import type { Contribution } from "~/data/types";
import { displayOrigin, originLabels, relabel, relabelChoices, type DisplayOrigin } from "~/domain/session";

const props = defineProps<{
  contributions: Contribution[];
  gaps: string[];
  /** Corrections the student made to a label: contribution id → choice. */
  flags: Record<string, string>;
  attempts: number;
  hintsUsed: number;
  canShow?: boolean;
  editable?: boolean;
}>();
const emit = defineEmits<{ show: [step: number]; showTutor: []; reopen: [] }>();

const filter = ref<"all" | "you" | "tutor">("all");
const origin = (c: Contribution) => displayOrigin(c, props.flags);
const count = (o: DisplayOrigin) => props.contributions.filter((c) => origin(c) === o).length;
const stats = computed(() =>
  [
    { key: "you", label: originLabels.you, value: count("you"), dot: "bg-forest" },
    { key: "prompted", label: originLabels.prompted, value: count("prompted"), dot: "bg-iris" },
    { key: "supplied", label: originLabels.supplied, value: count("supplied"), dot: "bg-coral" },
    { key: "mixed", label: "Mixed or not sure", value: count("mixed") + count("unclear"), dot: "bg-sun-deep" },
  ].filter((x) => x.key !== "mixed" || x.value > 0),
);
const shownEntries = computed(() =>
  props.contributions.filter((c) => {
    const o = origin(c);
    return filter.value === "all" ? true : filter.value === "you" ? o === "you" : o === "prompted" || o === "supplied";
  }),
);
const tagKind = (o: DisplayOrigin) => o;
const dotClass = (o: DisplayOrigin) =>
  o === "you" ? "bg-forest" : o === "prompted" ? "bg-iris" : o === "supplied" ? "bg-coral" : o === "mixed" ? "bg-sun-deep" : "bg-muted-foreground";
const choiceLabel = (v: string | undefined) => relabelChoices.find((c) => c.value === v)?.label ?? "Not sure";
const filters = [
  { v: "all", l: "Everything" },
  { v: "you", l: "Yours" },
  { v: "tutor", l: "Tutor" },
];
</script>

<template>
  <div class="space-y-12">
    <!-- Summary -->
    <section aria-labelledby="summary" class="space-y-7">
      <div class="grid gap-4 sm:gap-8" :style="{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }">
        <Reveal v-for="(s, i) in stats" :key="s.key" :index="i" :delay="0.1" class="space-y-1.5">
          <span class="font-display block text-6xl leading-none font-bold sm:text-7xl"><CountUp :to="s.value" :delay="200 + i * 120" /></span>
          <span class="text-muted-foreground flex items-start gap-2 text-sm leading-tight font-semibold"><span :class="['mt-1 size-2.5 shrink-0 rounded-full', s.dot]" /> {{ s.label }}</span>
        </Reveal>
      </div>
      <p id="summary" class="text-muted-foreground max-w-xl text-[17px] leading-relaxed">
        Across {{ attempts }} {{ attempts === 1 ? "attempt" : "attempts" }}<template v-if="hintsUsed"> and {{ hintsUsed }} {{ hintsUsed === 1 ? "hint" : "hints" }}</template>. This is a record of who contributed what. It doesn't measure what you understand.
      </p>
      <UiCollapsible>
        <UiCollapsibleTrigger class="text-foreground inline-flex items-center gap-2 text-sm font-semibold underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground">
          <Info class="size-4" /> How to read these labels
        </UiCollapsibleTrigger>
        <UiCollapsibleContent>
          <dl class="mt-4 grid gap-4 text-sm sm:grid-cols-3">
            <div><dt class="font-bold">You introduced</dt><dd class="text-muted-foreground mt-1">Steps, ideas and explanations you wrote without being asked.</dd></div>
            <div><dt class="font-bold">Tutor prompted</dt><dd class="text-muted-foreground mt-1">A question from the tutor that led you to say something. The answer is still yours.</dd></div>
            <div><dt class="font-bold">Tutor supplied</dt><dd class="text-muted-foreground mt-1">A hint the tutor showed you. It is guidance, not part of your work.</dd></div>
          </dl>
          <p class="text-muted-foreground mt-4 text-sm">The labels come from what the app saw, so they can be wrong. If one doesn't match what happened, change it on that entry below.</p>
        </UiCollapsibleContent>
      </UiCollapsible>
    </section>

    <!-- Gaps -->
    <section v-if="gaps.length" aria-labelledby="gaps" class="bg-warning text-warning-foreground rounded-[2rem] p-7 sm:p-9">
      <h2 id="gaps" class="font-display text-2xl font-bold">Points to revisit</h2>
      <p class="mt-1 text-[15px] opacity-85">You finished with these still open. They stay on your Today page until you've looked at them again.</p>
      <ul class="mt-5 space-y-3">
        <li v-for="g in gaps" :key="g" class="flex items-start gap-3 text-[17px] leading-snug font-semibold"><Flag class="mt-1 size-4 shrink-0" /> <RichText :text="g" /></li>
      </ul>
      <UiButton v-if="editable" variant="dark" class="mt-6" @click="emit('reopen')"><RotateCcw /> Reopen task</UiButton>
    </section>

    <!-- Evidence -->
    <section aria-labelledby="evidence">
      <div class="mb-5 flex flex-wrap items-end justify-between gap-4">
        <h2 id="evidence" class="font-display text-3xl font-bold">Everything in this task</h2>
        <UiToggleGroup v-model="filter" type="single" class="bg-foreground/6 rounded-full p-1" aria-label="Filter contributions">
          <UiToggleGroupItem v-for="f in filters" :key="f.v" :value="f.v" class="data-[state=on]:bg-card rounded-full px-4 text-sm font-semibold data-[state=on]:shadow-md">{{ f.l }}</UiToggleGroupItem>
        </UiToggleGroup>
      </div>

      <ol class="relative">
        <li v-for="(c, i) in shownEntries" :key="c.id" class="group relative grid grid-cols-[28px_minmax(0,1fr)] gap-x-4">
          <div class="flex flex-col items-center pt-1.5">
            <span :class="['size-3.5 rounded-full ring-4 ring-background', dotClass(origin(c))]" />
            <span v-if="i < shownEntries.length - 1" class="bg-foreground/12 mt-1 w-0.5 flex-1" aria-hidden="true" />
          </div>
          <Reveal :index="i" :delay="0.05" :y="10" class="pb-8">
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <Tag :kind="tagKind(origin(c))">{{ originLabels[origin(c)] }}</Tag>
              <h3 class="font-display text-lg font-bold">{{ c.title }}</h3>
            </div>
            <div class="mt-2.5 max-w-2xl text-[16px] leading-7"><RichText :text="c.evidence" /></div>

            <div class="mt-2 flex flex-wrap items-center gap-1">
              <UiButton v-if="canShow && c.step !== null" size="sm" variant="ghost" class="-ml-3" @click="emit('show', c.step!)">Show in attempt <ArrowRight /></UiButton>
              <UiButton v-else-if="canShow && c.target === 'tutor'" size="sm" variant="ghost" class="-ml-3" @click="emit('showTutor')">Show in tutor <ArrowRight /></UiButton>

              <!-- Correct a label that doesn't match what happened -->
              <template v-if="c.origin !== 'setting'">
                <p v-if="c.id in flags" class="text-muted-foreground flex items-center gap-1 text-sm">
                  You marked this as “{{ choiceLabel(flags[c.id]) }}”.
                  <UiButton size="sm" variant="link" class="h-auto px-1 text-sm" @click="relabel(flags, c.id, null)">Undo</UiButton>
                </p>
                <UiDropdownMenu v-else>
                  <UiDropdownMenuTrigger as-child>
                    <UiButton size="sm" variant="ghost" class="text-muted-foreground transition-opacity data-[state=open]:opacity-100 md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">Not quite right?</UiButton>
                  </UiDropdownMenuTrigger>
                  <UiDropdownMenuContent align="start" class="w-72 rounded-2xl p-1.5">
                    <UiDropdownMenuLabel class="text-muted-foreground text-xs font-semibold">This was…</UiDropdownMenuLabel>
                    <UiDropdownMenuItem v-for="ch in relabelChoices" :key="ch.value" class="rounded-xl py-2.5" @select="relabel(flags, c.id, ch.value)">{{ ch.label }}</UiDropdownMenuItem>
                  </UiDropdownMenuContent>
                </UiDropdownMenu>
              </template>
            </div>
          </Reveal>
        </li>
      </ol>
      <p v-if="!shownEntries.length" class="text-muted-foreground rounded-2xl border-2 border-dashed p-8 text-center">Nothing in this filter.</p>
    </section>
  </div>
</template>
