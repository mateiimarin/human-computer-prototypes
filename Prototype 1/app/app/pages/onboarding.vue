<script setup lang="ts">
import { ArrowLeft, ArrowRight, Check, Compass, Feather, Footprints, Lock, ShieldCheck, Sprout } from "@lucide/vue";
import type { Mode, StartApproach } from "~/data/types";

definePageMeta({ layout: "flow" });
useHead({ title: "Welcome · Attempt First" });

const app = useApp();
const step = ref(0);
const dir = ref(1);
const name = ref(app.state.value.user.name);

const styles = [
  {
    id: "try",
    icon: Feather,
    title: "I try first, then check",
    text: "The tutor stays out of the way until you ask. Questions only, no hints.",
    mode: "questions" as Mode,
    start: "blank" as StartApproach,
    tone: "bg-mint text-forest",
  },
  {
    id: "hints",
    icon: Footprints,
    title: "Small hints when I'm stuck",
    text: "Start from a blank page and unlock up to three hints, one at a time.",
    mode: "hints" as Mode,
    start: "blank" as StartApproach,
    tone: "bg-lilac text-iris-deep",
  },
  {
    id: "scaffold",
    icon: Compass,
    title: "A bounded starting point",
    text: "Each step comes with a short prompt, plus up to three hints.",
    mode: "hints" as Mode,
    start: "scaffold" as StartApproach,
    tone: "bg-blush text-[#9a2f1f]",
  },
];
const style = ref(styles.find((s) => s.mode === app.state.value.settings.mode && s.start === app.state.value.settings.start)?.id ?? "try");
const chosen = computed(() => styles.find((s) => s.id === style.value)!);

const total = 3;
function go(n: number) {
  dir.value = n > step.value ? 1 : -1;
  step.value = n;
}
async function finish() {
  const st = app.state.value;
  st.user.name = name.value.trim() || st.user.name;
  st.settings.mode = chosen.value.mode;
  st.settings.start = chosen.value.start;
  st.settings.budget = 3;
  st.onboarded = true;
  await navigateTo("/");
}
async function skip() {
  app.state.value.onboarded = true;
  await navigateTo("/");
}
</script>

<template>
  <div class="relative flex min-h-dvh flex-col overflow-hidden">
    <div class="pointer-events-none absolute -top-40 -right-40 size-[520px] rounded-full opacity-70 blur-3xl" style="background: var(--sun)" />
    <div class="pointer-events-none absolute -bottom-52 -left-40 size-[520px] rounded-full opacity-40 blur-3xl" style="background: var(--lilac)" />

    <header class="relative flex items-center justify-between px-6 py-6 sm:px-10">
      <Logo />
      <div class="flex items-center gap-6">
        <ol class="flex items-center gap-2" aria-label="Progress">
          <li v-for="i in total" :key="i" :aria-current="i - 1 === step ? 'step' : undefined">
            <span class="bg-foreground/12 relative block h-2 overflow-hidden rounded-full transition-all duration-500" :class="i - 1 === step ? 'w-10' : 'w-2'">
              <span class="bg-foreground absolute inset-y-0 left-0 rounded-full transition-all duration-500" :style="{ width: i - 1 <= step ? '100%' : '0%' }" />
            </span>
            <span class="sr-only">Step {{ i }} of {{ total }}</span>
          </li>
        </ol>
        <button class="text-muted-foreground hover:text-foreground text-sm font-semibold" @click="skip">Skip for now</button>
      </div>
    </header>

    <main id="main" class="relative flex flex-1 items-center justify-center px-6 pb-16">
      <div class="w-full max-w-[640px]">
        <AnimatePresence mode="wait" :initial="false" custom="dir">
          <Motion
            :key="step"
            :initial="{ opacity: 0, x: 40 * dir, filter: 'blur(4px)' }"
            :animate="{ opacity: 1, x: 0, filter: 'blur(0px)' }"
            :exit="{ opacity: 0, x: -40 * dir, filter: 'blur(4px)' }"
            :transition="{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }"
          >
            <!-- 1 · name -->
            <section v-if="step === 0" aria-labelledby="ob-title">
              <p class="text-muted-foreground mb-3 text-sm font-semibold">Step 1 of 3</p>
              <h1 id="ob-title" class="font-display text-[2.4rem] leading-[1.05] font-bold text-balance sm:text-5xl">
                Hi, I'm Attempt First. What should I call you?
              </h1>
              <form class="mt-9 space-y-6" @submit.prevent="go(1)">
                <div class="space-y-2">
                  <UiLabel for="ob-name" class="text-sm font-semibold">Your first name</UiLabel>
                  <UiInput id="ob-name" v-model="name" autocomplete="given-name" class="h-14 text-lg" placeholder="Lukas Brunner" />
                </div>
                <UiButton type="submit" size="lg" :disabled="!name.trim()">Continue <ArrowRight /></UiButton>
              </form>
            </section>

            <!-- 2 · style -->
            <section v-else-if="step === 1" aria-labelledby="ob-title">
              <p class="text-muted-foreground mb-3 text-sm font-semibold">Step 2 of 3</p>
              <h1 id="ob-title" class="font-display text-[2.2rem] leading-[1.05] font-bold text-balance sm:text-5xl">
                How do you like to work through a problem?
              </h1>
              <p class="text-muted-foreground mt-4 text-lg">These are starting preferences. You can change them for any task.</p>
              <UiRadioGroup v-model="style" class="mt-8 gap-3" aria-label="Working style">
                <label
                  v-for="s in styles"
                  :key="s.id"
                  :for="`style-${s.id}`"
                  class="bg-card hover:border-foreground/30 has-[[data-state=checked]]:border-foreground has-[[data-state=checked]]:shadow-md group flex cursor-pointer items-center gap-4 rounded-3xl border-2 border-transparent p-4 pr-5 shadow-sm transition-all"
                >
                  <span :class="['grid size-12 shrink-0 place-items-center rounded-2xl transition-transform group-hover:scale-105', s.tone]">
                    <component :is="s.icon" class="size-6" />
                  </span>
                  <span class="flex-1">
                    <span class="font-display block text-lg font-bold">{{ s.title }}</span>
                    <span class="text-muted-foreground block text-[15px] leading-snug">{{ s.text }}</span>
                  </span>
                  <UiRadioGroupItem :id="`style-${s.id}`" :value="s.id" />
                </label>
              </UiRadioGroup>
              <div class="mt-8 flex items-center gap-3">
                <UiButton variant="ghost" size="lg" @click="go(0)"><ArrowLeft /> Back</UiButton>
                <UiButton size="lg" @click="go(2)">Continue <ArrowRight /></UiButton>
              </div>
            </section>

            <!-- 3 · agreement -->
            <section v-else aria-labelledby="ob-title">
              <p class="text-muted-foreground mb-3 text-sm font-semibold">Step 3 of 3</p>
              <h1 id="ob-title" class="font-display text-[2.2rem] leading-[1.05] font-bold text-balance sm:text-5xl">
                Here's the deal, {{ name.trim() || "friend" }}.
              </h1>
              <ul class="mt-8 space-y-5">
                <li v-for="(line, i) in [
                  { icon: Sprout, title: 'Your attempt comes first', text: 'Every task opens on your own page. Help only starts when you ask for it.' },
                  { icon: ShieldCheck, title: chosen.mode === 'questions' ? 'Questions only' : 'Hints, one at a time', text: chosen.mode === 'questions' ? 'The tutor answers with questions that point to your next step.' : 'You unlock up to three hints, each after adding some thinking of your own.' },
                  { icon: Lock, title: 'Final answers stay hidden', text: 'That holds whichever help you choose. You can change the rest, deliberately, whenever you like.' },
                ]" :key="line.title">
                  <Reveal :index="i" :delay="0.1" class="flex items-start gap-4">
                    <span class="bg-primary grid size-11 shrink-0 place-items-center rounded-2xl"><component :is="line.icon" class="size-5" /></span>
                    <span>
                      <span class="font-display block text-lg font-bold">{{ line.title }}</span>
                      <span class="text-muted-foreground block text-[15px] leading-snug">{{ line.text }}</span>
                    </span>
                  </Reveal>
                </li>
              </ul>
              <div class="mt-9 flex items-center gap-3">
                <UiButton variant="ghost" size="lg" @click="go(1)"><ArrowLeft /> Back</UiButton>
                <UiButton size="lg" @click="finish"><Check /> Start studying</UiButton>
              </div>
            </section>
          </Motion>
        </AnimatePresence>
      </div>
    </main>
  </div>
</template>
