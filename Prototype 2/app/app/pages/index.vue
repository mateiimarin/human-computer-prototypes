<script setup lang="ts">
import { exercises } from '~/data/packs'
import { courses } from '~/data/catalog'
import { X } from '@lucide/vue'
import { toast } from 'vue-sonner'

definePageMeta({ title: 'Exercises' })
const route = useRoute()
const { ws, topics } = useWorkspace()
const { open, startOver } = useSession()
const statusOf = useExerciseStatus()

const courseId = ref(courses[0]!.id)
const notice = ref(route.query.notice === 'no-session')
/** The dialog closes before the confirm button's own handler runs, so the exercise is kept apart from the open state. */
const confirmOpen = ref(false)
const resetId = ref<string | null>(null)
const resetPack = computed(() => exercises.find(p => p.id === resetId.value))
function askStartOver(id: string) { resetId.value = id; confirmOpen.value = true }

/** One state per concept an exercise checks, taken from everything shown so far. */
const statesOf = (pack: { subs: { id: string }[] }) => pack.subs.map(s => topics.value.flatMap(t => t.concepts).find(c => c.id === s.id)?.state ?? 'unverified')
function confirmReset() {
  const pack = resetPack.value
  if (!pack) return
  startOver(pack.id)
  toast('Started over', { description: `${pack.title} is back at the baseline.` })
}
</script>

<template>
  <div>
    <PageHeader title="Exercises">
      <template #actions>
        <UiSelect v-model="courseId">
          <UiSelectTrigger class="h-10 min-w-64 rounded-lg" aria-label="Course"><UiSelectValue /></UiSelectTrigger>
          <UiSelectContent><UiSelectItem v-for="c in courses" :key="c.id" :value="c.id">{{ c.name }}</UiSelectItem></UiSelectContent>
        </UiSelect>
      </template>
    </PageHeader>

    <Transition leave-active-class="transition duration-200" leave-to-class="opacity-0 -translate-y-1">
      <div v-if="notice" class="bg-muted mb-6 flex items-start gap-3 rounded-xl p-4 text-sm leading-6" role="status">
        <p class="flex-1">There is no open session. Start an exercise below.</p>
        <button class="hover:bg-accent -m-1 rounded-md p-1" aria-label="Dismiss" @click="notice = false"><X class="size-4" /></button>
      </div>
    </Transition>

    <section v-for="(c, ci) in topics" :key="c.id" class="mb-10" :aria-labelledby="`topic-${c.id}`">
      <Reveal :index="ci + 1" class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 :id="`topic-${c.id}`" class="text-xl font-semibold">{{ c.name }}</h2>
        <p class="text-muted-foreground text-sm">{{ c.checked }} of {{ c.total }} concepts shown without help</p>
      </Reveal>
      <ul class="divide-border divide-y" :aria-label="`${c.name} exercises`">
        <Reveal v-for="(p, i) in c.exercises" :key="p.id" as="li" :index="ci + i + 2">
          <ExerciseRow
            :pack="p" :states="statesOf(p)" :status="statusOf(p.id)" :in-progress="!!ws.open[p.id]"
            @open="open(p.id)" @start-over="askStartOver(p.id)"
          />
        </Reveal>
      </ul>
    </section>

    <UiAlertDialog v-model:open="confirmOpen">
      <UiAlertDialogContent class="max-w-md">
        <UiAlertDialogHeader>
          <UiAlertDialogTitle>Start over?</UiAlertDialogTitle>
          <UiAlertDialogDescription>
            This clears your answers and chat for {{ resetPack?.title }}.
          </UiAlertDialogDescription>
        </UiAlertDialogHeader>
        <UiAlertDialogFooter class="gap-2">
          <UiAlertDialogCancel as-child><UiButton variant="ghost">Cancel</UiButton></UiAlertDialogCancel>
          <UiAlertDialogAction as-child><UiButton variant="destructive" @click="confirmReset">Start over</UiButton></UiAlertDialogAction>
        </UiAlertDialogFooter>
      </UiAlertDialogContent>
    </UiAlertDialog>
  </div>
</template>
