<script setup lang="ts">
import { Copy, Paperclip, ArrowRight } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { packOf } from '~/lib/session'

definePageMeta({ layout: 'session', middleware: 'session' })
useStep('elsewhere')
const { ws } = useWorkspace()
const { go } = useSession()
const { open } = useLeave()
const s = computed(() => ws.value.active!)
const pack = computed(() => packOf(s.value))
const e = computed(() => s.value.elsewhere)
const file = ref<HTMLInputElement>()
const error = ref('')

const plain = (t: string) => t.replace(/\$/g, '').replace(/\*\*/g, '').replace(/\\dots/g, '…').replace(/\\/g, '')
async function copy() {
  try { await navigator.clipboard.writeText(`${pack.value.title}\n\n${plain(pack.value.statement)}\n${plain(pack.value.example)}`); toast.success('Problem copied') }
  catch { toast.error('Couldn’t copy. Select the text above instead.') }
}
function attach(f?: File | null) { if (!f) return; e.value.attached = true; e.value.solution ||= ''; toast.success(`${f.name} attached`) }
function next() {
  if (!e.value.solution.trim() && !e.value.attached) { error.value = 'Paste your solution or attach a photo to continue.'; return }
  go('explain')
}
</script>

<template>
  <div>
    <StageHeader title="Work on it elsewhere" description="Use your own tools, paper or another assistant. Your place here stays saved." next="Come back with your solution, then check your understanding." />

    <ol class="space-y-10">
      <Reveal as="li" :index="1" class="grid gap-5 sm:grid-cols-[3rem_1fr]">
        <span class="bg-muted grid size-9 place-items-center rounded-full text-sm font-semibold">1</span>
        <div class="space-y-5">
          <div class="space-y-1.5"><h2 class="text-xl font-semibold">Go and solve it</h2><p class="text-muted-foreground text-base leading-7">Here is your exercise to take along. We can’t see what you do elsewhere, and we won’t guess which steps were yours.</p></div>
          <div class="border-border space-y-2 rounded-xl border p-5 text-base leading-7"><p class="font-medium">{{ pack.title }}</p><p><RichText :text="pack.statement" /></p></div>
          <div class="flex flex-wrap gap-2">
            <UiButton variant="outline" @click="copy"><Copy /> Copy the problem</UiButton>
            <UiButton variant="ghost" @click="open = true">Leave and resume later</UiButton>
          </div>
        </div>
      </Reveal>

      <Reveal as="li" :index="2" class="grid gap-5 sm:grid-cols-[3rem_1fr]">
        <span class="bg-muted grid size-9 place-items-center rounded-full text-sm font-semibold">2</span>
        <div class="space-y-5">
          <div class="space-y-1.5"><h2 class="text-xl font-semibold">Come back with your solution</h2><p class="text-muted-foreground text-base leading-7">Paste it or attach a photo. It stays out of sight during the check, so the check measures you.</p></div>
          <div class="space-y-2">
            <UiLabel for="elsewhere-solution">Your solution</UiLabel>
            <UiTextarea id="elsewhere-solution" v-model="e.solution" rows="7" class="font-mono text-sm" placeholder="Paste code or your reasoning here" :aria-invalid="!!error" />
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
