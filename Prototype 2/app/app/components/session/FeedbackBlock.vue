<script setup lang="ts">
import { Check, CircleAlert, History } from '@lucide/vue'
import type { Feedback, Pack } from '~/data/types'
import type { Repeat } from '~/lib/evidence'
import { fmtDate } from '~/lib/format'
import { packs } from '~/data/packs'

const props = defineProps<{ feedback: Feedback; pack: Pack; repeat?: Repeat | null }>()
const evidence = useEvidenceSheet()
const earlierName = computed(() => {
  const id = props.repeat?.entry.sub
  return Object.values(packs).flatMap(p => p.subs).find(s => s.id === id)?.name ?? ''
})
const where = computed(() => {
  const e = props.repeat?.entry
  if (!e) return ''
  return e.source === 'review' ? 'a review' : e.source === 'twin' ? 'a twin problem' : e.title
})
</script>

<template>
  <section class="space-y-8" aria-label="Feedback on your explanation">
    <div class="space-y-3">
      <h3 class="text-sm font-medium">What you covered</h3>
      <ul v-if="feedback.covered.length" class="space-y-2.5">
        <Reveal v-for="(c, i) in feedback.covered" :key="c" as="li" :index="i" class="flex items-start gap-3 text-base leading-7">
          <Check class="text-demonstrated-foreground mt-1.5 size-4 shrink-0" :stroke-width="2.6" />
          <RichText :text="c" />
        </Reveal>
      </ul>
      <p v-else class="text-muted-foreground text-base leading-7">None of the points this exercise checks were covered yet.</p>
    </div>

    <Reveal v-if="feedback.gap" :index="3" class="space-y-4">
      <div class="bg-gap text-gap-foreground space-y-1.5 rounded-xl p-5">
        <h3 class="flex items-center gap-2 text-sm font-medium"><CircleAlert class="size-4" /> Gap · {{ pack.subs.find(s => s.id === feedback.gap!.sub)?.name }}</h3>
        <p class="text-foreground text-base leading-7"><RichText :text="feedback.gap.text" /></p>
      </div>
      <div v-if="repeat" class="flex items-start gap-3 text-[15px] leading-6" role="note">
        <History class="text-muted-foreground mt-1 size-4 shrink-0" />
        <p class="text-muted-foreground">
          <span class="text-foreground font-medium">This has come up before.</span>
          On {{ fmtDate(repeat.entry.at) }}, in {{ where }}, you also showed a gap on “{{ earlierName }}”.
          <template v-if="repeat.text">{{ repeat.text }}</template>
          <button class="text-foreground ml-1 underline underline-offset-4" @click="evidence.open(repeat.entry.sub)">See that evidence</button>
        </p>
      </div>
    </Reveal>

    <Reveal :index="4" class="space-y-1">
      <h3 class="text-sm font-medium">What to do next</h3>
      <p class="text-base leading-7"><RichText :text="feedback.next" /></p>
    </Reveal>
  </section>
</template>
