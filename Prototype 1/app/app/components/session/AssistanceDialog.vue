<script setup lang="ts">
import { Check, Lock, Timer } from "@lucide/vue";
import { MAX_HINTS, PAUSE_SECONDS } from "~/data/exercises";
import { applyPolicy, hintsLabel } from "~/domain/session";
import { toast } from "vue-sonner";

const { open } = useAssistDialog();
const s = useSession();

const value = ref([3]);
const pausing = ref(false);
const elapsed = ref(0);
const total = PAUSE_SECONDS * 1000;
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
  if (v && s.value) value.value = [s.value.budget];
});
watch(value, reset);
onUnmounted(stop);

const used = computed(() => s.value?.revealedHints.length ?? 0);
const target = computed(() => value.value[0] ?? 0);
const increase = computed(() => !!s.value && target.value > s.value.budget);
const changed = computed(() => !!s.value && target.value !== s.value.budget);
const ready = computed(() => pausing.value && elapsed.value >= total);
const secondsLeft = computed(() => Math.max(0, Math.ceil((total - elapsed.value) / 1000)));
const progress = computed(() => Math.min(1, elapsed.value / total));

function startPause() {
  pausing.value = true;
  startedAt = Date.now();
  elapsed.value = 0;
  timer = setInterval(() => {
    // Compare wall-clock time so a suspended tab can't stall the pause
    elapsed.value = Date.now() - startedAt;
    if (elapsed.value >= total) {
      stop();
      announced.value = "You can apply the change now.";
    }
  }, 100);
}
function apply() {
  if (!s.value || !changed.value) return;
  if (increase.value && !ready.value) return;
  applyPolicy(s.value, target.value);
  open.value = false;
  toast.success(`Now ${hintsLabel(s.value.budget).toLowerCase()}`, {
    description: "Your attempt and the hints you've seen are kept.",
  });
}
const consequences = computed(() => {
  if (!s.value) return [];
  const n = target.value;
  const seen = used.value ? `The ${used.value} hint${used.value === 1 ? "" : "s"} you've seen stay visible.` : "";
  if (n === 0) return ["Hints are switched off. The tutor only asks questions.", seen].filter(Boolean);
  return [
    `You can unlock up to ${n} hints, one at a time.`,
    used.value ? `${used.value} already used, so ${Math.max(0, n - used.value)} remain.` : `All ${n} are still available.`,
    "Each hint still needs two short answers from you first.",
  ];
});
const C = 2 * Math.PI * 26;
</script>

<template>
  <UiDialog v-model:open="open">
    <UiDialogContent class="max-h-[92dvh] gap-6 overflow-y-auto sm:max-w-xl">
      <UiDialogHeader class="space-y-2 text-left">
        <UiDialogTitle class="font-display text-3xl font-bold">Change hints</UiDialogTitle>
        <UiDialogDescription class="text-base">
          Currently: <strong class="text-foreground">{{ s ? hintsLabel(s.budget) : "" }}</strong>. Your attempt and the hints you've seen are kept.
        </UiDialogDescription>
      </UiDialogHeader>

      <div class="space-y-3">
        <div class="flex items-baseline justify-between gap-3">
          <UiLabel class="font-semibold">Number of hints</UiLabel>
          <span class="font-display text-2xl font-bold" aria-live="polite">{{ hintsLabel(target) }}</span>
        </div>
        <UiSlider v-model="value" :min="Math.min(used, MAX_HINTS)" :max="MAX_HINTS" :step="1" label="Number of hints" class="py-2" />
        <div class="text-muted-foreground flex justify-between text-sm font-semibold" aria-hidden="true">
          <span v-for="n in MAX_HINTS + 1" :key="n">{{ n - 1 }}</span>
        </div>
      </div>

      <ul v-if="changed" class="text-muted-foreground space-y-1.5 text-[15px]">
        <li v-for="c in consequences" :key="c" class="flex items-start gap-2.5"><Check class="text-foreground mt-0.5 size-4 shrink-0" /> {{ c }}</li>
      </ul>
      <p class="text-muted-foreground flex items-center gap-2.5 text-[15px]"><Lock class="size-4 shrink-0" /> The tutor still won't give full answers.</p>

      <!-- Deliberate pause -->
      <Transition enter-active-class="transition-all duration-400 ease-out" enter-from-class="scale-95 opacity-0">
        <div v-if="increase" class="bg-guidance text-guidance-foreground flex items-center gap-5 rounded-3xl p-5">
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
            <span class="font-display block text-lg font-bold">{{ ready ? "Ready" : "Wait a few seconds" }}</span>
            <span class="block text-[15px] leading-snug">
              {{ !pausing ? "Adding hints starts a 5-second countdown first. You can cancel at any time." : ready ? "You can apply the change now." : "Counting down. You can still cancel." }}
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
