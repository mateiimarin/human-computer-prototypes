<script setup lang="ts">
import { EllipsisVertical, Info, RotateCcw, SlidersHorizontal, X } from "@lucide/vue";
import { toast } from "vue-sonner";
import { phases } from "~/lib/journey";
import { hintsLabel, remainingHints } from "~/domain/session";

const app = useApp();
const route = useRoute();
const id = useTaskId();
const task = computed(() => app.task(id.value));
const s = useSession();
const assist = useAssistDialog();
const intro = useIntro();
const restartOpen = ref(false);

const current = computed(() => Math.max(0, phases.findIndex((p) => route.path.endsWith(`/${p.id}`))));
const reach = computed(() => {
  if (!s.value?.started) return 0;
  return s.value.reviews.length ? 3 : 1 + (route.path.endsWith("/review") ? 1 : 0);
});
function href(i: number) {
  return `/task/${id.value}/${phases[i]!.id}`;
}
// Assistance only matters while working; review and reflection don't offer help to change
const showAgreement = computed(() => s.value?.started && current.value === 1);
// The one place that shows how many hints are left
const agreement = computed(() =>
  !s.value ? "" : s.value.budget === 0 ? hintsLabel(0) : `${remainingHints(s.value)} of ${hintsLabel(s.value.budget)} left`,
);
function startOver() {
  app.startOver(id.value);
  restartOpen.value = false;
  toast.success("Exercise reset");
  navigateTo(`/task/${id.value}`);
}
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <header class="bg-background/85 sticky top-0 z-30 backdrop-blur-xl">
      <div class="mx-auto flex h-[72px] w-full max-w-[1480px] items-center gap-3 px-4 sm:px-6">
        <UiTooltip>
          <UiTooltipTrigger as-child>
            <UiButton variant="secondary" size="icon" class="bg-card shadow-sm" aria-label="Leave this exercise. Your work is kept." @click="navigateTo('/')"><X /></UiButton>
          </UiTooltipTrigger>
          <UiTooltipContent>Leave. Your work is kept.</UiTooltipContent>
        </UiTooltip>
        <div class="hidden min-w-0 lg:block">
          <p class="text-muted-foreground truncate text-xs font-semibold">{{ task?.course }}</p>
          <p class="font-display truncate text-[15px] leading-tight font-bold">{{ task?.title }}</p>
        </div>

        <nav aria-label="Session progress" class="mx-auto hidden md:block">
          <ol class="bg-foreground/6 flex items-center gap-1 rounded-full p-1">
            <li v-for="(p, i) in phases" :key="p.id">
              <component
                :is="i <= reach && i !== current ? 'NuxtLink' : 'span'"
                :to="i <= reach && i !== current ? href(i) : undefined"
                :aria-current="i === current ? 'step' : undefined"
                :class="['relative flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold whitespace-nowrap sm:px-4', i === current ? 'text-foreground' : i < current ? 'text-foreground/80 hover:text-foreground' : i <= reach ? 'text-foreground/80 hover:text-foreground' : 'text-muted-foreground']"
              >
                <Motion v-if="i === current" layout-id="step-pill" class="bg-card absolute inset-0 rounded-full shadow-md" :transition="{ type: 'spring', stiffness: 420, damping: 34 }" />
                <span :class="['relative grid size-5 place-items-center rounded-full text-[11px] font-bold', i < current ? 'bg-forest text-white' : i === current ? 'bg-primary text-primary-foreground' : 'bg-foreground/10']">
                  <svg v-if="i < current" viewBox="0 0 12 12" class="size-3" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m2.5 6.2 2.2 2.2 4.8-5" /></svg>
                  <template v-else>{{ i + 1 }}</template>
                </span>
                <span class="relative">{{ p.label }}</span>
              </component>
            </li>
          </ol>
        </nav>
        <span class="text-muted-foreground ml-auto text-sm font-semibold md:hidden">Step {{ current + 1 }} of {{ phases.length }} · {{ phases[current]!.label }}</span>

        <div class="ml-auto flex items-center gap-2 md:ml-0">
          <Transition enter-active-class="transition duration-500 ease-out" enter-from-class="translate-y-1 opacity-0">
            <button
              v-if="showAgreement"
              class="bg-card hover:bg-card hidden h-11 items-center gap-2.5 rounded-full px-4 text-sm font-semibold shadow-sm transition-shadow hover:shadow-md lg:flex"
              :aria-label="`Hints: ${agreement}. Change hints.`"
              @click="assist.open.value = true"
            >
              <SlidersHorizontal class="text-iris size-4" /> {{ agreement }} <span class="text-muted-foreground font-medium">· Change</span>
            </button>
          </Transition>
          <UiDropdownMenu>
            <UiDropdownMenuTrigger as-child>
              <UiButton variant="secondary" size="icon" class="bg-card shadow-sm" aria-label="Session menu"><EllipsisVertical /></UiButton>
            </UiDropdownMenuTrigger>
            <UiDropdownMenuContent align="end" class="w-56 rounded-2xl p-1.5">
              <UiDropdownMenuItem v-if="showAgreement" class="rounded-xl py-2.5 lg:hidden" @select="assist.open.value = true"><SlidersHorizontal /> Change hints</UiDropdownMenuItem>
              <UiDropdownMenuItem class="rounded-xl py-2.5" @select="intro.open.value = true"><Info /> About this prototype</UiDropdownMenuItem>
              <UiDropdownMenuSeparator />
              <UiDropdownMenuItem variant="destructive" class="rounded-xl py-2.5" @select="restartOpen = true"><RotateCcw /> Start over</UiDropdownMenuItem>
            </UiDropdownMenuContent>
          </UiDropdownMenu>
        </div>
      </div>
    </header>

    <main id="main" tabindex="-1" class="flex-1 outline-none"><slot /></main>

    <AssistanceDialog v-if="s" />

    <UiAlertDialog v-model:open="restartOpen">
      <UiAlertDialogContent>
        <UiAlertDialogHeader>
          <UiAlertDialogTitle>Start this exercise over?</UiAlertDialogTitle>
          <UiAlertDialogDescription>This removes your attempt, hints, tutor conversation and reviews for this exercise.</UiAlertDialogDescription>
        </UiAlertDialogHeader>
        <UiAlertDialogFooter>
          <UiAlertDialogCancel>Stay</UiAlertDialogCancel>
          <UiAlertDialogAction class="bg-destructive hover:bg-destructive/90 text-white" @click="startOver">Start over</UiAlertDialogAction>
        </UiAlertDialogFooter>
      </UiAlertDialogContent>
    </UiAlertDialog>
  </div>
</template>
