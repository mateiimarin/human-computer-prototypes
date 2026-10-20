<script setup lang="ts">
import { ArrowLeft, ChevronRight, History } from '@lucide/vue'
import { fmtDate, relative } from '~/lib/format'
import { mixedLabel } from '~/lib/evidence'

const route = useRoute()
const { ws, concepts } = useWorkspace()
const { start } = useSession()
const { drill, questionsFor } = useReviewRun()
/** Practise one point with a short independent drill; with no questions for it, fall back to a twin problem. */
function practise(sub: string, packId: string) { if (!drill(sub)) start(packId, 'twin') }
const evidence = useEvidenceSheet()
const c = computed(() => concepts.value.find(x => x.id === route.params.id))
const sessions = computed(() => ws.value.sessions.filter(s => c.value?.packs.some(p => p.id === s.packId)))
const noteFor = (s: any) => s.state === 'unverified' && s.previous ? `Previously ${s.previous.state} on ${fmtDate(s.previous.at)}` : null
</script>

<template>
  <div v-if="c">
    <Reveal class="pb-4"><UiButton variant="ghost" size="sm" class="-ml-3" as-child><NuxtLink to="/concepts"><ArrowLeft /> All concepts</NuxtLink></UiButton></Reveal>
    <Reveal :index="1" as="header" class="flex flex-wrap items-center gap-x-8 gap-y-6 pb-10">
      <EvidenceRing :states="c.subs.map(s => s.state)" :size="120" :stroke="12" :label="`${c.name}: ${mixedLabel(c.subs.map(s => s.state))}`"><span class="text-2xl leading-none font-semibold tabular-nums">{{ c.checked }}/{{ c.total }}</span><span class="text-muted-foreground mt-1 text-xs">checked</span></EvidenceRing>
      <div class="min-w-0 flex-1 basis-72 space-y-3">
        <h1 class="text-[28px] leading-9 font-semibold sm:text-[32px] sm:leading-10" tabindex="-1">{{ c.name }}</h1>
        <p class="text-muted-foreground max-w-xl text-lg leading-8">{{ c.blurb }}</p>
        <p class="text-sm">{{ mixedLabel(c.subs.map(s => s.state)) }}</p>
      </div>
    </Reveal>

    <section v-for="(p, pi) in c.packs" :key="p.id" class="mb-12" :aria-label="p.title">
      <Reveal :index="pi + 2" class="mb-2 flex flex-wrap items-center justify-between gap-3">
        <div><p class="text-muted-foreground text-sm">Exercise {{ p.sheetNo }}</p><h2 class="text-xl font-semibold"><RichText :text="p.title" /></h2></div>
        <UiButton variant="outline" @click="start(p.id)">New session</UiButton>
      </Reveal>
      <ul class="divide-border divide-y">
        <Reveal v-for="(s, i) in c.subs.filter(x => x.packId === p.id)" :key="s.id" as="li" :index="i + pi + 3" class="flex flex-wrap items-center gap-x-4 gap-y-3 py-5">
          <div class="min-w-0 flex-1 basis-60 space-y-1">
            <p class="text-[17px] leading-6 font-medium">{{ s.name }}</p>
            <p class="text-muted-foreground text-sm"><RichText :text="s.blurb" /></p>
            <p v-if="noteFor(s)" class="text-muted-foreground text-sm">{{ noteFor(s) }}. The latest check didn’t give independent evidence.</p>
            <p v-else-if="s.at" class="text-muted-foreground text-sm">Last checked {{ relative(s.at) }}</p>
            <p v-if="s.state !== 'demonstrated' && questionsFor(s.id).length" class="text-muted-foreground text-sm">{{ questionsFor(s.id).length }} short questions, solutions hidden.</p>
          </div>
          <EvidenceBadge :state="s.state" /><ConditionTag v-if="s.state === 'unverified'" :condition="s.condition as any" />
          <div class="flex items-center gap-1">
            <UiButton v-if="s.state === 'gap' || s.state === 'partial'" size="sm" variant="secondary" @click="practise(s.id, p.id)">Practise this point</UiButton>
            <UiButton v-else-if="s.state === 'unverified'" size="sm" variant="secondary" @click="practise(s.id, p.id)">Check this point</UiButton>
            <UiButton variant="ghost" size="sm" @click="evidence.open(s.id)">See evidence <ChevronRight /></UiButton>
          </div>
        </Reveal>
      </ul>
    </section>

    <section v-if="sessions.length" aria-labelledby="hist">
      <Reveal><h2 id="hist" class="mb-2 text-xl font-semibold">Past sessions</h2></Reveal>
      <ul class="divide-border divide-y">
        <Reveal v-for="s in sessions" :key="s.id" as="li" class="flex flex-wrap items-center gap-x-4 gap-y-1.5 py-4">
          <div class="min-w-0 flex-1 basis-64"><p class="text-[15px] font-medium">{{ s.title }}</p><p class="text-muted-foreground text-sm">{{ s.line }}</p></div>
          <ConditionTag v-if="s.condition !== 'independent'" condition="assisted" /><span class="text-muted-foreground w-24 text-right text-sm">{{ relative(s.at) }}</span>
        </Reveal>
      </ul>
    </section>
  </div>
  <EmptyState v-else title="That concept isn’t in this course" text="It may belong to a different course, or the sheet it came from was removed."><template #icon><History class="size-5" /></template><UiButton as-child><NuxtLink to="/concepts">Back to concepts</NuxtLink></UiButton></EmptyState>
</template>
