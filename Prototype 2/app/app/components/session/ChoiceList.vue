<script setup lang="ts">
import { Check, X } from '@lucide/vue'
import type { Question } from '~/data/types'
import type { AnswerState } from '~/data/session'

/** Answer options. When `reveal` is set, right and wrong choices are marked with an icon and words, never colour alone. */
const props = defineProps<{ q: Question; a: AnswerState; reveal?: boolean; locked?: boolean }>()
const keys = ['A', 'B', 'C', 'D']
function pick(id: string) { if (!props.locked) { props.a.choice = id; props.a.idk = false } }
</script>

<template>
  <UiRadioGroup :model-value="a.choice ?? ''" class="gap-2" aria-label="Answers" :disabled="locked" @update:model-value="(v) => pick(v as string)">
    <label
      v-for="(c, i) in q.choices" :key="c.id"
      class="flex min-h-14 items-center gap-4 rounded-xl border px-4 py-3.5 transition-colors duration-150"
      :class="[
        locked ? 'cursor-default' : 'hover:bg-accent/50 cursor-pointer',
        !reveal && a.choice === c.id && 'border-foreground bg-accent/60',
        reveal && c.id === q.correct && 'border-demonstrated-dot/60 bg-demonstrated',
        reveal && a.choice === c.id && c.id !== q.correct && 'border-gap-dot/60 bg-gap',
      ]"
    >
      <UiRadioGroupItem :value="c.id" class="size-5 shrink-0" :aria-label="`Option ${keys[i]}`" :disabled="locked" />
      <span class="flex-1 text-base leading-7"><RichText :text="c.label" /></span>
      <span v-if="reveal && c.id === q.correct" class="text-demonstrated-foreground flex shrink-0 items-center gap-1 text-xs font-medium"><Check class="size-4" /> Right answer</span>
      <span v-else-if="reveal && a.choice === c.id" class="text-gap-foreground flex shrink-0 items-center gap-1 text-xs font-medium"><X class="size-4" /> Your answer</span>
    </label>
  </UiRadioGroup>
</template>
