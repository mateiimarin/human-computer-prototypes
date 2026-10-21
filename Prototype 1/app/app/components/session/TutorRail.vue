<script setup lang="ts">
import { ArrowRight, Compass, Lightbulb, ListPlus, Lock, Send, Target } from "@lucide/vue";
import type { TaskContent } from "~/data/types";
import {
  answerQuestion,
  askForHint,
  contributionEntries,
  displayOrigin,
  hasPendingQuestion,
  hasWork,
  isHintRequest,
  nextStepToTry,
  originLabels,
  remainingHints,
  tutorReply,
  tutorSays,
  youSay,
} from "~/domain/session";

const props = defineProps<{ content: TaskContent; sheet?: boolean }>();
const emit = defineEmits<{ focusStep: [step: number] }>();

const s = useSession();
const tab = ref("tutor");
const notice = ref("");
const thinking = ref(false);
const scroller = ref<HTMLElement>();
const entries = computed(() => contributionEntries(s.value, props.content));
const pending = computed(() => hasPendingQuestion(s.value));
const noHints = computed(() => s.value.budget === 0 || remainingHints(s.value) === 0);

const request = computed({
  get: () => s.value.tutorDraft,
  set: (v) => (s.value.tutorDraft = v),
});
const placeholder = computed(() =>
  pending.value ? `Answer to unlock hint ${s.value.revealedHints.length + 1}…` : "Ask the tutor, or ask for a hint…",
);

function toBottom() {
  nextTick(() => scroller.value?.scrollTo({ top: scroller.value.scrollHeight, behavior: "smooth" }));
}
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * One message from the student. While the tutor waits for an answer, typed text is that answer;
 * a hint request or a menu question is still treated as what it is.
 */
async function send(raw: string, opts: { about?: number | null; menu?: boolean } = {}) {
  const typed = raw.trim();
  if (!typed) {
    notice.value = pending.value ? "Write an answer first. It isn't marked." : "Type a message, or pick something from Quick ask.";
    return;
  }
  notice.value = "";
  request.value = "";
  const about = opts.about ?? null;
  youSay(s.value, typed, about);
  thinking.value = true;
  toBottom();
  await wait(650);
  const r = tutorReply(props.content, typed, s.value.exchanges.length, about);
  if (isHintRequest(typed)) askForHint(s.value, props.content);
  else if (pending.value && !opts.menu && !r.locked) answerQuestion(s.value, props.content, typed);
  else {
    const step = r.step ?? nextStepToTry(s.value, props.content);
    s.value.exchanges.push({ question: typed, reply: r.text, about, step, locked: r.locked });
    tutorSays(s.value, r.text, step, r.locked);
  }
  thinking.value = false;
  toBottom();
}

/** Test aid: the prepared text for whatever the tutor is waiting for. */
function fillSample() {
  if (pending.value) request.value = s.value.gate === "reasoning" ? props.content.sampleAnswers.plan : props.content.sampleAnswers.recall;
  else {
    const list = props.content.tutor.suggestions.slice(0, 2);
    request.value = list[s.value.exchanges.filter((e) => e.question).length % list.length]!;
  }
  nextTick(() => document.getElementById("tutor-input")?.focus());
}
const dot = (o: string) => (o === "you" ? "bg-forest" : o === "prompted" ? "bg-iris" : o === "supplied" ? "bg-coral" : o === "mixed" ? "bg-sun-deep" : "bg-muted-foreground");
const tabClass =
  "text-muted-foreground data-[state=active]:text-foreground h-auto flex-none rounded-none border-b-2 border-transparent px-0 pb-3 data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none";
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <UiTabs v-model="tab" class="flex min-h-0 flex-1 flex-col gap-0">
      <div class="px-5 pt-5" :class="sheet ? 'pr-14' : ''">
        <UiTabsList class="h-auto w-full justify-start gap-6 rounded-none border-b bg-transparent p-0">
          <UiTabsTrigger value="tutor" :class="tabClass">Tutor</UiTabsTrigger>
          <UiTabsTrigger value="sources" :class="tabClass">Who thought it? <span class="text-muted-foreground font-medium">{{ entries.length }}</span></UiTabsTrigger>
        </UiTabsList>
      </div>

      <!-- TUTOR: one chat -->
      <UiTabsContent value="tutor" class="flex min-h-0 flex-1 flex-col">
        <div ref="scroller" class="min-h-0 flex-1 overflow-y-auto px-5 py-5" aria-live="polite" aria-label="Chat with the tutor">
          <p v-if="!s.chat.length" class="text-muted-foreground text-[15px] leading-relaxed">
            Say what you tried or where you're stuck, or pick a hint or a common question from <strong class="text-foreground">Quick ask</strong>. The tutor replies with a question, not the answer.
          </p>

          <UiMessageGroup class="gap-4">
            <UiMessage v-for="(m, i) in s.chat" :key="i" :align="m.role === 'you' ? 'end' : 'start'">
              <UiMessageContent>
                <!-- Only the student's own messages sit in a bubble; the tutor writes plain text -->
                <UiBubble v-if="m.role === 'you'" variant="default" align="end">
                  <UiBubbleContent>{{ m.text }}</UiBubbleContent>
                </UiBubble>
                <div v-else class="space-y-1 text-[15px] leading-relaxed">
                  <p v-if="m.kind === 'hint'" class="flex items-center gap-1.5 text-sm font-bold"><Lightbulb class="size-4" /> Hint {{ m.hint }}</p>
                  <p v-if="m.locked" class="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold"><Lock class="size-3" /> Full answer withheld</p>
                  <RichText :text="m.text" />
                  <button
                    v-if="m.step != null"
                    class="text-foreground mt-1 flex items-center gap-1 text-sm font-semibold underline underline-offset-4"
                    @click="emit('focusStep', m.step!)"
                  >
                    Try it in step {{ m.step + 1 }} <ArrowRight class="size-3.5" />
                  </button>
                </div>
              </UiMessageContent>
            </UiMessage>

            <UiMessage v-if="thinking">
              <UiMessageContent>
                <p class="text-muted-foreground flex items-center gap-2 text-[15px]"><UiSpinner class="size-4" /> <span class="shimmer">Typing…</span></p>
              </UiMessageContent>
            </UiMessage>
          </UiMessageGroup>
        </div>

        <!-- Composer -->
        <form class="space-y-2 px-4 pt-1 pb-4" @submit.prevent="send(request)">
          <p v-if="notice" role="status" class="bg-warning text-warning-foreground rounded-xl px-3.5 py-2 text-sm font-medium">{{ notice }}</p>
          <SampleInput label="message to the tutor" @fill="fillSample">
            <UiInputGroup class="bg-card rounded-2xl">
              <UiLabel for="tutor-input" class="sr-only">Message to the tutor</UiLabel>
              <UiInputGroupTextarea
                id="tutor-input"
                v-model="request"
                rows="2"
                class="max-h-40 min-h-[56px] text-[15px]"
                :placeholder="placeholder"
                @keydown.enter.exact.prevent="send(request)"
              />
              <UiInputGroupAddon align="block-end" class="justify-between">
                <UiDropdownMenu>
                  <UiDropdownMenuTrigger as-child>
                    <UiInputGroupButton variant="outline" size="sm" class="rounded-full"><ListPlus /> Quick ask</UiInputGroupButton>
                  </UiDropdownMenuTrigger>
                  <UiDropdownMenuContent align="start" side="top" class="w-72 rounded-2xl p-1.5">
                    <UiDropdownMenuItem class="rounded-xl py-2.5" :disabled="noHints" @select="send('Give me a hint', { menu: true })"><Lightbulb /> Give me a hint</UiDropdownMenuItem>
                    <UiDropdownMenuItem v-if="!hasWork(s)" class="rounded-xl py-2.5" @select="send('I don\'t know where to start.', { menu: true })"><Compass /> I don't know where to start</UiDropdownMenuItem>
                    <UiDropdownMenuSeparator />
                    <UiDropdownMenuLabel class="text-muted-foreground text-xs font-semibold">I'm stuck on…</UiDropdownMenuLabel>
                    <UiDropdownMenuItem v-for="(st, n) in content.steps" :key="st.label" class="rounded-xl py-2.5" @select="send(`I'm stuck on step ${n + 1}.`, { about: n, menu: true })">
                      <Target /> Step {{ n + 1 }}: {{ st.label }}
                    </UiDropdownMenuItem>
                  </UiDropdownMenuContent>
                </UiDropdownMenu>
                <UiInputGroupButton type="submit" variant="default" size="icon-sm" class="rounded-full" aria-label="Send to tutor" :disabled="thinking"><Send /></UiInputGroupButton>
              </UiInputGroupAddon>
            </UiInputGroup>
          </SampleInput>
          <p class="text-muted-foreground flex items-center gap-1.5 px-1 text-xs font-medium"><Lock class="size-3" /> The tutor won't give full answers</p>
        </form>
      </UiTabsContent>

      <!-- WHO THOUGHT IT -->
      <UiTabsContent value="sources" class="min-h-0 flex-1 overflow-y-auto px-5 py-6">
        <p class="text-muted-foreground mb-6 text-[15px] leading-relaxed">Everything in this exercise so far, and who it came from.</p>
        <p v-if="!entries.length" class="text-muted-foreground text-[15px]">Nothing yet. Steps you write appear here.</p>
        <ol>
          <li v-for="(c, i) in entries" :key="c.id" class="grid grid-cols-[14px_minmax(0,1fr)] gap-x-3.5">
            <div class="flex flex-col items-center pt-1.5">
              <span class="size-2.5 rounded-full" :class="dot(displayOrigin(c, s.flags))" />
              <span v-if="i < entries.length - 1" class="bg-foreground/15 mt-1 w-px flex-1" aria-hidden="true" />
            </div>
            <div class="pb-6">
              <p class="flex flex-wrap items-baseline justify-between gap-x-3">
                <span class="font-display font-bold">{{ c.title }}</span>
                <span class="text-muted-foreground text-xs font-semibold">{{ originLabels[displayOrigin(c, s.flags)] }}</span>
              </p>
              <div class="text-muted-foreground mt-1 line-clamp-2 text-[15px] leading-6"><RichText :text="c.evidence" /></div>
              <UiButton v-if="c.step !== null" size="sm" variant="ghost" class="-ml-3 mt-1" @click="emit('focusStep', c.step!)">Show in attempt <ArrowRight /></UiButton>
            </div>
          </li>
        </ol>
      </UiTabsContent>
    </UiTabs>
  </div>
</template>
