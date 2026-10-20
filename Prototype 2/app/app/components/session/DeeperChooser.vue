<script setup lang="ts">
import { ArrowRight, ShieldQuestion, Bug } from '@lucide/vue'
import type { ActiveSession } from '~/data/session'

const props = defineProps<{ session: ActiveSession }>()
const emit = defineEmits<{ continue: [] }>()
const d = computed(() => props.session.deeper)
const label = computed(() => (d.value.defend ? 'Continue to Defend your solution' : d.value.mistakes ? 'Continue to Spot the mistake' : 'Continue to the post-quiz'))
</script>

<template>
  <section aria-labelledby="deeper-title" class="space-y-5">
    <div class="space-y-1.5">
      <h2 id="deeper-title" class="text-xl font-semibold">Go deeper first?</h2>
      <p class="text-muted-foreground text-base leading-7">Both checks are optional, short, and end with a Finish button. With neither ticked you go straight to the post-quiz.</p>
    </div>
    <ul class="divide-border border-border divide-y border-y">
      <li>
        <label class="hover:bg-accent/40 -mx-3 flex cursor-pointer items-center gap-4 rounded-lg px-3 py-4 transition-colors">
          <UiCheckbox v-model="d.defend" aria-label="Defend your solution" />
          <span class="bg-check text-check-foreground grid size-10 shrink-0 place-items-center rounded-xl"><ShieldQuestion class="size-5" /></span>
          <span class="min-w-0 flex-1"><span class="block text-[15px] font-medium">Defend your solution</span><span class="text-muted-foreground block text-sm">Three short “why?” questions · about 3 minutes</span></span>
        </label>
      </li>
      <li>
        <label class="hover:bg-accent/40 -mx-3 flex cursor-pointer items-center gap-4 rounded-lg px-3 py-4 transition-colors">
          <UiCheckbox v-model="d.mistakes" aria-label="Spot the planted mistake" />
          <span class="bg-check text-check-foreground grid size-10 shrink-0 place-items-center rounded-xl"><Bug class="size-5" /></span>
          <span class="min-w-0 flex-1"><span class="block text-[15px] font-medium">Spot the planted mistake</span><span class="text-muted-foreground block text-sm">A solution with one error to find · about 2 minutes</span></span>
        </label>
      </li>
    </ul>
    <UiButton size="xl" class="w-full sm:w-auto" @click="emit('continue')">{{ label }} <ArrowRight /></UiButton>
  </section>
</template>
