<script setup lang="ts">
import { Check, Lock, Timer } from "@lucide/vue";
import type { Mode } from "~/data/types";
import { agreementLabel, applyPolicy, remainingHints } from "~/domain/session";
import { toast } from "vue-sonner";

const { open } = useAssistDialog();
const app = useApp();
const s = useSession();

const mode = ref<Mode>("questions");
const budget = ref("3");
const pausing = ref(false);
const elapsed = ref(0);
const total = computed(() => app.state.value.settings.pauseSeconds * 1000);
let startedAt = 0;
let timer: ReturnType<typeof setInterval> | undefined;
const announced = ref("");

function stop() {
  if (timer) clearInterval(timer);
  timer = undefined;
}
function reset() {
  stop();
  pausing.value = false;
  elapsed.value = 0;
  announced.value = "";
}
watch(open, (v) => {
  reset();
  if (v && s.value) {
    mode.value = s.value.mode;
    budget.value = String(Math.max(s.value.budget, 3));
  }
});
watch([mode, budget], reset);
onUnmounted(stop);

const increase = computed(
  () => !!s.value && mode.value === "hints" && (s.value.mode === "questions" || Number(budget.value) > s.value.budget),
);
const changed = computed(
  () => !!s.value && (mode.value !== s.value.mode || (mode.value === "hints" && Number(budget.value) !== s.value.budget)),
);
const ready = computed(() => pausing.value && elapsed.value >= total.value);
const secondsLeft = computed(() => Math.max(0, Math.ceil((total.value - elapsed.value) / 1000)));
const progress = computed(() => Math.min(1, elapsed.value / total.value));

function startPause() {
  pausing.value = true;
  startedAt = Date.now();
  elapsed.value = 0;
  timer = setInterval(() => {
    // Compare wall-clock time so a suspended tab can't stall the pause
    elapsed.value = Date.now() - startedAt;
    if (elapsed.value >= total.value) {
      stop();
      announced.value = "You can apply the change now.";
    }
  }, 100);
}
function apply() {
  if (!s.value || !changed.value) return;
  if (increase.value && !ready.value) return;
  applyPolicy(s.value, mode.value, Number(budget.value));
  open.value = false;
  toast.success(`Assistance is now ${agreementLabel(s.value.mode, s.value.budget).toLowerCase()}`, {
    description: "Your attempt and used hints are unchanged.",
  });
}
const consequences = computed(() => {
  if (!s.value) return [];
  const used = s.value.revealedHints.length;
  if (mode.value === "questions")
    return [
      "Hints are switched off. The tutor only asks questions.",
      used ? `The ${used} hint${used === 1 ? "" : "s"} you've seen stay visible.` : "No hints have been used so far.",
    ];
  const n = Number(budget.value);
  return [
    `You can unlock up to ${n} hints in total, one at a time.`,
    used ? `${used} already used, so ${Math.max(0, n - used)} remain.` : `All ${n} are still available.`,
    "Each hint still needs some thinking from you first.",
  ];
});
const C = 2 * Math.PI * 26;
</script>

<template>
  <UiDialog v-model:open="open">
    <UiDialogContent class="max-h-[92dvh] gap-6 overflow-y-auto sm:max-w-xl">
      <UiDialogHeader class="space-y-2 text-left">
        <UiDialogTitle class="font-display text-3xl font-bold">Change assistance</UiDialogTitle>
        <UiDialogDescription class="text-base">
          Right now: <strong class="text-foreground">{{ s ? agreementLabel(s.mode, s.budget) : "" }}</strong>. Your attempt and any hints you've used stay as they are.
        </UiDialogDescription>
      </UiDialogHeader>

      <UiRadioGroup v-model="mode" class="gap-3" aria-label="Assistance level">
        <label
          for="as-questions"
          class="hover:border-foreground/30 has-[[data-state=checked]]:border-foreground has-[[data-state=checked]]:bg-card flex cursor-pointer items-start gap-4 rounded-2xl border-2 border-foreground/10 p-4 transition-all"
        >
          <UiRadioGroupItem id="as-questions" value="questions" class="mt-1" />
          <span>
            <span class="font-display block text-lg font-bold">Questions only</span>
            <span class="text-muted-foreground block text-[15px]">The tutor asks questions that point to your next step.</span>
          </span>
        </label>
        <label
          for="as-hints"
          class="hover:border-foreground/30 has-[[data-state=checked]]:border-foreground flex cursor-pointer items-start gap-4 rounded-2xl border-2 border-foreground/10 p-4 transition-all"
        >
          <UiRadioGroupItem id="as-hints" value="hints" class="mt-1" />
          <span>
            <span class="font-display block text-lg font-bold">Questions and hints</span>
            <span class="text-muted-foreground block text-[15px]">Small pieces of guidance, one at a time.</span>
          </span>
        </label>
      </UiRadioGroup>

      <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="-translate-y-2 opacity-0">
        <div v-if="mode === 'hints'" class="space-y-2">
          <UiLabel class="font-semibold">Hint allowance</UiLabel>
          <UiToggleGroup v-model="budget" type="single" class="bg-foreground/6 w-fit rounded-full p-1" aria-label="Hint allowance">
            <UiToggleGroupItem value="3" class="data-[state=on]:bg-card rounded-full px-5 font-semibold data-[state=on]:shadow-md" :disabled="!!s && s.revealedHints.length > 3">3 hints</UiToggleGroupItem>
            <UiToggleGroupItem value="5" class="data-[state=on]:bg-card rounded-full px-5 font-semibold data-[state=on]:shadow-md">5 hints</UiToggleGroupItem>
          </UiToggleGroup>
        </div>
      </Transition>

      <ul v-if="changed" class="text-muted-foreground space-y-1.5 text-[15px]">
        <li v-for="c in consequences" :key="c" class="flex items-start gap-2.5"><Check class="text-foreground mt-0.5 size-4 shrink-0" /> {{ c }}</li>
      </ul>
      <p class="text-muted-foreground flex items-center gap-2.5 text-[15px]"><Lock class="size-4 shrink-0" /> Final answers stay hidden either way.</p>

      <!-- Deliberate pause -->
      <Transition enter-active-class="transition-all duration-400 ease-out" enter-from-class="scale-95 opacity-0">
        <div v-if="increase && changed" class="bg-guidance text-guidance-foreground flex items-center gap-5 rounded-3xl p-5">
          <span class="relative grid size-16 shrink-0 place-items-center">
            <svg viewBox="0 0 64 64" class="absolute inset-0 -rotate-90" aria-hidden="true">
              <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" stroke-opacity=".18" stroke-width="6" />
              <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" :stroke-dasharray="C" :stroke-dashoffset="C * (1 - (pausing ? progress : 0))" />
            </svg>
            <Check v-if="ready" class="size-6" :stroke-width="3" />
            <Timer v-else-if="!pausing" class="size-6" />
            <span v-else class="font-display text-xl font-bold tabular-nums">{{ secondsLeft }}</span>
          </span>
          <span class="space-y-0.5">
            <span class="font-display block text-lg font-bold">{{ ready ? "Ready when you are" : "Take a moment first" }}</span>
            <span class="block text-[15px] leading-snug">
              {{ !pausing ? "More help is a deliberate choice. A short pause keeps it that way." : ready ? "You can apply the change, or cancel and keep working." : "You can still cancel and return to your attempt." }}
            </span>
          </span>
        </div>
      </Transition>
      <p class="sr-only" role="status" aria-live="polite">{{ announced }}</p>

      <UiDialogFooter class="gap-2 sm:justify-between">
        <UiButton variant="ghost" size="lg" @click="open = false">Cancel</UiButton>
        <UiButton v-if="increase && !pausing" size="lg" :disabled="!changed" @click="startPause">Start the pause</UiButton>
        <UiButton v-else size="lg" :disabled="!changed || (increase && !ready)" @click="apply">
          {{ increase && !ready ? `Apply in ${secondsLeft}s` : "Apply change" }}
        </UiButton>
      </UiDialogFooter>
    </UiDialogContent>
  </UiDialog>
</template>
