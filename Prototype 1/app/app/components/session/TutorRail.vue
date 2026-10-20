<script setup lang="ts">
import { ArrowRight, Lightbulb, Lock, Send } from "@lucide/vue";
import type { TaskContent } from "~/data/types";
import {
  advanceGate,
  contributionEntries,
  displayOrigin,
  hasWork,
  nextStepToTry,
  originLabels,
  remainingHints,
  revealHint,
  tutorReply,
} from "~/domain/session";

const props = defineProps<{ content: TaskContent; sheet?: boolean }>();
const emit = defineEmits<{ focusStep: [step: number] }>();

const s = useSession();
const assist = useAssistDialog();
const tab = ref("tutor");
const notice = ref("");
const thinking = ref(false);
const scroller = ref<HTMLElement>();
const remaining = computed(() => remainingHints(s.value));
const nextHint = computed(() => s.value.revealedHints.length + 1);
const entries = computed(() => contributionEntries(s.value, props.content));
const asked = computed(() => s.value.exchanges.some((e) => e.question));
const gateStage = computed(() => (s.value.gate === "reasoning" ? 1 : 2));

const request = computed({
  get: () => s.value.tutorDraft,
  set: (v) => (s.value.tutorDraft = v),
});
const response = computed({
  get: () => s.value.gateDraft,
  set: (v) => (s.value.gateDraft = v),
});
/** Which step the question is about; the toggle group works in strings. */
const about = computed({
  get: () => (s.value.aboutDraft == null ? "" : String(s.value.aboutDraft)),
  set: (v: string | undefined) => (s.value.aboutDraft = v ? Number(v) : null),
});

function toBottom() {
  nextTick(() => scroller.value?.scrollTo({ top: scroller.value.scrollHeight, behavior: "smooth" }));
}
async function ask(suggestion?: string) {
  const step = suggestion ? null : (s.value.aboutDraft ?? null);
  const typed = (suggestion ?? request.value).trim();
  const q = typed || (step !== null ? `I'm stuck on step ${step + 1}.` : "");
  if (!q) {
    notice.value = hasWork(s.value)
      ? "Say what you tried or what feels unclear, or choose the step it's about."
      : "Tell the tutor what feels unclear, or ask for a starter question.";
    return;
  }
  notice.value = "";
  request.value = "";
  s.value.aboutDraft = null;
  thinking.value = true;
  s.value.exchanges.push({ question: q, reply: "", about: step });
  toBottom();
  const idx = s.value.exchanges.length - 1;
  const r = tutorReply(props.content, q, idx, step);
  await new Promise((res) => setTimeout(res, 900));
  const e = s.value.exchanges[idx]!;
  e.reply = r.text;
  e.locked = r.locked;
  e.step = r.step ?? nextStepToTry(s.value, props.content);
  thinking.value = false;
  toBottom();
}
function reveal() {
  revealHint(s.value, props.content);
}
function contribute() {
  if (!advanceGate(s.value, response.value)) {
    notice.value = "Write something first. It isn't checked for correctness.";
    return;
  }
  notice.value = "";
  response.value = "";
}
const dot = (o: string) => (o === "you" ? "bg-forest" : o === "prompted" ? "bg-iris" : o === "supplied" ? "bg-coral" : o === "mixed" ? "bg-sun-deep" : "bg-muted-foreground");
const tabClass =
  "text-guidance-foreground/65 data-[state=active]:text-guidance-foreground h-auto flex-none rounded-none border-b-2 border-transparent px-0 pb-3 data-[state=active]:border-guidance-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none";
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <UiTabs v-model="tab" class="flex min-h-0 flex-1 flex-col gap-0">
      <div class="px-5 pt-5" :class="sheet ? 'pr-14' : ''">
        <UiTabsList class="border-guidance-foreground/15 h-auto w-full justify-start gap-6 rounded-none border-b bg-transparent p-0">
          <UiTabsTrigger value="tutor" :class="tabClass">Tutor</UiTabsTrigger>
          <UiTabsTrigger value="sources" :class="tabClass">Who thought it? <span class="text-guidance-foreground/70 font-medium">{{ entries.length }}</span></UiTabsTrigger>
        </UiTabsList>
      </div>

      <!-- TUTOR -->
      <UiTabsContent value="tutor" class="flex min-h-0 flex-1 flex-col">
        <div ref="scroller" class="min-h-0 flex-1 space-y-9 overflow-y-auto px-5 py-6">
          <!-- Hint ladder -->
          <section v-if="s.mode === 'hints'" aria-label="Hints">
            <div class="flex items-center justify-between gap-3">
              <h2 class="font-display text-lg font-bold">Hints</h2>
              <span class="flex items-center gap-2 text-sm font-semibold">
                <span class="flex gap-1.5" role="img" :aria-label="`${remaining} of ${s.budget} hints left`">
                  <span v-for="i in s.budget" :key="i" class="size-2.5 rounded-full transition-colors duration-500" :class="i <= s.revealedHints.length ? 'bg-guidance-foreground/25' : 'bg-guidance-foreground'" />
                </span>
                {{ remaining }} of {{ s.budget }} hints left
              </span>
            </div>

            <ol v-if="s.revealedHints.length" class="mt-4 space-y-4">
              <li v-for="n in s.revealedHints.length" :key="n">
                <Reveal :y="8">
                  <p class="text-guidance-foreground/80 mb-0.5 text-xs font-bold tracking-wide uppercase">Hint {{ n }}</p>
                  <p class="text-[15px] leading-relaxed"><RichText :text="content.hints[n - 1]!" /></p>
                </Reveal>
              </li>
            </ol>

            <div v-if="remaining > 0" class="mt-4">
              <template v-if="s.gate === 'hint'">
                <UiButton variant="dark" size="sm" @click="reveal"><Lightbulb /> Reveal hint {{ nextHint }}</UiButton>
                <p v-if="remaining > 1" class="text-guidance-foreground/85 mt-2.5 text-sm leading-snug">
                  {{ remaining - 1 }} more after this. Each unlocks once you've shown some thinking of your own.
                </p>
              </template>
              <Reveal v-else :y="8" as="form" class="border-guidance-foreground/25 space-y-3 border-t pt-4" @submit.prevent="contribute">
                <p class="text-guidance-foreground/85 text-sm font-semibold">To unlock hint {{ nextHint }} · {{ gateStage }} of 2</p>
                <UiLabel for="gate-response" class="text-[15px] leading-snug font-semibold">
                  {{ s.gate === "reasoning" ? "What will you try with this hint?" : content.gateQuestion }}
                </UiLabel>
                <UiTextarea id="gate-response" v-model="response" class="bg-card min-h-[84px] text-[15px]" placeholder="In your own words…" />
                <div class="flex items-center justify-between gap-3">
                  <span class="text-guidance-foreground/80 text-sm">Not checked for correctness.</span>
                  <UiButton type="submit" size="sm">{{ s.gate === "reasoning" ? "Continue" : `Unlock hint ${nextHint}` }} <ArrowRight /></UiButton>
                </div>
              </Reveal>
            </div>
            <div v-else class="mt-4 space-y-2 text-[15px] leading-snug">
              <p><strong>No hints left.</strong> You can keep working, ask the tutor a question, or reread the hints above.</p>
              <UiButton size="sm" variant="outline" @click="assist.open.value = true">Change assistance</UiButton>
            </div>
          </section>

          <!-- Conversation -->
          <section aria-label="Conversation" aria-live="polite" class="space-y-7">
            <div v-if="!asked" class="space-y-4">
              <p class="text-[15px] leading-relaxed">Tell me what you've tried, or where you're stuck. I'll ask a question rather than give an answer.</p>
              <ul class="-mx-3">
                <li v-if="!hasWork(s)">
                  <button class="hover:bg-guidance-foreground/8 flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] font-semibold transition-colors" @click="ask('I don\'t know where to start.')">
                    I don't know where to start <ArrowRight class="size-4 shrink-0" />
                  </button>
                </li>
                <li v-for="sug in content.tutor.suggestions" :key="sug">
                  <button class="hover:bg-guidance-foreground/8 flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] font-medium transition-colors" @click="ask(sug)">
                    {{ sug }} <ArrowRight class="size-4 shrink-0" />
                  </button>
                </li>
              </ul>
            </div>

            <template v-for="(e, i) in s.exchanges" :key="i">
              <div v-if="e.question" class="space-y-0.5">
                <p class="text-guidance-foreground/80 text-xs font-bold tracking-wide uppercase">You<template v-if="e.about != null"> · step {{ e.about + 1 }}</template></p>
                <p class="text-[15px] leading-relaxed font-medium">{{ e.question }}</p>
              </div>
              <div class="border-iris/45 space-y-2 border-l-2 pl-4">
                <p class="text-guidance-foreground/80 flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase">Tutor<template v-if="e.locked"> · <Lock class="size-3" /> answer stays hidden</template></p>
                <p v-if="e.reply" class="text-[15px] leading-relaxed"><RichText :text="e.reply" /></p>
                <p v-else class="text-muted-foreground inline-flex items-center gap-2 text-[15px]"><UiSpinner class="size-4" /> <span class="shimmer">Thinking of a question…</span></p>
                <UiButton v-if="e.reply && e.step != null" size="sm" variant="ghost" class="text-guidance-foreground hover:bg-guidance-foreground/10 -ml-3" @click="emit('focusStep', e.step!)">
                  Try it in step {{ e.step + 1 }} <ArrowRight />
                </UiButton>
              </div>
            </template>
          </section>
        </div>

        <!-- Composer -->
        <form class="space-y-2.5 px-5 pt-1 pb-5" @submit.prevent="ask()">
          <p v-if="notice" role="status" class="bg-warning text-warning-foreground rounded-xl px-3.5 py-2.5 text-sm font-medium">{{ notice }}</p>
          <div class="bg-card focus-within:ring-ring/30 rounded-3xl transition-shadow focus-within:ring-4">
            <UiLabel for="tutor-input" class="sr-only">Where are you stuck?</UiLabel>
            <textarea
              id="tutor-input"
              v-model="request"
              rows="2"
              class="placeholder:text-muted-foreground/80 block max-h-40 min-h-[64px] w-full resize-none rounded-t-3xl bg-transparent px-5 pt-4 text-[15px] leading-6 outline-none"
              placeholder="What did you try, or what's blocking you?"
              @keydown.enter.exact.prevent="ask()"
            />
            <div class="flex items-center justify-between gap-2 px-3 pt-1 pb-3">
              <div class="flex items-center gap-1.5">
                <span id="about-label" class="text-muted-foreground pl-2 text-xs font-semibold">About</span>
                <UiToggleGroup v-model="about" type="single" class="gap-1" aria-labelledby="about-label">
                  <UiToggleGroupItem v-for="(st, n) in content.steps" :key="st.label" :value="String(n)" :aria-label="`Step ${n + 1}, ${st.label}`" class="bg-foreground/6 hover:bg-foreground/12 data-[state=on]:bg-foreground data-[state=on]:text-background h-7 rounded-full px-2.5 text-xs font-semibold">Step {{ n + 1 }}</UiToggleGroupItem>
                </UiToggleGroup>
              </div>
              <UiButton type="submit" size="icon-sm" aria-label="Send to tutor" :disabled="thinking"><Send /></UiButton>
            </div>
          </div>
          <p class="text-guidance-foreground/80 flex items-center gap-1.5 px-1 text-xs font-medium"><Lock class="size-3" /> Final answers stay hidden</p>
        </form>
      </UiTabsContent>

      <!-- WHO THOUGHT IT -->
      <UiTabsContent value="sources" class="min-h-0 flex-1 overflow-y-auto px-5 py-6">
        <p class="text-guidance-foreground/90 mb-6 text-[15px] leading-relaxed">Where each visible idea came from so far. It records contributions, not understanding.</p>
        <p v-if="!entries.length" class="text-guidance-foreground/80 text-[15px]">Nothing yet. Your first step shows up here.</p>
        <ol>
          <li v-for="(c, i) in entries" :key="c.id" class="grid grid-cols-[14px_minmax(0,1fr)] gap-x-3.5">
            <div class="flex flex-col items-center pt-1.5">
              <span class="size-2.5 rounded-full" :class="dot(displayOrigin(c, s.flags))" />
              <span v-if="i < entries.length - 1" class="bg-guidance-foreground/20 mt-1 w-px flex-1" aria-hidden="true" />
            </div>
            <div class="pb-6">
              <p class="flex flex-wrap items-baseline justify-between gap-x-3">
                <span class="font-display font-bold">{{ c.title }}</span>
                <span class="text-guidance-foreground/85 text-xs font-semibold">{{ originLabels[displayOrigin(c, s.flags)] }}</span>
              </p>
              <div class="text-muted-foreground mt-1 line-clamp-2 text-[15px] leading-6"><RichText :text="c.evidence" /></div>
              <UiButton v-if="c.step !== null" size="sm" variant="ghost" class="text-guidance-foreground hover:bg-guidance-foreground/10 -ml-3 mt-1" @click="emit('focusStep', c.step!)">Show in attempt <ArrowRight /></UiButton>
            </div>
          </li>
        </ol>
      </UiTabsContent>
    </UiTabs>
  </div>
</template>
