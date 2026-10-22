<script setup lang="ts">
import { ChevronRight, ChevronDown, ArrowRight } from '@lucide/vue'

definePageMeta({ title: 'Concepts' })
const { ws, topics, dueNow } = useWorkspace()
const { begin } = useReviewRun()
const evidence = useEvidenceSheet()

const closed = ref<string[]>([])
const toggle = (id: string) => (closed.value = closed.value.includes(id) ? closed.value.filter(x => x !== id) : [...closed.value, id])
</script>

<template>
  <div>
    <PageHeader title="Concepts" description="Select a concept to see your answers." />

    <Reveal v-if="ws.saved.length" :index="1" class="border-border mb-10 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 rounded-xl border px-5 py-4">
      <p class="text-[15px] leading-6"><span class="font-medium">{{ ws.saved.length }} {{ ws.saved.length === 1 ? 'question' : 'questions' }} to answer again</span></p>
      <UiButton v-if="dueNow.length" @click="begin('due', dueNow.map(d => d.qid))">Practise {{ dueNow.length }} due <ArrowRight /></UiButton>
      <UiButton v-else variant="outline" @click="begin('all', ws.saved.map(s => s.qid))">Practise all <ArrowRight /></UiButton>
    </Reveal>

    <section v-for="(tp, ti) in topics" :key="tp.id" class="mb-8" :aria-labelledby="`topic-${tp.id}`">
      <Reveal :index="ti + 2">
        <button class="hover:bg-accent/40 -mx-3 flex w-[calc(100%+1.5rem)] items-center gap-4 rounded-xl px-3 py-3 text-left transition-colors" :aria-expanded="!closed.includes(tp.id)" @click="toggle(tp.id)">
          <EvidenceRing :states="tp.concepts.map(c => c.state)" :size="40" :stroke="5" :label="`${tp.name}: ${tp.checked} of ${tp.total} concepts shown without help`" />
          <span class="min-w-0 flex-1"><span :id="`topic-${tp.id}`" class="block text-xl leading-7 font-semibold">{{ tp.name }}</span><span class="text-muted-foreground block text-sm">{{ tp.checked }} of {{ tp.total }} concepts shown without help</span></span>
          <ChevronDown class="text-muted-foreground size-5 transition-transform duration-200" :class="closed.includes(tp.id) && '-rotate-90'" />
        </button>
      </Reveal>
      <ul v-show="!closed.includes(tp.id)" class="divide-border divide-y pl-[3.25rem]" :aria-label="`${tp.name} concepts`">
        <li v-for="c in tp.concepts" :key="c.id">
          <button v-if="c.entry" class="hover:bg-accent/40 group -mx-3 flex w-[calc(100%+1.5rem)] items-center gap-4 rounded-lg px-3 py-3.5 text-left transition-colors" @click="evidence.open(c.id)">
            <span class="flex-1 text-[16px] leading-6 font-medium">{{ c.name }}</span>
            <EvidenceBadge :state="c.state" short />
            <ChevronRight class="text-muted-foreground size-5 transition-transform group-hover:translate-x-0.5" />
          </button>
          <div v-else class="flex items-center gap-4 py-3.5">
            <span class="text-muted-foreground flex-1 text-[16px] leading-6">{{ c.name }}</span>
            <EvidenceBadge state="unverified" short />
            <span class="size-5" aria-hidden="true" />
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>
