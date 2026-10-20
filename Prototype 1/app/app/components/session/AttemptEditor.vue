<script setup lang="ts">
import { Camera, FileImage, Flag, ImagePlus, Sparkles, X } from "@lucide/vue";
import type { TaskContent } from "~/data/types";
import { hasOpenGap, isStale, latestReview, loadSample, nextOutcome } from "~/domain/session";

const props = defineProps<{ content: TaskContent; error?: string }>();
const s = useSession();
const id = useTaskId();
const sampleOpen = ref(false);
const replaceOpen = ref(false);
const picked = ref<string | null>(null);
const reading = ref(false);
const pick = ref<HTMLInputElement>();
const flash = ref<number | null>(null);

const review = computed(() => latestReview(s.value));
const stale = computed(() => isStale(s.value));
const open = computed(() => hasOpenGap(s.value));
const gapStep = computed(() => props.content.gap.step);
const attempt = computed(() => (review.value?.version ?? 0) + (stale.value || !review.value ? 1 : 0));
const filled = computed(() => s.value.blocks.map((b) => !!b.trim()));
const sampleBlocks = computed(() => props.content.samples[nextOutcome(s.value)]);

/** One line under the title: what to do, or where the last review left things. */
const status = computed(() => {
  const v = review.value?.version;
  if (!v) return { gap: false, text: "Write each step in your own words. Use $…$ for maths." };
  if (open.value)
    return {
      gap: true,
      text: stale.value
        ? `You're revising after review ${v}. Check it again when you're ready.`
        : `Review ${v} found a gap in step ${gapStep.value + 1}. Revise it, then check again.`,
    };
  return { gap: false, text: stale.value ? `Edited since review ${v}. Check it again when you're ready.` : `Review ${v} found no issues.` };
});

function focusStep(i: number) {
  nextTick(() => {
    const el = document.getElementById(`attempt-${i}`);
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
    el?.focus({ preventScroll: true });
    flash.value = i;
    setTimeout(() => (flash.value = null), 1600);
  });
}
defineExpose({ focusStep });

async function onFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (!f) return;
  picked.value = URL.createObjectURL(f);
  openSample(true);
  (e.target as HTMLInputElement).value = "";
}
async function openSample(fromFile = false) {
  if (!fromFile) picked.value = null;
  sampleOpen.value = true;
  reading.value = true;
  await new Promise((r) => setTimeout(r, 1300));
  reading.value = false;
}
function requestUse() {
  if (s.value.blocks.some((b) => b.trim())) replaceOpen.value = true;
  else use();
}
function use() {
  loadSample(s.value, props.content);
  s.value.attachment = true;
  sampleOpen.value = false;
  replaceOpen.value = false;
}
function setBlock(i: number, v: string | number) {
  s.value.blocks[i] = String(v);
}
const hasMath = (b: string | undefined) => !!b && /\$[^$\n]+\$/.test(b);
</script>

<template>
  <section aria-labelledby="attempt-title" class="bg-card rounded-[2rem] shadow-md">
    <div class="p-6 sm:p-9">
      <header class="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div class="space-y-1.5">
          <p class="text-muted-foreground text-sm font-semibold">Attempt {{ attempt }}</p>
          <h1 id="attempt-title" class="font-display text-[2rem] leading-tight font-bold sm:text-4xl">Your attempt</h1>
        </div>
        <UiDropdownMenu>
          <UiDropdownMenuTrigger as-child>
            <UiButton variant="ghost" size="sm" class="-mr-2"><ImagePlus /> Handwritten work</UiButton>
          </UiDropdownMenuTrigger>
          <UiDropdownMenuContent align="end" class="w-60 rounded-2xl p-1.5">
            <UiDropdownMenuItem class="rounded-xl py-2.5" @select="pick?.click()"><Camera /> Choose a photo</UiDropdownMenuItem>
            <UiDropdownMenuItem class="rounded-xl py-2.5" @select="openSample(false)"><Sparkles /> Use a sample photo</UiDropdownMenuItem>
          </UiDropdownMenuContent>
        </UiDropdownMenu>
        <input ref="pick" type="file" accept="image/*" class="sr-only" tabindex="-1" aria-hidden="true" @change="onFile" />
      </header>

      <p
        class="mt-2 flex items-start gap-2 text-[15px] leading-snug"
        :class="status.gap ? 'text-warning-foreground font-medium' : 'text-muted-foreground'"
        role="status"
      >
        <Flag v-if="status.gap" class="mt-0.5 size-4 shrink-0" />
        <span>
          {{ status.text }}
          <NuxtLink v-if="status.gap" :to="`/task/${id}/review`" class="ml-1 font-semibold underline underline-offset-4">See the feedback</NuxtLink>
        </span>
      </p>

      <Transition enter-active-class="transition duration-300" enter-from-class="-translate-y-2 opacity-0">
        <p v-if="error" role="alert" class="bg-warning text-warning-foreground mt-5 rounded-2xl px-4 py-3.5 text-[15px] font-medium">{{ error }}</p>
      </Transition>

      <ol class="mt-6 divide-y">
        <li v-for="(step, i) in content.steps" :key="step.label" class="py-6 first:pt-2">
          <div class="mb-3 flex items-center gap-3">
            <span class="grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors duration-500" :class="filled[i] ? 'bg-forest text-white' : 'bg-foreground/8'">{{ i + 1 }}</span>
            <UiLabel :for="`attempt-${i}`" class="font-display text-xl font-bold">{{ step.label }}</UiLabel>
          </div>

          <p v-if="s.start === 'scaffold'" class="text-guidance-foreground mb-3 flex items-start gap-2 text-[15px] font-medium"><Sparkles class="mt-0.5 size-4 shrink-0" /> {{ step.scaffold }}</p>

          <!-- What the last review said about this step, kept next to the text being revised -->
          <div v-if="open && i === gapStep" class="border-warning-foreground/50 bg-warning/60 mb-3 space-y-1.5 rounded-r-2xl border-l-4 py-3 pr-4 pl-4 text-[15px] leading-snug">
            <p class="text-warning-foreground font-bold">{{ content.gap.title }}</p>
            <p v-if="review?.explained" class="text-warning-foreground/90">You explained: “{{ review.explanation }}”</p>
          </div>

          <UiTextarea
            :id="`attempt-${i}`"
            :model-value="s.blocks[i]"
            class="min-h-[112px] text-[17px] transition-shadow duration-500"
            :class="flash === i ? 'ring-ring/40 border-ring ring-4' : ''"
            :placeholder="step.placeholder"
            @update:model-value="setBlock(i, $event)"
          />
          <p v-if="hasMath(s.blocks[i])" class="text-muted-foreground mt-2.5 overflow-x-auto px-1 text-[17px] leading-8" aria-label="Preview of your step"><RichText :text="s.blocks[i]!" /></p>
        </li>
      </ol>

      <UiAttachment v-if="s.attachment" size="default" class="mt-2 rounded-2xl">
        <UiAttachmentMedia><FileImage /></UiAttachmentMedia>
        <UiAttachmentContent>
          <UiAttachmentTitle>Handwritten work</UiAttachmentTitle>
          <UiAttachmentDescription>Transcribed into your steps</UiAttachmentDescription>
        </UiAttachmentContent>
        <UiAttachmentActions><UiAttachmentAction aria-label="Remove attachment" @click="s.attachment = false"><X /></UiAttachmentAction></UiAttachmentActions>
      </UiAttachment>
    </div>

    <UiDialog v-model:open="sampleOpen">
      <UiDialogContent class="max-h-[92dvh] overflow-y-auto sm:max-w-xl">
        <UiDialogHeader class="text-left">
          <UiDialogTitle class="font-display text-2xl font-bold">{{ reading ? "Reading your handwriting" : "Here's what we read" }}</UiDialogTitle>
          <UiDialogDescription>{{ reading ? "This takes a moment." : "Check it over. You can edit every step afterwards." }}</UiDialogDescription>
        </UiDialogHeader>
        <div class="bg-foreground/[0.04] relative overflow-hidden rounded-2xl">
          <img v-if="picked" :src="picked" alt="Your photo" class="max-h-[360px] w-full object-contain" />
          <HandwrittenSample v-else :blocks="sampleBlocks" />
          <Transition leave-active-class="transition duration-500" leave-to-class="opacity-0">
            <div v-if="reading" class="absolute inset-0 overflow-hidden bg-white/40 backdrop-blur-[1px]">
              <div class="absolute inset-x-0 h-24 animate-scan bg-gradient-to-b from-transparent via-sun/60 to-transparent" />
            </div>
          </Transition>
        </div>
        <UiDialogFooter class="gap-2 sm:justify-between">
          <UiButton variant="ghost" size="lg" @click="sampleOpen = false">Cancel</UiButton>
          <UiButton size="lg" :disabled="reading" @click="requestUse">Use this as my attempt</UiButton>
        </UiDialogFooter>
      </UiDialogContent>
    </UiDialog>

    <UiAlertDialog v-model:open="replaceOpen">
      <UiAlertDialogContent>
        <UiAlertDialogHeader>
          <UiAlertDialogTitle>Replace what you've written?</UiAlertDialogTitle>
          <UiAlertDialogDescription>The three steps will be overwritten with the transcription. Your earlier reviews are not affected.</UiAlertDialogDescription>
        </UiAlertDialogHeader>
        <UiAlertDialogFooter>
          <UiAlertDialogCancel>Keep my text</UiAlertDialogCancel>
          <UiAlertDialogAction @click="use">Replace</UiAlertDialogAction>
        </UiAlertDialogFooter>
      </UiAlertDialogContent>
    </UiAlertDialog>
  </section>
</template>
