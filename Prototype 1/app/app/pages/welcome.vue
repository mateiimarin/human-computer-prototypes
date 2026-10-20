<script setup lang="ts">
import { ArrowLeft, ArrowRight, GraduationCap, Lock, Sparkles, Waypoints } from "@lucide/vue";
import { toast } from "vue-sonner";

definePageMeta({ layout: "flow" });
useHead({ title: "Sign in · Attempt First" });

const app = useApp();
const step = ref<"email" | "code">("email");
const email = ref("");
const error = ref("");
const code = ref<string[]>([]);
const busy = ref<"" | "email" | "code" | "sso">("");

function validEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}
async function sendCode() {
  if (!validEmail(email.value)) {
    error.value = "Enter the email you use at your university, like name@university.edu.";
    return;
  }
  error.value = "";
  busy.value = "email";
  await new Promise((r) => setTimeout(r, 700));
  busy.value = "";
  step.value = "code";
}
async function finish(address?: string) {
  if (address) app.state.value.user.email = address.trim();
  app.state.value.signedIn = true;
  await navigateTo(app.state.value.onboarded ? "/" : "/onboarding");
}
async function verify() {
  busy.value = "code";
  await new Promise((r) => setTimeout(r, 800));
  await finish(email.value);
  busy.value = "";
}
async function sso() {
  busy.value = "sso";
  await new Promise((r) => setTimeout(r, 900));
  await finish();
  busy.value = "";
}
function resend() {
  toast.success("A new code is on its way", { description: email.value });
}

const points = [
  { icon: Sparkles, text: "Your attempt comes first", delay: 0.5, pos: "left-[8%] bottom-[30%]" },
  { icon: Waypoints, text: "One hint at a time", delay: 0.65, pos: "left-[46%] bottom-[22%]" },
  { icon: GraduationCap, text: "See who thought it", delay: 0.8, pos: "left-[14%] bottom-[10%]" },
];
</script>

<template>
  <div class="grid min-h-dvh lg:grid-cols-[1.12fr_1fr]">
    <!-- Brand panel -->
    <section class="relative isolate m-3 overflow-hidden rounded-[2.25rem] lg:m-4" style="background: var(--grad-sunrise)">
      <div class="absolute inset-x-0 bottom-0 -z-10 h-[52%] min-h-[220px]">
        <CourseArt tone="sunrise" illo="stairs" bare />
      </div>
      <div class="flex h-full min-h-[360px] flex-col gap-10 p-7 sm:p-10 lg:min-h-0 lg:p-14">
        <Reveal :y="-10"><Logo /></Reveal>
        <div class="max-w-[32rem] space-y-5">
          <Reveal as="h1" :delay="0.12" :y="26" class="font-display text-[2.4rem] leading-[1.02] font-bold text-balance sm:text-5xl lg:text-[3.6rem]">
            You do the thinking. We help with the rest.
          </Reveal>
          <Reveal as="p" :delay="0.24" class="max-w-md text-lg leading-snug font-medium text-pretty text-foreground/80">
            A study workspace that waits for your attempt, then helps one small step at a time.
          </Reveal>
        </div>
      </div>
      <div class="pointer-events-none absolute inset-0 hidden lg:[@media(min-height:780px)]:block">
        <Motion
          v-for="(p, i) in points"
          :key="p.text"
          :initial="{ opacity: 0, scale: 0.7, y: 20 }"
          :animate="{ opacity: 1, scale: 1, y: 0 }"
          :transition="{ delay: p.delay + 0.3, type: 'spring', stiffness: 220, damping: 18 }"
          :class="['absolute', p.pos]"
        >
          <span
            class="bg-card/95 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold shadow-md backdrop-blur"
            :class="i % 2 ? 'animate-float-slow' : 'animate-float'"
          >
            <component :is="p.icon" class="text-iris size-4" /> {{ p.text }}
          </span>
        </Motion>
      </div>
    </section>

    <!-- Form -->
    <section class="flex items-center justify-center px-6 py-12 sm:px-10">
      <div class="w-full max-w-[400px]">
        <AnimatePresence mode="wait" :initial="false">
          <Motion
            v-if="step === 'email'"
            key="email"
            :initial="{ opacity: 0, x: 30 }"
            :animate="{ opacity: 1, x: 0 }"
            :exit="{ opacity: 0, x: -30 }"
            :transition="{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }"
          >
            <h2 class="font-display text-[2rem] leading-tight font-bold">Welcome back</h2>
            <p class="text-muted-foreground mt-2">Sign in to pick up your sheets and sessions.</p>

            <form class="mt-8 space-y-4" novalidate @submit.prevent="sendCode">
              <div class="space-y-2">
                <UiLabel for="email" class="text-sm font-semibold">University email</UiLabel>
                <UiInput
                  id="email"
                  v-model="email"
                  type="email"
                  autocomplete="email"
                  placeholder="name@university.edu"
                  :aria-invalid="!!error"
                  aria-describedby="email-error"
                  @input="error = ''"
                />
                <p v-if="error" id="email-error" role="alert" class="text-destructive text-sm font-medium">{{ error }}</p>
              </div>
              <UiButton type="submit" size="lg" class="w-full" :disabled="busy === 'email'">
                <UiSpinner v-if="busy === 'email'" /> {{ busy === "email" ? "Sending code…" : "Email me a sign-in code" }}
              </UiButton>
            </form>

            <div class="text-muted-foreground my-6 flex items-center gap-4 text-xs font-semibold tracking-wider uppercase">
              <span class="bg-border h-px flex-1" /> or <span class="bg-border h-px flex-1" />
            </div>
            <UiButton variant="outline" size="lg" class="w-full" :disabled="busy === 'sso'" @click="sso">
              <UiSpinner v-if="busy === 'sso'" /><GraduationCap v-else /> Continue with university account
            </UiButton>
            <p class="text-muted-foreground mt-8 flex items-start gap-2 text-sm leading-snug">
              <Lock class="mt-0.5 size-4 shrink-0" />
              Your attempts stay yours. The tutor never receives your name, and final answers are never shown.
            </p>
          </Motion>

          <Motion
            v-else
            key="code"
            :initial="{ opacity: 0, x: 30 }"
            :animate="{ opacity: 1, x: 0 }"
            :exit="{ opacity: 0, x: -30 }"
            :transition="{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }"
          >
            <button class="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm font-semibold" @click="step = 'email'">
              <ArrowLeft class="size-4" /> Use a different email
            </button>
            <h2 class="font-display text-[2rem] leading-tight font-bold">Check your inbox</h2>
            <p class="text-muted-foreground mt-2">
              We sent a 6-digit code to <span class="text-foreground font-semibold">{{ email }}</span>.
            </p>
            <form class="mt-8 space-y-6" @submit.prevent="verify">
              <UiPinInput v-model="code" placeholder="" aria-label="6-digit sign-in code" @complete="verify">
                <UiPinInputGroup class="flex gap-2">
                  <UiPinInputSlot v-for="(_, i) in 6" :key="i" :index="i" />
                </UiPinInputGroup>
              </UiPinInput>
              <UiButton type="submit" size="lg" class="w-full" :disabled="code.length < 6 || busy === 'code'">
                <UiSpinner v-if="busy === 'code'" /> {{ busy === "code" ? "Signing you in…" : "Sign in" }}
              </UiButton>
            </form>
            <p class="text-muted-foreground mt-6 text-sm">
              Didn't get it?
              <button class="text-foreground font-semibold underline underline-offset-4" @click="resend">Send a new code</button>
            </p>
          </Motion>
        </AnimatePresence>
      </div>
    </section>
  </div>
</template>
