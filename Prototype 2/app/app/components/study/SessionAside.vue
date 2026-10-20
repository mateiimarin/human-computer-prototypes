<script setup lang="ts">
import { ArrowRight, ClipboardList, NotebookPen, EyeOff, BarChart3 } from '@lucide/vue'
import type { Pack } from '~/data/types'
import { topicById } from '~/data/catalog'

const props = defineProps<{ pack: Pack | null; resuming: boolean }>()
const emit = defineEmits<{ start: [] }>()

const steps = [
  { icon: ClipboardList, tint: 'bg-muted', title: 'Prepare', text: 'Three questions. Results stay hidden.' },
  { icon: NotebookPen, tint: 'bg-assist text-assist-foreground', title: 'Work', text: 'Solve it with the companion, or elsewhere.' },
  { icon: EyeOff, tint: 'bg-check text-check-foreground', title: 'Verify', text: 'Explain it back with your references hidden.' },
  { icon: BarChart3, tint: 'bg-muted', title: 'Review', text: 'See what you showed and what to do next.' },
]
</script>

<template>
  <aside aria-label="Your session" class="space-y-6">
    <Transition mode="out-in" enter-active-class="transition duration-200 ease-out" enter-from-class="translate-y-1 opacity-0" leave-active-class="transition duration-100" leave-to-class="opacity-0">
      <div v-if="pack" :key="pack.id" class="space-y-1">
        <h2 class="text-xl leading-7 font-semibold"><RichText :text="pack.title" /></h2>
        <p class="text-muted-foreground text-sm">Exercise {{ pack.sheetNo }} · {{ topicById(pack.topicId).name }} · about {{ pack.work.minutes + 8 }} minutes</p>
      </div>
      <p v-else class="text-muted-foreground text-[15px] leading-6">Choose an exercise to see what the session involves.</p>
    </Transition>

    <ol class="space-y-3">
      <li v-for="s in steps" :key="s.title" class="flex items-start gap-3 text-sm leading-5">
        <span class="grid size-8 shrink-0 place-items-center rounded-lg" :class="s.tint"><component :is="s.icon" class="size-4" /></span>
        <span class="pt-0.5"><span class="font-medium">{{ s.title }}.</span> <span class="text-muted-foreground">{{ s.text }}</span></span>
      </li>
    </ol>

    <div class="space-y-3">
      <UiButton size="xl" class="w-full" :disabled="!pack" @click="emit('start')">
        {{ resuming ? 'Resume session' : 'Start with the baseline' }} <ArrowRight />
      </UiButton>
      <p v-if="!pack" class="text-muted-foreground text-center text-sm">Pick an exercise to start.</p>
      <p v-else class="text-muted-foreground text-sm leading-5">You can change the exercise until you start. After that, a new session is a deliberate choice.</p>
    </div>
  </aside>
</template>
