<script setup lang="ts">
import { ArrowLeft, ArrowRight, Check, Pencil } from '@lucide/vue'
import type { Question } from '~/data/types'
import type { AnswerState } from '~/data/session'
import { isAnswered, answerText } from '~/lib/session'

/** One question at a time, then a recap where answers can still be revised. Shared by baseline, post-quiz, twin check and review. */
const props = withDefaults(defineProps<{
  questions: Question[]
  answers: Record<string, AnswerState>
  submitLabel?: string
  claimFrom?: number
  confidence?: boolean
  canSkip?: boolean
  skipLabel?: string
  recapTitle?: string
  recapNote?: string
}>(), { submitLabel: 'Submit answers', confidence: true, canSkip: true, skipLabel: 'Skip this check', recapTitle: 'Review your answers' })
const emit = defineEmits<{ submit: []; skip: []; exit: [] }>()

const idx = ref(0)
const dir = ref<'fwd' | 'back'>('fwd')
const total = computed(() => props.questions.length)
const onRecap = computed(() => idx.value >= total.value)
const q = computed(() => props.questions[idx.value])
const a = computed(() => (q.value ? props.answers[q.value.id]! : null))
const answeredAll = computed(() => props.questions.every(x => isAnswered(props.answers[x.id])))
const missing = computed(() => props.questions.filter(x => !isAnswered(props.answers[x.id])).length)
const isClaim = computed(() => props.claimFrom !== undefined && idx.value >= props.claimFrom && !onRecap.value)

function choose(id: string) {
  if (!a.value) return
  a.value.choice = id
  a.value.idk = false
}
function idk() {
  if (!a.value) return
  a.value.idk = true
  a.value.choice = null
}
function go(n: number) {
  dir.value = n > idx.value ? 'fwd' : 'back'
  idx.value = n
}
function next() { go(idx.value + 1) }
function back() { idx.value > 0 ? go(idx.value - 1) : emit('exit') }

defineExpose({ idx, go })
</script>

<template>
  <div class="space-y-8">
    <!-- progress -->
    <div class="space-y-3">
      <div class="flex items-center justify-between gap-4">
        <p class="text-muted-foreground text-sm tabular-nums" aria-live="polite">
          <template v-if="onRecap">Your answers</template><template v-else>Question {{ idx + 1 }} of {{ total }}</template>
        </p>
        <UiButton v-if="canSkip" variant="ghost" size="sm" class="text-muted-foreground -mr-3" @click="emit('skip')">{{ skipLabel }}</UiButton>
      </div>
      <div class="flex gap-1.5" aria-hidden="true">
        <span
          v-for="(x, i) in [...questions, null]" :key="i" class="h-1 flex-1 rounded-full transition-colors duration-300"
          :class="i === idx ? 'bg-foreground' : x && isAnswered(answers[x.id]) ? 'bg-foreground/40' : 'bg-border'"
        />
      </div>
    </div>

    <Transition :name="`q-${dir}`" mode="out-in">
      <!-- a question -->
      <div v-if="q && a" :key="q.id" class="space-y-7">
        <div class="space-y-2">
          <p v-if="isClaim" class="text-muted-foreground text-sm">Claim. Reported separately from the before and after comparison.</p>
          <h2 class="text-[22px] leading-9 font-medium sm:text-2xl sm:leading-10"><RichText :text="q.prompt" /></h2>
        </div>

        <div class="space-y-2">
          <UiRadioGroup :model-value="a.choice ?? ''" class="gap-2" :aria-label="`Answers for question ${idx + 1}`" @update:model-value="(v) => choose(v as string)">
            <label
              v-for="(c, i) in q.choices" :key="c.id"
              class="hover:bg-accent/50 flex min-h-14 cursor-pointer items-center gap-4 rounded-xl border px-4 py-3.5 transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring"
              :class="a.choice === c.id && 'border-foreground bg-accent/60'"
            >
              <UiRadioGroupItem :value="c.id" class="size-5 shrink-0" :aria-label="`Option ${i + 1}`" />
              <span class="flex-1 text-base leading-7"><RichText :text="c.label" /></span>
            </label>
          </UiRadioGroup>
          <IdkOption :selected="a.idk" @select="idk" />
        </div>

        <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="translate-y-1 opacity-0">
          <div v-if="isAnswered(a)" class="space-y-5">
            <div v-if="q.justify" class="space-y-2">
              <UiLabel :for="`just-${q.id}`">Why? <span class="text-muted-foreground font-normal">One sentence, optional</span></UiLabel>
              <UiTextarea :id="`just-${q.id}`" :model-value="a.justification ?? ''" rows="2" class="min-h-16" placeholder="Because…" @update:model-value="(v) => (a!.justification = String(v))" />
            </div>
            <ConfidencePicker v-if="confidence" v-model="a.confidence" />
          </div>
        </Transition>

        <div class="flex items-center justify-between pt-2">
          <UiButton variant="ghost" size="lg" @click="back"><ArrowLeft /> Back</UiButton>
          <div class="flex items-center gap-3">
            <p v-if="!isAnswered(a)" class="text-muted-foreground hidden text-sm sm:block">Choose an answer or “I don’t know”.</p>
            <UiButton size="lg" :disabled="!isAnswered(a)" @click="next">{{ idx === total - 1 ? 'Review answers' : 'Next' }} <ArrowRight /></UiButton>
          </div>
        </div>
      </div>

      <!-- recap -->
      <div v-else key="recap" class="space-y-7">
        <div class="space-y-2">
          <h2 class="text-[22px] leading-9 font-medium sm:text-2xl sm:leading-10">{{ recapTitle }}</h2>
          <p v-if="recapNote" class="text-muted-foreground text-base leading-7">{{ recapNote }}</p>
        </div>
        <ol class="divide-border divide-y">
          <li v-for="(x, i) in questions" :key="x.id" class="flex items-start gap-4 py-4">
            <span class="text-muted-foreground mt-0.5 w-5 shrink-0 text-sm tabular-nums">{{ i + 1 }}</span>
            <div class="min-w-0 flex-1 space-y-1">
              <p class="text-[15px] leading-6"><RichText :text="x.prompt" /></p>
              <p class="text-[15px] leading-6" :class="isAnswered(answers[x.id]) ? 'text-muted-foreground' : 'text-gap-foreground'">
                <template v-if="isAnswered(answers[x.id])"><RichText :text="answerText(x, answers[x.id])" /></template><template v-else>Not answered</template>
              </p>
            </div>
            <UiButton variant="ghost" size="sm" :aria-label="`Edit answer ${i + 1}`" @click="go(i)"><Pencil /> Edit</UiButton>
          </li>
        </ol>
        <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
          <UiButton variant="ghost" size="lg" @click="go(total - 1)"><ArrowLeft /> Back</UiButton>
          <div class="flex flex-wrap items-center justify-end gap-3">
            <p v-if="!answeredAll" class="text-muted-foreground text-sm">Answer the remaining {{ missing }}, or skip this check.</p>
            <UiButton size="lg" :disabled="!answeredAll" @click="emit('submit')"><Check /> {{ submitLabel }}</UiButton>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style>
.q-fwd-enter-active, .q-back-enter-active { transition: opacity 220ms var(--ease-out), transform 220ms var(--ease-out); }
.q-fwd-leave-active, .q-back-leave-active { transition: opacity 100ms var(--ease-in), transform 100ms var(--ease-in); }
.q-fwd-enter-from { opacity: 0; transform: translateX(16px); }
.q-fwd-leave-to { opacity: 0; transform: translateX(-10px); }
.q-back-enter-from { opacity: 0; transform: translateX(-16px); }
.q-back-leave-to { opacity: 0; transform: translateX(10px); }
</style>
