<script setup lang="ts">
import { Check, X, SkipForward, Clock4, LifeBuoy, HelpCircle, Contrast } from '@lucide/vue'
import { packs } from '~/data/packs'
import { fmtDate, fmtTime } from '~/lib/format'
import type { EvidenceItem } from '~/lib/evidence'

const { sub, close } = useEvidenceSheet()
const { ws } = useWorkspace()
const { start } = useSession()
const { drill } = useReviewRun()
const info = computed(() => {
  if (!sub.value) return null
  for (const p of Object.values(packs)) {
    const s = p.subs.find(x => x.id === sub.value)
    if (s) return { sub: s, pack: p }
  }
  return null
})
const history = computed(() => ws.value.entries.filter(e => e.sub === sub.value).sort((a, b) => +new Date(b.at) - +new Date(a.at)))
const latest = computed(() => history.value[0])
const verdictIcon: Record<EvidenceItem['verdict'], any> = { correct: Check, incorrect: X, partial: Contrast, skipped: SkipForward, deferred: Clock4, assisted: LifeBuoy, idk: HelpCircle }
const verdictLabel: Record<EvidenceItem['verdict'], string> = { correct: 'Correct', incorrect: 'Incorrect', partial: 'Partly', skipped: 'Skipped', deferred: 'Postponed', assisted: 'Assisted', idk: 'I don’t know' }
const verdictTone: Record<EvidenceItem['verdict'], string> = { correct: 'text-demonstrated-foreground', incorrect: 'text-gap-foreground', partial: 'text-partial-foreground', skipped: 'text-muted-foreground', deferred: 'text-muted-foreground', assisted: 'text-assist-foreground', idk: 'text-gap-foreground' }

function drillIt() { const sid = sub.value!; close(); if (!drill(sid)) practise() }
function practise() { const p = info.value!.pack; close(); start(p.id, 'twin') }
</script>

<template>
  <UiSheet :open="!!sub" @update:open="(o) => !o && close()">
    <UiSheetContent side="right" class="w-full gap-0 sm:max-w-lg">
      <template v-if="info">
        <UiSheetHeader class="space-y-3 p-6 pb-4">
          <p class="text-muted-foreground text-sm"><RichText :text="info.pack.title" /></p>
          <UiSheetTitle class="text-2xl leading-8">{{ info.sub.name }}</UiSheetTitle>
          <UiSheetDescription class="text-base leading-7"><RichText :text="info.sub.blurb" /></UiSheetDescription>
          <div v-if="latest" class="flex flex-wrap gap-2"><EvidenceBadge :state="latest.state" /><ConditionTag v-if="latest.state === 'unverified'" :condition="latest.condition" /></div>
          <p v-else class="text-muted-foreground text-sm">No check has covered this yet.</p>
        </UiSheetHeader>
        <div class="flex-1 space-y-8 overflow-y-auto p-6 pt-2">
          <section v-for="(e, i) in history" :key="e.id" class="space-y-3" :aria-label="`Evidence from ${fmtDate(e.at)}`">
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h3 class="text-[15px] font-medium">{{ i === 0 ? 'Latest' : 'Earlier' }} · {{ fmtDate(e.at) }}<span class="text-muted-foreground font-normal"> at {{ fmtTime(e.at) }}</span></h3>
              <span v-if="e.attempt > 1" class="text-muted-foreground text-xs">Attempt {{ e.attempt }}</span>
            </div>
            <p class="text-muted-foreground text-sm">{{ e.title }}</p>
            <div class="flex flex-wrap items-center gap-2"><EvidenceBadge :state="e.state" short /><ConditionTag :condition="e.condition" /></div>
            <ul class="divide-border divide-y">
              <li v-for="(it, j) in e.items" :key="j" class="space-y-1.5 py-3.5">
                <p class="text-[15px] leading-6 font-medium"><RichText :text="it.label" /></p>
                <p class="text-muted-foreground text-[15px] leading-6">You: <RichText :text="it.answer" /></p>
                <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <span class="flex items-center gap-1.5 font-medium" :class="verdictTone[it.verdict]"><component :is="verdictIcon[it.verdict]" class="size-4" /> {{ verdictLabel[it.verdict] }}</span>
                  <ConfidenceTag :confidence="it.confidence" />
                </div>
                <p v-if="it.note" class="text-muted-foreground bg-muted mt-1 rounded-lg px-3.5 py-2.5 text-sm leading-6"><RichText :text="it.note" /></p>
              </li>
            </ul>
          </section>
          <p v-if="!history.length" class="text-muted-foreground text-[15px] leading-7">Complete a session on this exercise and the answers behind its status appear here.</p>
        </div>
        <div v-if="latest && latest.state !== 'demonstrated'" class="space-y-2 p-6 pt-3">
          <UiButton size="lg" class="w-full" @click="drillIt">Practise this point</UiButton>
          <UiButton variant="ghost" size="lg" class="w-full" @click="practise">Try a twin problem instead</UiButton>
        </div>
      </template>
    </UiSheetContent>
  </UiSheet>
</template>
