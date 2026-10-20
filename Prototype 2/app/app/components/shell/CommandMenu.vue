<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { packs as _packs } from '~/data/packs'
import { House, BookOpen, Orbit, Repeat2, Settings, Plus, FileText, CalendarClock, Upload } from '@lucide/vue'

const { open } = useCommandMenu()
const { coursePacks, concepts, ws } = useWorkspace()
const { start } = useSession()
const { packs } = { packs: _packs }

useEventListener('keydown', (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    open.value = !open.value
  }
})
function go(to: string) { open.value = false; navigateTo(to) }
function begin(id: string) { open.value = false; start(id) }

// Moderator shortcut: fills the open answer box with a known response, so each feedback state can be shown on demand.
const route = useRoute()
const fillable = computed(() => ws.value.active && ['/session/explain', '/session/twin'].includes(route.path))
function fill(k: 'complete' | 'partial' | 'offtrack') {
  const s = ws.value.active!, p = packs[s.packId]!
  open.value = false
  if (route.path === '/session/explain') s.explain.text = p.explain.samples[k]
  else s.twin.text = p.twin.sample[k]
}
const pages = [
  { label: 'Overview', to: '/', icon: House },
  { label: 'Study', to: '/study', icon: BookOpen },
  { label: 'Concepts', to: '/concepts', icon: Orbit },
  { label: 'Review', to: '/review', icon: Repeat2 },
  { label: 'Settings', to: '/settings', icon: Settings },
]
</script>

<template>
  <UiCommandDialog v-if="ws.signedIn" v-model:open="open" title="Search" description="Jump to a page, concept or exercise">
    <UiCommandInput placeholder="Search pages, concepts and exercises…" />
    <UiCommandList class="max-h-[min(440px,60dvh)] p-1.5">
      <UiCommandEmpty>Nothing matches. Try an exercise or a page name.</UiCommandEmpty>
      <UiCommandGroup heading="Go to">
        <UiCommandItem v-for="p in pages" :key="p.to" :value="p.label" class="rounded-xl py-2.5" @select="go(p.to)">
          <component :is="p.icon" /> {{ p.label }}
        </UiCommandItem>
      </UiCommandGroup>
      <UiCommandGroup v-if="coursePacks.length" heading="Start a session">
        <UiCommandItem v-for="p in coursePacks" :key="p.id" :value="`start ${p.title} ${p.sheetNo}`" class="rounded-xl py-2.5" @select="begin(p.id)">
          <FileText /> <span class="flex-1">{{ p.title }}</span><span class="text-muted-foreground text-xs">Exercise {{ p.sheetNo }}</span>
        </UiCommandItem>
      </UiCommandGroup>
      <UiCommandGroup v-if="concepts.length" heading="Concepts">
        <UiCommandItem v-for="c in concepts" :key="c.id" :value="`concept ${c.name}`" class="rounded-xl py-2.5" @select="go(`/concepts/${c.id}`)">
          <Orbit /> {{ c.name }}
        </UiCommandItem>
      </UiCommandGroup>
      <UiCommandGroup v-if="fillable" heading="Fill the answer with a known response">
        <UiCommandItem value="fill complete answer" class="rounded-xl py-2.5" @select="fill('complete')">A complete explanation</UiCommandItem>
        <UiCommandItem value="fill partial answer" class="rounded-xl py-2.5" @select="fill('partial')">A partial explanation</UiCommandItem>
        <UiCommandItem value="fill off-track answer" class="rounded-xl py-2.5" @select="fill('offtrack')">An off-track explanation</UiCommandItem>
      </UiCommandGroup>
      <UiCommandGroup heading="Actions">
        <UiCommandItem value="Add exercise sheet upload" class="rounded-xl py-2.5" @select="go('/study?tab=upload')"><Upload /> Add an exercise sheet</UiCommandItem>
        <UiCommandItem value="Add course" class="rounded-xl py-2.5" @select="() => { open = false; useCommandMenu().addCourse.value = true }"><Plus /> Add a course</UiCommandItem>
        <UiCommandItem value="Exam plan date priorities" class="rounded-xl py-2.5" @select="go('/review?tab=exam')"><CalendarClock /> Open exam plan</UiCommandItem>
      </UiCommandGroup>
    </UiCommandList>
  </UiCommandDialog>
</template>
