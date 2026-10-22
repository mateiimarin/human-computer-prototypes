<script setup lang="ts">
import { Copy, Paperclip, ArrowRight } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { packOf } from '~/lib/session'

definePageMeta({ layout: 'session', middleware: 'session' })
useStep('elsewhere')
const { ws } = useWorkspace()
const { go } = useSession()
const s = computed(() => ws.value.active!)
const pack = computed(() => packOf(s.value))
const e = computed(() => s.value.elsewhere)
const file = ref<HTMLInputElement>()
const error = ref('')

const plain = (t: string) => t.replace(/\$/g, '').replace(/\*\*/g, '').replace(/\\dots/g, '…').replace(/\\/g, '')
async function copy() {
  try { await navigator.clipboard.writeText(`${pack.value.title}\n\n${plain(pack.value.statement)}\n${plain(pack.value.example)}`); toast.success('Exercise copied') }
  catch { toast.error('Could not copy. Select the text above instead.') }
}
function attach(f?: File | null) { if (!f) return; e.value.attached = true; error.value = ''; toast.success(`${f.name} attached`) }
function next() {
  if (!e.value.solution.trim() && !e.value.attached) { error.value = 'Paste your solution or attach a photo to continue.'; return }
  go('explain')
}
</script>

<template>
  <div>
    <StageHeader title="Work on it elsewhere" description="Use your own tools. Come back with your solution." />

    <ol class="space-y-10">
      <Reveal as="li" :index="1" class="grid gap-5 sm:grid-cols-[3rem_1fr]">
        <span class="bg-muted grid size-9 place-items-center rounded-full text-sm font-semibold">1</span>
        <div class="space-y-5">
          <h2 class="text-xl font-semibold">Take the exercise with you</h2>
          <div class="border-border space-y-2 rounded-xl border p-5 text-base leading-7"><p class="font-medium"><RichText :text="pack.title" /></p><p><RichText :text="pack.statement" /></p></div>
          <UiButton variant="outline" @click="copy"><Copy /> Copy the exercise</UiButton>
        </div>
      </Reveal>

      <Reveal as="li" :index="2" class="grid gap-5 sm:grid-cols-[3rem_1fr]">
        <span class="bg-muted grid size-9 place-items-center rounded-full text-sm font-semibold">2</span>
        <div class="space-y-5">
          <h2 class="text-xl font-semibold">Come back with your solution</h2>
          <div class="space-y-2">
            <UiLabel for="elsewhere-solution">Your solution</UiLabel>
            <SampleInput label="Your solution" @fill="e.solution = pack.sampleAnswers.elsewhere; error = ''">
              <UiTextarea id="elsewhere-solution" v-model="e.solution" rows="7" class="font-mono text-sm" placeholder="Paste code or your reasoning here" :aria-invalid="!!error" />
            </SampleInput>
            <p v-if="error" class="text-gap-foreground text-sm" role="alert">{{ error }}</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UiButton variant="outline" @click="file?.click()"><Paperclip /> {{ e.attached ? 'Photo attached' : 'Attach a photo or file' }}</UiButton>
            <input ref="file" type="file" class="sr-only" accept="image/*,.pdf,.txt,.py" aria-label="Attach your solution" @change="attach(($event.target as HTMLInputElement).files?.[0])">
          </div>
          <UiButton size="xl" @click="next">Continue to the check <ArrowRight /></UiButton>
        </div>
      </Reveal>
    </ol>
  </div>
</template>
