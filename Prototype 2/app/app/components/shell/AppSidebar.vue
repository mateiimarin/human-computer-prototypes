<script setup lang="ts">
import { useSidebar } from '~/components/ui/sidebar'
import { House, BookOpen, Orbit, Repeat2, Play, ArrowRight } from '@lucide/vue'
import { resumePath, stageOf, stages } from '~/lib/session'
import { packs } from '~/data/packs'

const route = useRoute()
const { ws, dueNow } = useWorkspace()
const { setOpenMobile, state, isMobile } = useSidebar()
const collapsed = computed(() => state.value === 'collapsed' && !isMobile.value)

const nav = [
  { to: '/', label: 'Overview', icon: House, match: (p: string) => p === '/' },
  { to: '/study', label: 'Study', icon: BookOpen, match: (p: string) => p.startsWith('/study') },
  { to: '/concepts', label: 'Concepts', icon: Orbit, match: (p: string) => p.startsWith('/concepts') },
  { to: '/review', label: 'Review', icon: Repeat2, match: (p: string) => p.startsWith('/review') },
]
const active = computed(() => ws.value.active)
const activePack = computed(() => (active.value ? packs[active.value.packId] : null))
const stageLabel = computed(() => (active.value ? stages.find(s => s.id === stageOf(active.value!.step))?.label : ''))
</script>

<template>
  <UiSidebar collapsible="icon">
    <UiSidebarHeader class="gap-3 p-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-2">
      <NuxtLink
        to="/" aria-label="Prove-it, overview"
        class="flex h-10 items-center rounded-lg px-1.5 group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        @click="setOpenMobile(false)"
      >
        <Logo :word="!collapsed" />
      </NuxtLink>
      <CourseSwitcher :collapsed="collapsed" />
    </UiSidebarHeader>

    <UiSidebarContent class="px-3 pt-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
      <nav aria-label="Workspace" class="w-full">
        <UiSidebarMenu class="gap-1 group-data-[collapsible=icon]:items-center">
          <UiSidebarMenuItem v-for="item in nav" :key="item.to">
            <UiSidebarMenuButton
              as-child :is-active="item.match(route.path)" :tooltip="item.label"
              class="text-muted-foreground data-[active=true]:text-foreground h-10 gap-3 rounded-lg px-3 text-sm font-medium group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0!"
            >
              <NuxtLink :to="item.to" class="relative" :aria-label="item.label" :aria-current="item.match(route.path) ? 'page' : undefined" @click="setOpenMobile(false)">
                <component :is="item.icon" class="size-[18px]!" />
                <span class="group-data-[collapsible=icon]:hidden">{{ item.label }}</span>
                <template v-if="item.to === '/review' && dueNow.length">
                  <span class="bg-foreground text-background ml-auto grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums group-data-[collapsible=icon]:hidden" :aria-label="`${dueNow.length} due`">{{ dueNow.length }}</span>
                  <span class="bg-foreground ring-sidebar absolute top-1.5 right-1.5 hidden size-2 rounded-full ring-2 group-data-[collapsible=icon]:block" aria-hidden="true" />
                </template>
              </NuxtLink>
            </UiSidebarMenuButton>
          </UiSidebarMenuItem>
        </UiSidebarMenu>
      </nav>
    </UiSidebarContent>

    <UiSidebarFooter class="gap-3 p-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-2">
      <template v-if="active && activePack">
        <NuxtLink
          v-if="!collapsed" :to="resumePath(active)"
          class="hero-field group/resume block rounded-xl p-4 transition-transform duration-200 hover:-translate-y-0.5"
          @click="setOpenMobile(false)"
        >
          <span class="text-hero-muted block text-xs">In progress · {{ stageLabel }}</span>
          <span class="mt-1 block text-sm leading-5 font-semibold">{{ activePack.title }}</span>
          <span class="mt-3 inline-flex items-center gap-1 text-sm font-medium">Resume <ArrowRight class="size-4 transition-transform group-hover/resume:translate-x-0.5" /></span>
        </NuxtLink>
        <UiTooltip v-else>
          <UiTooltipTrigger as-child>
            <NuxtLink :to="resumePath(active)" class="hero-field grid size-10 place-items-center rounded-xl" :aria-label="`Resume ${activePack.title}`"><Play class="size-4" /></NuxtLink>
          </UiTooltipTrigger>
          <UiTooltipContent side="right">Resume · {{ activePack.title }}</UiTooltipContent>
        </UiTooltip>
      </template>
      <UserMenu :collapsed="collapsed" />
    </UiSidebarFooter>
    <UiSidebarRail />
  </UiSidebar>
</template>
