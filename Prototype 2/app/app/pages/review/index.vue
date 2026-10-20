<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { dueNow, savedForCourse } = useWorkspace()
const tab = computed({
  get: () => (['library', 'due', 'exam'].includes(route.query.tab as string) ? (route.query.tab as string) : 'library'),
  set: (v) => router.replace({ query: { tab: v } }),
})
</script>

<template>
  <div>
    <PageHeader title="Review" description="Come back to what you saved. Answers stay hidden until you submit." />
    <Reveal :index="1" class="mb-8">
      <UiTabs v-model="tab" class="gap-0">
        <UiTabsList aria-label="Review sections">
          <UiTabsTrigger value="library" class="px-5">Library <span class="text-muted-foreground text-xs tabular-nums">{{ savedForCourse.length }}</span></UiTabsTrigger>
          <UiTabsTrigger value="due" class="px-5">Due <span v-if="dueNow.length" class="text-muted-foreground text-xs tabular-nums">{{ dueNow.length }}</span></UiTabsTrigger>
          <UiTabsTrigger value="exam" class="px-5">Exam plan</UiTabsTrigger>
        </UiTabsList>
      </UiTabs>
    </Reveal>
    <Transition name="q-fwd" mode="out-in">
      <ReviewLibrary v-if="tab === 'library'" key="l" />
      <DueList v-else-if="tab === 'due'" key="d" />
      <ExamPlan v-else key="e" />
    </Transition>
  </div>
</template>
