<script setup lang="ts">
import { ChevronRight, Orbit, BookOpen } from '@lucide/vue'
import { mixedLabel } from '~/lib/evidence'

const { concepts, isFirstUse } = useWorkspace()
const filter = ref<'all' | 'gap' | 'unverified' | 'demonstrated'>('all')
const opts = [
  { v: 'all', label: 'All' }, { v: 'gap', label: 'Gaps' }, { v: 'unverified', label: 'Unverified' }, { v: 'demonstrated', label: 'Demonstrated' },
] as const
const shown = computed(() => concepts.value.filter(c => filter.value === 'all' || c.subs.some(s => s.state === filter.value)))
const count = (v: string) => concepts.value.filter(c => v === 'all' || c.subs.some(s => s.state === v)).length
const totals = computed(() => { const s = concepts.value.flatMap(c => c.subs); return { c: s.filter(x => x.condition === 'independent').length, t: s.length } })
</script>

<template>
  <div>
    <PageHeader title="Concepts" :description="isFirstUse ? 'Concepts appear here as you add sheets and complete checks.' : `${totals.c} of ${totals.t} sub-concepts checked independently. Every status has evidence you can open.`" />

    <EmptyState v-if="isFirstUse" title="Nothing to show yet" text="Add an exercise sheet, and its concepts and sub-concepts appear here, each marked unverified until you complete a check.">
      <template #icon><Orbit class="size-5" /></template>
      <UiButton as-child><NuxtLink to="/study?tab=upload">Add an exercise sheet</NuxtLink></UiButton>
    </EmptyState>

    <template v-else>
      <Reveal :index="1" class="mb-6">
        <UiToggleGroup type="single" :model-value="filter" class="bg-muted w-fit flex-wrap gap-1 rounded-lg p-1" aria-label="Filter concepts" @update:model-value="(v) => v && (filter = v as any)">
          <UiToggleGroupItem v-for="o in opts" :key="o.v" :value="o.v" class="h-9 gap-2 rounded-md px-4">{{ o.label }} <span class="text-muted-foreground text-xs tabular-nums">{{ count(o.v) }}</span></UiToggleGroupItem>
        </UiToggleGroup>
      </Reveal>

      <TransitionGroup tag="ul" name="rowlist" class="divide-border relative divide-y">
        <li v-for="(c, i) in shown" :key="c.id">
          <NuxtLink :to="`/concepts/${c.id}`" class="group hover:bg-accent/40 -mx-3 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl px-3 py-5 transition-colors">
            <EvidenceRing :states="c.subs.map(s => s.state)" :size="80" :stroke="9" :label="`${c.name}: ${mixedLabel(c.subs.map(s => s.state))}`"><span class="text-base font-semibold tabular-nums">{{ c.checked }}/{{ c.total }}</span></EvidenceRing>
            <div class="min-w-0 flex-1 basis-64 space-y-2">
              <div class="flex flex-wrap items-center gap-3"><h2 class="text-xl font-semibold">{{ c.name }}</h2><EvidenceBadge :state="c.headline" short /></div>
              <p class="text-muted-foreground text-sm">{{ mixedLabel(c.subs.map(s => s.state)) }}</p>
            </div>
            <ChevronRight class="text-muted-foreground size-5 transition-transform group-hover:translate-x-1" />
          </NuxtLink>
        </li>
      </TransitionGroup>
      <EmptyState v-if="!shown.length" title="No concepts match this filter" text="Switch back to All to see every concept in this course."><template #icon><BookOpen class="size-5" /></template><UiButton variant="outline" @click="filter = 'all'">Show all</UiButton></EmptyState>
    </template>
  </div>
</template>

<style>
.rowlist-move, .rowlist-enter-active, .rowlist-leave-active { transition: all 350ms var(--ease-out); }
.rowlist-enter-from, .rowlist-leave-to { opacity: 0; transform: translateY(10px); }
.rowlist-leave-active { position: absolute; width: 100%; }
</style>
