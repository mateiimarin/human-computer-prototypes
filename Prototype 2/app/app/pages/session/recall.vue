<script setup lang="ts">
import { ArrowRight, History } from '@lucide/vue'
import { packOf } from '~/lib/session'
import { packs } from '~/data/packs'

definePageMeta({ layout: 'session', middleware: 'session' })
useStep('recall')
const { ws } = useWorkspace()
const { go } = useSession()
const s = computed(() => ws.value.active!)
const pack = computed(() => packOf(s.value))
const from = computed(() => (pack.value.recall ? packs[pack.value.recall.packId]! : null))
const sheet = ref(false)

// With no matching earlier exercise, this step simply doesn't exist.
onMounted(() => { if (!pack.value.recall) go('work') })
function carry() { s.value.recall.done = true; go('work') }
</script>

<template>
  <div v-if="pack.recall && from">
    <StageHeader
      title="Something you’ve solved before"
      description="A quick recall before you start. Remembering how you solved a similar problem makes this one easier to begin."
      next="Work on the exercise below."
    />
    <div class="space-y-8">
      <ProblemCard :pack="pack" />

      <Reveal :index="1" class="space-y-4">
        <div class="border-border flex items-start gap-4 rounded-2xl border p-5 sm:p-6">
          <span class="bg-check text-check-foreground grid size-11 shrink-0 place-items-center rounded-xl"><History class="size-5" /></span>
          <div class="space-y-1">
            <p class="text-muted-foreground text-sm">Earlier exercise · <RichText :text="from.title" /></p>
            <p class="text-lg leading-8"><RichText :text="pack.recall.prompt" /></p>
          </div>
        </div>
        <div class="space-y-2">
          <UiLabel for="recall">What do you remember? <span class="text-muted-foreground font-normal">Optional, a few words is plenty</span></UiLabel>
          <UiTextarea id="recall" v-model="s.recall.text" rows="3" placeholder="The state was…, and at each step I…" />
        </div>
        <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="translate-y-1 opacity-0">
          <div v-if="s.recall.revealed" class="bg-assist/50 space-y-1 rounded-xl p-5 text-base leading-7"><p class="text-assist-foreground text-sm font-medium">What you did, and how it applies here</p><p><RichText :text="pack.recall.reveal" /></p></div>
        </Transition>
      </Reveal>

      <Reveal :index="2" class="flex flex-wrap items-center gap-3">
        <UiButton size="lg" @click="carry">Start working <ArrowRight /></UiButton>
        <UiButton variant="outline" size="lg" @click="s.recall.revealed = true">Show what I did</UiButton>
        <UiButton variant="ghost" size="lg" @click="sheet = true">Open the earlier solution</UiButton>
      </Reveal>
    </div>

    <UiSheet v-model:open="sheet">
      <UiSheetContent side="right" class="w-full gap-0 sm:max-w-lg">
        <UiSheetHeader class="space-y-1.5 p-6 pb-4"><UiSheetTitle class="text-xl">{{ from.title }}</UiSheetTitle><UiSheetDescription>Your earlier solution, 8 Oct</UiSheetDescription></UiSheetHeader>
        <div class="space-y-6 overflow-y-auto p-6 pt-2">
          <p class="text-base leading-7"><RichText :text="from.statement" /></p>
          <ol class="space-y-2.5"><li v-for="(t, i) in from.work.solution.steps" :key="i" class="bg-assist/50 rounded-xl px-4 py-3 text-[15px] leading-7"><RichText :text="t" /></li></ol>
          <CodeSnippet :code="from.work.solution.code" title="solution.py" />
        </div>
      </UiSheetContent>
    </UiSheet>
  </div>
</template>
