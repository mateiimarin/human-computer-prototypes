<script setup lang="ts">
import { ArrowRight, ChevronRight, Upload, Repeat2, CalendarClock, Target, Play, Plus } from '@lucide/vue'
import { packs } from '~/data/packs'
import { daysUntil, relative, greeting } from '~/lib/format'
import { resumePath, stageOf, stages } from '~/lib/session'
import { mixedLabel } from '~/lib/evidence'

const { ws, course, concepts, dueNow, isFirstUse, sheets } = useWorkspace()
const { start } = useSession()
const { drill } = useReviewRun()

const first = computed(() => ws.value.profile.name.split(' ')[0])
const active = computed(() => ws.value.active)
const activePack = computed(() => (active.value ? packs[active.value.packId] : null))
const stageLabel = computed(() => (active.value ? stages.find(s => s.id === stageOf(active.value!.step))?.label : ''))

const gap = computed(() => {
  for (const c of concepts.value) {
    const g = c.subs.find(s => s.state === 'gap')
    if (g) return { concept: c, sub: g }
  }
  return null
})
const nextPack = computed(() => sheets.value.flatMap(s => s.packIds).map(id => packs[id]!).find(p => !ws.value.sessions.some(s => s.packId === p.id && s.condition === 'independent')))
const nextWhy = computed(() => {
  const p = nextPack.value
  const done = p && ws.value.sessions.find(s => s.packId === p.id)
  if (done?.condition === 'assisted') return 'You finished it with the solution open, so nothing counts as independent evidence yet. A check with your references hidden changes that.'
  return 'A short baseline, then work, then a check with your references hidden.'
})

const totals = computed(() => {
  const subs = concepts.value.flatMap(c => c.subs)
  return { checked: subs.filter(s => s.condition === 'independent').length, total: subs.length }
})
const days = computed(() => (course.value.exam.date ? daysUntil(course.value.exam.date) : null))
const sessions = computed(() => ws.value.sessions.filter(s => s.courseId === course.value.id).slice(0, 4))

function practiseGap() {
  if (gap.value && !drill(gap.value.sub.id)) start(gap.value.sub.packId, 'twin')
}
</script>

<template>
  <div class="space-y-12">
    <Reveal as="header">
      <h1 tabindex="-1" class="text-[28px] leading-9 font-semibold sm:text-[32px] sm:leading-10">{{ greeting() }}, {{ first }}</h1>
    </Reveal>

    <!-- The one next action -->
    <Reveal :index="1" as="section" aria-label="Next step" class="border-border flex flex-col gap-5 rounded-2xl border p-6 sm:flex-row sm:gap-6 sm:p-8">
      <span class="grid size-12 shrink-0 place-items-center rounded-xl" :class="active && !isFirstUse ? 'bg-assist text-assist-foreground' : gap && !isFirstUse ? 'bg-gap text-gap-foreground' : 'bg-check text-check-foreground'">
        <Play v-if="active && !isFirstUse" class="size-6" /><Target v-else-if="gap && !isFirstUse" class="size-6" /><Plus v-else class="size-6" />
      </span>
      <div class="min-w-0 flex-1 space-y-6">
      <template v-if="active && activePack && !isFirstUse">
        <div class="space-y-2">
          <p class="text-muted-foreground text-sm">Open session · {{ stageLabel }}</p>
          <p class="text-2xl leading-8 font-semibold"><RichText :text="activePack.title" /></p>
          <p class="text-muted-foreground max-w-lg text-base leading-7">{{ active.pre.submitted ? 'Your baseline is saved' : 'Your session is open' }}, and everything you wrote is where you left it.</p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <UiButton size="xl" as-child><NuxtLink :to="resumePath(active)">Resume session <ArrowRight /></NuxtLink></UiButton>
          <UiButton variant="ghost" size="lg" as-child><NuxtLink to="/study">Start something else</NuxtLink></UiButton>
        </div>
      </template>

      <template v-else-if="isFirstUse">
        <div class="space-y-2">
          <p class="text-2xl leading-8 font-semibold">Add what you’re studying for {{ course.name }}.</p>
          <p class="text-muted-foreground max-w-lg text-base leading-7">Upload an exercise sheet or pick a topic. Each exercise becomes a session with a baseline, time to work, and a check.</p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <UiButton size="xl" as-child><NuxtLink to="/study?tab=upload"><Upload /> Add an exercise sheet</NuxtLink></UiButton>
          <UiButton variant="ghost" size="lg" as-child><NuxtLink to="/study">Browse topics</NuxtLink></UiButton>
        </div>
        <p v-if="active && activePack" class="text-muted-foreground text-sm">You also have an open session on <RichText :text="activePack.title" />. <NuxtLink :to="resumePath(active)" class="text-foreground underline underline-offset-4">Resume it</NuxtLink></p>
      </template>

      <template v-else>
        <div class="space-y-2">
          <p class="text-muted-foreground text-sm">{{ gap ? 'Best next step' : 'Ready when you are' }}</p>
          <p class="text-2xl leading-8 font-semibold">
            {{ gap ? `Practise “${gap.sub.name}”.` : `Start ${nextPack?.title ?? 'a new session'}.` }}
          </p>
          <p class="text-muted-foreground max-w-lg text-base leading-7">
            {{ gap ? 'Your last check showed a gap here. A few short questions on just this point will show whether it closes.' : nextWhy }}
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <UiButton v-if="gap" size="xl" @click="practiseGap">Practise this gap <ArrowRight /></UiButton>
          <UiButton v-else-if="nextPack" size="xl" @click="start(nextPack.id)">Start session <ArrowRight /></UiButton>
          <UiButton variant="ghost" size="lg" as-child><NuxtLink to="/study">Choose an exercise</NuxtLink></UiButton>
        </div>
      </template>
      </div>
    </Reveal>

    <!-- Review and the exam plan -->
    <section v-if="!isFirstUse" aria-labelledby="review-title">
      <Reveal :index="2"><h2 id="review-title" class="mb-1 text-xl font-semibold">Review</h2></Reveal>
      <ul class="divide-border divide-y">
        <Reveal :index="3" as="li">
          <NuxtLink to="/review?tab=due" class="hover:bg-accent/40 group -mx-3 flex items-center gap-4 rounded-xl px-3 py-4 transition-colors">
            <span class="bg-muted grid size-10 shrink-0 place-items-center rounded-xl"><Repeat2 class="size-5" /></span>
            <span class="min-w-0 flex-1">
              <span class="block text-[15px] font-medium">{{ dueNow.length ? `${dueNow.length} ${dueNow.length === 1 ? 'question is' : 'questions are'} due` : 'Nothing is due' }}</span>
              <span class="text-muted-foreground block text-sm">{{ dueNow.length ? `About ${Math.max(3, dueNow.length * 2)} minutes, with solutions hidden.` : 'You can still run a weekly review whenever you like.' }}</span>
            </span>
            <ChevronRight class="text-muted-foreground size-5 transition-transform group-hover:translate-x-0.5" />
          </NuxtLink>
        </Reveal>
        <Reveal :index="4" as="li">
          <NuxtLink to="/review?tab=exam" class="hover:bg-accent/40 group -mx-3 flex items-center gap-4 rounded-xl px-3 py-4 transition-colors">
            <span class="bg-muted grid size-10 shrink-0 place-items-center rounded-xl"><CalendarClock class="size-5" /></span>
            <span class="min-w-0 flex-1">
              <span class="block text-[15px] font-medium">{{ days !== null ? `Exam in ${days} ${days === 1 ? 'day' : 'days'}` : 'No exam date set' }}</span>
              <span class="text-muted-foreground block text-sm">{{ days !== null ? 'Adjust which topics your review plan includes.' : 'Set a date to shape your review plan.' }}</span>
            </span>
            <ChevronRight class="text-muted-foreground size-5 transition-transform group-hover:translate-x-0.5" />
          </NuxtLink>
        </Reveal>
        <Reveal v-if="gap && active" :index="5" as="li">
          <button class="hover:bg-accent/40 group -mx-3 flex w-[calc(100%+1.5rem)] items-center gap-4 rounded-xl px-3 py-4 text-left transition-colors" @click="practiseGap">
            <span class="bg-gap text-gap-foreground grid size-10 shrink-0 place-items-center rounded-xl"><Target class="size-5" /></span>
            <span class="min-w-0 flex-1">
              <span class="block text-[15px] font-medium">Practise “{{ gap.sub.name }}”</span>
              <span class="text-muted-foreground block text-sm">Short questions on the gap in {{ gap.concept.name }}.</span>
            </span>
            <ChevronRight class="text-muted-foreground size-5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </Reveal>
      </ul>
    </section>

    <!-- Concepts -->
    <section v-if="!isFirstUse" aria-labelledby="concepts-title">
      <Reveal :index="6" class="mb-1 flex items-end justify-between gap-4">
        <div>
          <h2 id="concepts-title" class="text-xl font-semibold">Concepts</h2>
          <p class="text-muted-foreground mt-1 text-[15px]"><span class="tabular-nums">{{ totals.checked }}</span> of <span class="tabular-nums">{{ totals.total }}</span> sub-concepts checked independently</p>
        </div>
        <UiButton variant="ghost" size="sm" as-child><NuxtLink to="/concepts">All concepts <ArrowRight /></NuxtLink></UiButton>
      </Reveal>
      <ul class="divide-border divide-y">
        <Reveal v-for="(c, i) in concepts" :key="c.id" as="li" :index="7 + i">
          <NuxtLink :to="`/concepts/${c.id}`" class="group hover:bg-accent/40 -mx-3 flex items-center gap-5 rounded-2xl px-3 py-4 transition-colors">
            <EvidenceRing :states="c.subs.map(s => s.state)" :size="60" :stroke="7" :label="`${c.name}: ${mixedLabel(c.subs.map(s => s.state))}`"><span class="text-sm font-semibold tabular-nums">{{ c.checked }}/{{ c.total }}</span></EvidenceRing>
            <div class="min-w-0 flex-1 space-y-1">
              <p class="text-[17px] leading-6 font-medium">{{ c.name }}</p>
              <p class="text-muted-foreground text-sm">{{ mixedLabel(c.subs.map(s => s.state)) }}</p>
            </div>
            <EvidenceBadge :state="c.headline" short class="hidden sm:inline-flex" />
            <ChevronRight class="text-muted-foreground size-5 transition-transform group-hover:translate-x-0.5" />
          </NuxtLink>
        </Reveal>
      </ul>
    </section>

    <!-- Recent sessions -->
    <section v-if="sessions.length" aria-labelledby="recent-title">
      <Reveal :index="9"><h2 id="recent-title" class="mb-1 text-xl font-semibold">Recent sessions</h2></Reveal>
      <ul class="divide-border divide-y">
        <Reveal v-for="(s, i) in sessions" :key="s.id" as="li" :index="10 + i">
          <NuxtLink :to="`/concepts/${packs[s.packId]!.conceptId}`" class="hover:bg-accent/40 -mx-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg px-3 py-4 transition-colors">
            <div class="min-w-0 flex-1 basis-60 space-y-1">
              <p class="text-[15px] font-medium">{{ s.title }}</p>
              <p class="text-muted-foreground line-clamp-1 text-sm">{{ s.line }}</p>
            </div>
            <ConditionTag v-if="s.condition !== 'independent'" condition="assisted" />
            <span class="text-muted-foreground w-24 text-right text-sm tabular-nums">{{ relative(s.at) }}</span>
          </NuxtLink>
        </Reveal>
      </ul>
    </section>

    <!-- First use: what a session is -->
    <section v-if="isFirstUse" aria-labelledby="how-title" class="space-y-4">
      <Reveal :index="2"><h2 id="how-title" class="text-xl font-semibold">How a session works</h2></Reveal>
      <ol class="grid gap-6 sm:grid-cols-4">
        <Reveal v-for="(s, i) in stages" :key="s.id" as="li" :index="3 + i" class="space-y-1">
          <p class="text-muted-foreground text-sm tabular-nums">{{ i + 1 }}</p>
          <p class="text-[15px] font-medium">{{ s.label }}</p>
          <p class="text-muted-foreground text-sm leading-6">{{ s.blurb }}</p>
        </Reveal>
      </ol>
    </section>
  </div>
</template>
